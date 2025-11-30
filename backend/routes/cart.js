const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/cart/:userId - Lấy giỏ hàng của user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Lấy giỏ hàng từ bảng gio_hang và chi_tiet_gio_hang
    const [rows] = await pool.query(`
      SELECT ct.ma_ct, ct.ma_sp, ct.so_luong, ct.gia_tai_thoi_diem,
             sp.ten_sp as name, sp.anh_dai_dien as image, sp.gia as price, sp.mau_sac, sp.bo_nho
      FROM gio_hang gh
      JOIN chi_tiet_gio_hang ct ON gh.ma_gio_hang = ct.ma_gio_hang
      JOIN san_pham sp ON ct.ma_sp = sp.ma_sp
      WHERE gh.ma_kh = ?
    `, [userId]);
    
    // Format data cho frontend
    const cartItems = rows.map(item => ({
      id: item.ma_sp,
      cartItemId: item.ma_ct,
      name: item.name,
      image: item.image ? `images/${item.image}` : 'images/iphone.jpg',
      price: parseFloat(item.gia_tai_thoi_diem) || parseFloat(item.price),
      quantity: item.so_luong,
      color: item.mau_sac || 'Mặc định',
      colorCode: '#000000',
      storage: item.bo_nho || '128GB',
      inStock: true
    }));
    
    res.json({ success: true, data: cartItems });
  } catch (error) {
    console.log('Cart API error:', error.message);
    // Trả về mảng rỗng nếu có lỗi
    res.json({ success: true, data: [] });
  }
});

// POST /api/cart - Thêm sản phẩm vào giỏ hàng
router.post('/', async (req, res) => {
  try {
    const { userId, productId, quantity, color, storage } = req.body;
    
    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const [existing] = await pool.query(
      'SELECT * FROM gio_hang WHERE ma_kh = ? AND ma_sp = ?',
      [userId, productId]
    );
    
    if (existing.length > 0) {
      // Cập nhật số lượng
      await pool.query(
        'UPDATE gio_hang SET so_luong = so_luong + ? WHERE ma_kh = ? AND ma_sp = ?',
        [quantity, userId, productId]
      );
    } else {
      // Thêm mới
      await pool.query(
        'INSERT INTO gio_hang (ma_kh, ma_sp, so_luong, mau_sac, dung_luong) VALUES (?, ?, ?, ?, ?)',
        [userId, productId, quantity, color, storage]
      );
    }
    
    res.json({ success: true, message: 'Đã thêm vào giỏ hàng' });
  } catch (error) {
    console.log('Add to cart error:', error.message);
    res.json({ success: false, message: 'Lỗi thêm giỏ hàng' });
  }
});

// DELETE /api/cart/:userId/:productId - Xóa sản phẩm khỏi giỏ
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    await pool.query(
      'DELETE FROM gio_hang WHERE ma_kh = ? AND ma_sp = ?',
      [userId, productId]
    );
    
    res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// DELETE /api/cart/:userId - Xóa toàn bộ giỏ hàng
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await pool.query('DELETE FROM gio_hang WHERE ma_kh = ?', [userId]);
    
    res.json({ success: true, message: 'Đã xóa giỏ hàng' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

module.exports = router;
