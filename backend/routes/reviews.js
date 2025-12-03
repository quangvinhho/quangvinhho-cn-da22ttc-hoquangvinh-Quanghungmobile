// API routes cho đánh giá sản phẩm
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/reviews/product/:productId - Lấy tất cả đánh giá của sản phẩm
router.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const [rows] = await pool.query(`
            SELECT dg.*, kh.ho_ten, kh.avt
            FROM danh_gia dg
            LEFT JOIN khach_hang kh ON dg.ma_kh = kh.ma_kh
            WHERE dg.ma_sp = ?
            ORDER BY dg.ngay_danh_gia DESC
        `, [productId]);
        
        // Map dữ liệu sang format frontend
        const reviews = rows.map(row => {
            // Parse ảnh - hỗ trợ cả JSON string và chuỗi phân cách bằng dấu phẩy
            let images = [];
            if (row.hinh_anh) {
                try {
                    images = JSON.parse(row.hinh_anh);
                } catch {
                    images = row.hinh_anh.split(',');
                }
            }
            
            return {
                id: row.ma_dg,
                productId: row.ma_sp,
                userId: row.ma_kh,
                userName: row.ho_ten || 'Khách hàng',
                userAvatar: row.avt || null,
                rating: row.so_sao,
                comment: row.binh_luan,
                images: images,
                date: row.ngay_danh_gia,
                verified: true // Đã mua hàng (có thể check từ đơn hàng)
            };
        });
        
        res.json(reviews);
    } catch (error) {
        console.error('Lỗi lấy đánh giá:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reviews/product/:productId/stats - Lấy thống kê đánh giá của sản phẩm
router.get('/product/:productId/stats', async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Lấy thống kê tổng quan
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as totalReviews,
                AVG(so_sao) as avgRating,
                SUM(CASE WHEN so_sao = 5 THEN 1 ELSE 0 END) as star5,
                SUM(CASE WHEN so_sao = 4 THEN 1 ELSE 0 END) as star4,
                SUM(CASE WHEN so_sao = 3 THEN 1 ELSE 0 END) as star3,
                SUM(CASE WHEN so_sao = 2 THEN 1 ELSE 0 END) as star2,
                SUM(CASE WHEN so_sao = 1 THEN 1 ELSE 0 END) as star1
            FROM danh_gia
            WHERE ma_sp = ?
        `, [productId]);
        
        const total = stats[0].totalReviews || 0;
        const result = {
            totalReviews: total,
            avgRating: stats[0].avgRating ? parseFloat(stats[0].avgRating).toFixed(1) : 0,
            distribution: {
                star5: { count: stats[0].star5 || 0, percent: total > 0 ? Math.round((stats[0].star5 / total) * 100) : 0 },
                star4: { count: stats[0].star4 || 0, percent: total > 0 ? Math.round((stats[0].star4 / total) * 100) : 0 },
                star3: { count: stats[0].star3 || 0, percent: total > 0 ? Math.round((stats[0].star3 / total) * 100) : 0 },
                star2: { count: stats[0].star2 || 0, percent: total > 0 ? Math.round((stats[0].star2 / total) * 100) : 0 },
                star1: { count: stats[0].star1 || 0, percent: total > 0 ? Math.round((stats[0].star1 / total) * 100) : 0 }
            }
        };
        
        res.json(result);
    } catch (error) {
        console.error('Lỗi lấy thống kê đánh giá:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/reviews - Thêm đánh giá mới
router.post('/', async (req, res) => {
    try {
        const { productId, userId, rating, comment, images } = req.body;
        
        // Validate
        if (!productId || !userId || !rating) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Số sao phải từ 1-5' });
        }
        
        // Kiểm tra xem user đã mua sản phẩm này chưa (đơn hàng đã xác nhận trở lên)
        const [purchaseCheck] = await pool.query(`
            SELECT dh.ma_don 
            FROM don_hang dh
            INNER JOIN chi_tiet_don_hang ct ON dh.ma_don = ct.ma_don
            WHERE dh.ma_kh = ? 
              AND ct.ma_sp = ? 
              AND dh.trang_thai IN ('delivered', 'completed', 'da_giao', 'hoan_thanh', 'confirmed', 'paid', 'shipping')
            LIMIT 1
        `, [userId, productId]);
        
        if (purchaseCheck.length === 0) {
            return res.status(403).json({ 
                error: 'Bạn cần mua sản phẩm này trước khi đánh giá',
                code: 'NOT_PURCHASED'
            });
        }
        
        // Kiểm tra xem user đã đánh giá sản phẩm này chưa
        const [existing] = await pool.query(
            'SELECT ma_dg FROM danh_gia WHERE ma_sp = ? AND ma_kh = ?',
            [productId, userId]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Bạn đã đánh giá sản phẩm này rồi' });
        }
        
        // Thêm đánh giá - lưu ảnh dưới dạng JSON string
        const imageStr = images && images.length > 0 ? JSON.stringify(images) : null;
        const [result] = await pool.query(
            'INSERT INTO danh_gia (ma_sp, ma_kh, so_sao, binh_luan, hinh_anh) VALUES (?, ?, ?, ?, ?)',
            [productId, userId, rating, comment || '', imageStr]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Đánh giá đã được gửi thành công!' 
        });
    } catch (error) {
        console.error('Lỗi thêm đánh giá:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/reviews/:id - Cập nhật đánh giá
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, images, userId } = req.body;
        
        // Kiểm tra quyền sở hữu
        const [existing] = await pool.query(
            'SELECT ma_kh FROM danh_gia WHERE ma_dg = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
        }
        
        if (existing[0].ma_kh !== userId) {
            return res.status(403).json({ error: 'Bạn không có quyền sửa đánh giá này' });
        }
        
        const imageStr = images && images.length > 0 ? JSON.stringify(images) : null;
        await pool.query(
            'UPDATE danh_gia SET so_sao = ?, binh_luan = ?, hinh_anh = ? WHERE ma_dg = ?',
            [rating, comment, imageStr, id]
        );
        
        res.json({ message: 'Đã cập nhật đánh giá' });
    } catch (error) {
        console.error('Lỗi cập nhật đánh giá:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/reviews/:id - Xóa đánh giá
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        
        // Kiểm tra quyền sở hữu
        const [existing] = await pool.query(
            'SELECT ma_kh FROM danh_gia WHERE ma_dg = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
        }
        
        if (existing[0].ma_kh !== userId) {
            return res.status(403).json({ error: 'Bạn không có quyền xóa đánh giá này' });
        }
        
        await pool.query('DELETE FROM danh_gia WHERE ma_dg = ?', [id]);
        res.json({ message: 'Đã xóa đánh giá' });
    } catch (error) {
        console.error('Lỗi xóa đánh giá:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reviews/can-review/:productId/:userId - Kiểm tra user có thể đánh giá sản phẩm không
router.get('/can-review/:productId/:userId', async (req, res) => {
    try {
        const { productId, userId } = req.params;
        
        // Kiểm tra đã mua sản phẩm chưa (đơn hàng đã xác nhận trở lên)
        const [purchaseCheck] = await pool.query(`
            SELECT dh.ma_don 
            FROM don_hang dh
            INNER JOIN chi_tiet_don_hang ct ON dh.ma_don = ct.ma_don
            WHERE dh.ma_kh = ? 
              AND ct.ma_sp = ? 
              AND dh.trang_thai IN ('delivered', 'completed', 'da_giao', 'hoan_thanh', 'confirmed', 'paid', 'shipping')
            LIMIT 1
        `, [userId, productId]);
        
        const hasPurchased = purchaseCheck.length > 0;
        
        // Kiểm tra đã đánh giá chưa
        const [reviewCheck] = await pool.query(
            'SELECT ma_dg FROM danh_gia WHERE ma_sp = ? AND ma_kh = ?',
            [productId, userId]
        );
        
        const hasReviewed = reviewCheck.length > 0;
        
        res.json({
            canReview: hasPurchased && !hasReviewed,
            hasPurchased,
            hasReviewed,
            message: !hasPurchased 
                ? 'Bạn cần mua sản phẩm này trước khi đánh giá' 
                : hasReviewed 
                    ? 'Bạn đã đánh giá sản phẩm này rồi' 
                    : 'Bạn có thể đánh giá sản phẩm này'
        });
    } catch (error) {
        console.error('Lỗi kiểm tra quyền đánh giá:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reviews/user/:userId - Lấy tất cả đánh giá của user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await pool.query(`
            SELECT dg.*, sp.ten_sp, sp.anh_dai_dien
            FROM danh_gia dg
            LEFT JOIN san_pham sp ON dg.ma_sp = sp.ma_sp
            WHERE dg.ma_kh = ?
            ORDER BY dg.ngay_danh_gia DESC
        `, [userId]);
        
        const reviews = rows.map(row => ({
            id: row.ma_dg,
            productId: row.ma_sp,
            productName: row.ten_sp,
            productImage: row.anh_dai_dien,
            rating: row.so_sao,
            comment: row.binh_luan,
            images: row.hinh_anh ? row.hinh_anh.split(',') : [],
            date: row.ngay_danh_gia
        }));
        
        res.json(reviews);
    } catch (error) {
        console.error('Lỗi lấy đánh giá của user:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
