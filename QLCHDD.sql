-- RESET DATABASE
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS chi_tiet_don_hang;
DROP TABLE IF EXISTS don_hang;
DROP TABLE IF EXISTS chi_tiet_gio_hang;
DROP TABLE IF EXISTS gio_hang;
DROP TABLE IF EXISTS thanh_toan;
DROP TABLE IF EXISTS danh_gia;
DROP TABLE IF EXISTS bao_hanh;
DROP TABLE IF EXISTS reset_password;
DROP TABLE IF EXISTS du_lieu_tim_kiem;
DROP TABLE IF EXISTS tin_tuc;
DROP TABLE IF EXISTS khuyen_mai;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS khach_hang;
DROP TABLE IF EXISTS cau_hinh;
DROP TABLE IF EXISTS anh_san_pham;
DROP TABLE IF EXISTS san_pham;
DROP TABLE IF EXISTS hang_san_xuat;
DROP TABLE IF EXISTS quoc_gia;
DROP TABLE IF EXISTS lien_he;

SET FOREIGN_KEY_CHECKS = 1;

-------------------------------------------------------------
-- CREATE DATABASE
-------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS QHUNG
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE QHUNG;
SET FOREIGN_KEY_CHECKS = 0;

-------------------------------------------------------------
-- 1. QUỐC GIA
-------------------------------------------------------------
CREATE TABLE quoc_gia (
  ma_quoc_gia INT AUTO_INCREMENT PRIMARY KEY,
  ten_quoc_gia VARCHAR(150) NOT NULL
);

-------------------------------------------------------------
-- 2. HÃNG SẢN XUẤT
-------------------------------------------------------------
CREATE TABLE hang_san_xuat (
  ma_hang INT AUTO_INCREMENT PRIMARY KEY,
  ten_hang VARCHAR(150) NOT NULL,
  ma_quoc_gia INT,
  FOREIGN KEY (ma_quoc_gia) REFERENCES quoc_gia(ma_quoc_gia) ON DELETE SET NULL
);

-------------------------------------------------------------
-- 3. SẢN PHẨM
-------------------------------------------------------------
CREATE TABLE san_pham (
  ma_sp INT AUTO_INCREMENT PRIMARY KEY,
  ten_sp VARCHAR(255) NOT NULL,
  ma_hang INT,
  gia DECIMAL(12,2) NOT NULL,
  so_luong_ton INT DEFAULT 0,
  mo_ta LONGTEXT,
  mau_sac VARCHAR(100),
  bo_nho VARCHAR(50),
  anh_dai_dien VARCHAR(500),
  ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_hang) REFERENCES hang_san_xuat(ma_hang) ON DELETE SET NULL
);

-------------------------------------------------------------
-- 4. ẢNH SẢN PHẨM
-------------------------------------------------------------
CREATE TABLE anh_san_pham (
  ma_anh INT AUTO_INCREMENT PRIMARY KEY,
  ma_sp INT NOT NULL,
  duong_dan VARCHAR(500) NOT NULL,
  FOREIGN KEY (ma_sp) REFERENCES san_pham(ma_sp) ON DELETE CASCADE
);

-------------------------------------------------------------
-- 5. CẤU HÌNH
-------------------------------------------------------------
CREATE TABLE cau_hinh (
  ma_cau_hinh INT AUTO_INCREMENT PRIMARY KEY,
  ma_sp INT NOT NULL,
  ram VARCHAR(50),
  chip VARCHAR(150),
  pin VARCHAR(150),
  man_hinh VARCHAR(150),
  camera VARCHAR(200),
  he_dieu_hanh VARCHAR(150),
  FOREIGN KEY (ma_sp) REFERENCES san_pham(ma_sp) ON DELETE CASCADE
);

-------------------------------------------------------------
-- 6. KHÁCH HÀNG
-------------------------------------------------------------
CREATE TABLE khach_hang (
  ma_kh INT AUTO_INCREMENT PRIMARY KEY,
  ho_ten VARCHAR(150),
  email VARCHAR(255) UNIQUE,
  so_dt VARCHAR(20),
  dia_chi VARCHAR(300),
  mat_khau VARCHAR(255) NOT NULL,
  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE khach_hang
ADD COLUMN avt VARCHAR(255) AFTER ho_ten;
-------------------------------------------------------------
-- 7. ADMIN
-------------------------------------------------------------
CREATE TABLE admin (
  ma_admin INT AUTO_INCREMENT PRIMARY KEY,
  tai_khoan VARCHAR(100) UNIQUE,
  mat_khau VARCHAR(255),
  ho_ten VARCHAR(150),
  quyen ENUM('superadmin','nhanvien') DEFAULT 'nhanvien'
);
ALTER TABLE admin
ADD COLUMN avt VARCHAR(255) AFTER ho_ten;
-------------------------------------------------------------
-- 8. GIỎ HÀNG
-------------------------------------------------------------
CREATE TABLE gio_hang (
  ma_gio_hang INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh INT NOT NULL,
  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
);

-------------------------------------------------------------
-- 9. CHI TIẾT GIỎ HÀNG
-------------------------------------------------------------
CREATE TABLE chi_tiet_gio_hang (
  ma_ct INT AUTO_INCREMENT PRIMARY KEY,
  ma_gio_hang INT NOT NULL,
  ma_sp INT NOT NULL,
  so_luong INT DEFAULT 1,
  gia_tai_thoi_diem DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (ma_gio_hang) REFERENCES gio_hang(ma_gio_hang) ON DELETE CASCADE,
  FOREIGN KEY (ma_sp) REFERENCES san_pham(ma_sp) ON DELETE CASCADE
);

-------------------------------------------------------------
-- 10. KHUYẾN MÃI
-------------------------------------------------------------
CREATE TABLE khuyen_mai (
  ma_km INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  loai ENUM('percent','fixed'),
  gia_tri DECIMAL(10,2),
  ngay_bat_dau DATETIME,
  ngay_ket_thuc DATETIME,
  so_luong INT DEFAULT 0
);

-------------------------------------------------------------
-- 11. ĐƠN HÀNG
-------------------------------------------------------------
CREATE TABLE don_hang (
  ma_don INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh INT,
  ten_nguoi_nhan VARCHAR(150),
  so_dt VARCHAR(20),
  dia_chi_nhan VARCHAR(300),
  tong_tien DECIMAL(14,2),
  trang_thai ENUM('pending','confirmed','shipping','completed','cancelled') DEFAULT 'pending',
  thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
  ma_km INT NULL,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE SET NULL,
  FOREIGN KEY (ma_km) REFERENCES khuyen_mai(ma_km) ON DELETE SET NULL
);

-------------------------------------------------------------
-- 12. CHI TIẾT ĐƠN HÀNG
-------------------------------------------------------------
CREATE TABLE chi_tiet_don_hang (
  ma_ct_don INT AUTO_INCREMENT PRIMARY KEY,
  ma_don INT NOT NULL,
  ma_sp INT NOT NULL,
  so_luong INT NOT NULL,
  gia DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (ma_don) REFERENCES don_hang(ma_don) ON DELETE CASCADE,
  FOREIGN KEY (ma_sp) REFERENCES san_pham(ma_sp) ON DELETE RESTRICT
);

-------------------------------------------------------------
-- 13. THANH TOÁN
-------------------------------------------------------------
CREATE TABLE thanh_toan (
  ma_tt INT AUTO_INCREMENT PRIMARY KEY,
  ma_don INT NOT NULL,
  so_tien DECIMAL(14,2),
  phuong_thuc VARCHAR(50),
  trang_thai ENUM('pending','success','failed') DEFAULT 'pending',
  thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_don) REFERENCES don_hang(ma_don) ON DELETE CASCADE
);

-------------------------------------------------------------
-- 14. BẢO HÀNH
-------------------------------------------------------------
CREATE TABLE bao_hanh (
  ma_bh INT AUTO_INCREMENT PRIMARY KEY,
  ma_sp INT NOT NULL,
  ma_kh INT NOT NULL,
  mo_ta_loi TEXT,
  ngay_bao_hanh DATETIME DEFAULT CURRENT_TIMESTAMP,
  trang_thai ENUM('waiting','fixing','done') DEFAULT 'waiting',
  FOREIGN KEY (ma_sp) REFERENCES san_pham(ma_sp) ON DELETE CASCADE,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
);

-------------------------------------------------------------
-- 15. ĐÁNH GIÁ
-------------------------------------------------------------
CREATE TABLE danh_gia (
  ma_dg INT AUTO_INCREMENT PRIMARY KEY,
  ma_sp INT NOT NULL,
  ma_kh INT NOT NULL,
  so_sao TINYINT,
  binh_luan TEXT,
  ngay_danh_gia DATETIME DEFAULT CURRENT_TIMESTAMP,
  hinh_anh TEXT,
  FOREIGN KEY (ma_sp) REFERENCES san_pham(ma_sp) ON DELETE CASCADE,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
);

-------------------------------------------------------------
-- 16. TIN TỨC
-------------------------------------------------------------
CREATE TABLE tin_tuc (
  ma_tintuc INT AUTO_INCREMENT PRIMARY KEY,
  tieu_de VARCHAR(255),
  noi_dung LONGTEXT,
  anh_dai_dien VARCHAR(500),
  ma_admin INT,
  ngay_dang DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_admin) REFERENCES admin(ma_admin) ON DELETE SET NULL
);

-------------------------------------------------------------
-- 17. DỮ LIỆU TÌM KIẾM
-------------------------------------------------------------
CREATE TABLE du_lieu_tim_kiem (
  ma INT AUTO_INCREMENT PRIMARY KEY,
  tu_khoa VARCHAR(255),
  ma_kh INT,
  thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE SET NULL
);

-------------------------------------------------------------
-- 18. RESET PASSWORD
-------------------------------------------------------------
CREATE TABLE reset_password (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expired_at DATETIME NOT NULL,
  used TINYINT DEFAULT 0,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
);

-------------------------------------------------------------
-- 19. LIÊN HỆ
-------------------------------------------------------------
CREATE TABLE lien_he (
  ma_lien_he INT AUTO_INCREMENT PRIMARY KEY,
  ho_ten VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  so_dien_thoai VARCHAR(20),
  tieu_de VARCHAR(255),
  noi_dung TEXT NOT NULL,
  ngay_gui DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  trang_thai ENUM('new','read','replied') DEFAULT 'new'
);

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO quoc_gia (ten_quoc_gia) VALUES
('Việt Nam'),
('Mỹ'),
('Nhật Bản'),
('Hàn Quốc'),
('Trung Quốc'),
('Đài Loan'),
('Thái Lan'),
('Anh'),
('Đức'),
('Pháp');
INSERT INTO hang_san_xuat (ten_hang, ma_quoc_gia) VALUES
('Apple', 2),
('Samsung', 4),
('Xiaomi', 5),
('Oppo', 5),
('Vivo', 5),
('Asus', 3),
('Nokia', 8),
('Sony', 3),
('Vsmart', 1),
('Realme', 5);
INSERT INTO san_pham (ten_sp, ma_hang, gia, so_luong_ton, mo_ta, mau_sac, bo_nho, anh_dai_dien) VALUES
('iPhone 15 Pro Max', 1, 32990000, 20, 'Flagship Apple 2024', 'Đen', '256GB', 'iphone15.jpg'),
('iPhone 14', 1, 17990000, 15, 'Màn OLED 6.1 inch', 'Trắng', '128GB', 'iphone14.jpg'),
('Samsung S24 Ultra', 2, 28990000, 10, 'Camera 200MP', 'Xám', '256GB', 's24u.jpg'),
('Samsung A54', 2, 8490000, 25, 'Pin 5000mAh', 'Tím', '128GB', 'a54.jpg'),
('Xiaomi Redmi Note 13', 3, 4990000, 40, 'Giá rẻ cấu hình cao', 'Xanh', '128GB', 'rn13.jpg'),
('Oppo Reno10', 4, 10990000, 18, 'Chụp chân dung đẹp', 'Hồng', '256GB', 'reno10.jpg'),
('Vivo V25', 5, 8990000, 12, 'Selfie đẹp', 'Đen', '128GB', 'v25.jpg'),
('Asus ROG Phone 7', 6, 27990000, 8, 'Gaming mạnh nhất', 'Đen', '512GB', 'rog7.jpg'),
('Vsmart Joy 4', 9, 2990000, 30, 'Giá rẻ VN', 'Xanh', '64GB', 'joy4.jpg'),
('Sony Xperia 5', 8, 24990000, 6, 'Nhỏ gọn mạnh mẽ', 'Xanh', '256GB', 'xperia5.jpg');
INSERT INTO anh_san_pham (ma_sp, duong_dan) VALUES
(1,'ip15-1.jpg'),(1,'ip15-2.jpg'),
(2,'ip14-1.jpg'),(2,'ip14-2.jpg'),
(3,'s24-1.jpg'),(3,'s24-2.jpg'),
(4,'a54-1.jpg'),(4,'a54-2.jpg'),
(5,'rn13-1.jpg'),(5,'rn13-2.jpg');
INSERT INTO cau_hinh (ma_sp, ram, chip, pin, man_hinh, camera, he_dieu_hanh) VALUES
(1,'8GB','A17 Pro','4500mAh','6.7 OLED','48MP','iOS'),
(2,'6GB','A15','4200mAh','6.1 OLED','12MP','iOS'),
(3,'12GB','Snapdragon 8 Gen 3','5000mAh','6.8 AMOLED','200MP','Android'),
(4,'8GB','Exynos 1380','5000mAh','6.4 AMOLED','50MP','Android'),
(5,'8GB','Helio G99','5000mAh','6.67 AMOLED','108MP','Android'),
(6,'8GB','Snapdragon 778G','4600mAh','6.7 AMOLED','64MP','Android'),
(7,'8GB','Dimensity 900','4500mAh','6.44 AMOLED','50MP','Android'),
(8,'16GB','Snapdragon 8 Gen 2','6000mAh','6.8 AMOLED','50MP','Android'),
(9,'4GB','Snapdragon 665','5000mAh','6.53 LCD','16MP','Android'),
(10,'8GB','Snapdragon 888','4500mAh','6.1 OLED','12MP','Android');
INSERT INTO khach_hang (ho_ten, email, so_dt, dia_chi, mat_khau) VALUES
('Nguyễn Văn A','a@gmail.com','0911111111','Hà Nội','123'),
('Trần Thị B','b@gmail.com','0922222222','Đà Nẵng','123'),
('Lê Văn C','c@gmail.com','0933333333','TP.HCM','123'),
('Phạm Thị D','d@gmail.com','0944444444','Cần Thơ','123'),
('Ngô Văn E','e@gmail.com','0955555555','Hải Phòng','123'),
('Đặng Thị F','f@gmail.com','0966666666','Quảng Ninh','123'),
('Trần Văn G','g@gmail.com','0977777777','Huế','123'),
('Phan Thị H','h@gmail.com','0988888888','Vũng Tàu','123'),
('Hoàng Văn I','i@gmail.com','0999999999','Long An','123'),
('Lý Thị K','k@gmail.com','0900000000','An Giang','123');
INSERT INTO admin (tai_khoan, mat_khau, ho_ten, quyen) VALUES
('admin1','123','Nguyễn Admin','superadmin'),
('admin2','123','Trần Admin','nhanvien');
INSERT INTO gio_hang (ma_kh) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10);
INSERT INTO chi_tiet_gio_hang (ma_gio_hang, ma_sp, so_luong, gia_tai_thoi_diem) VALUES
(1,1,1,32990000),
(2,3,1,28990000),
(3,4,2,8490000),
(4,5,1,4990000),
(5,2,1,17990000),
(6,6,1,10990000),
(7,7,1,8990000),
(8,8,1,27990000),
(9,9,1,2990000),
(10,10,1,24990000);
INSERT INTO khuyen_mai (code, loai, gia_tri, ngay_bat_dau, ngay_ket_thuc, so_luong) VALUES
('SALE10','percent',10,'2024-01-01','2024-12-31',100),
('SALE20','percent',20,'2024-01-01','2024-12-31',50),
('GIAM500','fixed',500000,'2024-01-01','2024-12-31',200),
('GIAM1TR','fixed',1000000,'2024-01-01','2024-12-31',150),
('FREESHIP','fixed',30000,'2024-01-01','2024-12-31',500),
('VIP10','percent',10,'2024-02-01','2024-12-31',100),
('VIP20','percent',20,'2024-02-01','2024-12-31',100),
('KM100','fixed',100000,'2024-01-01','2024-06-30',200),
('KM200','fixed',200000,'2024-01-01','2024-06-30',200),
('BLACKFRIDAY','percent',30,'2024-11-01','2024-11-30',300);
INSERT INTO don_hang (ma_kh, ten_nguoi_nhan, so_dt, dia_chi_nhan, tong_tien, trang_thai, ma_km) VALUES
(1,'Nguyễn Văn A','0911111111','Hà Nội',32990000,'completed',1),
(2,'Trần Thị B','0922222222','Đà Nẵng',28990000,'completed',2),
(3,'Lê Văn C','0933333333','HCM',8490000,'shipping',3),
(4,'Phạm Thị D','0944444444','Cần Thơ',4990000,'pending',NULL),
(5,'Ngô Văn E','0955555555','Hải Phòng',17990000,'confirmed',4),
(6,'Đặng Thị F','0966666666','Quảng Ninh',10990000,'completed',5),
(7,'Trần Văn G','0977777777','Huế',8990000,'shipping',NULL),
(8,'Phan Thị H','0988888888','Vũng Tàu',27990000,'completed',1),
(9,'Hoàng Văn I','0999999999','Long An',2990000,'pending',NULL),
(10,'Lý Thị K','0900000000','An Giang',24990000,'cancelled',NULL);
INSERT INTO chi_tiet_don_hang (ma_don, ma_sp, so_luong, gia) VALUES
(1,1,1,32990000),
(2,3,1,28990000),
(3,4,1,8490000),
(4,5,1,4990000),
(5,2,1,17990000),
(6,6,1,10990000),
(7,7,1,8990000),
(8,8,1,27990000),
(9,9,1,2990000),
(10,10,1,24990000);
INSERT INTO thanh_toan (ma_don, so_tien, phuong_thuc, trang_thai) VALUES
(1,32990000,'Momo','success'),
(2,28990000,'ZaloPay','success'),
(3,8490000,'COD','pending'),
(4,4990000,'Momo','success'),
(5,17990000,'VNPAY','success'),
(6,10990000,'COD','pending'),
(7,8990000,'VNPAY','success'),
(8,27990000,'Momo','success'),
(9,2990000,'COD','pending'),
(10,24990000,'ZaloPay','failed');
INSERT INTO bao_hanh (ma_sp, ma_kh, mo_ta_loi, trang_thai) VALUES
(1,1,'Lỗi pin','waiting'),
(2,2,'Loa rè','fixing'),
(3,3,'Máy nóng','done'),
(4,4,'Camera mờ','waiting'),
(5,5,'Tụt pin nhanh','fixing'),
(6,6,'Không nhận sạc','done'),
(7,7,'Lỗi cảm ứng','waiting'),
(8,8,'Không bật nguồn','fixing'),
(9,9,'Wifi yếu','done'),
(10,10,'Lỗi màn hình','waiting');
INSERT INTO danh_gia (ma_sp, ma_kh, so_sao, binh_luan) VALUES
(1,1,5,'Rất tốt'),
(2,2,4,'Ổn'),
(3,3,5,'Xuất sắc'),
(4,4,4,'Tạm ổn'),
(5,5,5,'Ngon trong tầm giá'),
(6,6,4,'Đẹp'),
(7,7,5,'Quá hài lòng'),
(8,8,5,'Gaming ngon'),
(9,9,3,'Tạm dùng'),
(10,10,4,'Được');
INSERT INTO tin_tuc (tieu_de, noi_dung, anh_dai_dien, ma_admin) VALUES
('Apple ra mắt iPhone mới','Nội dung...','tintuc1.jpg',NULL),
('Samsung giới thiệu S24','Nội dung...','tintuc2.jpg',NULL),
('Xiaomi Note 13 gây sốt','Nội dung...','tintuc3.jpg',NULL),
('Oppo Reno10 giảm giá','Nội dung...','tintuc4.jpg',NULL),
('Vivo ra mắt dòng V mới','Nội dung...','tintuc5.jpg',NULL),
('Sony quay lại VN','Nội dung...','tintuc6.jpg',NULL),
('Vsmart trở lại?','Nội dung...','tintuc7.jpg',NULL),
('Realme ra mắt sản phẩm mới','Nội dung...','tintuc8.jpg',NULL),
('Asus ra mắt ROG mới','Nội dung...','tintuc9.jpg',NULL),
('Tin công nghệ hot nhất tuần','Nội dung...','tintuc10.jpg',NULL);

INSERT INTO du_lieu_tim_kiem (tu_khoa, ma_kh) VALUES
('iPhone',1),
('Samsung',2),
('Xiaomi',3),
('Oppo',4),
('Vivo',5),
('Asus',6),
('Vsmart',7),
('Sony',8),
('Realme',9),
('Điện thoại giá rẻ',10);
INSERT INTO reset_password (ma_kh, token, expired_at, used) VALUES
(1,'token1','2025-01-01',0),
(2,'token2','2025-01-01',0),
(3,'token3','2025-01-01',0),
(4,'token4','2025-01-01',1),
(5,'token5','2025-01-01',0),
(6,'token6','2025-01-01',1),
(7,'token7','2025-01-01',0),
(8,'token8','2025-01-01',0),
(9,'token9','2025-01-01',0),
(10,'token10','2025-01-01',0);
INSERT INTO lien_he (ho_ten, email, so_dien_thoai, tieu_de, noi_dung) VALUES
('Khách 1','l1@gmail.com','0901','Hỗ trợ','Cần hỗ trợ mua hàng'),
('Khách 2','l2@gmail.com','0902','Bảo hành','Thắc mắc bảo hành'),
('Khách 3','l3@gmail.com','0903','Khiếu nại','Sản phẩm lỗi'),
('Khách 4','l4@gmail.com','0904','Tư vấn','Nhờ tư vấn điện thoại'),
('Khách 5','l5@gmail.com','0905','Góp ý','Góp ý dịch vụ'),
('Khách 6','l6@gmail.com','0906','Hỏi giá','Hỏi giá sản phẩm'),
('Khách 7','l7@gmail.com','0907','Hỗ trợ','Không đăng nhập được'),
('Khách 8','l8@gmail.com','0908','Đổi trả','Muốn đổi sản phẩm'),
('Khách 9','l9@gmail.com','0909','Phản hồi','Phản hồi dịch vụ'),
('Khách 10','l10@gmail.com','0910','Tư vấn','Tư vấn cấu hình máy');

select * from san_pham;
select * from khach_hang;



