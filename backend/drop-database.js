// Script to drop the database
require('dotenv').config();
const mysql = require('mysql2/promise');

async function dropDatabase() {
  let connection;

  try {
    // Create connection without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Vinh123456789@'
    });

    const dbName = process.env.DB_NAME || 'QHUNG';
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    console.log(`✅ Database ${dbName} đã được xóa thành công`);

  } catch (error) {
    console.error('❌ Lỗi xóa database:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

dropDatabase();