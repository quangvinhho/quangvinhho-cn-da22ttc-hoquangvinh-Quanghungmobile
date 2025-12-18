const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ============================================================
// 1. LẤY DANH SÁCH VOUCHER KHẢ DỤNG
// ============================================================
router.get('/vouchers/available', async (req, res) => {
  try {
    console.log('Fetching available vouchers...');
    
    // Debug: Lấy tất cả voucher để kiểm tra
    const [allVouchers] = await pool.query('SELECT code, trang_thai, ngay_bat_dau, ngay_ket_thuc, NOW() as now_time FROM khuyen_mai LIMIT 10');
    console.log('All vouchers in DB:', allVouchers);
    
    const [vouchers] = await pool.query(`
      SELECT 
        ma_km,
        code,
        loai_km,
        loai,
        gia_tri,
        mo_ta,
        dieu_kien_toi_thieu,
        dieu_kien_toi_da,
        so_luong,
        so_luong_da_dung,
        (so_luong - so_luong_da_dung) as so_luong_con_lai,
        ngay_bat_dau,
        ngay_ket_thuc,
        DATEDIFF(ngay_ket_thuc, NOW()) as so_ngay_con_lai
      FROM khuyen_mai
      WHERE trang_thai = 'active'
        AND ngay_bat_dau <= NOW()
        AND ngay_ket_thuc >= NOW()
        AND so_luong_da_dung < so_luong
      ORDER BY ngay_ket_thuc ASC
      LIMIT 50
    `);
    
    console.log('Available vouchers found:', vouchers.length);

    res.json({
      success: true,
      data: vouchers.map(v => ({
        id: v.ma_km,
        code: v.code,
        type: v.loai_km,
        discountType: v.loai,
        discountValue: parseFloat(v.gia_tri),
        description: v.mo_ta,
        minOrder: parseFloat(v.dieu_kien_toi_thieu),
        maxOrder: v.dieu_kien_toi_da ? parseFloat(v.dieu_kien_toi_da) : null,
        totalQuantity: v.so_luong,
        usedQuantity: v.so_luong_da_dung,
        remainingQuantity: v.so_luong_con_lai,
        startDate: v.ngay_bat_dau,
        endDate: v.ngay_ket_thuc,
        daysRemaining: v.so_ngay_con_lai
      }))
    });
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// DEBUG: LẤY TẤT CẢ VOUCHER (không lọc)
// ============================================================
router.get('/vouchers/all', async (req, res) => {
  try {
    const [vouchers] = await pool.query(`
      SELECT 
        ma_km, code, loai_km, loai, gia_tri, mo_ta,
        dieu_kien_toi_thieu, so_luong, so_luong_da_dung,
        trang_thai, ngay_bat_dau, ngay_ket_thuc,
        NOW() as server_time,
        CASE 
          WHEN ngay_bat_dau > NOW() THEN 'chua_bat_dau'
          WHEN ngay_ket_thuc < NOW() THEN 'da_het_han'
          WHEN so_luong_da_dung >= so_luong THEN 'het_luot'
          WHEN trang_thai != 'active' THEN 'khong_active'
          ELSE 'kha_dung'
        END as ly_do
      FROM khuyen_mai
      ORDER BY ngay_tao DESC
    `);
    
    res.json({ success: true, data: vouchers, count: vouchers.length });
  } catch (error) {
    console.error('Get all vouchers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// 2. KIỂM TRA VOUCHER CÓ HỢP LỆ
// ============================================================
router.post('/vouchers/validate', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { code, totalAmount } = req.body;

    if (!code || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã voucher hoặc tổng tiền'
      });
    }

    // Gọi stored procedure
    const [result] = await connection.query(
      'CALL sp_validate_voucher(?, ?, @valid, @message, @ma_km, @gia_tri_giam)',
      [code, totalAmount]
    );

    const [output] = await connection.query(
      'SELECT @valid as valid, @message as message, @ma_km as ma_km, @gia_tri_giam as gia_tri_giam'
    );

    const { valid, message, ma_km, gia_tri_giam } = output[0];

    if (valid === 1) {
      res.json({
        success: true,
        data: {
          voucherId: ma_km,
          code: code,
          discountAmount: parseFloat(gia_tri_giam),
          message: message
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: message
      });
    }
  } catch (error) {
    console.error('Validate voucher error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

// ============================================================
// 3. LẤY DANH SÁCH FLASH SALE ĐANG DIỄN RA
// ============================================================
router.get('/flash-sales/active', async (req, res) => {
  try {
    const [flashSales] = await pool.query(`
      SELECT 
        fs.ma_flash_sale,
        fs.ten_su_kien,
        fs.mo_ta,
        fs.anh_dai_dien,
        fs.ngay_bat_dau,
        fs.ngay_ket_thuc,
        TIMESTAMPDIFF(MINUTE, NOW(), fs.ngay_ket_thuc) as phut_con_lai,
        COUNT(ctfs.ma_ct_flash) as so_san_pham,
        COALESCE(SUM(ctfs.so_luong_da_ban), 0) as tong_da_ban
      FROM flash_sale fs
      LEFT JOIN chi_tiet_flash_sale ctfs ON fs.ma_flash_sale = ctfs.ma_flash_sale
      WHERE fs.trang_thai = 'active'
        AND fs.ngay_bat_dau <= NOW()
        AND fs.ngay_ket_thuc >= NOW()
      GROUP BY fs.ma_flash_sale
      ORDER BY fs.ngay_ket_thuc ASC
    `);

    res.json({
      success: true,
      data: flashSales.map(fs => ({
        id: fs.ma_flash_sale,
        name: fs.ten_su_kien,
        description: fs.mo_ta,
        image: fs.anh_dai_dien,
        startTime: fs.ngay_bat_dau,
        endTime: fs.ngay_ket_thuc,
        minutesRemaining: fs.phut_con_lai,
        productCount: fs.so_san_pham,
        totalSold: fs.tong_da_ban
      }))
    });
  } catch (error) {
    console.error('Get flash sales error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// 4. LẤY CHI TIẾT FLASH SALE (SẢN PHẨM TRONG FLASH SALE)
// ============================================================
router.get('/flash-sales/:flashSaleId/products', async (req, res) => {
  try {
    const { flashSaleId } = req.params;

    const [products] = await pool.query(`
      SELECT 
        ctfs.ma_ct_flash,
        ctfs.ma_sp,
        sp.ten_sp,
        sp.anh_dai_dien,
        ctfs.gia_goc,
        ctfs.gia_flash,
        ctfs.so_luong_flash,
        ctfs.so_luong_da_ban,
        (ctfs.so_luong_flash - ctfs.so_luong_da_ban) as so_luong_con_lai,
        ROUND(((ctfs.gia_goc - ctfs.gia_flash) / ctfs.gia_goc * 100), 0) as phan_tram_giam
      FROM chi_tiet_flash_sale ctfs
      JOIN san_pham sp ON ctfs.ma_sp = sp.ma_sp
      WHERE ctfs.ma_flash_sale = ?
      ORDER BY ctfs.so_luong_da_ban DESC
    `, [flashSaleId]);

    res.json({
      success: true,
      data: products.map(p => ({
        id: p.ma_ct_flash,
        productId: p.ma_sp,
        name: p.ten_sp,
        image: p.anh_dai_dien ? (p.anh_dai_dien.startsWith('images/') ? p.anh_dai_dien : `images/${p.anh_dai_dien}`) : 'images/iphone.jpg',
        originalPrice: parseFloat(p.gia_goc),
        flashPrice: parseFloat(p.gia_flash),
        totalQuantity: p.so_luong_flash,
        soldQuantity: p.so_luong_da_ban,
        remainingQuantity: p.so_luong_con_lai,
        discountPercent: p.phan_tram_giam
      }))
    });
  } catch (error) {
    console.error('Get flash sale products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// 5. LẤY KHUYẾN MÃI SẢN PHẨM (DISCOUNT TRỰC TIẾP)
// ============================================================
router.get('/products/:productId/discount', async (req, res) => {
  try {
    const { productId } = req.params;

    const [discount] = await pool.query(`
      SELECT 
        ma_km_sp,
        loai_giam,
        gia_tri_giam,
        ngay_bat_dau,
        ngay_ket_thuc
      FROM khuyen_mai_san_pham
      WHERE ma_sp = ?
        AND trang_thai = 'active'
        AND ngay_bat_dau <= NOW()
        AND ngay_ket_thuc >= NOW()
      LIMIT 1
    `, [productId]);

    if (discount.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    const d = discount[0];
    res.json({
      success: true,
      data: {
        id: d.ma_km_sp,
        discountType: d.loai_giam,
        discountValue: parseFloat(d.gia_tri_giam),
        startDate: d.ngay_bat_dau,
        endDate: d.ngay_ket_thuc
      }
    });
  } catch (error) {
    console.error('Get product discount error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// 6. LƯU VOUCHER CHO NGƯỜI DÙNG
// ============================================================
router.post('/vouchers/:voucherId/save', async (req, res) => {
  try {
    const { voucherId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Cần đăng nhập để lưu voucher'
      });
    }

    // Kiểm tra voucher tồn tại
    const [voucher] = await pool.query(
      'SELECT ma_km FROM khuyen_mai WHERE ma_km = ? AND trang_thai = "active"',
      [voucherId]
    );

    if (voucher.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Voucher không tồn tại'
      });
    }

    // Thêm vào danh sách lưu
    await pool.query(
      'INSERT IGNORE INTO voucher_nguoi_dung (ma_kh, ma_km) VALUES (?, ?)',
      [userId, voucherId]
    );

    res.json({
      success: true,
      message: 'Đã lưu voucher'
    });
  } catch (error) {
    console.error('Save voucher error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// 7. LẤY DANH SÁCH VOUCHER ĐÃ LƯU CỦA NGƯỜI DÙNG
// ============================================================
router.get('/user/:userId/saved-vouchers', async (req, res) => {
  try {
    const { userId } = req.params;

    const [vouchers] = await pool.query(`
      SELECT 
        km.ma_km,
        km.code,
        km.loai_km,
        km.loai,
        km.gia_tri,
        km.mo_ta,
        km.dieu_kien_toi_thieu,
        km.dieu_kien_toi_da,
        km.so_luong,
        km.so_luong_da_dung,
        (km.so_luong - km.so_luong_da_dung) as so_luong_con_lai,
        km.ngay_ket_thuc,
        vn.da_su_dung
      FROM voucher_nguoi_dung vn
      JOIN khuyen_mai km ON vn.ma_km = km.ma_km
      WHERE vn.ma_kh = ?
        AND km.trang_thai = 'active'
        AND km.ngay_ket_thuc >= NOW()
        AND vn.da_su_dung = 0
      ORDER BY km.ngay_ket_thuc ASC
    `, [userId]);

    res.json({
      success: true,
      data: vouchers.map(v => ({
        id: v.ma_km,
        code: v.code,
        type: v.loai_km,
        discountType: v.loai,
        discountValue: parseFloat(v.gia_tri),
        description: v.mo_ta,
        minOrder: parseFloat(v.dieu_kien_toi_thieu),
        maxOrder: v.dieu_kien_toi_da ? parseFloat(v.dieu_kien_toi_da) : null,
        remainingQuantity: v.so_luong_con_lai,
        endDate: v.ngay_ket_thuc
      }))
    });
  } catch (error) {
    console.error('Get saved vouchers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// 8. TÍNH TỔNG TIỀN ĐƠN HÀNG (CÓ TÍNH KHUYẾN MÃI)
// ============================================================
router.post('/calculate-total', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { subtotal, voucherId, items } = req.body;

    if (!subtotal || !items) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu'
      });
    }

    // Gọi stored procedure
    await connection.query(
      'CALL sp_calculate_order_total(?, ?, ?, @tien_giam_voucher, @tien_giam_san_pham, @tien_giam_flash_sale, @tien_ship, @tong_tien)',
      [subtotal, voucherId || null, JSON.stringify(items)]
    );

    const [output] = await connection.query(
      'SELECT @tien_giam_voucher as tien_giam_voucher, @tien_giam_san_pham as tien_giam_san_pham, @tien_giam_flash_sale as tien_giam_flash_sale, @tien_ship as tien_ship, @tong_tien as tong_tien'
    );

    const result = output[0];

    res.json({
      success: true,
      data: {
        subtotal: parseFloat(subtotal),
        voucherDiscount: parseFloat(result.tien_giam_voucher),
        productDiscount: parseFloat(result.tien_giam_san_pham),
        flashSaleDiscount: parseFloat(result.tien_giam_flash_sale),
        shippingFee: parseFloat(result.tien_ship),
        totalDiscount: parseFloat(result.tien_giam_voucher) + parseFloat(result.tien_giam_san_pham) + parseFloat(result.tien_giam_flash_sale),
        total: parseFloat(result.tong_tien)
      }
    });
  } catch (error) {
    console.error('Calculate total error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

// ============================================================
// LẤY SẢN PHẨM BÁN CHẬM NHẤT (SLOW MOVERS)
// Thay đổi mỗi 12 giờ dựa trên thời gian hiện tại
// ============================================================
router.get('/slow-movers', async (req, res) => {
  try {
    // Tính offset dựa trên chu kỳ 12 giờ
    // Mỗi 12 giờ sẽ lấy 4 sản phẩm khác nhau
    const now = new Date();
    const hoursSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60));
    const cycleNumber = Math.floor(hoursSinceEpoch / 12); // Chu kỳ 12 giờ
    const offset = (cycleNumber % 10) * 4; // Offset thay đổi mỗi 12 giờ, quay vòng sau 10 chu kỳ

    // Lấy 4 sản phẩm bán chậm nhất (ít đơn hàng nhất)
    const [products] = await pool.query(`
      SELECT 
        sp.ma_sp,
        sp.ten_sp,
        sp.gia,
        sp.anh_dai_dien,
        sp.so_luong_ton,
        COALESCE(SUM(ctdh.so_luong), 0) as so_luong_da_ban
      FROM san_pham sp
      LEFT JOIN chi_tiet_don_hang ctdh ON sp.ma_sp = ctdh.ma_sp
      GROUP BY sp.ma_sp, sp.ten_sp, sp.gia, sp.anh_dai_dien, sp.so_luong_ton
      ORDER BY so_luong_da_ban ASC, sp.ma_sp ASC
      LIMIT 4 OFFSET ?
    `, [offset]);

    // Nếu không đủ sản phẩm với offset, lấy từ đầu
    if (products.length === 0) {
      const [fallbackProducts] = await pool.query(`
        SELECT 
          sp.ma_sp,
          sp.ten_sp,
          sp.gia,
          sp.anh_dai_dien,
          sp.so_luong_ton,
          COALESCE(SUM(ctdh.so_luong), 0) as so_luong_da_ban
        FROM san_pham sp
        LEFT JOIN chi_tiet_don_hang ctdh ON sp.ma_sp = ctdh.ma_sp
        GROUP BY sp.ma_sp, sp.ten_sp, sp.gia, sp.anh_dai_dien, sp.so_luong_ton
        ORDER BY so_luong_da_ban ASC, sp.ma_sp ASC
        LIMIT 4
      `);
      
      return res.json({
        success: true,
        data: fallbackProducts.map(p => ({
          id: p.ma_sp,
          name: p.ten_sp,
          price: parseFloat(p.gia || 0),
          image: p.anh_dai_dien ? `images/${p.anh_dai_dien}` : 'images/iphone.jpg',
          stock: p.so_luong_ton || 0,
          sold: parseInt(p.so_luong_da_ban) || 0,
          rating: 4.5,
          reviews: 10
        })),
        cycle: cycleNumber,
        nextChangeIn: 12 - (now.getHours() % 12) + ' giờ'
      });
    }

    res.json({
      success: true,
      data: products.map(p => ({
        id: p.ma_sp,
        name: p.ten_sp,
        price: parseFloat(p.gia || 0),
        image: p.anh_dai_dien ? `images/${p.anh_dai_dien}` : 'images/iphone.jpg',
        stock: p.so_luong_ton || 0,
        sold: parseInt(p.so_luong_da_ban) || 0,
        rating: 4.5,
        reviews: 10
      })),
      cycle: cycleNumber,
      nextChangeIn: 12 - (now.getHours() % 12) + ' giờ'
    });
  } catch (error) {
    console.error('Get slow movers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
