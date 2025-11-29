// Script to read data from QHUNG database
require('dotenv').config();
const mysql = require('mysql2/promise');

async function readDatabase() {
  let connection;

  try {
    console.log('DB_NAME from env:', process.env.DB_NAME);
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Vinh123456789@',
      database: process.env.DB_NAME || 'QHUNG'
    });

    console.log(`✅ Kết nối thành công đến database ${process.env.DB_NAME || 'QHUNG'}`);

    // Query to get all products
    const [rows] = await connection.query('SELECT * FROM san_pham LIMIT 10');
    console.log('📊 Dữ liệu sản phẩm (10 sản phẩm đầu):');
    console.table(rows);

    // Count total products
    const [countResult] = await connection.query('SELECT COUNT(*) as total FROM san_pham');
    console.log(`📈 Tổng số sản phẩm: ${countResult[0].total}`);

  } catch (error) {
    console.error('❌ Lỗi đọc database:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

readDatabase();