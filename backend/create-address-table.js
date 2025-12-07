// Script để tạo bảng địa chỉ nhận hàng
const { pool } = require('./config/database');

async function createAddressTable() {
  try {
    console.log('Đang tạo bảng dia_chi_nhan_hang...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dia_chi_nhan_hang (
        ma_dia_chi INT AUTO_INCREMENT PRIMARY KEY,
        ma_kh INT NOT NULL,
        ho_ten_nguoi_nhan VARCHAR(150) NOT NULL,
        so_dien_thoai VARCHAR(20) NOT NULL,
        tinh_thanh VARCHAR(100) NOT NULL,
        quan_huyen VARCHAR(100) NOT NULL,
        phuong_xa VARCHAR(100) NOT NULL,
        dia_chi_cu_the VARCHAR(300) NOT NULL,
        loai_dia_chi ENUM('nha_rieng','co_quan') DEFAULT 'nha_rieng',
        mac_dinh TINYINT DEFAULT 0,
        ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Tạo bảng dia_chi_nhan_hang thành công!');
    
    // Thêm một số địa chỉ mẫu
    console.log('Đang thêm dữ liệu mẫu...');
    
    await pool.query(`
      INSERT INTO dia_chi_nhan_hang 
      (ma_kh, ho_ten_nguoi_nhan, so_dien_thoai, tinh_thanh, quan_huyen, phuong_xa, dia_chi_cu_the, loai_dia_chi, mac_dinh)
      VALUES 
      (1, 'Nguyễn Văn A', '0911111111', 'Thành phố Hà Nội', 'Quận Ba Đình', 'Phường Cống Vị', 'Số 123 Đường Kim Mã', 'nha_rieng', 1),
      (1, 'Bạn Minh', '0911222333', 'Thành phố Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 'Tòa nhà ABC, Lầu 5', 'co_quan', 0),
      (2, 'Trần Thị B', '0922222222', 'Thành phố Đà Nẵng', 'Quận Hải Châu', 'Phường Thạch Thang', 'Số 45 Đường Nguyễn Văn Linh', 'nha_rieng', 1)
      ON DUPLICATE KEY UPDATE ma_dia_chi = ma_dia_chi
    `);
    
    console.log('✅ Thêm dữ liệu mẫu thành công!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

createAddressTable();
