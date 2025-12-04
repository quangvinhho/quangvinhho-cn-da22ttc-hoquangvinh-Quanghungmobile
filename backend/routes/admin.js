// API routes cho Admin Dashboard
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ==================== ADMIN PROFILE ====================

// GET /api/admin/profile/:id - Lấy thông tin admin từ database
router.get('/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [admins] = await pool.query(
            'SELECT ma_admin, tai_khoan, ho_ten, quyen, avt FROM admin WHERE ma_admin = ?',
            [id]
        );
        
        if (admins.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy admin' });
        }
        
        res.json({ success: true, data: admins[0] });
    } catch (error) {
        console.error('Error getting admin profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/profile-by-account/:account - Lấy thông tin admin theo tài khoản
router.get('/profile-by-account/:account', async (req, res) => {
    try {
        const { account } = req.params;
        
        const [admins] = await pool.query(
            'SELECT ma_admin, tai_khoan, ho_ten, quyen, avt FROM admin WHERE tai_khoan = ?',
            [account]
        );
        
        if (admins.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy admin' });
        }
        
        res.json({ success: true, data: admins[0] });
    } catch (error) {
        console.error('Error getting admin profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/profile/:id - Cập nhật thông tin admin
router.put('/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ho_ten, avt } = req.body;
        
        let updateFields = [];
        let updateValues = [];
        
        if (ho_ten) {
            updateFields.push('ho_ten = ?');
            updateValues.push(ho_ten);
        }
        if (avt !== undefined) {
            updateFields.push('avt = ?');
            updateValues.push(avt);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có dữ liệu để cập nhật' });
        }
        
        updateValues.push(id);
        await pool.query(
            `UPDATE admin SET ${updateFields.join(', ')} WHERE ma_admin = ?`,
            updateValues
        );
        
        // Lấy thông tin mới
        const [admins] = await pool.query(
            'SELECT ma_admin, tai_khoan, ho_ten, quyen, avt FROM admin WHERE ma_admin = ?',
            [id]
        );
        
        res.json({ success: true, message: 'Cập nhật thành công', data: admins[0] });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== ORDERS ====================

// GET /api/admin/orders - Lấy tất cả đơn hàng
router.get('/orders', async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT dh.*, tt.phuong_thuc, tt.trang_thai as trang_thai_thanh_toan,
                   (SELECT COUNT(*) FROM chi_tiet_don_hang WHERE ma_don = dh.ma_don) as so_san_pham
            FROM don_hang dh
            LEFT JOIN thanh_toan tt ON dh.ma_don = tt.ma_don
            ORDER BY dh.thoi_gian DESC
        `);
        
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/orders/:id/status - Cập nhật trạng thái đơn hàng
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await pool.query('UPDATE don_hang SET trang_thai = ? WHERE ma_don = ?', [status, id]);
        
        // Nếu đơn hàng đã giao, cập nhật thanh toán COD thành công
        if (status === 'delivered') {
            await pool.query(
                "UPDATE thanh_toan SET trang_thai = 'success' WHERE ma_don = ? AND phuong_thuc = 'COD'",
                [id]
            );
        }
        
        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== CUSTOMERS ====================

// GET /api/admin/customers - Lấy tất cả khách hàng
router.get('/customers', async (req, res) => {
    try {
        const [customers] = await pool.query(`
            SELECT kh.*,
                   (SELECT COUNT(*) FROM don_hang WHERE ma_kh = kh.ma_kh) as so_don_hang,
                   (SELECT COALESCE(SUM(tong_tien), 0) FROM don_hang WHERE ma_kh = kh.ma_kh) as tong_chi_tieu
            FROM khach_hang kh
            ORDER BY kh.ma_kh DESC
        `);
        
        // Remove password from response
        const safeCustomers = customers.map(c => {
            const { mat_khau, ...customer } = c;
            return customer;
        });
        
        res.json({ success: true, data: safeCustomers });
    } catch (error) {
        console.error('Error getting customers:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/customers/:id - Lấy chi tiết khách hàng
router.get('/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [customers] = await pool.query(`
            SELECT kh.*,
                   (SELECT COUNT(*) FROM don_hang WHERE ma_kh = kh.ma_kh) as so_don_hang,
                   (SELECT COALESCE(SUM(tong_tien), 0) FROM don_hang WHERE ma_kh = kh.ma_kh) as tong_chi_tieu
            FROM khach_hang kh
            WHERE kh.ma_kh = ?
        `, [id]);
        
        if (customers.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
        }
        
        const { mat_khau, ...customer } = customers[0];
        
        // Get customer orders
        const [orders] = await pool.query(`
            SELECT * FROM don_hang WHERE ma_kh = ? ORDER BY thoi_gian DESC LIMIT 10
        `, [id]);
        
        res.json({ success: true, data: { ...customer, orders } });
    } catch (error) {
        console.error('Error getting customer:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== REVIEWS ====================

// GET /api/admin/reviews - Lấy tất cả đánh giá
router.get('/reviews', async (req, res) => {
    try {
        const [reviews] = await pool.query(`
            SELECT dg.*, kh.ho_ten, kh.avt, sp.ten_sp
            FROM danh_gia dg
            LEFT JOIN khach_hang kh ON dg.ma_kh = kh.ma_kh
            LEFT JOIN san_pham sp ON dg.ma_sp = sp.ma_sp
            ORDER BY dg.ngay_danh_gia DESC
        `);
        
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/reviews/:id - Xóa đánh giá
router.delete('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM danh_gia WHERE ma_dg = ?', [id]);
        res.json({ success: true, message: 'Đã xóa đánh giá' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== STATISTICS ====================

// GET /api/admin/stats - Lấy thống kê tổng quan
router.get('/stats', async (req, res) => {
    try {
        // Total revenue
        const [[{ total_revenue }]] = await pool.query(
            "SELECT COALESCE(SUM(tong_tien), 0) as total_revenue FROM don_hang WHERE trang_thai != 'cancelled'"
        );
        
        // Total orders
        const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) as total_orders FROM don_hang');
        
        // Total customers
        const [[{ total_customers }]] = await pool.query('SELECT COUNT(*) as total_customers FROM khach_hang');
        
        // Total products
        const [[{ total_products }]] = await pool.query('SELECT COUNT(*) as total_products FROM san_pham');
        
        // Pending orders
        const [[{ pending_orders }]] = await pool.query(
            "SELECT COUNT(*) as pending_orders FROM don_hang WHERE trang_thai = 'pending'"
        );
        
        // Monthly revenue
        const [monthlyRevenue] = await pool.query(`
            SELECT MONTH(thoi_gian) as month, SUM(tong_tien) as revenue
            FROM don_hang
            WHERE YEAR(thoi_gian) = YEAR(CURDATE()) AND trang_thai != 'cancelled'
            GROUP BY MONTH(thoi_gian)
            ORDER BY month
        `);
        
        // Orders by status
        const [ordersByStatus] = await pool.query(`
            SELECT trang_thai, COUNT(*) as count
            FROM don_hang
            GROUP BY trang_thai
        `);
        
        res.json({
            success: true,
            data: {
                total_revenue,
                total_orders,
                total_customers,
                total_products,
                pending_orders,
                monthly_revenue: monthlyRevenue,
                orders_by_status: ordersByStatus
            }
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/stats/top-products - Top sản phẩm bán chạy
router.get('/stats/top-products', async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT sp.*, hsx.ten_hang, COALESCE(SUM(ct.so_luong), 0) as total_sold
            FROM san_pham sp
            LEFT JOIN hang_san_xuat hsx ON sp.ma_hang = hsx.ma_hang
            LEFT JOIN chi_tiet_don_hang ct ON sp.ma_sp = ct.ma_sp
            LEFT JOIN don_hang dh ON ct.ma_don = dh.ma_don AND dh.trang_thai != 'cancelled'
            GROUP BY sp.ma_sp
            ORDER BY total_sold DESC
            LIMIT 10
        `);
        
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Error getting top products:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== PRODUCTS MANAGEMENT ====================

// GET /api/admin/products - Lấy tất cả sản phẩm với thông tin chi tiết
router.get('/products', async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT sp.*, hsx.ten_hang as brand,
                   (SELECT COUNT(*) FROM danh_gia WHERE ma_sp = sp.ma_sp) as review_count,
                   (SELECT AVG(so_sao) FROM danh_gia WHERE ma_sp = sp.ma_sp) as avg_rating
            FROM san_pham sp
            LEFT JOIN hang_san_xuat hsx ON sp.ma_hang = hsx.ma_hang
            ORDER BY sp.ma_sp DESC
        `);
        
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/products - Thêm sản phẩm mới
router.post('/products', async (req, res) => {
    try {
        const { ten_sp, ma_hang, gia, bo_nho, so_luong_ton, mau_sac, mo_ta, anh_dai_dien } = req.body;
        
        const [result] = await pool.query(
            `INSERT INTO san_pham (ten_sp, ma_hang, gia, bo_nho, so_luong_ton, mau_sac, mo_ta, anh_dai_dien) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [ten_sp, ma_hang, gia, bo_nho || 128, so_luong_ton || 0, mau_sac, mo_ta, anh_dai_dien]
        );
        
        res.json({ success: true, message: 'Thêm sản phẩm thành công', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/products/:id - Cập nhật sản phẩm
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_sp, ma_hang, gia, bo_nho, so_luong_ton, mau_sac, mo_ta, anh_dai_dien } = req.body;
        
        await pool.query(
            `UPDATE san_pham SET ten_sp = ?, ma_hang = ?, gia = ?, bo_nho = ?, 
             so_luong_ton = ?, mau_sac = ?, mo_ta = ?, anh_dai_dien = ? WHERE ma_sp = ?`,
            [ten_sp, ma_hang, gia, bo_nho, so_luong_ton, mau_sac, mo_ta, anh_dai_dien, id]
        );
        
        res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/products/:id - Xóa sản phẩm
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra sản phẩm có trong đơn hàng không
        const [orders] = await pool.query('SELECT COUNT(*) as count FROM chi_tiet_don_hang WHERE ma_sp = ?', [id]);
        if (orders[0].count > 0) {
            return res.status(400).json({ success: false, message: 'Không thể xóa sản phẩm đã có trong đơn hàng' });
        }
        
        // Xóa đánh giá của sản phẩm
        await pool.query('DELETE FROM danh_gia WHERE ma_sp = ?', [id]);
        // Xóa sản phẩm
        await pool.query('DELETE FROM san_pham WHERE ma_sp = ?', [id]);
        
        res.json({ success: true, message: 'Xóa sản phẩm thành công' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== BRANDS ====================

// GET /api/admin/brands - Lấy danh sách hãng sản xuất
router.get('/brands', async (req, res) => {
    try {
        const [brands] = await pool.query('SELECT * FROM hang_san_xuat ORDER BY ten_hang');
        res.json({ success: true, data: brands });
    } catch (error) {
        console.error('Error getting brands:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== ORDER DETAILS ====================

// GET /api/admin/orders/:id - Lấy chi tiết đơn hàng
router.get('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [orders] = await pool.query(`
            SELECT dh.*, tt.phuong_thuc, tt.trang_thai as trang_thai_thanh_toan, kh.ho_ten as ten_khach_hang, kh.email
            FROM don_hang dh
            LEFT JOIN thanh_toan tt ON dh.ma_don = tt.ma_don
            LEFT JOIN khach_hang kh ON dh.ma_kh = kh.ma_kh
            WHERE dh.ma_don = ?
        `, [id]);
        
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }
        
        const [items] = await pool.query(`
            SELECT ct.*, sp.ten_sp, sp.anh_dai_dien, sp.mau_sac
            FROM chi_tiet_don_hang ct
            JOIN san_pham sp ON ct.ma_sp = sp.ma_sp
            WHERE ct.ma_don = ?
        `, [id]);
        
        res.json({ success: true, data: { ...orders[0], items } });
    } catch (error) {
        console.error('Error getting order detail:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/orders/:id - Xóa đơn hàng
router.delete('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Xóa chi tiết đơn hàng
        await pool.query('DELETE FROM chi_tiet_don_hang WHERE ma_don = ?', [id]);
        // Xóa thanh toán
        await pool.query('DELETE FROM thanh_toan WHERE ma_don = ?', [id]);
        // Xóa đơn hàng
        await pool.query('DELETE FROM don_hang WHERE ma_don = ?', [id]);
        
        res.json({ success: true, message: 'Xóa đơn hàng thành công' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== DASHBOARD STATS ====================

// GET /api/admin/dashboard - Lấy dữ liệu dashboard tổng hợp
router.get('/dashboard', async (req, res) => {
    try {
        // Thống kê tổng quan
        const [[stats]] = await pool.query(`
            SELECT 
                (SELECT COALESCE(SUM(tong_tien), 0) FROM don_hang WHERE trang_thai != 'cancelled' AND MONTH(thoi_gian) = MONTH(CURDATE())) as revenue_month,
                (SELECT COUNT(*) FROM don_hang) as total_orders,
                (SELECT COUNT(*) FROM don_hang WHERE trang_thai = 'pending') as pending_orders,
                (SELECT COUNT(*) FROM khach_hang) as total_customers,
                (SELECT COUNT(*) FROM san_pham) as total_products
        `);
        
        // Đơn hàng gần đây
        const [recentOrders] = await pool.query(`
            SELECT dh.*, tt.phuong_thuc
            FROM don_hang dh
            LEFT JOIN thanh_toan tt ON dh.ma_don = tt.ma_don
            ORDER BY dh.thoi_gian DESC
            LIMIT 5
        `);
        
        // Doanh thu theo tháng (năm hiện tại)
        const [monthlyRevenue] = await pool.query(`
            SELECT MONTH(thoi_gian) as month, COALESCE(SUM(tong_tien), 0) as revenue
            FROM don_hang
            WHERE YEAR(thoi_gian) = YEAR(CURDATE()) AND trang_thai != 'cancelled'
            GROUP BY MONTH(thoi_gian)
            ORDER BY month
        `);
        
        // Đơn hàng theo trạng thái
        const [ordersByStatus] = await pool.query(`
            SELECT trang_thai, COUNT(*) as count
            FROM don_hang
            GROUP BY trang_thai
        `);
        
        res.json({
            success: true,
            data: {
                stats,
                recentOrders,
                monthlyRevenue,
                ordersByStatus
            }
        });
    } catch (error) {
        console.error('Error getting dashboard:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== NEWS MANAGEMENT ====================

// GET /api/admin/news - Lấy tất cả tin tức
router.get('/news', async (req, res) => {
    try {
        const [news] = await pool.query(`
            SELECT tt.*, a.ho_ten as ten_admin
            FROM tin_tuc tt
            LEFT JOIN admin a ON tt.ma_admin = a.ma_admin
            ORDER BY tt.ngay_dang DESC
        `);
        res.json({ success: true, data: news });
    } catch (error) {
        console.error('Error getting news:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/news - Thêm tin tức mới
router.post('/news', async (req, res) => {
    try {
        const { tieu_de, noi_dung, anh_dai_dien, ma_admin } = req.body;
        const [result] = await pool.query(
            'INSERT INTO tin_tuc (tieu_de, noi_dung, anh_dai_dien, ma_admin) VALUES (?, ?, ?, ?)',
            [tieu_de, noi_dung, anh_dai_dien, ma_admin || null]
        );
        res.json({ success: true, message: 'Thêm tin tức thành công', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error adding news:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/news/:id - Cập nhật tin tức
router.put('/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { tieu_de, noi_dung, anh_dai_dien } = req.body;
        await pool.query(
            'UPDATE tin_tuc SET tieu_de = ?, noi_dung = ?, anh_dai_dien = ? WHERE ma_tintuc = ?',
            [tieu_de, noi_dung, anh_dai_dien, id]
        );
        res.json({ success: true, message: 'Cập nhật tin tức thành công' });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/news/:id - Xóa tin tức
router.delete('/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tin_tuc WHERE ma_tintuc = ?', [id]);
        res.json({ success: true, message: 'Xóa tin tức thành công' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
