// Cấu hình kết nối MySQL
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

// Tạo pool kết nối MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Vinh123456789@',
    database: process.env.DB_NAME || 'QHUNG',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test kết nối MySQL
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Kết nối MySQL thành công!');
        connection.release();
    } catch (error) {
        console.error('❌ Lỗi kết nối MySQL:', error.message);
    }
};

module.exports = { pool, testConnection };
