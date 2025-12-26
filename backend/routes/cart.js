const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ============================================
// CÁC ROUTE CỤ THỂ PHẢI ĐẶT TRƯỚC ROUTE CÓ PARAMS
// ============================================

// GET /api/cart/debug/:userId - Debug giỏ hàng
router.get('/debug/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Lấy tất cả giỏ hàng của user
    const [carts] = await pool.query(
      'SELECT * FROM gio_hang WHERE ma_kh = ?',
      [userId]
    );
    
    // Lấy tất cả chi tiết giỏ hàng
    let allDetails = [];
    for (const cart of carts) {
      const [details] = await pool.query(
        'SELECT * FROM chi_tiet_gio_hang WHERE ma_gio_hang = ?',
        [cart.ma_gio_hang]
      );
      allDetails.push({
        cart: cart,
        details: details
      });
    }
    
    res.json({
      userId,
      totalCarts: carts.length,
      data: allDetails
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// POST /api/cart/cleanup/:userId - Dọn dẹp giỏ hàng trùng lặp
router.post('/cleanup/:userId', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { userId } = req.params;
    
    console.log('=== CLEANUP CART for user:', userId, '===');
    
    // Lấy tất cả giỏ hàng của user
    const [carts] = await connection.query(
      'SELECT ma_gio_hang FROM gio_hang WHERE ma_kh = ? ORDER BY ma_gio_hang ASC',
      [userId]
    );
    
    console.log('Found carts:', carts);
    
    if (carts.length <= 1) {
      connection.release();
      return res.json({ success: true, message: 'Không cần cleanup', cartsCount: carts.length });
    }
    
    await connection.beginTransaction();
    
    // Giữ lại giỏ hàng đầu tiên, merge các item từ giỏ hàng khác vào
    const mainCartId = carts[0].ma_gio_hang;
    const otherCartIds = carts.slice(1).map(c => c.ma_gio_hang);
    
    console.log('Main cart:', mainCartId);
    console.log('Other carts to merge:', otherCartIds);
    
    // Di chuyển tất cả chi tiết từ các giỏ hàng khác vào giỏ hàng chính
    for (const cartId of otherCartIds) {
      // Lấy chi tiết từ giỏ hàng cần merge
      const [details] = await connection.query(
        'SELECT ma_sp, so_luong, gia_tai_thoi_diem FROM chi_tiet_gio_hang WHERE ma_gio_hang = ?',
        [cartId]
      );
      
      for (const detail of details) {
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chính chưa
        const [existing] = await connection.query(
          'SELECT ma_ct, so_luong FROM chi_tiet_gio_hang WHERE ma_gio_hang = ? AND ma_sp = ?',
          [mainCartId, detail.ma_sp]
        );
        
        if (existing.length > 0) {
          // Cộng dồn số lượng
          await connection.query(
            'UPDATE chi_tiet_gio_hang SET so_luong = so_luong + ? WHERE ma_ct = ?',
            [detail.so_luong, existing[0].ma_ct]
          );
        } else {
          // Thêm mới vào giỏ hàng chính
          await connection.query(
            'INSERT INTO chi_tiet_gio_hang (ma_gio_hang, ma_sp, so_luong, gia_tai_thoi_diem) VALUES (?, ?, ?, ?)',
            [mainCartId, detail.ma_sp, detail.so_luong, detail.gia_tai_thoi_diem]
          );
        }
      }
      
      // Xóa chi tiết giỏ hàng cũ
      await connection.query('DELETE FROM chi_tiet_gio_hang WHERE ma_gio_hang = ?', [cartId]);
      
      // Xóa giỏ hàng cũ
      await connection.query('DELETE FROM gio_hang WHERE ma_gio_hang = ?', [cartId]);
    }
    
    await connection.commit();
    connection.release();
    
    console.log('=== CLEANUP SUCCESS ===');
    res.json({ 
      success: true, 
      message: `Đã merge ${otherCartIds.length} giỏ hàng vào giỏ hàng chính`,
      mainCartId,
      mergedCarts: otherCartIds
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Cleanup error:', error);
    res.json({ success: false, message: error.message });
  }
});

// DELETE /api/cart/remove/:cartItemId - Xóa theo cartItemId
router.delete('/remove/:cartItemId', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { cartItemId } = req.params;
    
    console.log('=== DELETE /remove/:cartItemId ===');
    console.log('cartItemId:', cartItemId, 'type:', typeof cartItemId);
    
    // Kiểm tra cartItemId hợp lệ
    if (!cartItemId || isNaN(cartItemId)) {
      connection.release();
      return res.json({ success: false, message: 'cartItemId không hợp lệ' });
    }
    
    const cartItemIdNum = parseInt(cartItemId, 10);
    console.log('cartItemIdNum:', cartItemIdNum);
    
    // Kiểm tra xem item có tồn tại không trước khi xóa
    const [checkExist] = await connection.query(
      'SELECT ma_ct, ma_gio_hang, ma_sp FROM chi_tiet_gio_hang WHERE ma_ct = ?',
      [cartItemIdNum]
    );
    console.log('Item exists check:', checkExist);
    
    if (checkExist.length === 0) {
      console.log('Item not found in database, cartItemId:', cartItemIdNum);
      connection.release();
      return res.json({ success: true, message: 'Item không tồn tại hoặc đã bị xóa', affectedRows: 0, deleted: true });
    }
    
    // Bắt đầu transaction để đảm bảo xóa thành công
    await connection.beginTransaction();
    
    const [result] = await connection.query(
      'DELETE FROM chi_tiet_gio_hang WHERE ma_ct = ?',
      [cartItemIdNum]
    );
    
    console.log('Delete result:', result);
    console.log('Affected rows:', result.affectedRows);
    
    // Kiểm tra lại sau khi xóa
    const [checkAfter] = await connection.query(
      'SELECT ma_ct FROM chi_tiet_gio_hang WHERE ma_ct = ?',
      [cartItemIdNum]
    );
    
    const isDeleted = checkAfter.length === 0;
    console.log('After delete check:', isDeleted ? 'DELETED' : 'STILL EXISTS');
    
    if (!isDeleted) {
      // Rollback nếu không xóa được
      await connection.rollback();
      connection.release();
      console.error('CRITICAL: Item still exists after DELETE query! Rolling back...');
      return res.json({ 
        success: false, 
        message: 'Không thể xóa sản phẩm, vui lòng thử lại', 
        affectedRows: result.affectedRows,
        deleted: false
      });
    }
    
    // Commit transaction
    await connection.commit();
    connection.release();
    
    console.log('=== DELETE SUCCESS ===');
    
    res.json({ 
      success: true, 
      message: 'Đã xóa khỏi giỏ hàng', 
      affectedRows: result.affectedRows,
      deleted: true
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Delete cart item error:', error);
    res.json({ success: false, message: error.message });
  }
});

// DELETE /api/cart/clear/:userId - Xóa toàn bộ giỏ hàng
router.delete('/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('DELETE /clear/:userId called with:', userId);
    
    // Lấy TẤT CẢ ma_gio_hang của user (có thể có nhiều do bug)
    const [carts] = await pool.query(
      'SELECT ma_gio_hang FROM gio_hang WHERE ma_kh = ?',
      [userId]
    );
    
    console.log('Found carts for user:', carts);
    
    // Xóa tất cả chi tiết giỏ hàng từ TẤT CẢ giỏ hàng
    for (const cart of carts) {
      const [result] = await pool.query(
        'DELETE FROM chi_tiet_gio_hang WHERE ma_gio_hang = ?',
        [cart.ma_gio_hang]
      );
      console.log(`Deleted ${result.affectedRows} items from cart ${cart.ma_gio_hang}`);
    }
    
    res.json({ success: true, message: 'Đã xóa giỏ hàng', cartsCleared: carts.length });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.json({ success: false, message: error.message });
  }
});

// PUT /api/cart/update - Cập nhật số lượng
router.put('/update', async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;
    
    await pool.query(
      'UPDATE chi_tiet_gio_hang SET so_luong = ? WHERE ma_ct = ?',
      [quantity, cartItemId]
    );
    
    res.json({ success: true, message: 'Đã cập nhật số lượng' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// POST /api/cart - Thêm sản phẩm vào giỏ hàng
router.post('/', async (req, res) => {
  try {
    const { userId, productId, quantity = 1, productInfo } = req.body;
    
    if (!userId || !productId) {
      return res.json({ success: false, message: 'Thiếu thông tin userId hoặc productId' });
    }
    
    // Lấy thông tin sản phẩm từ database
    const [products] = await pool.query(
      'SELECT ma_sp, ten_sp, gia, mau_sac, bo_nho, anh_dai_dien FROM san_pham WHERE ma_sp = ?',
      [productId]
    );
    
    let product;
    let price;
    let isFromDB = false;
    
    if (products.length > 0) {
      // Sản phẩm có trong database
      product = products[0];
      price = parseFloat(product.gia) || 0;
      isFromDB = true;
    } else if (productInfo) {
      // Sản phẩm từ JSON file - dùng thông tin từ frontend
      product = {
        ma_sp: productId,
        ten_sp: productInfo.name,
        gia: productInfo.price,
        mau_sac: productInfo.color || 'Mặc định',
        bo_nho: productInfo.storage || '128GB',
        anh_dai_dien: productInfo.image
      };
      price = parseFloat(productInfo.price) || 0;
      isFromDB = false;
    } else {
      return res.json({ success: false, message: 'Sản phẩm không tồn tại' });
    }
    
    // Chỉ lưu vào database nếu sản phẩm có trong bảng san_pham
    if (isFromDB) {
      // Kiểm tra/tạo giỏ hàng cho user
      let [carts] = await pool.query(
        'SELECT ma_gio_hang FROM gio_hang WHERE ma_kh = ?',
        [userId]
      );
      
      let cartId;
      if (carts.length === 0) {
        // Tạo giỏ hàng mới
        const [result] = await pool.query(
          'INSERT INTO gio_hang (ma_kh) VALUES (?)',
          [userId]
        );
        cartId = result.insertId;
      } else {
        cartId = carts[0].ma_gio_hang;
      }
      
      // Kiểm tra sản phẩm đã có trong chi tiết giỏ hàng chưa
      const [existing] = await pool.query(
        'SELECT ma_ct, so_luong FROM chi_tiet_gio_hang WHERE ma_gio_hang = ? AND ma_sp = ?',
        [cartId, productId]
      );
      
      if (existing.length > 0) {
        // Cập nhật số lượng
        await pool.query(
          'UPDATE chi_tiet_gio_hang SET so_luong = so_luong + ? WHERE ma_ct = ?',
          [quantity, existing[0].ma_ct]
        );
      } else {
        // Thêm mới vào chi tiết giỏ hàng
        await pool.query(
          'INSERT INTO chi_tiet_gio_hang (ma_gio_hang, ma_sp, so_luong, gia_tai_thoi_diem) VALUES (?, ?, ?, ?)',
          [cartId, productId, quantity, price]
        );
      }
    }
    
    // Xử lý đường dẫn ảnh
    let imagePath = product.anh_dai_dien || 'images/15-256.avif';
    if (imagePath && !imagePath.startsWith('images/') && !imagePath.startsWith('http')) {
      imagePath = `images/${imagePath}`;
    }
    
    res.json({ 
      success: true, 
      message: isFromDB ? 'Đã thêm vào giỏ hàng' : 'Đã thêm vào giỏ hàng (localStorage)',
      savedToDB: isFromDB,
      product: {
        id: product.ma_sp,
        name: product.ten_sp,
        price: price,
        image: imagePath,
        color: product.mau_sac || 'Mặc định',
        storage: product.bo_nho || '128GB'
      }
    });
  } catch (error) {
    console.log('Add to cart error:', error.message);
    res.json({ success: true, message: 'Đã thêm vào giỏ hàng (localStorage)', savedToDB: false });
  }
});

// ============================================
// CÁC ROUTE CÓ PARAMS ĐẶT SAU
// ============================================

// GET /api/cart/:userId - Lấy giỏ hàng của user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('=== GET /:userId ===');
    console.log('userId:', userId);
    
    // Debug: Kiểm tra TẤT CẢ giỏ hàng của user (có thể có nhiều do bug)
    const [allCarts] = await pool.query(
      'SELECT ma_gio_hang FROM gio_hang WHERE ma_kh = ?',
      [userId]
    );
    console.log('All carts for user:', allCarts);
    
    if (allCarts.length > 1) {
      console.warn('WARNING: User has multiple carts! This may cause issues.');
    }
    
    // Lấy giỏ hàng từ TẤT CẢ các bản ghi gio_hang của user
    const [rows] = await pool.query(`
      SELECT ct.ma_ct, ct.ma_sp, ct.so_luong, ct.gia_tai_thoi_diem, ct.ma_gio_hang,
             sp.ten_sp, sp.anh_dai_dien, sp.gia, sp.mau_sac, sp.bo_nho, sp.so_luong_ton
      FROM gio_hang gh
      JOIN chi_tiet_gio_hang ct ON gh.ma_gio_hang = ct.ma_gio_hang
      JOIN san_pham sp ON ct.ma_sp = sp.ma_sp
      WHERE gh.ma_kh = ?
    `, [userId]);
    
    console.log('Cart items from DB:', rows.length);
    rows.forEach((item, i) => {
      console.log(`Item ${i}: ma_ct=${item.ma_ct}, ma_sp=${item.ma_sp}, ma_gio_hang=${item.ma_gio_hang}`);
    });
    
    // Format data cho frontend
    const cartItems = rows.map(item => {
      const price = parseFloat(item.gia_tai_thoi_diem) || parseFloat(item.gia) || 0;
      
      // Xử lý đường dẫn ảnh
      let imagePath = item.anh_dai_dien || '';
      if (!imagePath) {
        imagePath = 'images/15-256.avif';
      } else if (imagePath.startsWith('images/')) {
        // Đã có prefix, giữ nguyên
      } else if (!imagePath.startsWith('http')) {
        imagePath = `images/${imagePath}`;
      }
      imagePath = imagePath.replace('images/images/', 'images/');
      
      // Xử lý màu sắc
      let colorName = 'Mặc định';
      let colorCode = '#000000';
      
      if (item.mau_sac) {
        try {
          if (item.mau_sac.startsWith('{') || item.mau_sac.startsWith('[')) {
            const colorData = JSON.parse(item.mau_sac);
            if (colorData.colorNames && colorData.colorNames.length > 0) {
              colorName = colorData.colorNames[0];
            }
            if (colorData.colors && colorData.colors.length > 0) {
              colorCode = colorData.colors[0];
            }
          } else {
            colorName = item.mau_sac;
          }
        } catch (e) {
          colorName = item.mau_sac;
        }
      }
      
      return {
        id: item.ma_sp,
        cartItemId: item.ma_ct,
        name: item.ten_sp || 'Sản phẩm',
        image: imagePath,
        price: price,
        originalPrice: price,
        quantity: item.so_luong || 1,
        color: colorName,
        colorCode: colorCode,
        storage: item.bo_nho || '128GB',
        inStock: (item.so_luong_ton || 0) > 0,
        stockCount: item.so_luong_ton || 0
      };
    });
    
    console.log('=== GET SUCCESS ===');
    res.json({ success: true, data: cartItems });
  } catch (error) {
    console.log('Cart API error:', error.message);
    res.json({ success: true, data: [] });
  }
});

// DELETE /api/cart/:userId/:productId - Xóa sản phẩm khỏi giỏ theo userId và productId
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    console.log('DELETE /:userId/:productId called with:', userId, productId);
    
    // Lấy ma_gio_hang của user
    const [carts] = await pool.query(
      'SELECT ma_gio_hang FROM gio_hang WHERE ma_kh = ?',
      [userId]
    );
    
    if (carts.length > 0) {
      const [result] = await pool.query(
        'DELETE FROM chi_tiet_gio_hang WHERE ma_gio_hang = ? AND ma_sp = ?',
        [carts[0].ma_gio_hang, productId]
      );
      console.log('Delete by userId/productId result:', result);
    }
    
    res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng' });
  } catch (error) {
    console.error('Delete cart error:', error);
    res.json({ success: false, message: error.message });
  }
});

module.exports = router;
