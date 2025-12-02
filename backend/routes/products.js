// API routes cho sản phẩm
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Map ảnh mặc định theo hãng - sử dụng ảnh sản phẩm thực tế
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
    'default': 'images/iphone-17-pro-max-256.jpg'
};

// Helper function để lấy ảnh phù hợp
function getProductImage(row) {
    // Nếu có ảnh trong DB, dùng nó
    const dbImage = row.anh_dai_dien || row.image;
    if (dbImage && (dbImage.includes('.avif') || dbImage.includes('.webp') || dbImage.includes('.png') || dbImage.includes('.jpg'))) {
        return dbImage.startsWith('images/') ? dbImage : `images/${dbImage}`;
    }
    
    // Nếu không, dùng ảnh mặc định theo hãng
    const brand = row.ten_hang || row.brand || '';
    return brandImageMap[brand] || brandImageMap['default'];
}

// Helper function để map dữ liệu từ DB sang format frontend
function mapProductToFrontend(row) {
    const brand = row.ten_hang || row.brand || 'unknown';
    
    return {
        id: row.ma_sp || row.id,
        name: row.ten_sp || row.name,
        brand: brand.toLowerCase(),
        category: row.category || 'dienthoai',
        price: parseFloat(row.gia || row.price) || 0,
        oldPrice: row.oldPrice ? parseFloat(row.oldPrice) : null,
        discount: row.discount || 0,
        ram: row.ram || 8,
        storage: parseInt(row.bo_nho) || row.storage || 128,
        screen: row.screen || '6.5" AMOLED',
        camera: row.camera || '50MP',
        battery: row.battery || '5000 mAh',
        os: row.os || 'Android',
        features: row.features ? (typeof row.features === 'string' ? JSON.parse(row.features) : row.features) : ['tragop'],
        colors: row.colors ? (typeof row.colors === 'string' ? JSON.parse(row.colors) : row.colors) : ['#000000'],
        image: getProductImage(row),
        images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : [],
        sku: row.sku || `SKU-${row.ma_sp || row.id}`,
        rating: row.rating || 4.5,
        reviews: row.reviews || Math.floor(Math.random() * 200) + 50,
        stock: row.so_luong_ton || row.stock || 10,
        description: row.mo_ta || row.description || ''
    };
}

// GET /api/products - Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
    try {
        // Join với bảng hang_san_xuat để lấy tên hãng
        const [rows] = await pool.query(`
            SELECT sp.*, hsx.ten_hang 
            FROM san_pham sp 
            LEFT JOIN hang_san_xuat hsx ON sp.ma_hang = hsx.ma_hang
        `);
        
        // Map dữ liệu sang format frontend
        const products = rows.map(mapProductToFrontend);
        res.json(products);
    } catch (error) {
        console.error('Lỗi lấy sản phẩm:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/products/:id - Lấy chi tiết sản phẩm
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT sp.*, hsx.ten_hang 
            FROM san_pham sp 
            LEFT JOIN hang_san_xuat hsx ON sp.ma_hang = hsx.ma_hang
            WHERE sp.ma_sp = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        }
        
        // Map dữ liệu sang format frontend
        res.json(mapProductToFrontend(rows[0]));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/products - Thêm sản phẩm mới
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const [result] = await pool.query('INSERT INTO san_pham SET ?', data);
        res.status(201).json({ id: result.insertId, message: 'Đã thêm sản phẩm' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/products/:id - Cập nhật sản phẩm
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await pool.query('UPDATE san_pham SET ? WHERE id = ?', [data, id]);
        res.json({ message: `Đã cập nhật sản phẩm ${id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/products/:id - Xóa sản phẩm
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM san_pham WHERE id = ?', [id]);
        res.json({ message: `Đã xóa sản phẩm ${id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
