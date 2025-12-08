/**
 * Script thêm cột video_url vào bảng tin_tuc
 */

const { pool } = require('./config/database');

async function addVideoUrlColumn() {
    try {
        console.log('🔄 Đang thêm cột video_url vào bảng tin_tuc...');
        
        // Kiểm tra xem cột đã tồn tại chưa
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'tin_tuc' 
            AND COLUMN_NAME = 'video_url'
        `);
        
        if (columns.length > 0) {
            console.log('✅ Cột video_url đã tồn tại trong bảng tin_tuc');
        } else {
            // Thêm cột video_url
            await pool.query(`
                ALTER TABLE tin_tuc 
                ADD COLUMN video_url VARCHAR(500) NULL 
                AFTER anh_dai_dien
            `);
            console.log('✅ Đã thêm cột video_url thành công!');
        }
        
        // Hiển thị cấu trúc bảng hiện tại
        const [structure] = await pool.query('DESCRIBE tin_tuc');
        console.log('\n📋 Cấu trúc bảng tin_tuc:');
        structure.forEach(col => {
            console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

addVideoUrlColumn();
