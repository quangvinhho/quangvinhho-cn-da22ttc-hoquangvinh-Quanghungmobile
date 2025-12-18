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
// Lấy 4 sản phẩm có lượng bán thấp nhất từ database thực
// ============================================================

// Map ảnh mặc định theo hãng - sử dụng ảnh thực tế có trong thư mục images
const brandImageMap = {
  'Apple': 'images/iphone-17-pro-max-256.jpg',
  'Samsung': 'images/samsung-galaxy-s24_15__2.webp',
  'Xiaomi': 'images/Xiaomi.avif',
  'Oppo': 'images/oppo_reno_13_f_4g_256gb.avif',
  'Vivo': 'images/oppo_reno_13_f_4g_256gb.avif',
  'Google': 'images/pixel-9-pro.avif',
  'Sony': 'images/sony-xperia-1-vi.webp',
  'Tecno': 'images/TECNO.avif',
  'Realme': 'images/reno10_5g_-_combo_product_-_blue_-_copy.webp',
  'Asus': 'images/iphone17.avif',
  'default': 'images/iphone17.avif'
};

// Danh sách ảnh thực tế có trong thư mục (để kiểm tra)
const validImages = [
  'iphone-17-pro-max-256.jpg', 'iphone17.avif', 'iphone17.jpg', 'iphone.jpg',
  'iphone-17-pro_1.webp', 'iphone-17-pro-1_1.webp', 'iphone-16-pro-max-titan-den.webp',
  'samsung-galaxy-s24_15__2.webp', 'samsung-galaxy-s24_17__2.webp', 'samsung_galaxy_a36_5g.avif',
  'samsung_galaxy_s24_fe_5g.avif', 'galaxy-s24-plus-den.webp', 'galaxy-s24-plus-vang.webp',
  'Xiaomi.avif', 'home-poco-f8-pro-1125.webp',
  'oppo_reno_13_f_4g_256gb.avif', 'oppo-reno.avif', 'reno-xanh.avif', 'oppx9.avif',
  'pixel-9-pro.avif', 'sony-xperia-1-vi.webp', 'TECNO.avif',
  'reno10_5g_-_combo_product_-_blue_-_copy.webp', '15-256.avif', '15IP.avif'
];

// Helper function để lấy ảnh phù hợp - ưu tiên ảnh theo hãng vì chắc chắn tồn tại
function getSlowMoverImage(row) {
  const brand = row.ten_hang || '';
  const dbImage = row.anh_dai_dien || '';
  
  // Kiểm tra nếu ảnh trong DB nằm trong danh sách ảnh hợp lệ
  const imageName = dbImage.replace('images/', '');
  if (validImages.includes(imageName)) {
    return dbImage.startsWith('images/') ? dbImage : `images/${dbImage}`;
  }
  
  // Fallback: dùng ảnh mặc định theo hãng
  return brandImageMap[brand] || brandImageMap['default'];
}

router.get('/slow-movers', async (req, res) => {
  try {
    // Lấy 4 sản phẩm bán chậm nhất (ít đơn hàng hoàn thành nhất) + thông tin hãng
    const [products] = await pool.query(`
      SELECT 
        sp.ma_sp,
        sp.ten_sp,
        sp.gia,
        sp.anh_dai_dien,
        sp.so_luong_ton,
        hsx.ten_hang,
        COALESCE(sold_data.so_luong_da_ban, 0) as so_luong_da_ban,
        COALESCE(review_data.so_danh_gia, 0) as so_danh_gia,
        COALESCE(review_data.diem_trung_binh, 0) as diem_trung_binh
      FROM san_pham sp
      LEFT JOIN hang_san_xuat hsx ON sp.ma_hang = hsx.ma_hang
      LEFT JOIN (
        SELECT 
          ctdh.ma_sp,
          SUM(ctdh.so_luong) as so_luong_da_ban
        FROM chi_tiet_don_hang ctdh
        JOIN don_hang dh ON ctdh.ma_don = dh.ma_don
        WHERE dh.trang_thai IN ('completed', 'shipping', 'confirmed')
        GROUP BY ctdh.ma_sp
      ) sold_data ON sp.ma_sp = sold_data.ma_sp
      LEFT JOIN (
        SELECT 
          ma_sp,
          COUNT(*) as so_danh_gia,
          AVG(so_sao) as diem_trung_binh
        FROM danh_gia
        GROUP BY ma_sp
      ) review_data ON sp.ma_sp = review_data.ma_sp
      WHERE sp.so_luong_ton > 0
      ORDER BY so_luong_da_ban ASC, sp.ma_sp ASC
      LIMIT 4
    `);

    if (products.length === 0) {
      // Fallback: lấy bất kỳ 4 sản phẩm nào
      const [fallbackProducts] = await pool.query(`
        SELECT 
          sp.ma_sp,
          sp.ten_sp,
          sp.gia,
          sp.anh_dai_dien,
          sp.so_luong_ton,
          hsx.ten_hang,
          0 as so_luong_da_ban,
          0 as so_danh_gia,
          4.5 as diem_trung_binh
        FROM san_pham sp
        LEFT JOIN hang_san_xuat hsx ON sp.ma_hang = hsx.ma_hang
        WHERE sp.so_luong_ton > 0
        ORDER BY RAND()
        LIMIT 4
      `);
      
      return res.json({
        success: true,
        data: fallbackProducts.map(p => ({
          id: p.ma_sp,
          name: p.ten_sp,
          price: parseFloat(p.gia || 0),
          image: getSlowMoverImage(p),
          stock: p.so_luong_ton || 0,
          sold: 0,
          rating: 4.5,
          reviews: 0,
          brand: p.ten_hang || ''
        })),
        message: 'Sản phẩm ưu đãi đặc biệt'
      });
    }

    res.json({
      success: true,
      data: products.map(p => ({
        id: p.ma_sp,
        name: p.ten_sp,
        price: parseFloat(p.gia || 0),
        image: getSlowMoverImage(p),
        stock: p.so_luong_ton || 0,
        sold: parseInt(p.so_luong_da_ban) || 0,
        rating: parseFloat(p.diem_trung_binh) || 4.5,
        reviews: parseInt(p.so_danh_gia) || 0,
        brand: p.ten_hang || ''
      })),
      message: 'Sản phẩm có lượng mua thấp nhất - Ưu đãi đặc biệt!'
    });
  } catch (error) {
    console.error('Get slow movers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
