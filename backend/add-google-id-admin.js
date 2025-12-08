// Script thêm cột google_id vào bảng admin
const { pool } = require('./config/database');

async function addGoogleIdToAdmin() {
    try {
        console.log('🔧 Thêm cột google_id vào bảng admin...');
        
        // Kiểm tra cột đã tồn tại chưa
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'admin' 
            AND COLUMN_NAME = 'google_id'
        `);
        
        if (columns.length > 0) {
            console.log('✅ Cột google_id đã tồn tại trong bảng admin');
        } else {
            // Thêm cột google_id
            await pool.query(`
                ALTER TABLE admin 
                ADD COLUMN google_id VARCHAR(255) AFTER avt
            `);
            console.log('✅ Đã thêm cột google_id vào bảng admin');
        }

        // Kiểm tra cột email đã tồn tại chưa
        const [emailColumns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'admin' 
            AND COLUMN_NAME = 'email'
        `);
        
        if (emailColumns.length > 0) {
            console.log('✅ Cột email đã tồn tại trong bảng admin');
        } else {
            // Thêm cột email
            await pool.query(`
                ALTER TABLE admin 
                ADD COLUMN email VARCHAR(255) AFTER tai_khoan
            `);
            console.log('✅ Đã thêm cột email vào bảng admin');
        }

        console.log('🎉 Hoàn thành cập nhật bảng admin!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

addGoogleIdToAdmin();
