require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateProducts() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Thêm các hãng mới nếu chưa có
        const newBrands = [
            ['Google', 2],  // Mỹ
            ['Tecno', 5]    // Trung Quốc
        ];
        
        for (const [tenHang, maQuocGia] of newBrands) {
            const [existing] = await conn.execute('SELECT ma_hang FROM hang_san_xuat WHERE ten_hang = ?', [tenHang]);
            if (existing.length === 0) {
                await conn.execute('INSERT INTO hang_san_xuat (ten_hang, ma_quoc_gia) VALUES (?, ?)', [tenHang, maQuocGia]);
                console.log(`Đã thêm hãng: ${tenHang}`);
            }
        }

        // Lấy danh sách mã hãng
        const [brands] = await conn.execute('SELECT ma_hang, ten_hang FROM hang_san_xuat');
        const brandMap = {};
        brands.forEach(b => brandMap[b.ten_hang] = b.ma_hang);
        console.log('Danh sách hãng:', brandMap);

        // Cập nhật ảnh cho sản phẩm hiện có theo tên hãng
        const imageUpdates = [
            // Apple - cập nhật ảnh iPhone
            { brand: 'Apple', image: 'images/iphone-17-pro-max-256.jpg' },
            // Samsung
            { brand: 'Samsung', image: 'images/samsung-galaxy-s24_15__2.webp' },
            // Xiaomi
            { brand: 'Xiaomi', image: 'images/Xiaomi.avif' },
            // Oppo
            { brand: 'Oppo', image: 'images/oppo_reno_13_f_4g_256gb.avif' },
            // Vivo
            { brand: 'Vivo', image: 'images/oppo_reno_13_f_4g_256gb.avif' },
            // Sony
            { brand: 'Sony', image: 'images/sony-xperia-1-vi.webp' },
        ];

        for (const update of imageUpdates) {
            const maHang = brandMap[update.brand];
            if (maHang) {
                await conn.execute(
                    'UPDATE san_pham SET anh_dai_dien = ? WHERE ma_hang = ?',
                    [update.image, maHang]
                );
                console.log(`Đã cập nhật ảnh cho hãng ${update.brand}`);
            }
        }

        // Thêm sản phẩm mới (không xóa sản phẩm cũ)
        // Cấu trúc: [ten_sp, ma_hang, gia, so_luong_ton, mo_ta, mau_sac, bo_nho, anh_dai_dien]
        const newProducts = [
            // iPhone products mới
            ['iPhone 17 Pro Max 256GB', brandMap['Apple'], 34990000, 50, 'Flagship mới nhất của Apple với chip A18 Pro', 'Titan Đen', '256GB', 'images/iphone-17-pro-max-256.jpg'],
            ['iPhone 17 Pro 128GB', brandMap['Apple'], 28990000, 50, 'iPhone 17 Pro với camera 48MP', 'Titan Trắng', '128GB', 'images/iphone-17-pro_1.webp'],
            
            // Samsung products mới
            ['Samsung Galaxy S24 FE 128GB', brandMap['Samsung'], 16990000, 50, 'Samsung Galaxy S24 Fan Edition', 'Đen', '128GB', 'images/samsung_galaxy_s24_fe_5g.avif'],
            ['Samsung Galaxy A36 5G 128GB', brandMap['Samsung'], 8490000, 50, 'Samsung tầm trung mới nhất', 'Xanh', '128GB', 'images/samsung_galaxy_a36_5g.avif'],
            ['Samsung Galaxy A56 5G 256GB', brandMap['Samsung'], 9690000, 40, 'Samsung Galaxy A56 5G', 'Tím', '256GB', 'images/A56.avif'],
            
            // Xiaomi products mới
            ['POCO F8 Pro 256GB', brandMap['Xiaomi'], 12990000, 40, 'POCO F8 Pro gaming phone', 'Đen', '256GB', 'images/home-poco-f8-pro-1125.webp'],
            
            // OPPO products mới
            ['OPPO Find X9 Pro 256GB', brandMap['Oppo'], 21990000, 30, 'OPPO Find X9 Pro flagship', 'Đen', '256GB', 'images/oppx9.avif'],
            ['OPPO Reno 13F 4G 256GB', brandMap['Oppo'], 7990000, 50, 'OPPO Reno 13F mới', 'Xanh', '256GB', 'images/oppo_reno_13_f_4g_256gb.avif'],
            
            // Google products
            ['Google Pixel 9 Pro 128GB', brandMap['Google'], 23990000, 25, 'Google Pixel 9 Pro với AI', 'Trắng', '128GB', 'images/pixel-9-pro.avif'],
            
            // Sony products mới
            ['Sony Xperia 10 VII 128GB', brandMap['Sony'], 10990000, 30, 'Sony Xperia 10 VII', 'Đen', '128GB', 'images/cate_XPERIA_10VII_1125.webp'],
            
            // Tecno products
            ['TECNO Pova 6 256GB', brandMap['Tecno'], 5490000, 50, 'TECNO Pova 6 pin khủng 6000mAh', 'Xanh', '256GB', 'images/TECNO.avif']
        ];

        let addedCount = 0;
        for (const p of newProducts) {
            // Kiểm tra sản phẩm đã tồn tại chưa
            const [existing] = await conn.execute('SELECT ma_sp FROM san_pham WHERE ten_sp = ?', [p[0]]);
            if (existing.length === 0) {
                await conn.execute(
                    'INSERT INTO san_pham (ten_sp, ma_hang, gia, so_luong_ton, mo_ta, mau_sac, bo_nho, anh_dai_dien) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    p
                );
                addedCount++;
            }
        }
        console.log(`Đã thêm ${addedCount} sản phẩm mới với ảnh từ thư mục images`);
        
        // Hiển thị kết quả
        const [result] = await conn.execute('SELECT ma_sp, ten_sp, anh_dai_dien FROM san_pham');
        console.log('\nDanh sách sản phẩm:');
        result.forEach(p => console.log(`  ${p.ma_sp}. ${p.ten_sp} - ${p.anh_dai_dien}`));
        
    } catch (error) {
        console.error('Lỗi:', error.message);
    }
    await conn.end();
}

updateProducts();
