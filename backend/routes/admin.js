// API routes cho Admin Dashboard
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cau hinh multer de upload anh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../frontend/images/products');
        // Tao thu muc neu chua co
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Tao ten file duy nhat
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);
        if (ext && mime) {
            return cb(null, true);
        }
        cb(new Error('Chi chap nhan file anh (jpg, png, gif, webp, avif)'));
    }
});

// ==================== UPLOAD IMAGE ====================

// POST /api/admin/upload - Upload anh dai dien san pham
router.post('/upload', (req, res) => {
    upload.single('image')(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({ success: false, message: 'Loi upload: ' + err.message });
        } else if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ success: false, message: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Khong co file duoc upload' });
        }
        
        // Tra ve URL tuong doi
        const imageUrl = 'images/products/' + req.file.filename;
        console.log('Uploaded file:', imageUrl);
        res.json({ 
            success: true, 
            message: 'Upload thanh cong',
            url: imageUrl,
            filename: req.file.filename
        });
    });
});

// POST /api/admin/upload-gallery - Upload anh mo ta san pham
router.post('/upload-gallery', (req, res) => {
    upload.single('image')(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({ success: false, message: 'Loi upload: ' + err.message });
        } else if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ success: false, message: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Khong co file duoc upload' });
        }
        
        const productId = req.body.productId;
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Thieu productId' });
        }
        
        // Tra ve URL tuong doi
        const imageUrl = 'images/products/' + req.file.filename;
        console.log('Uploaded gallery image:', imageUrl, 'for product:', productId);
        
        // Luu vao bang anh_san_pham
        try {
            await pool.query(
                'INSERT INTO anh_san_pham (ma_sp, duong_dan) VALUES (?, ?)',
                [productId, imageUrl]
            );
            
            res.json({ 
                success: true, 
                message: 'Upload thanh cong',
                url: imageUrl,
                filename: req.file.filename,
                productId: productId
            });
        } catch (dbError) {
            console.error('Error saving to database:', dbError);
            res.status(500).json({ success: false, message: 'Loi luu vao database: ' + dbError.message });
        }
    });
});

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

// POST /api/admin/products - Thêm sản phẩm mới (kèm thông số kỹ thuật)
router.post('/products', async (req, res) => {
    try {
        const { ten_sp, ma_hang, gia, bo_nho, so_luong_ton, mau_sac, ten_mau_sac, mo_ta, anh_dai_dien, cau_hinh } = req.body;
        
        // Lưu màu sắc dạng JSON object chứa cả hex và tên
        let colorData = null;
        if (mau_sac) {
            try {
                const hexColors = typeof mau_sac === 'string' ? JSON.parse(mau_sac) : mau_sac;
                const colorNames = ten_mau_sac ? (typeof ten_mau_sac === 'string' ? JSON.parse(ten_mau_sac) : ten_mau_sac) : [];
                colorData = JSON.stringify({ colors: hexColors, colorNames: colorNames });
            } catch(e) {
                colorData = mau_sac; // Fallback: giữ nguyên nếu không parse được
            }
        }
        
        // Thêm sản phẩm
        const [result] = await pool.query(
            `INSERT INTO san_pham (ten_sp, ma_hang, gia, bo_nho, so_luong_ton, mau_sac, mo_ta, anh_dai_dien) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [ten_sp, ma_hang, gia, bo_nho || 128, so_luong_ton || 0, colorData, mo_ta, anh_dai_dien]
        );
        
        const productId = result.insertId;
        
        // Thêm thông số kỹ thuật vào bảng cau_hinh nếu có
        if (cau_hinh && (cau_hinh.ram || cau_hinh.chip || cau_hinh.man_hinh || cau_hinh.camera || cau_hinh.pin || cau_hinh.he_dieu_hanh)) {
            await pool.query(
                `INSERT INTO cau_hinh (ma_sp, ram, chip, man_hinh, camera, pin, he_dieu_hanh) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [productId, cau_hinh.ram || null, cau_hinh.chip || null, cau_hinh.man_hinh || null, 
                 cau_hinh.camera || null, cau_hinh.pin || null, cau_hinh.he_dieu_hanh || null]
            );
        }
        
        res.json({ success: true, message: 'Thêm sản phẩm thành công', data: { id: productId } });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/products/:id/specs - Lấy thông số kỹ thuật của sản phẩm
router.get('/products/:id/specs', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM cau_hinh WHERE ma_sp = ?', [id]);
        
        if (rows.length === 0) {
            return res.json({ success: true, data: null });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error getting product specs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/products/:id/specs - Cập nhật thông số kỹ thuật riêng
router.put('/products/:id/specs', async (req, res) => {
    try {
        const { id } = req.params;
        const { ram, chip, man_hinh, camera, pin, he_dieu_hanh } = req.body;
        
        // Kiểm tra đã có cấu hình chưa
        const [existing] = await pool.query('SELECT * FROM cau_hinh WHERE ma_sp = ?', [id]);
        
        if (existing.length > 0) {
            // Update cấu hình hiện có
            await pool.query(
                `UPDATE cau_hinh SET ram = ?, chip = ?, man_hinh = ?, camera = ?, pin = ?, he_dieu_hanh = ? WHERE ma_sp = ?`,
                [ram || null, chip || null, man_hinh || null, camera || null, pin || null, he_dieu_hanh || null, id]
            );
        } else {
            // Insert cấu hình mới
            await pool.query(
                `INSERT INTO cau_hinh (ma_sp, ram, chip, man_hinh, camera, pin, he_dieu_hanh) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, ram || null, chip || null, man_hinh || null, camera || null, pin || null, he_dieu_hanh || null]
            );
        }
        
        res.json({ success: true, message: 'Cập nhật cấu hình thành công' });
    } catch (error) {
        console.error('Error updating product specs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/products/:id - Cập nhật sản phẩm (kèm thông số kỹ thuật)
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_sp, ma_hang, gia, bo_nho, so_luong_ton, mau_sac, ten_mau_sac, mo_ta, anh_dai_dien, cau_hinh } = req.body;
        
        // Lưu màu sắc dạng JSON object chứa cả hex và tên
        let colorData = null;
        if (mau_sac) {
            try {
                const hexColors = typeof mau_sac === 'string' ? JSON.parse(mau_sac) : mau_sac;
                const colorNames = ten_mau_sac ? (typeof ten_mau_sac === 'string' ? JSON.parse(ten_mau_sac) : ten_mau_sac) : [];
                colorData = JSON.stringify({ colors: hexColors, colorNames: colorNames });
            } catch(e) {
                colorData = mau_sac; // Fallback: giữ nguyên nếu không parse được
            }
        }
        
        // Cập nhật sản phẩm
        await pool.query(
            `UPDATE san_pham SET ten_sp = ?, ma_hang = ?, gia = ?, bo_nho = ?, 
             so_luong_ton = ?, mau_sac = ?, mo_ta = ?, anh_dai_dien = ? WHERE ma_sp = ?`,
            [ten_sp, ma_hang, gia, bo_nho, so_luong_ton, colorData, mo_ta, anh_dai_dien, id]
        );
        
        // Cập nhật thông số kỹ thuật nếu có
        if (cau_hinh) {
            // Kiểm tra đã có cấu hình chưa
            const [existing] = await pool.query('SELECT * FROM cau_hinh WHERE ma_sp = ?', [id]);
            
            if (existing.length > 0) {
                // Update cấu hình hiện có
                await pool.query(
                    `UPDATE cau_hinh SET ram = ?, chip = ?, man_hinh = ?, camera = ?, pin = ?, he_dieu_hanh = ? WHERE ma_sp = ?`,
                    [cau_hinh.ram || null, cau_hinh.chip || null, cau_hinh.man_hinh || null, 
                     cau_hinh.camera || null, cau_hinh.pin || null, cau_hinh.he_dieu_hanh || null, id]
                );
            } else if (cau_hinh.ram || cau_hinh.chip || cau_hinh.man_hinh || cau_hinh.camera || cau_hinh.pin || cau_hinh.he_dieu_hanh) {
                // Insert cấu hình mới
                await pool.query(
                    `INSERT INTO cau_hinh (ma_sp, ram, chip, man_hinh, camera, pin, he_dieu_hanh) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [id, cau_hinh.ram || null, cau_hinh.chip || null, cau_hinh.man_hinh || null, 
                     cau_hinh.camera || null, cau_hinh.pin || null, cau_hinh.he_dieu_hanh || null]
                );
            }
        }
        
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
        
        // Xóa cấu hình của sản phẩm
        await pool.query('DELETE FROM cau_hinh WHERE ma_sp = ?', [id]);
        // Xóa ảnh sản phẩm
        await pool.query('DELETE FROM anh_san_pham WHERE ma_sp = ?', [id]);
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
        const [brands] = await pool.query(`
            SELECT h.*, q.ten_quoc_gia, 
                   (SELECT COUNT(*) FROM san_pham WHERE ma_hang = h.ma_hang) as so_san_pham
            FROM hang_san_xuat h
            LEFT JOIN quoc_gia q ON h.ma_quoc_gia = q.ma_quoc_gia
            ORDER BY h.ten_hang
        `);
        res.json({ success: true, data: brands });
    } catch (error) {
        console.error('Error getting brands:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/countries - Lấy danh sách quốc gia
router.get('/countries', async (req, res) => {
    try {
        const [countries] = await pool.query('SELECT * FROM quoc_gia ORDER BY ten_quoc_gia');
        res.json({ success: true, data: countries });
    } catch (error) {
        console.error('Error getting countries:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/brands - Thêm hãng sản xuất mới
router.post('/brands', async (req, res) => {
    try {
        const { ten_hang, ma_quoc_gia } = req.body;
        
        if (!ten_hang) {
            return res.status(400).json({ success: false, message: 'Tên hãng không được để trống' });
        }
        
        const [result] = await pool.query(
            'INSERT INTO hang_san_xuat (ten_hang, ma_quoc_gia) VALUES (?, ?)',
            [ten_hang, ma_quoc_gia || null]
        );
        
        res.json({ 
            success: true, 
            message: 'Thêm hãng thành công',
            data: { id: result.insertId, ten_hang, ma_quoc_gia }
        });
    } catch (error) {
        console.error('Error adding brand:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/brands/:id - Cập nhật hãng sản xuất
router.put('/brands/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_hang, ma_quoc_gia } = req.body;
        
        if (!ten_hang) {
            return res.status(400).json({ success: false, message: 'Tên hãng không được để trống' });
        }
        
        await pool.query(
            'UPDATE hang_san_xuat SET ten_hang = ?, ma_quoc_gia = ? WHERE ma_hang = ?',
            [ten_hang, ma_quoc_gia || null, id]
        );
        
        res.json({ success: true, message: 'Cập nhật hãng thành công' });
    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/brands/:id - Xóa hãng sản xuất
router.delete('/brands/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra có sản phẩm nào đang dùng hãng này không
        const [products] = await pool.query('SELECT COUNT(*) as count FROM san_pham WHERE ma_hang = ?', [id]);
        
        if (products[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Không thể xóa hãng này vì đang có ${products[0].count} sản phẩm thuộc hãng` 
            });
        }
        
        await pool.query('DELETE FROM hang_san_xuat WHERE ma_hang = ?', [id]);
        
        res.json({ success: true, message: 'Xóa hãng thành công' });
    } catch (error) {
        console.error('Error deleting brand:', error);
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
        const { tieu_de, noi_dung, anh_dai_dien, video_url, ma_admin } = req.body;
        const [result] = await pool.query(
            'INSERT INTO tin_tuc (tieu_de, noi_dung, anh_dai_dien, video_url, ma_admin) VALUES (?, ?, ?, ?, ?)',
            [tieu_de, noi_dung, anh_dai_dien, video_url || null, ma_admin || null]
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
        const { tieu_de, noi_dung, anh_dai_dien, video_url } = req.body;
        await pool.query(
            'UPDATE tin_tuc SET tieu_de = ?, noi_dung = ?, anh_dai_dien = ?, video_url = ? WHERE ma_tintuc = ?',
            [tieu_de, noi_dung, anh_dai_dien, video_url || null, id]
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

// ==================== CONTACT MANAGEMENT ====================

// GET /api/admin/contacts - Lấy tất cả liên hệ
router.get('/contacts', async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT * FROM lien_he';
        let params = [];
        
        if (status) {
            query += ' WHERE trang_thai = ?';
            params.push(status);
        }
        
        query += ' ORDER BY ngay_gui DESC';
        
        const [contacts] = await pool.query(query, params);
        res.json({ success: true, data: contacts });
    } catch (error) {
        console.error('Error getting contacts:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/contacts/stats - Thống kê liên hệ
router.get('/contacts/stats', async (req, res) => {
    try {
        const [[stats]] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN trang_thai = 'new' THEN 1 ELSE 0 END) as new_count,
                SUM(CASE WHEN trang_thai = 'read' THEN 1 ELSE 0 END) as read_count,
                SUM(CASE WHEN trang_thai = 'replied' THEN 1 ELSE 0 END) as replied_count
            FROM lien_he
        `);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error getting contact stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/contacts/:id - Lấy chi tiết liên hệ
router.get('/contacts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [contacts] = await pool.query('SELECT * FROM lien_he WHERE ma_lien_he = ?', [id]);
        
        if (contacts.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy liên hệ' });
        }
        
        // Tự động cập nhật trạng thái thành 'read' nếu đang là 'new'
        if (contacts[0].trang_thai === 'new') {
            await pool.query("UPDATE lien_he SET trang_thai = 'read' WHERE ma_lien_he = ?", [id]);
            contacts[0].trang_thai = 'read';
        }
        
        res.json({ success: true, data: contacts[0] });
    } catch (error) {
        console.error('Error getting contact:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/contacts/:id/status - Cập nhật trạng thái liên hệ
router.put('/contacts/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['new', 'read', 'replied'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
        }
        
        await pool.query('UPDATE lien_he SET trang_thai = ? WHERE ma_lien_he = ?', [status, id]);
        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        console.error('Error updating contact status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/contacts/:id - Xóa liên hệ
router.delete('/contacts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM lien_he WHERE ma_lien_he = ?', [id]);
        res.json({ success: true, message: 'Xóa liên hệ thành công' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/contacts - Tạo liên hệ mới (từ form frontend)
router.post('/contacts', async (req, res) => {
    try {
        const { ho_ten, email, so_dien_thoai, tieu_de, noi_dung } = req.body;
        
        if (!ho_ten || !email || !noi_dung) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }
        
        const [result] = await pool.query(
            `INSERT INTO lien_he (ho_ten, email, so_dien_thoai, tieu_de, noi_dung, trang_thai) 
             VALUES (?, ?, ?, ?, ?, 'new')`,
            [ho_ten, email, so_dien_thoai || null, tieu_de || null, noi_dung]
        );
        
        res.json({ success: true, message: 'Gửi liên hệ thành công', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== CONTACT RESPONSE (PHẢN HỒI LIÊN HỆ) ====================

// POST /api/admin/contacts/:id/response - Admin gửi phản hồi cho liên hệ
router.post('/contacts/:id/response', async (req, res) => {
    try {
        const { id } = req.params;
        const { noi_dung_phan_hoi, ma_admin } = req.body;
        
        if (!noi_dung_phan_hoi) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung phản hồi' });
        }
        
        // Lấy thông tin liên hệ
        const [contacts] = await pool.query('SELECT * FROM lien_he WHERE ma_lien_he = ?', [id]);
        if (contacts.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy liên hệ' });
        }
        const contact = contacts[0];
        
        // Lưu phản hồi
        const [result] = await pool.query(
            `INSERT INTO phan_hoi_lien_he (ma_lien_he, ma_admin, noi_dung_phan_hoi) 
             VALUES (?, ?, ?)`,
            [id, ma_admin || null, noi_dung_phan_hoi]
        );
        
        // Cập nhật trạng thái liên hệ thành 'replied'
        await pool.query("UPDATE lien_he SET trang_thai = 'replied' WHERE ma_lien_he = ?", [id]);
        
        // Tìm khách hàng theo email để gửi thông báo
        const [customers] = await pool.query('SELECT ma_kh FROM khach_hang WHERE email = ?', [contact.email]);
        
        // Tạo thông báo cho người dùng
        const tieuDeThongBao = 'Phản hồi từ QuangHưngShop';
        const noiDungThongBao = `Liên hệ của bạn về "${contact.tieu_de || 'Hỗ trợ'}" đã được phản hồi: ${noi_dung_phan_hoi.substring(0, 100)}${noi_dung_phan_hoi.length > 100 ? '...' : ''}`;
        
        await pool.query(
            `INSERT INTO thong_bao (ma_kh, email_nguoi_nhan, tieu_de, noi_dung, loai, lien_ket) 
             VALUES (?, ?, ?, ?, 'contact_response', ?)`,
            [
                customers.length > 0 ? customers[0].ma_kh : null,
                contact.email,
                tieuDeThongBao,
                noi_dung_phan_hoi,
                '/contact.html'
            ]
        );
        
        res.json({ 
            success: true, 
            message: 'Phản hồi đã được gửi thành công',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating contact response:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/contacts/:id/responses - Lấy lịch sử phản hồi của liên hệ
router.get('/contacts/:id/responses', async (req, res) => {
    try {
        const { id } = req.params;
        const [responses] = await pool.query(`
            SELECT ph.*, a.ho_ten as admin_name, a.avt as admin_avatar
            FROM phan_hoi_lien_he ph
            LEFT JOIN admin a ON ph.ma_admin = a.ma_admin
            WHERE ph.ma_lien_he = ?
            ORDER BY ph.ngay_phan_hoi DESC
        `, [id]);
        
        res.json({ success: true, data: responses });
    } catch (error) {
        console.error('Error getting contact responses:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== NOTIFICATIONS (THÔNG BÁO) ====================

// GET /api/admin/notifications - Lấy tất cả thông báo (cho admin xem)
router.get('/notifications', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const [notifications] = await pool.query(`
            SELECT * FROM thong_bao 
            ORDER BY ngay_tao DESC 
            LIMIT ?
        `, [parseInt(limit)]);
        
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
