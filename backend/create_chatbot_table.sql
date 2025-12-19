-- Script tạo bảng lịch sử chatbot với tính năng cuộc hội thoại
-- Chạy script này trong MySQL nếu bảng chưa tồn tại

USE QHUNG;

-- Xóa bảng cũ nếu cần migrate
-- DROP TABLE IF EXISTS lich_su_chatbot;
-- DROP TABLE IF EXISTS cuoc_hoi_thoai;

-- Tạo bảng cuộc hội thoại (conversations)
CREATE TABLE IF NOT EXISTS cuoc_hoi_thoai (
  ma_cuoc_hoi_thoai INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh INT NOT NULL,
  tieu_de VARCHAR(255) DEFAULT 'Cuộc hội thoại mới',
  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
);

CREATE INDEX idx_cuoc_hoi_thoai_ma_kh ON cuoc_hoi_thoai(ma_kh);
CREATE INDEX idx_cuoc_hoi_thoai_ngay ON cuoc_hoi_thoai(ngay_cap_nhat);

-- Tạo bảng lịch sử chatbot (messages)
CREATE TABLE IF NOT EXISTS lich_su_chatbot (
  ma_tin_nhan INT AUTO_INCREMENT PRIMARY KEY,
  ma_cuoc_hoi_thoai INT NOT NULL,
  ma_kh INT NOT NULL,
  vai_tro ENUM('user','assistant') NOT NULL,
  noi_dung TEXT NOT NULL,
  thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_cuoc_hoi_thoai) REFERENCES cuoc_hoi_thoai(ma_cuoc_hoi_thoai) ON DELETE CASCADE,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
);

-- Tạo index để tối ưu truy vấn
CREATE INDEX idx_chatbot_ma_kh ON lich_su_chatbot(ma_kh);
CREATE INDEX idx_chatbot_cuoc_hoi_thoai ON lich_su_chatbot(ma_cuoc_hoi_thoai);
CREATE INDEX idx_chatbot_thoi_gian ON lich_su_chatbot(thoi_gian);

-- Kiểm tra bảng đã tạo thành công
DESCRIBE cuoc_hoi_thoai;
DESCRIBE lich_su_chatbot;
SELECT 'Bảng cuoc_hoi_thoai và lich_su_chatbot đã được tạo thành công!' as message;
