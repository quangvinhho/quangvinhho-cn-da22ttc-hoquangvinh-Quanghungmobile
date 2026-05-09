const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Gọi sang RAG Service để đồng bộ dữ liệu
async function syncRAGKnowledge() {
    try {
        // Gọi nhẹ sang API Python nhưng không chờ kết quả để tránh chặn request
        fetch('http://127.0.0.1:8000/api/reload_knowledge', { method: 'POST' })
            .then(res => res.json())
            .then(data => console.log('Đồng bộ RAG:', data))
            .catch(err => console.log('RAG service hiện không chạy, bỏ qua đồng bộ:', err.message));
    } catch (error) {
        console.error('Lỗi khi đồng bộ RAG:', error);
    }
}

// GET all knowledge items
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM chatbot_knowledge ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy dữ liệu chatbot:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        res.json(results);
    });
});

// POST new knowledge item
router.post('/', (req, res) => {
    const { question, answer, type, is_active } = req.body;
    const sql = 'INSERT INTO chatbot_knowledge (question, answer, type, is_active) VALUES (?, ?, ?, ?)';
    db.query(sql, [question, answer, type, is_active === undefined ? 1 : is_active], (err, result) => {
        if (err) {
            console.error('Lỗi khi thêm dữ liệu chatbot:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        syncRAGKnowledge(); // Báo Python cập nhật ngay
        res.status(201).json({ id: result.insertId, message: 'Thêm thành công' });
    });
});

// PUT update knowledge item
router.put('/:id', (req, res) => {
    const { question, answer, type, is_active } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE chatbot_knowledge SET question = ?, answer = ?, type = ?, is_active = ? WHERE id = ?';
    db.query(sql, [question, answer, type, is_active, id], (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật dữ liệu chatbot:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu' });
        }
        syncRAGKnowledge(); // Báo Python cập nhật ngay
        res.json({ message: 'Cập nhật thành công' });
    });
});

// DELETE knowledge item
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM chatbot_knowledge WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Lỗi khi xóa dữ liệu chatbot:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu' });
        }
        syncRAGKnowledge(); // Báo Python cập nhật ngay
        res.json({ message: 'Xóa thành công' });
    });
});

module.exports = router;