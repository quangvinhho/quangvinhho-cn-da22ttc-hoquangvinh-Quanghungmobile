-- RESET DATABASE
CREATE DATABASE IF NOT EXISTS QHUNG
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE QHUNG;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS lich_su_chatbot;
DROP TABLE IF EXISTS cuoc_hoi_thoai;
DROP TABLE IF EXISTS thong_bao;
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

-- 1. QUOC GIA
CREATE TABLE quoc_gia (
  ma_quoc_gia INT AUTO_INCREMENT PRIMARY KEY,
  ten_quoc_gia VARCHAR(150) NOT NULL
);

-- 2. HANG SAN XUAT
CREATE TABLE hang_san_xuat (
  ma_hang INT AUTO_INCREMENT PRIMARY KEY,
  ten_hang VARCHAR(150) NOT NULL,
  ma_quoc_gia INT,
  FOREIGN KEY (ma_quoc_gia) REFERENCES quoc_gia(ma_quoc_gia) ON DELETE SET NULL
);

-- 3. SAN PHAM
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

-- 4. ANH SAN PHAM
CREATE TABLE anh_san_pham (
  ma_anh INT AUTO_INCREMENT PRIMARY KEY,
  ma_sp INT NOT NULL,
  duong_dan VARCHAR(500) NOT NULL,
  FOREIGN KEY (ma_sp) REFERENCES san_pham(ma_sp) ON DELETE CASCADE
);

-- 5. CAU HINH
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

-- 6. KHACH HANG
CREATE TABLE khach_hang (
  ma_kh INT AUTO_INCREMENT PRIMARY KEY,
  gioi_tinh ENUM('nam', 'nu', 'khac'),
  ngay_sinh DATE,
  ho_ten VARCHAR(150),
  avt VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  so_dt VARCHAR(20),
  dia_chi VARCHAR(300),
  mat_khau VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. ADMIN
CREATE TABLE admin (
  ma_admin INT AUTO_INCREMENT PRIMARY KEY,
  tai_khoan VARCHAR(100) UNIQUE,
  mat_khau VARCHAR(255),
  ho_ten VARCHAR(150),
  avt VARCHAR(255),
  quyen ENUM('superadmin','nhanvien') DEFAULT 'nhanvien'
);

-- 8. GIO HANG
CREATE TABLE gio_hang (
  ma_gio_hang INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh INT NOT NULL,
  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
);

-- 9. CHI TIET GIO HANG
CREATE TABLE chi_tiet_gio_hang (
  ma_ct INT AUTO_INCREMENT PRIMARY KEY,
  ma_gio_hang INT NOT NULL,
  ma_sp INT NOT NULL,
  so_luong INT DEFAULT 1,
  gia_tai_thoi_diem DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (ma_gio_hang) REFERENCES gio_hang(ma_gio_hang) ON DELETE CASCADE,
  FOREIGN KEY (ma_sp) REFERENCES san_pham(ma_sp) ON DELETE CASCADE
);

-- 10. KHUYEN MAI
CREATE TABLE khuyen_mai (
  ma_km INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  loai ENUM('percent','fixed'),
  loai_km ENUM('freeship','discount','phone') DEFAULT 'discount',
  gia_tri DECIMAL(10,2),
  mo_ta VARCHAR(255),
  dieu_kien_toi_thieu DECIMAL(14,2) DEFAULT 0,
  dieu_kien_toi_da DECIMAL(14,2) DEFAULT NULL,
  ngay_bat_dau DATETIME,
  ngay_ket_thuc DATETIME,
  so_luong INT DEFAULT 0,
  so_luong_da_dung INT DEFAULT 0,
  trang_thai ENUM('active','inactive') DEFAULT 'active',
  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10.1 LICH SU VOUCHER
CREATE TABLE lich_su_voucher (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_km INT NOT NULL,
  ma_kh INT,
  ma_don INT,
  so_tien_giam DECIMAL(14,2),
  ngay_su_dung DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_km) REFERENCES khuyen_mai(ma_km) ON DELETE CASCADE,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE SET NULL,
  FOREIGN KEY (ma_don) REFERENCES don_hang(ma_don) ON DELETE SET NULL
);

-- 10.2 VOUCHER DA LUU CUA USER
CREATE TABLE voucher_nguoi_dung (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_km INT NOT NULL,
  ma_kh INT NOT NULL,
  da_su_dung TINYINT DEFAULT 0,
  ngay_luu DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_km) REFERENCES khuyen_mai(ma_km) ON DELETE CASCADE,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE,
  UNIQUE KEY unique_user_voucher (ma_km, ma_kh)
);

-- 11. DON HANG
CREATE TABLE don_hang (
  ma_don INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh INT,
  ten_nguoi_nhan VARCHAR(150),
  so_dt VARCHAR(20),
  dia_chi_nhan VARCHAR(300),
  tong_tien DECIMAL(14,2),
  trang_thai ENUM('pending','confirmed','shipping','delivered','completed','cancelled') DEFAULT 'pending',
  thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
  ma_km INT NULL,
  ly_do_huy VARCHAR(500) NULL,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE SET NULL,
  FOREIGN KEY (ma_km) REFERENCES khuyen_mai(ma_km) ON DELETE SET NULL
);

-- 12. CHI TIET DON HANG
CREATE TABLE chi_tiet_don_hang (
  ma_ct_don INT AUTO_INCREMENT PRIMARY KEY,
  ma_don INT NOT NULL,
  ma_sp INT NOT NULL,
  so_luong INT NOT NULL,
  gia DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (ma_don) REFERENCES don_hang(ma_don) ON DELETE CASCADE,
  FOREIGN KEY (ma_sp) REFERENCES san_pham(ma_sp) ON DELETE RESTRICT
);

-- 13. THANH TOAN
CREATE TABLE thanh_toan (
  ma_tt INT AUTO_INCREMENT PRIMARY KEY,
  ma_don INT NOT NULL,
  so_tien DECIMAL(14,2),
  phuong_thuc VARCHAR(50),
  trang_thai ENUM('pending','success','failed') DEFAULT 'pending',
  thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_don) REFERENCES don_hang(ma_don) ON DELETE CASCADE
);

-- 14. BAO HANH
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

-- 15. DANH GIA
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

-- 16. TIN TUC
CREATE TABLE tin_tuc (
  ma_tintuc INT AUTO_INCREMENT PRIMARY KEY,
  tieu_de VARCHAR(255),
  noi_dung LONGTEXT,
  anh_dai_dien VARCHAR(500),
  ma_admin INT,
  ngay_dang DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_admin) REFERENCES admin(ma_admin) ON DELETE SET NULL
);

-- 17. DU LIEU TIM KIEM
CREATE TABLE du_lieu_tim_kiem (
  ma INT AUTO_INCREMENT PRIMARY KEY,
  tu_khoa VARCHAR(255),
  ma_kh INT,
  thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE SET NULL
);

-- 18. RESET PASSWORD
CREATE TABLE reset_password (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expired_at DATETIME NOT NULL,
  used TINYINT DEFAULT 0,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
);

-- 19. LIEN HE
CREATE TABLE lien_he (
  ma_lien_he INT AUTO_INCREMENT PRIMARY KEY,
  ho_ten VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  so_dien_thoai VARCHAR(20),
  tieu_de VARCHAR(255),
  noi_dung TEXT NOT NULL,
  ngay_gui DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  trang_thai ENUM('new','read','replied') DEFAULT 'new',
  ma_kh INT NULL,
  ma_admin INT NULL,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE SET NULL,
  FOREIGN KEY (ma_admin) REFERENCES admin(ma_admin) ON DELETE SET NULL
);

-- 20. THONG BAO
CREATE TABLE thong_bao (
  ma_thong_bao INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh INT,
  email_nguoi_nhan VARCHAR(255),
  tieu_de VARCHAR(255) NOT NULL,
  noi_dung TEXT NOT NULL,
  loai ENUM('order_update','promotion','contact_response','system') DEFAULT 'system',
  lien_ket VARCHAR(500),
  da_doc TINYINT DEFAULT 0,
  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
);

-- 21. CUOC HOI THOAI CHATBOT
CREATE TABLE cuoc_hoi_thoai (
  ma_cuoc_hoi_thoai INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh INT NOT NULL,
  tieu_de VARCHAR(255) DEFAULT 'Cuoc hoi thoai moi',
  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
);

CREATE INDEX idx_cuoc_hoi_thoai_ma_kh ON cuoc_hoi_thoai(ma_kh);
CREATE INDEX idx_cuoc_hoi_thoai_ngay ON cuoc_hoi_thoai(ngay_cap_nhat);

-- 22. LICH SU CHATBOT
CREATE TABLE lich_su_chatbot (
  ma_tin_nhan INT AUTO_INCREMENT PRIMARY KEY,
  ma_cuoc_hoi_thoai INT NOT NULL,
  ma_kh INT NOT NULL,
  vai_tro ENUM('user','assistant') NOT NULL,
  noi_dung TEXT NOT NULL,
  thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_cuoc_hoi_thoai) REFERENCES cuoc_hoi_thoai(ma_cuoc_hoi_thoai) ON DELETE CASCADE,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
);

CREATE INDEX idx_chatbot_ma_kh ON lich_su_chatbot(ma_kh);
CREATE INDEX idx_chatbot_cuoc_hoi_thoai ON lich_su_chatbot(ma_cuoc_hoi_thoai);
CREATE INDEX idx_chatbot_thoi_gian ON lich_su_chatbot(thoi_gian);

-- INSERT DATA
INSERT INTO quoc_gia (ten_quoc_gia) VALUES
('Viet Nam'),('My'),('Nhat Ban'),('Han Quoc'),('Trung Quoc'),
('Dai Loan'),('Thai Lan'),('Anh'),('Duc'),('Phap');

INSERT INTO hang_san_xuat (ten_hang, ma_quoc_gia) VALUES
('Apple', 2),('Samsung', 4),('Xiaomi', 5),('Oppo', 5),('Vivo', 5),
('Asus', 3),('Nokia', 8),('Sony', 3),('Vsmart', 1),('Realme', 5);

INSERT INTO san_pham (ten_sp, ma_hang, gia, so_luong_ton, mo_ta, mau_sac, bo_nho, anh_dai_dien) VALUES
('iPhone 15 Pro Max', 1, 32990000, 20, 'Flagship Apple 2024', 'Den', '256GB', 'iphone15.jpg'),
('iPhone 14', 1, 17990000, 15, 'Man OLED 6.1 inch', 'Trang', '128GB', 'iphone14.jpg'),
('Samsung S24 Ultra', 2, 28990000, 10, 'Camera 200MP', 'Xam', '256GB', 's24u.jpg'),
('Samsung A54', 2, 8490000, 25, 'Pin 5000mAh', 'Tim', '128GB', 'a54.jpg'),
('Xiaomi Redmi Note 13', 3, 4990000, 40, 'Gia re cau hinh cao', 'Xanh', '128GB', 'rn13.jpg'),
('Oppo Reno10', 4, 10990000, 18, 'Chup chan dung dep', 'Hong', '256GB', 'reno10.jpg'),
('Vivo V25', 5, 8990000, 12, 'Selfie dep', 'Den', '128GB', 'v25.jpg'),
('Asus ROG Phone 7', 6, 27990000, 8, 'Gaming manh nhat', 'Den', '512GB', 'rog7.jpg'),
('Vsmart Joy 4', 9, 2990000, 30, 'Gia re VN', 'Xanh', '64GB', 'joy4.jpg'),
('Sony Xperia 5', 8, 24990000, 6, 'Nho gon manh me', 'Xanh', '256GB', 'xperia5.jpg');

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
('Nguyen Van A','a@gmail.com','0911111111','Ha Noi','123'),
('Tran Thi B','b@gmail.com','0922222222','Da Nang','123'),
('Le Van C','c@gmail.com','0933333333','TP.HCM','123'),
('Pham Thi D','d@gmail.com','0944444444','Can Tho','123'),
('Ngo Van E','e@gmail.com','0955555555','Hai Phong','123'),
('Dang Thi F','f@gmail.com','0966666666','Quang Ninh','123'),
('Tran Van G','g@gmail.com','0977777777','Hue','123'),
('Phan Thi H','h@gmail.com','0988888888','Vung Tau','123'),
('Hoang Van I','i@gmail.com','0999999999','Long An','123'),
('Ly Thi K','k@gmail.com','0900000000','An Giang','123');

INSERT INTO admin (tai_khoan, mat_khau, ho_ten, quyen) VALUES
('admin1','123','Nguyen Admin','superadmin'),
('admin2','123','Tran Admin','nhanvien');

INSERT INTO gio_hang (ma_kh) VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10);

INSERT INTO chi_tiet_gio_hang (ma_gio_hang, ma_sp, so_luong, gia_tai_thoi_diem) VALUES
(1,1,1,32990000),(2,3,1,28990000),(3,4,2,8490000),(4,5,1,4990000),(5,2,1,17990000),
(6,6,1,10990000),(7,7,1,8990000),(8,8,1,27990000),(9,9,1,2990000),(10,10,1,24990000);

INSERT INTO khuyen_mai (code, loai, loai_km, gia_tri, mo_ta, dieu_kien_toi_thieu, ngay_bat_dau, ngay_ket_thuc, so_luong, so_luong_da_dung, trang_thai) VALUES
('SALE10','percent','discount',10,'Giảm 10% đơn hàng',0,'2024-01-01','2025-12-31',100,0,'active'),
('SALE20','percent','discount',20,'Giảm 20% đơn hàng',500000,'2024-01-01','2025-12-31',50,0,'active'),
('GIAM500','fixed','discount',500000,'Giảm 500.000đ',1000000,'2024-01-01','2025-12-31',200,0,'active'),
('GIAM1TR','fixed','discount',1000000,'Giảm 1.000.000đ',5000000,'2024-01-01','2025-12-31',150,0,'active'),
('FREESHIP','fixed','freeship',30000,'Miễn phí vận chuyển',0,'2024-01-01','2025-12-31',500,0,'active'),
('FREESHIP50','fixed','freeship',50000,'Giảm 50K phí ship',500000,'2024-01-01','2025-12-31',300,0,'active'),
('GIAM10','percent','discount',10,'Giảm 10% đơn hàng',1000000,'2024-01-01','2025-12-31',100,0,'active'),
('GIAM15','percent','discount',15,'Giảm 15% đơn hàng',2000000,'2024-01-01','2025-12-31',100,0,'active'),
('GIAM20','percent','discount',20,'Giảm 20% đơn hàng',5000000,'2024-01-01','2025-12-31',100,0,'active'),
('GIAM50K','fixed','discount',50000,'Giảm 50.000đ',500000,'2024-01-01','2025-12-31',200,0,'active'),
('GIAM100K','fixed','discount',100000,'Giảm 100.000đ',1000000,'2024-01-01','2025-12-31',200,0,'active'),
('PHONE10','percent','phone',10,'Giảm 10% cho điện thoại (cần lưu mã)',0,'2024-01-01','2025-12-31',100,0,'active'),
('PHONE200K','fixed','phone',200000,'Giảm 200K cho điện thoại (cần lưu mã)',3000000,'2024-01-01','2025-12-31',100,0,'active'),
('VIP10','percent','discount',10,'Ưu đãi VIP 10%',0,'2024-02-01','2025-12-31',100,0,'active'),
('VIP20','percent','discount',20,'Ưu đãi VIP 20%',0,'2024-02-01','2025-12-31',100,0,'active'),
('KM100','fixed','discount',100000,'Giảm 100.000đ',500000,'2024-01-01','2025-06-30',200,0,'active'),
('KM200','fixed','discount',200000,'Giảm 200.000đ',1000000,'2024-01-01','2025-06-30',200,0,'active'),
('BLACKFRIDAY','percent','discount',30,'Black Friday giảm 30%',0,'2024-11-01','2025-11-30',300,0,'active');

INSERT INTO don_hang (ma_kh, ten_nguoi_nhan, so_dt, dia_chi_nhan, tong_tien, trang_thai, ma_km) VALUES
(1,'Nguyen Van A','0911111111','Ha Noi',32990000,'completed',1),
(2,'Tran Thi B','0922222222','Da Nang',28990000,'completed',2),
(3,'Le Van C','0933333333','HCM',8490000,'shipping',3),
(4,'Pham Thi D','0944444444','Can Tho',4990000,'pending',NULL),
(5,'Ngo Van E','0955555555','Hai Phong',17990000,'confirmed',4),
(6,'Dang Thi F','0966666666','Quang Ninh',10990000,'completed',5),
(7,'Tran Van G','0977777777','Hue',8990000,'shipping',NULL),
(8,'Phan Thi H','0988888888','Vung Tau',27990000,'completed',1),
(9,'Hoang Van I','0999999999','Long An',2990000,'pending',NULL),
(10,'Ly Thi K','0900000000','An Giang',24990000,'cancelled',NULL);

INSERT INTO chi_tiet_don_hang (ma_don, ma_sp, so_luong, gia) VALUES
(1,1,1,32990000),(2,3,1,28990000),(3,4,1,8490000),(4,5,1,4990000),(5,2,1,17990000),
(6,6,1,10990000),(7,7,1,8990000),(8,8,1,27990000),(9,9,1,2990000),(10,10,1,24990000);

INSERT INTO thanh_toan (ma_don, so_tien, phuong_thuc, trang_thai) VALUES
(1,32990000,'Momo','success'),(2,28990000,'ZaloPay','success'),(3,8490000,'COD','pending'),
(4,4990000,'Momo','success'),(5,17990000,'VNPAY','success'),(6,10990000,'COD','pending'),
(7,8990000,'VNPAY','success'),(8,27990000,'Momo','success'),(9,2990000,'COD','pending'),
(10,24990000,'ZaloPay','failed');

INSERT INTO bao_hanh (ma_sp, ma_kh, mo_ta_loi, trang_thai) VALUES
(1,1,'Loi pin','waiting'),(2,2,'Loa re','fixing'),(3,3,'May nong','done'),
(4,4,'Camera mo','waiting'),(5,5,'Tut pin nhanh','fixing'),(6,6,'Khong nhan sac','done'),
(7,7,'Loi cam ung','waiting'),(8,8,'Khong bat nguon','fixing'),(9,9,'Wifi yeu','done'),
(10,10,'Loi man hinh','waiting');

INSERT INTO danh_gia (ma_sp, ma_kh, so_sao, binh_luan) VALUES
(1,1,5,'Rat tot'),(2,2,4,'On'),(3,3,5,'Xuat sac'),(4,4,4,'Tam on'),
(5,5,5,'Ngon trong tam gia'),(6,6,4,'Dep'),(7,7,5,'Qua hai long'),
(8,8,5,'Gaming ngon'),(9,9,3,'Tam dung'),(10,10,4,'Duoc');

INSERT INTO tin_tuc (tieu_de, noi_dung, anh_dai_dien, ma_admin) VALUES
('Apple ra mat iPhone moi','Noi dung...','tintuc1.jpg',NULL),
('Samsung gioi thieu S24','Noi dung...','tintuc2.jpg',NULL),
('Xiaomi Note 13 gay sot','Noi dung...','tintuc3.jpg',NULL),
('Oppo Reno10 giam gia','Noi dung...','tintuc4.jpg',NULL),
('Vivo ra mat dong V moi','Noi dung...','tintuc5.jpg',NULL);

INSERT INTO du_lieu_tim_kiem (tu_khoa, ma_kh) VALUES
('iPhone',1),('Samsung',2),('Xiaomi',3),('Oppo',4),('Vivo',5);

INSERT INTO reset_password (ma_kh, token, expired_at, used) VALUES
(1,'token1','2025-01-01',0),(2,'token2','2025-01-01',0),(3,'token3','2025-01-01',0);

INSERT INTO thong_bao (ma_kh, tieu_de, noi_dung, loai, lien_ket, da_doc, ngay_tao) VALUES
(1, 'Don hang #1 da duoc xac nhan', 'Don hang cua ban da duoc xac nhan.', 'order_update', 'profile.html#orders', 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 'Giam 20% cho don hang tiep theo!', 'Su dung ma SALE20 de duoc giam 20%.', 'promotion', 'promotions.html', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 'Chao mung den QuangHung Mobile!', 'Cam on ban da dang ky tai khoan.', 'system', 'products.html', 0, NOW());

INSERT INTO lien_he (ho_ten, email, so_dien_thoai, tieu_de, noi_dung) VALUES
('Khach 1','l1@gmail.com','0901','Ho tro','Can ho tro mua hang'),
('Khach 2','l2@gmail.com','0902','Bao hanh','Thac mac bao hanh');

INSERT INTO cuoc_hoi_thoai (ma_kh, tieu_de, ngay_tao) VALUES
(1, 'Hoi ve iPhone 15 Pro Max', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'Hoi ve chinh sach bao hanh', DATE_SUB(NOW(), INTERVAL 3 DAY));

INSERT INTO lich_su_chatbot (ma_cuoc_hoi_thoai, ma_kh, vai_tro, noi_dung, thoi_gian) VALUES
(1, 1, 'user', 'iPhone 15 Pro Max co nhung mau gi?', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 1, 'assistant', 'iPhone 15 Pro Max co 4 mau: Titan Tu nhien, Titan Xanh, Titan Trang va Titan Den.', DATE_SUB(NOW(), INTERVAL 2 DAY));
