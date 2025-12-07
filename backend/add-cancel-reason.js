// Script thêm cột ly_do_huy vào bảng don_hang
const { pool } = require('./config/database');

async function addCancelReasonColumn() {
  try {
    await pool.query('ALTER TABLE don_hang ADD COLUMN ly_do_huy TEXT NULL');
    console.log('✅ Đã thêm cột ly_do_huy vào bảng don_hang');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ Cột ly_do_huy đã tồn tại');
    } else {
      console.error('❌ Lỗi:', error.message);
    }
  }
  process.exit(0);
}

addCancelReasonColumn();
