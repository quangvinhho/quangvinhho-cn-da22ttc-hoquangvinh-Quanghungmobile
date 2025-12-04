const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ==========================================
// API TÌM KIẾM VÀ LỊCH SỬ TÌM KIẾM
// ==========================================

/**
 * Lưu từ khóa tìm kiếm của người dùng
 * POST /api/search/save
 * Body: { tu_khoa: string, ma_kh: number (optional) }
 */
router.post('/save', async (req, res) => {
    try {
        const { tu_khoa, ma_kh } = req.body;

        if (!tu_khoa || tu_khoa.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Từ khóa tìm kiếm không được để trống'
            });
        }

        const keyword = tu_khoa.trim();

        // Kiểm tra nếu từ khóa đã tồn tại trong lịch sử của user này
        if (ma_kh) {
            const [existing] = await pool.query(
                `SELECT ma FROM du_lieu_tim_kiem 
                 WHERE tu_khoa = ? AND ma_kh = ? 
                 ORDER BY thoi_gian DESC LIMIT 1`,
                [keyword, ma_kh]
            );

            // Nếu đã có, cập nhật thời gian
            if (existing.length > 0) {
                await pool.query(
                    `UPDATE du_lieu_tim_kiem SET thoi_gian = CURRENT_TIMESTAMP 
                     WHERE ma = ?`,
                    [existing[0].ma]
                );
                return res.json({
                    success: true,
                    message: 'Đã cập nhật lịch sử tìm kiếm'
                });
            }
        }

        // Thêm mới từ khóa tìm kiếm
        await pool.query(
            `INSERT INTO du_lieu_tim_kiem (tu_khoa, ma_kh) VALUES (?, ?)`,
            [keyword, ma_kh || null]
        );

        // Giới hạn số lượng lịch sử tìm kiếm của mỗi user (giữ lại 20 từ khóa gần nhất)
        if (ma_kh) {
            await pool.query(
                `DELETE FROM du_lieu_tim_kiem 
                 WHERE ma_kh = ? 
                 AND ma NOT IN (
                     SELECT ma FROM (
                         SELECT ma FROM du_lieu_tim_kiem 
                         WHERE ma_kh = ? 
                         ORDER BY thoi_gian DESC LIMIT 20
                     ) AS recent
                 )`,
                [ma_kh, ma_kh]
            );
        }

        res.json({
            success: true,
            message: 'Đã lưu từ khóa tìm kiếm'
        });
    } catch (error) {
        console.error('Lỗi lưu từ khóa tìm kiếm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

/**
 * Lấy lịch sử tìm kiếm của người dùng
 * GET /api/search/history/:ma_kh
 */
router.get('/history/:ma_kh', async (req, res) => {
    try {
        const { ma_kh } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const [history] = await pool.query(
            `SELECT tu_khoa, thoi_gian 
             FROM du_lieu_tim_kiem 
             WHERE ma_kh = ? 
             ORDER BY thoi_gian DESC 
             LIMIT ?`,
            [ma_kh, limit]
        );

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Lỗi lấy lịch sử tìm kiếm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

/**
 * Xóa một từ khóa khỏi lịch sử tìm kiếm
 * DELETE /api/search/history
 * Body: { tu_khoa: string, ma_kh: number }
 */
router.delete('/history', async (req, res) => {
    try {
        const { tu_khoa, ma_kh } = req.body;

        if (!ma_kh) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu mã khách hàng'
            });
        }

        await pool.query(
            `DELETE FROM du_lieu_tim_kiem WHERE tu_khoa = ? AND ma_kh = ?`,
            [tu_khoa, ma_kh]
        );

        res.json({
            success: true,
            message: 'Đã xóa từ khóa khỏi lịch sử'
        });
    } catch (error) {
        console.error('Lỗi xóa lịch sử tìm kiếm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

/**
 * Xóa tất cả lịch sử tìm kiếm của người dùng
 * DELETE /api/search/history/all/:ma_kh
 */
router.delete('/history/all/:ma_kh', async (req, res) => {
    try {
        const { ma_kh } = req.params;

        await pool.query(
            `DELETE FROM du_lieu_tim_kiem WHERE ma_kh = ?`,
            [ma_kh]
        );

        res.json({
            success: true,
            message: 'Đã xóa tất cả lịch sử tìm kiếm'
        });
    } catch (error) {
        console.error('Lỗi xóa tất cả lịch sử:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

/**
 * Gợi ý tìm kiếm (autocomplete)
 * GET /api/search/suggest?q=keyword&ma_kh=123
 * Trả về: lịch sử tìm kiếm + sản phẩm phù hợp (bao gồm ma_sp để chuyển đến trang chi tiết)
 */
router.get('/suggest', async (req, res) => {
    try {
        const { q, ma_kh } = req.query;
        const limit = Math.min(parseInt(req.query.limit) || 8, 20); // Giới hạn tối đa 20

        let suggestions = [];

        // Nếu có từ khóa tìm kiếm
        if (q && q.trim() !== '') {
            const keyword = `%${q.trim()}%`;
            const startWith = `${q.trim()}%`;

            // Tìm sản phẩm phù hợp - bao gồm ma_sp, giá, ảnh để hiển thị
            const [products] = await pool.query(
                `SELECT ma_sp, ten_sp as text, gia, anh_dai_dien, 'product' as type 
                 FROM san_pham 
                 WHERE ten_sp LIKE ? OR mo_ta LIKE ?
                 ORDER BY 
                    CASE WHEN ten_sp LIKE ? THEN 0 ELSE 1 END,
                    ten_sp 
                 LIMIT ${limit}`,
                [keyword, keyword, startWith]
            );

            // Tìm từ lịch sử của user (nếu có đăng nhập)
            if (ma_kh && parseInt(ma_kh) > 0) {
                const [history] = await pool.query(
                    `SELECT tu_khoa as text, 'history' as type, MAX(thoi_gian) as last_time
                     FROM du_lieu_tim_kiem 
                     WHERE ma_kh = ? AND tu_khoa LIKE ? 
                     GROUP BY tu_khoa
                     ORDER BY last_time DESC 
                     LIMIT 5`,
                    [parseInt(ma_kh), keyword]
                );

                // Kết hợp: lịch sử trước, sản phẩm sau
                const historyTexts = history.map(h => h.text.toLowerCase());
                const uniqueProducts = products.filter(
                    p => !historyTexts.includes(p.text.toLowerCase())
                );

                suggestions = [...history, ...uniqueProducts].slice(0, limit);
            } else {
                suggestions = products;
            }
        } else if (ma_kh && parseInt(ma_kh) > 0) {
            // Nếu không có từ khóa, hiển thị lịch sử tìm kiếm gần đây + sản phẩm hot
            const [history] = await pool.query(
                `SELECT tu_khoa as text, 'history' as type, MAX(thoi_gian) as last_time
                 FROM du_lieu_tim_kiem 
                 WHERE ma_kh = ? 
                 GROUP BY tu_khoa
                 ORDER BY last_time DESC 
                 LIMIT 5`,
                [parseInt(ma_kh)]
            );
            
            // Thêm một số sản phẩm nổi bật
            const [hotProducts] = await pool.query(
                `SELECT ma_sp, ten_sp as text, gia, anh_dai_dien, 'hot' as type 
                 FROM san_pham 
                 ORDER BY ngay_cap_nhat DESC 
                 LIMIT 3`
            );
            
            suggestions = [...history, ...hotProducts];
        } else {
            // Không có từ khóa và không đăng nhập - trả về sản phẩm hot
            const [hotProducts] = await pool.query(
                `SELECT ma_sp, ten_sp as text, gia, anh_dai_dien, 'hot' as type 
                 FROM san_pham 
                 ORDER BY ngay_cap_nhat DESC 
                 LIMIT 5`
            );
            suggestions = hotProducts;
        }

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Lỗi gợi ý tìm kiếm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * Thống kê từ khóa tìm kiếm phổ biến (cho admin)
 * GET /api/search/popular
 */
router.get('/popular', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const [popular] = await pool.query(
            `SELECT tu_khoa, COUNT(*) as so_lan_tim 
             FROM du_lieu_tim_kiem 
             GROUP BY tu_khoa 
             ORDER BY so_lan_tim DESC 
             LIMIT ?`,
            [limit]
        );

        res.json({
            success: true,
            data: popular
        });
    } catch (error) {
        console.error('Lỗi lấy từ khóa phổ biến:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

module.exports = router;
