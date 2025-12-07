const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// POST /api/orders - Tạo đơn hàng mới
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      customerId,
      customerName,
      phone,
      address,
      items,
      subtotal,
      shippingFee,
      discount,
      total,
      paymentMethod,
      voucherCode
    } = req.body;

    // Tìm mã khuyến mãi nếu có
    let maKm = null;
    if (voucherCode) {
      const [vouchers] = await connection.query(
        'SELECT ma_km FROM khuyen_mai WHERE code = ? AND ngay_ket_thuc >= NOW() AND so_luong > 0',
        [voucherCode]
      );
      if (vouchers.length > 0) {
        maKm = vouchers[0].ma_km;
        // Giảm số lượng voucher
        await connection.query('UPDATE khuyen_mai SET so_luong = so_luong - 1 WHERE ma_km = ?', [maKm]);
      }
    }

    // Tạo đơn hàng
    const [orderResult] = await connection.query(
      `INSERT INTO don_hang (ma_kh, ten_nguoi_nhan, so_dt, dia_chi_nhan, tong_tien, trang_thai, ma_km)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [customerId || null, customerName, phone, address, total, maKm]
    );
    
    const orderId = orderResult.insertId;

    // Thêm chi tiết đơn hàng
    for (const item of items) {
      await connection.query(
        `INSERT INTO chi_tiet_don_hang (ma_don, ma_sp, so_luong, gia)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.id, item.quantity, item.price]
      );
      
      // Giảm số lượng tồn kho
      await connection.query(
        'UPDATE san_pham SET so_luong_ton = so_luong_ton - ? WHERE ma_sp = ?',
        [item.quantity, item.id]
      );
    }

    // Tạo bản ghi thanh toán
    const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'pending';
    await connection.query(
      `INSERT INTO thanh_toan (ma_don, so_tien, phuong_thuc, trang_thai)
       VALUES (?, ?, ?, ?)`,
      [orderId, total, paymentMethod.toUpperCase(), paymentStatus]
    );

    await connection.commit();

    res.json({
      success: true,
      data: {
        orderId: orderId,
        message: 'Đặt hàng thành công'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo đơn hàng: ' + error.message
    });
  } finally {
    connection.release();
  }
});

// PUT /api/orders/:orderId/payment - Cập nhật trạng thái thanh toán
router.put('/:orderId/payment', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, transactionId } = req.body;

    // Cập nhật thanh toán
    await pool.query(
      `UPDATE thanh_toan SET trang_thai = ?, thoi_gian = NOW() WHERE ma_don = ?`,
      [status, orderId]
    );

    // Nếu thanh toán thành công, cập nhật trạng thái đơn hàng
    if (status === 'success') {
      await pool.query(
        `UPDATE don_hang SET trang_thai = 'confirmed' WHERE ma_don = ?`,
        [orderId]
      );
    }

    res.json({
      success: true,
      message: 'Cập nhật thanh toán thành công'
    });

  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật thanh toán'
    });
  }
});

// GET /api/orders/:orderId - Lấy thông tin đơn hàng
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const [orders] = await pool.query(
      `SELECT dh.*, tt.phuong_thuc, tt.trang_thai as trang_thai_thanh_toan
       FROM don_hang dh
       LEFT JOIN thanh_toan tt ON dh.ma_don = tt.ma_don
       WHERE dh.ma_don = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const [items] = await pool.query(
      `SELECT ct.*, sp.ten_sp, sp.anh_dai_dien
       FROM chi_tiet_don_hang ct
       JOIN san_pham sp ON ct.ma_sp = sp.ma_sp
       WHERE ct.ma_don = ?`,
      [orderId]
    );

    res.json({
      success: true,
      data: {
        ...orders[0],
        items: items
      }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy thông tin đơn hàng' });
  }
});

// GET /api/orders/user/:userId - Lấy danh sách đơn hàng của user (kèm chi tiết sản phẩm)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Lấy danh sách đơn hàng
    const [orders] = await pool.query(
      `SELECT dh.*, tt.phuong_thuc, tt.trang_thai as trang_thai_thanh_toan
       FROM don_hang dh
       LEFT JOIN thanh_toan tt ON dh.ma_don = tt.ma_don
       WHERE dh.ma_kh = ?
       ORDER BY dh.thoi_gian DESC`,
      [userId]
    );

    // Lấy chi tiết sản phẩm cho mỗi đơn hàng
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await pool.query(
        `SELECT ct.ma_sp as id, ct.so_luong as quantity, ct.gia as price,
                sp.ten_sp as name, sp.anh_dai_dien as image, sp.mau_sac as color, sp.bo_nho as storage
         FROM chi_tiet_don_hang ct
         JOIN san_pham sp ON ct.ma_sp = sp.ma_sp
         WHERE ct.ma_don = ?`,
        [order.ma_don]
      );
      
      // Format items với đường dẫn ảnh đúng
      const formattedItems = items.map(item => {
        let imagePath = item.image || 'images/iphone.jpg';
        // Tránh trùng lặp images/images/
        if (imagePath && !imagePath.startsWith('images/') && !imagePath.startsWith('http')) {
          imagePath = `images/${imagePath}`;
        }
        return {
          ...item,
          image: imagePath,
          price: parseFloat(item.price)
        };
      });
      
      return {
        ...order,
        items: formattedItems
      };
    }));

    res.json({ success: true, data: ordersWithItems });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách đơn hàng' });
  }
});

// PUT /api/orders/:orderId/cancel - Người dùng hủy đơn hàng (chỉ khi chưa được admin xác nhận)
router.put('/:orderId/cancel', async (req, res) => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const { orderId } = req.params;
    const { userId } = req.body;

    // Kiểm tra đơn hàng tồn tại và thuộc về user
    const [orders] = await connection.query(
      'SELECT * FROM don_hang WHERE ma_don = ?',
      [orderId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const order = orders[0];

    // Kiểm tra quyền sở hữu (nếu có userId)
    if (userId && order.ma_kh && order.ma_kh != userId) {
      await connection.rollback();
      connection.release();
      return res.status(403).json({ success: false, message: 'Bạn không có quyền hủy đơn hàng này' });
    }

    // Chỉ cho phép hủy khi đơn hàng ở trạng thái 'pending' (chờ xử lý)
    if (order.trang_thai !== 'pending') {
      await connection.rollback();
      connection.release();
      const statusLabels = {
        'confirmed': 'đã được xác nhận',
        'shipping': 'đang giao hàng',
        'delivered': 'đã giao hàng',
        'completed': 'đã hoàn thành',
        'cancelled': 'đã bị hủy'
      };
      const statusText = statusLabels[order.trang_thai] || order.trang_thai;
      return res.status(400).json({ 
        success: false, 
        message: `Không thể hủy đơn hàng đã ${statusText}. Chỉ có thể hủy đơn hàng đang chờ xử lý.`
      });
    }

    // Lấy lý do hủy từ request
    const { cancelReason } = req.body;

    // Cập nhật trạng thái đơn hàng thành cancelled và lưu lý do hủy
    await connection.query(
      'UPDATE don_hang SET trang_thai = ?, ly_do_huy = ? WHERE ma_don = ?',
      ['cancelled', cancelReason || 'Không có lý do', orderId]
    );

    // Hoàn lại số lượng tồn kho cho các sản phẩm
    const [orderItems] = await connection.query(
      'SELECT ma_sp, so_luong FROM chi_tiet_don_hang WHERE ma_don = ?',
      [orderId]
    );

    for (const item of orderItems) {
      await connection.query(
        'UPDATE san_pham SET so_luong_ton = so_luong_ton + ? WHERE ma_sp = ?',
        [item.so_luong, item.ma_sp]
      );
    }

    // Cập nhật trạng thái thanh toán (dùng 'failed' vì ENUM không có 'cancelled')
    await connection.query(
      "UPDATE thanh_toan SET trang_thai = 'failed' WHERE ma_don = ?",
      [orderId]
    );

    // Nếu có sử dụng voucher, hoàn lại số lượng voucher
    if (order.ma_km) {
      await connection.query(
        'UPDATE khuyen_mai SET so_luong = so_luong + 1 WHERE ma_km = ?',
        [order.ma_km]
      );
    }

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: 'Đã hủy đơn hàng thành công'
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hủy đơn hàng: ' + error.message
    });
  }
});

module.exports = router;
