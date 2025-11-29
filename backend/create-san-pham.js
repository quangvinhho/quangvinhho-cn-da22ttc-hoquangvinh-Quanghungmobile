require('dotenv').config();
const mysql = require('mysql2/promise');

async function createTable() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS san_pham (
                ma_sp INT AUTO_INCREMENT PRIMARY KEY,
                ten_sp VARCHAR(255) NOT NULL,
                ma_hang INT,
                gia DECIMAL(15,2),
                gia_cu DECIMAL(15,2),
                giam_gia INT DEFAULT 0,
                ram INT DEFAULT 8,
                bo_nho INT DEFAULT 128,
                anh_dai_dien VARCHAR(500),
                mo_ta TEXT,
                so_luong_ton INT DEFAULT 10,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ma_hang) REFERENCES hang_san_xuat(ma_hang)
            )
        `);
        console.log('Created san_pham table');

        const products = [
            ['iPhone 15 Pro Max', 1, 34990000, 8, 256, 'images/iphone17.avif', 50],
            ['iPhone 15 Pro', 1, 28990000, 8, 128, 'images/iphone17.avif', 50],
            ['Samsung Galaxy S24 Ultra', 2, 33990000, 12, 256, 'images/samsung.webp', 50],
            ['Samsung Galaxy S24+', 2, 26990000, 12, 256, 'images/samsung.webp', 50],
            ['Xiaomi 14 Ultra', 3, 23990000, 16, 512, 'images/Xiaomi.avif', 50],
            ['Xiaomi 14', 3, 18990000, 12, 256, 'images/Xiaomi.avif', 50],
            ['OPPO Find X7 Ultra', 4, 24990000, 16, 512, 'images/oppo-reno.avif', 50],
            ['OPPO Reno 11 Pro', 4, 12990000, 12, 256, 'images/oppo-reno.avif', 50]
        ];

        for (const p of products) {
            await conn.execute(
                'INSERT INTO san_pham (ten_sp, ma_hang, gia, ram, bo_nho, anh_dai_dien, so_luong_ton) VALUES (?, ?, ?, ?, ?, ?, ?)',
                p
            );
        }
        console.log('Added sample products');
    } catch (error) {
        console.error('Error:', error.message);
    }
    await conn.end();
}

createTable();
