// API routes cho Thông báo người dùng
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/notifications/user/:userId - Lấy thông báo của user theo ma_kh
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, unread_only } = req.query;
        
        let query = `
            SELECT * FROM thong_bao 
            WHERE ma_kh = ?
        `;
        const params = [userId];
        
        if (unread_only === 'true') {
            query += ' AND da_doc = 0';
        }
        
        query += ' ORDER BY ngay_tao DESC LIMIT ?';
        params.push(parseInt(limit));
        
        const [notifications] = await pool.query(query, params);
        
        // Đếm số thông báo chưa đọc
        const [[countResult]] = await pool.query(
            'SELECT COUNT(*) as unread_count FROM thong_bao WHERE ma_kh = ? AND da_doc = 0',
            [userId]
        );
        
        res.json({ 
            success: true, 
            data: notifications,
            unread_count: countResult.unread_count
        });
    } catch (error) {
        console.error('Error getting user notifications:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/notifications/email/:email - Lấy thông báo theo email (cho user chưa đăng nhập)
router.get('/email/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { limit = 20, unread_only } = req.query;
        
        let query = `
            SELECT * FROM thong_bao 
            WHERE email_nguoi_nhan = ?
        `;
        const params = [email];
        
        if (unread_only === 'true') {
            query += ' AND da_doc = 0';
        }
        
        query += ' ORDER BY ngay_tao DESC LIMIT ?';
        params.push(parseInt(limit));
        
        const [notifications] = await pool.query(query, params);
        
        // Đếm số thông báo chưa đọc
        const [[countResult]] = await pool.query(
            'SELECT COUNT(*) as unread_count FROM thong_bao WHERE email_nguoi_nhan = ? AND da_doc = 0',
            [email]
        );
        
        res.json({ 
            success: true, 
            data: notifications,
            unread_count: countResult.unread_count
        });
    } catch (error) {
        console.error('Error getting notifications by email:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/notifications/count/:userId - Đếm thông báo chưa đọc
router.get('/count/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [[result]] = await pool.query(
            'SELECT COUNT(*) as count FROM thong_bao WHERE ma_kh = ? AND da_doc = 0',
            [userId]
        );
        
        res.json({ success: true, count: result.count });
    } catch (error) {
        console.error('Error counting notifications:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/notifications/:id/read - Đánh dấu đã đọc
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query('UPDATE thong_bao SET da_doc = 1 WHERE ma_thong_bao = ?', [id]);
        
        res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/notifications/read-all/:userId - Đánh dấu tất cả đã đọc
router.put('/read-all/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        await pool.query('UPDATE thong_bao SET da_doc = 1 WHERE ma_kh = ?', [userId]);
        
        res.json({ success: true, message: 'Đã đánh dấu tất cả đã đọc' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/notifications/:id - Xóa thông báo
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query('DELETE FROM thong_bao WHERE ma_thong_bao = ?', [id]);
        
        res.json({ success: true, message: 'Đã xóa thông báo' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
