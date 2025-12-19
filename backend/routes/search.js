const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ==========================================
// API TÌM KIẾM KIỂU YOUTUBE - NÂNG CẤP
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
 * 🔥 TRENDING - Từ khóa tìm kiếm hot nhất (kiểu YouTube)
 * GET /api/search/trending
 */
router.get('/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;

        // Lấy từ khóa được tìm nhiều nhất trong 7 ngày gần đây
        const [trending] = await pool.query(
            `SELECT tu_khoa as text, COUNT(*) as search_count, 'trending' as type
             FROM du_lieu_tim_kiem 
             WHERE thoi_gian >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY tu_khoa 
             ORDER BY search_count DESC 
             LIMIT ?`,
            [limit]
        );

        // Nếu không đủ trending, bổ sung từ sản phẩm mới/hot
        if (trending.length < limit) {
            const remaining = limit - trending.length;
            const [hotProducts] = await pool.query(
                `SELECT ten_sp as text, ma_sp, gia, anh_dai_dien, 'hot_product' as type
                 FROM san_pham 
                 WHERE ten_sp NOT IN (?)
                 ORDER BY ngay_cap_nhat DESC, ma_sp DESC
                 LIMIT ?`,
                [trending.length > 0 ? trending.map(t => t.text) : [''], remaining]
            );
            trending.push(...hotProducts);
        }

        res.json({
            success: true,
            data: trending
        });
    } catch (error) {
        console.error('Lỗi lấy trending:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

/**
 * 🎯 AUTOCOMPLETE - Gợi ý hoàn thành từ khóa thông minh (kiểu YouTube)
 * GET /api/search/autocomplete?q=iphone
 * Trả về các gợi ý hoàn thành câu: "iphone 15 pro", "iphone giá rẻ"...
 */
router.get('/autocomplete', async (req, res) => {
    try {
        const { q } = req.query;
        const limit = parseInt(req.query.limit) || 6;

        if (!q || q.trim().length < 1) {
            return res.json({ success: true, data: [] });
        }

        const keyword = q.trim().toLowerCase();
        const startWith = `${keyword}%`;
        const contains = `%${keyword}%`;

        // Gợi ý từ tên sản phẩm - ưu tiên bắt đầu bằng từ khóa
        const [productSuggestions] = await pool.query(
            `SELECT DISTINCT 
                LOWER(ten_sp) as suggestion,
                ma_sp,
                gia,
                anh_dai_dien,
                CASE 
                    WHEN LOWER(ten_sp) LIKE ? THEN 1
                    WHEN LOWER(ten_sp) LIKE ? THEN 2
                    ELSE 3
                END as priority
             FROM san_pham 
             WHERE LOWER(ten_sp) LIKE ? OR LOWER(ten_sp) LIKE ?
             ORDER BY priority, ten_sp
             LIMIT ?`,
            [startWith, contains, startWith, contains, limit]
        );

        // Gợi ý từ lịch sử tìm kiếm phổ biến
        const [historySuggestions] = await pool.query(
            `SELECT tu_khoa as suggestion, COUNT(*) as freq
             FROM du_lieu_tim_kiem 
             WHERE LOWER(tu_khoa) LIKE ? OR LOWER(tu_khoa) LIKE ?
             GROUP BY tu_khoa
             ORDER BY freq DESC
             LIMIT ?`,
            [startWith, contains, 4]
        );

        // Kết hợp và loại bỏ trùng lặp
        const seen = new Set();
        const combined = [];

        // Thêm từ lịch sử trước (phổ biến)
        historySuggestions.forEach(item => {
            const key = item.suggestion.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                combined.push({
                    text: item.suggestion,
                    type: 'autocomplete',
                    frequency: item.freq
                });
            }
        });

        // Thêm từ sản phẩm
        productSuggestions.forEach(item => {
            const key = item.suggestion.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                combined.push({
                    text: item.suggestion,
                    type: 'product_suggest',
                    ma_sp: item.ma_sp,
                    gia: item.gia,
                    anh_dai_dien: item.anh_dai_dien
                });
            }
        });

        res.json({
            success: true,
            data: combined.slice(0, limit)
        });
    } catch (error) {
        console.error('Lỗi autocomplete:', error);
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
 * 🎬 GỢI Ý TÌM KIẾM KIỂU YOUTUBE - NÂNG CẤP
 * GET /api/search/suggest?q=keyword&ma_kh=123
 * Trả về: trending + lịch sử + autocomplete + sản phẩm phù hợp
 */
router.get('/suggest', async (req, res) => {
    try {
        const { q, ma_kh } = req.query;
        const limit = Math.min(parseInt(req.query.limit) || 10, 20);

        let suggestions = [];

        // ========== TRƯỜNG HỢP 1: Có từ khóa tìm kiếm ==========
        if (q && q.trim() !== '') {
            const keyword = q.trim();
            const keywordLower = keyword.toLowerCase();
            const startWith = `${keyword}%`;
            const contains = `%${keyword}%`;

            // 1. Autocomplete từ lịch sử phổ biến
            const [autocompleteSuggestions] = await pool.query(
                `SELECT tu_khoa as text, COUNT(*) as freq, 'autocomplete' as type
                 FROM du_lieu_tim_kiem 
                 WHERE LOWER(tu_khoa) LIKE LOWER(?) 
                 GROUP BY tu_khoa
                 ORDER BY freq DESC
                 LIMIT 3`,
                [startWith]
            );

            // 2. Lịch sử cá nhân của user (nếu đăng nhập)
            let userHistory = [];
            if (ma_kh && parseInt(ma_kh) > 0) {
                const [history] = await pool.query(
                    `SELECT tu_khoa as text, 'history' as type, MAX(thoi_gian) as last_time
                     FROM du_lieu_tim_kiem 
                     WHERE ma_kh = ? AND LOWER(tu_khoa) LIKE LOWER(?)
                     GROUP BY tu_khoa
                     ORDER BY last_time DESC 
                     LIMIT 3`,
                    [parseInt(ma_kh), contains]
                );
                userHistory = history;
            }

            // 3. Sản phẩm phù hợp với hình ảnh và giá
            const [products] = await pool.query(
                `SELECT ma_sp, ten_sp as text, gia, anh_dai_dien, 'product' as type,
                    CASE 
                        WHEN LOWER(ten_sp) LIKE LOWER(?) THEN 1
                        WHEN LOWER(ten_sp) LIKE LOWER(?) THEN 2
                        ELSE 3
                    END as priority
                 FROM san_pham 
                 WHERE LOWER(ten_sp) LIKE LOWER(?) OR LOWER(mo_ta) LIKE LOWER(?)
                 ORDER BY priority, ten_sp 
                 LIMIT 6`,
                [startWith, contains, contains, contains]
            );

            // Kết hợp và loại bỏ trùng lặp
            const seen = new Set();
            
            // Thêm lịch sử cá nhân trước
            userHistory.forEach(item => {
                const key = item.text.toLowerCase();
                if (!seen.has(key)) {
                    seen.add(key);
                    suggestions.push(item);
                }
            });

            // Thêm autocomplete
            autocompleteSuggestions.forEach(item => {
                const key = item.text.toLowerCase();
                if (!seen.has(key)) {
                    seen.add(key);
                    suggestions.push(item);
                }
            });

            // Thêm sản phẩm
            products.forEach(item => {
                const key = item.text.toLowerCase();
                if (!seen.has(key)) {
                    seen.add(key);
                    suggestions.push(item);
                }
            });

            suggestions = suggestions.slice(0, limit);
        } 
        // ========== TRƯỜNG HỢP 2: Không có từ khóa (click vào ô search) ==========
        else {
            // 1. Lịch sử cá nhân (nếu đăng nhập)
            if (ma_kh && parseInt(ma_kh) > 0) {
                const [history] = await pool.query(
                    `SELECT tu_khoa as text, 'history' as type, MAX(thoi_gian) as last_time
                     FROM du_lieu_tim_kiem 
                     WHERE ma_kh = ? 
                     GROUP BY tu_khoa
                     ORDER BY last_time DESC 
                     LIMIT 5`,
                    [parseInt(ma_kh)]
                );
                suggestions.push(...history);
            }

            // 2. Trending - từ khóa hot
            const [trending] = await pool.query(
                `SELECT tu_khoa as text, COUNT(*) as search_count, 'trending' as type
                 FROM du_lieu_tim_kiem 
                 WHERE thoi_gian >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                   AND tu_khoa NOT IN (?)
                 GROUP BY tu_khoa 
                 ORDER BY search_count DESC 
                 LIMIT 4`,
                [suggestions.length > 0 ? suggestions.map(s => s.text) : ['']]
            );
            suggestions.push(...trending);

            // 3. Sản phẩm hot/mới
            const existingTexts = suggestions.map(s => s.text.toLowerCase());
            const [hotProducts] = await pool.query(
                `SELECT ma_sp, ten_sp as text, gia, anh_dai_dien, 'hot' as type 
                 FROM san_pham 
                 ORDER BY ngay_cap_nhat DESC, ma_sp DESC
                 LIMIT 5`
            );
            
            hotProducts.forEach(product => {
                if (!existingTexts.includes(product.text.toLowerCase())) {
                    suggestions.push(product);
                }
            });

            suggestions = suggestions.slice(0, limit);
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
