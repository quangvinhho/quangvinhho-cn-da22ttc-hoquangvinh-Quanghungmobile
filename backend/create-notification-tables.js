/**
 * Script tạo bảng phản hồi liên hệ và thông báo
 * Chạy: node create-notification-tables.js
 */

require('dotenv').config();
const { pool } = require('./config/database');

async function createTables() {
    try {
        console.log('Bắt đầu tạo bảng phản hồi và thông báo...');

        // 1. Tạo bảng phản hồi liên hệ
        await pool.query(`
            CREATE TABLE IF NOT EXISTS phan_hoi_lien_he (
                ma_phan_hoi INT AUTO_INCREMENT PRIMARY KEY,
                ma_lien_he INT NOT NULL,
                ma_admin INT,
                noi_dung_phan_hoi TEXT NOT NULL,
                ngay_phan_hoi DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ma_lien_he) REFERENCES lien_he(ma_lien_he) ON DELETE CASCADE,
                FOREIGN KEY (ma_admin) REFERENCES admin(ma_admin) ON DELETE SET NULL
            )
        `);
        console.log('✅ Đã tạo bảng phan_hoi_lien_he');

        // 2. Tạo bảng thông báo người dùng
        await pool.query(`
            CREATE TABLE IF NOT EXISTS thong_bao (
                ma_thong_bao INT AUTO_INCREMENT PRIMARY KEY,
                ma_kh INT,
                email_nguoi_nhan VARCHAR(255),
                tieu_de VARCHAR(255) NOT NULL,
                noi_dung TEXT NOT NULL,
                loai ENUM('contact_response', 'order_update', 'promotion', 'system') DEFAULT 'system',
                da_doc TINYINT DEFAULT 0,
                lien_ket VARCHAR(500),
                ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
            )
        `);
        console.log('✅ Đã tạo bảng thong_bao');

        // 3. Thêm cột ma_kh vào bảng lien_he (nếu chưa có) để liên kết với khách hàng đã đăng nhập
        try {
            await pool.query(`
                ALTER TABLE lien_he 
                ADD COLUMN ma_kh INT NULL,
                ADD FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE SET NULL
            `);
            console.log('✅ Đã thêm cột ma_kh vào bảng lien_he');
        } catch (alterError) {
            if (alterError.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Cột ma_kh đã tồn tại trong bảng lien_he');
            } else {
                console.log('ℹ️ Lưu ý:', alterError.message);
            }
        }

        console.log('\n✅ Hoàn tất tạo tất cả các bảng!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

createTables();
