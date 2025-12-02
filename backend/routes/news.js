const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Lấy tất cả tin tức (có phân trang)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Đếm tổng số tin tức
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM tin_tuc');
        const total = countResult[0].total;

        // Lấy danh sách tin tức
        const [rows] = await pool.query(`
            SELECT 
                tt.ma_tintuc,
                tt.tieu_de,
                tt.noi_dung,
                tt.anh_dai_dien,
                tt.ngay_dang,
                a.ho_ten as tac_gia
            FROM tin_tuc tt
            LEFT JOIN admin a ON tt.ma_admin = a.ma_admin
            ORDER BY tt.ngay_dang DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        res.json({
            success: true,
            data: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Lỗi lấy tin tức:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Lấy tin tức nổi bật (mới nhất)
router.get('/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const [rows] = await pool.query(`
            SELECT 
                tt.ma_tintuc,
                tt.tieu_de,
                tt.noi_dung,
                tt.anh_dai_dien,
                tt.ngay_dang,
                a.ho_ten as tac_gia
            FROM tin_tuc tt
            LEFT JOIN admin a ON tt.ma_admin = a.ma_admin
            ORDER BY tt.ngay_dang DESC
            LIMIT ?
        `, [limit]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Lỗi lấy tin tức nổi bật:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Lấy chi tiết tin tức theo ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.query(`
            SELECT 
                tt.ma_tintuc,
                tt.tieu_de,
                tt.noi_dung,
                tt.anh_dai_dien,
                tt.ngay_dang,
                a.ho_ten as tac_gia
            FROM tin_tuc tt
            LEFT JOIN admin a ON tt.ma_admin = a.ma_admin
            WHERE tt.ma_tintuc = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức' });
        }

        // Lấy tin tức liên quan (cùng tác giả hoặc mới nhất)
        const [relatedNews] = await pool.query(`
            SELECT 
                ma_tintuc,
                tieu_de,
                anh_dai_dien,
                ngay_dang
            FROM tin_tuc
            WHERE ma_tintuc != ?
            ORDER BY ngay_dang DESC
            LIMIT 4
        `, [id]);

        res.json({
            success: true,
            data: rows[0],
            relatedNews
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết tin tức:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Tìm kiếm tin tức
router.get('/search/:keyword', async (req, res) => {
    try {
        const { keyword } = req.params;
        const searchTerm = `%${keyword}%`;

        const [rows] = await pool.query(`
            SELECT 
                tt.ma_tintuc,
                tt.tieu_de,
                tt.noi_dung,
                tt.anh_dai_dien,
                tt.ngay_dang,
                a.ho_ten as tac_gia
            FROM tin_tuc tt
            LEFT JOIN admin a ON tt.ma_admin = a.ma_admin
            WHERE tt.tieu_de LIKE ? OR tt.noi_dung LIKE ?
            ORDER BY tt.ngay_dang DESC
            LIMIT 20
        `, [searchTerm, searchTerm]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Lỗi tìm kiếm tin tức:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
