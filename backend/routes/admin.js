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

// ==================== KHUYẾN MÃI (PROMOTIONS) ====================

// GET /api/admin/promotions - Lấy tất cả khuyến mãi
router.get('/promotions', async (req, res) => {
    try {
        const [promotions] = await pool.query(`
            SELECT km.*,
                   CASE 
                       WHEN NOW() < km.ngay_bat_dau THEN 'upcoming'
                       WHEN NOW() > km.ngay_ket_thuc THEN 'expired'
                       WHEN km.so_luong_da_dung >= km.so_luong THEN 'sold_out'
                       ELSE km.trang_thai
                   END as trang_thai_hien_tai,
                   (km.so_luong - km.so_luong_da_dung) as so_luong_con_lai,
                   DATEDIFF(km.ngay_ket_thuc, NOW()) as so_ngay_con_lai
            FROM khuyen_mai km
            ORDER BY km.ngay_tao DESC
        `);
        
        res.json({ success: true, data: promotions });
    } catch (error) {
        console.error('Error getting promotions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/promotions/stats - Thống kê khuyến mãi
router.get('/promotions/stats', async (req, res) => {
    try {
        // Tổng số khuyến mãi
        const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM khuyen_mai');
        
        // Đang hoạt động
        const [[{ active }]] = await pool.query(`
            SELECT COUNT(*) as active FROM khuyen_mai 
            WHERE trang_thai = 'active' 
            AND ngay_bat_dau <= NOW() 
            AND ngay_ket_thuc >= NOW()
            AND so_luong_da_dung < so_luong
        `);
        
        // Sắp diễn ra
        const [[{ upcoming }]] = await pool.query(`
            SELECT COUNT(*) as upcoming FROM khuyen_mai 
            WHERE ngay_bat_dau > NOW()
        `);
        
        // Đã hết hạn
        const [[{ expired }]] = await pool.query(`
            SELECT COUNT(*) as expired FROM khuyen_mai 
            WHERE ngay_ket_thuc < NOW() OR trang_thai = 'expired'
        `);
        
        // Tổng lượt sử dụng
        const [[{ total_used }]] = await pool.query('SELECT COALESCE(SUM(so_luong_da_dung), 0) as total_used FROM khuyen_mai');
        
        res.json({
            success: true,
            data: { total, active, upcoming, expired, total_used }
        });
    } catch (error) {
        console.error('Error getting promotion stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/promotions/:id - Lấy chi tiết khuyến mãi
router.get('/promotions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [promotions] = await pool.query(`
            SELECT * FROM khuyen_mai WHERE ma_km = ?
        `, [id]);
        
        if (promotions.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khuyến mãi' });
        }
        
        // Lấy lịch sử sử dụng
        const [history] = await pool.query(`
            SELECT ls.*, kh.ho_ten, dh.ma_don
            FROM lich_su_voucher ls
            LEFT JOIN khach_hang kh ON ls.ma_kh = kh.ma_kh
            LEFT JOIN don_hang dh ON ls.ma_don = dh.ma_don
            WHERE ls.ma_km = ?
            ORDER BY ls.ngay_su_dung DESC
            LIMIT 20
        `, [id]);
        
        res.json({ success: true, data: { ...promotions[0], history } });
    } catch (error) {
        console.error('Error getting promotion:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/promotions - Thêm khuyến mãi mới
router.post('/promotions', async (req, res) => {
    try {
        const { 
            code, loai_km, loai, gia_tri, mo_ta, 
            dieu_kien_toi_thieu, dieu_kien_toi_da, 
            so_luong, ngay_bat_dau, ngay_ket_thuc, trang_thai 
        } = req.body;
        
        console.log('Adding promotion:', req.body);
        
        if (!code || !gia_tri || !ngay_bat_dau || !ngay_ket_thuc) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
            });
        }
        
        // Kiểm tra code đã tồn tại chưa
        const [existing] = await pool.query('SELECT ma_km FROM khuyen_mai WHERE code = ?', [code.toUpperCase()]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Mã khuyến mãi đã tồn tại' });
        }
        
        // Chuyển đổi datetime-local sang MySQL datetime format
        const formatDateTime = (dt) => {
            if (!dt) return null;
            // Nếu đã có format đúng thì giữ nguyên
            if (dt.includes(' ')) return dt;
            // Chuyển từ YYYY-MM-DDTHH:mm sang YYYY-MM-DD HH:mm:ss
            return dt.replace('T', ' ') + ':00';
        };
        
        const startDate = formatDateTime(ngay_bat_dau);
        const endDate = formatDateTime(ngay_ket_thuc);
        
        console.log('Formatted dates:', { startDate, endDate });
        
        const [result] = await pool.query(`
            INSERT INTO khuyen_mai 
            (code, loai_km, loai, gia_tri, mo_ta, dieu_kien_toi_thieu, dieu_kien_toi_da, so_luong, ngay_bat_dau, ngay_ket_thuc, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            code.toUpperCase(), 
            loai_km || 'voucher', 
            loai || 'percent', 
            gia_tri, 
            mo_ta || '', 
            dieu_kien_toi_thieu || 0, 
            dieu_kien_toi_da || null, 
            so_luong || 100, 
            startDate, 
            endDate, 
            trang_thai || 'active'
        ]);
        
        console.log('Promotion added with ID:', result.insertId);
        
        res.json({ 
            success: true, 
            message: 'Thêm khuyến mãi thành công',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error adding promotion:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/promotions/:id - Cập nhật khuyến mãi
router.put('/promotions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            code, loai_km, loai, gia_tri, mo_ta, 
            dieu_kien_toi_thieu, dieu_kien_toi_da, 
            so_luong, ngay_bat_dau, ngay_ket_thuc, trang_thai 
        } = req.body;
        
        // Kiểm tra code trùng (trừ chính nó)
        if (code) {
            const [existing] = await pool.query(
                'SELECT ma_km FROM khuyen_mai WHERE code = ? AND ma_km != ?', 
                [code, id]
            );
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Mã khuyến mãi đã tồn tại' });
            }
        }
        
        await pool.query(`
            UPDATE khuyen_mai SET
                code = COALESCE(?, code),
                loai_km = COALESCE(?, loai_km),
                loai = COALESCE(?, loai),
                gia_tri = COALESCE(?, gia_tri),
                mo_ta = COALESCE(?, mo_ta),
                dieu_kien_toi_thieu = COALESCE(?, dieu_kien_toi_thieu),
                dieu_kien_toi_da = ?,
                so_luong = COALESCE(?, so_luong),
                ngay_bat_dau = COALESCE(?, ngay_bat_dau),
                ngay_ket_thuc = COALESCE(?, ngay_ket_thuc),
                trang_thai = COALESCE(?, trang_thai)
            WHERE ma_km = ?
        `, [
            code ? code.toUpperCase() : null, 
            loai_km, loai, gia_tri, mo_ta, 
            dieu_kien_toi_thieu, dieu_kien_toi_da, 
            so_luong, ngay_bat_dau, ngay_ket_thuc, trang_thai, id
        ]);
        
        res.json({ success: true, message: 'Cập nhật khuyến mãi thành công' });
    } catch (error) {
        console.error('Error updating promotion:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/promotions/:id - Xóa khuyến mãi
router.delete('/promotions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra đã có lịch sử sử dụng chưa
        const [history] = await pool.query('SELECT COUNT(*) as count FROM lich_su_voucher WHERE ma_km = ?', [id]);
        
        if (history[0].count > 0) {
            // Chỉ đánh dấu inactive thay vì xóa
            await pool.query("UPDATE khuyen_mai SET trang_thai = 'inactive' WHERE ma_km = ?", [id]);
            return res.json({ success: true, message: 'Đã vô hiệu hóa khuyến mãi (có lịch sử sử dụng)' });
        }
        
        // Xóa voucher đã lưu của người dùng
        await pool.query('DELETE FROM voucher_nguoi_dung WHERE ma_km = ?', [id]);
        // Xóa khuyến mãi
        await pool.query('DELETE FROM khuyen_mai WHERE ma_km = ?', [id]);
        
        res.json({ success: true, message: 'Xóa khuyến mãi thành công' });
    } catch (error) {
        console.error('Error deleting promotion:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/promotions/:id/status - Cập nhật trạng thái khuyến mãi
router.put('/promotions/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { trang_thai } = req.body;
        
        await pool.query('UPDATE khuyen_mai SET trang_thai = ? WHERE ma_km = ?', [trang_thai, id]);
        
        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        console.error('Error updating promotion status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/promotions/sync-usage - Đồng bộ số lượng đã dùng từ đơn hàng
router.post('/promotions/sync-usage', async (req, res) => {
    try {
        // Cập nhật so_luong_da_dung dựa trên số đơn hàng đã sử dụng voucher (không bị hủy)
        await pool.query(`
            UPDATE khuyen_mai km
            SET so_luong_da_dung = (
                SELECT COUNT(*)
                FROM don_hang dh
                WHERE dh.ma_km = km.ma_km
                AND dh.trang_thai != 'cancelled'
            )
        `);
        
        // Lấy kết quả sau khi cập nhật
        const [result] = await pool.query(`
            SELECT ma_km, code, so_luong, so_luong_da_dung, 
                   (so_luong - so_luong_da_dung) as so_luong_con_lai
            FROM khuyen_mai
        `);
        
        console.log('Synced voucher usage:', result);
        
        res.json({ 
            success: true, 
            message: 'Đã đồng bộ số lượng đã dùng thành công',
            data: result
        });
    } catch (error) {
        console.error('Error syncing promotion usage:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== FLASH SALE ====================

// GET /api/admin/flash-sales - Lấy tất cả flash sale
router.get('/flash-sales', async (req, res) => {
    try {
        const [flashSales] = await pool.query(`
            SELECT fs.*,
                   COUNT(ctfs.ma_ct_flash) as so_san_pham,
                   COALESCE(SUM(ctfs.so_luong_da_ban), 0) as tong_da_ban,
                   CASE 
                       WHEN NOW() < fs.ngay_bat_dau THEN 'upcoming'
                       WHEN NOW() > fs.ngay_ket_thuc THEN 'ended'
                       ELSE fs.trang_thai
                   END as trang_thai_hien_tai
            FROM flash_sale fs
            LEFT JOIN chi_tiet_flash_sale ctfs ON fs.ma_flash_sale = ctfs.ma_flash_sale
            GROUP BY fs.ma_flash_sale
            ORDER BY fs.ngay_bat_dau DESC
        `);
        
        res.json({ success: true, data: flashSales });
    } catch (error) {
        console.error('Error getting flash sales:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/flash-sales/:id - Lấy chi tiết flash sale
router.get('/flash-sales/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [flashSales] = await pool.query('SELECT * FROM flash_sale WHERE ma_flash_sale = ?', [id]);
        
        if (flashSales.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy Flash Sale' });
        }
        
        // Lấy sản phẩm trong flash sale
        const [products] = await pool.query(`
            SELECT ctfs.*, sp.ten_sp, sp.anh_dai_dien
            FROM chi_tiet_flash_sale ctfs
            JOIN san_pham sp ON ctfs.ma_sp = sp.ma_sp
            WHERE ctfs.ma_flash_sale = ?
        `, [id]);
        
        res.json({ success: true, data: { ...flashSales[0], products } });
    } catch (error) {
        console.error('Error getting flash sale:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/flash-sales - Thêm flash sale mới
router.post('/flash-sales', async (req, res) => {
    try {
        const { ten_su_kien, mo_ta, ngay_bat_dau, ngay_ket_thuc, trang_thai, products } = req.body;
        
        if (!ten_su_kien || !ngay_bat_dau || !ngay_ket_thuc) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
        }
        
        const [result] = await pool.query(`
            INSERT INTO flash_sale (ten_su_kien, mo_ta, ngay_bat_dau, ngay_ket_thuc, trang_thai)
            VALUES (?, ?, ?, ?, ?)
        `, [ten_su_kien, mo_ta || '', ngay_bat_dau, ngay_ket_thuc, trang_thai || 'upcoming']);
        
        const flashSaleId = result.insertId;
        
        // Thêm sản phẩm vào flash sale nếu có
        if (products && products.length > 0) {
            for (const p of products) {
                await pool.query(`
                    INSERT INTO chi_tiet_flash_sale (ma_flash_sale, ma_sp, gia_goc, gia_flash, so_luong_flash)
                    VALUES (?, ?, ?, ?, ?)
                `, [flashSaleId, p.ma_sp, p.gia_goc, p.gia_flash, p.so_luong_flash || 10]);
            }
        }
        
        res.json({ success: true, message: 'Thêm Flash Sale thành công', data: { id: flashSaleId } });
    } catch (error) {
        console.error('Error adding flash sale:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/flash-sales/:id - Cập nhật flash sale
router.put('/flash-sales/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_su_kien, mo_ta, ngay_bat_dau, ngay_ket_thuc, trang_thai } = req.body;
        
        await pool.query(`
            UPDATE flash_sale SET
                ten_su_kien = COALESCE(?, ten_su_kien),
                mo_ta = COALESCE(?, mo_ta),
                ngay_bat_dau = COALESCE(?, ngay_bat_dau),
                ngay_ket_thuc = COALESCE(?, ngay_ket_thuc),
                trang_thai = COALESCE(?, trang_thai)
            WHERE ma_flash_sale = ?
        `, [ten_su_kien, mo_ta, ngay_bat_dau, ngay_ket_thuc, trang_thai, id]);
        
        res.json({ success: true, message: 'Cập nhật Flash Sale thành công' });
    } catch (error) {
        console.error('Error updating flash sale:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/flash-sales/:id - Xóa flash sale
router.delete('/flash-sales/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Xóa chi tiết flash sale trước
        await pool.query('DELETE FROM chi_tiet_flash_sale WHERE ma_flash_sale = ?', [id]);
        // Xóa flash sale
        await pool.query('DELETE FROM flash_sale WHERE ma_flash_sale = ?', [id]);
        
        res.json({ success: true, message: 'Xóa Flash Sale thành công' });
    } catch (error) {
        console.error('Error deleting flash sale:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/flash-sales/:id/products - Thêm sản phẩm vào flash sale
router.post('/flash-sales/:id/products', async (req, res) => {
    try {
        const { id } = req.params;
        const { ma_sp, gia_goc, gia_flash, so_luong_flash } = req.body;
        
        await pool.query(`
            INSERT INTO chi_tiet_flash_sale (ma_flash_sale, ma_sp, gia_goc, gia_flash, so_luong_flash)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE gia_goc = ?, gia_flash = ?, so_luong_flash = ?
        `, [id, ma_sp, gia_goc, gia_flash, so_luong_flash || 10, gia_goc, gia_flash, so_luong_flash || 10]);
        
        res.json({ success: true, message: 'Thêm sản phẩm vào Flash Sale thành công' });
    } catch (error) {
        console.error('Error adding product to flash sale:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/flash-sales/:id/products/:productId - Xóa sản phẩm khỏi flash sale
router.delete('/flash-sales/:id/products/:productId', async (req, res) => {
    try {
        const { id, productId } = req.params;
        
        await pool.query('DELETE FROM chi_tiet_flash_sale WHERE ma_flash_sale = ? AND ma_sp = ?', [id, productId]);
        
        res.json({ success: true, message: 'Xóa sản phẩm khỏi Flash Sale thành công' });
    } catch (error) {
        console.error('Error removing product from flash sale:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
