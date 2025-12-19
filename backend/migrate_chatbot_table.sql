-- Script migrate bảng chatbot sang cấu trúc mới với cuộc hội thoại
-- Chạy script này nếu bạn đã có bảng lich_su_chatbot cũ

USE QHUNG;

-- Bước 1: Xóa bảng cũ (backup dữ liệu trước nếu cần)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS lich_su_chatbot;
DROP TABLE IF EXISTS cuoc_hoi_thoai;
SET FOREIGN_KEY_CHECKS = 1;

-- Bước 2: Tạo bảng cuộc hội thoại mới
CREATE TABLE cuoc_hoi_thoai (
  ma_cuoc_hoi_thoai INT AUTO_INCREMENT PRIMARY KEY,
  ma_kh INT NOT NULL,
  tieu_de VARCHAR(255) DEFAULT 'Cuộc hội thoại mới',
  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE CASCADE
);

-- Bước 3: Tạo bảng lịch sử chatbot mới
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

-- Bước 4: Tạo index
CREATE INDEX idx_cuoc_hoi_thoai_ma_kh ON cuoc_hoi_thoai(ma_kh);
CREATE INDEX idx_cuoc_hoi_thoai_ngay ON cuoc_hoi_thoai(ngay_cap_nhat);
CREATE INDEX idx_chatbot_ma_kh ON lich_su_chatbot(ma_kh);
CREATE INDEX idx_chatbot_cuoc_hoi_thoai ON lich_su_chatbot(ma_cuoc_hoi_thoai);
CREATE INDEX idx_chatbot_thoi_gian ON lich_su_chatbot(thoi_gian);

-- Bước 5: Thêm dữ liệu mẫu
INSERT INTO cuoc_hoi_thoai (ma_kh, tieu_de, ngay_tao) VALUES
(1, 'Hỏi về iPhone 15 Pro Max', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'Tư vấn điện thoại tầm giá 10 triệu', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 'Hỏi về chính sách bảo hành', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'So sánh Samsung và iPhone', NOW()),
(4, 'Hỏi về khuyến mãi', DATE_SUB(NOW(), INTERVAL 1 HOUR));

INSERT INTO lich_su_chatbot (ma_cuoc_hoi_thoai, ma_kh, vai_tro, noi_dung, thoi_gian) VALUES
(1, 1, 'user', 'iPhone 15 Pro Max có những màu gì?', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 1, 'assistant', 'iPhone 15 Pro Max có 4 màu: Titan Tự nhiên, Titan Xanh, Titan Trắng và Titan Đen. Bạn muốn tìm hiểu thêm về màu nào?', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 1, 'user', 'Giá bao nhiêu vậy?', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 1, 'assistant', 'iPhone 15 Pro Max 256GB hiện có giá 32.990.000đ tại QuangHưng Mobile. Bạn có muốn xem thêm thông tin cấu hình không?', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 1, 'user', 'Tư vấn cho mình điện thoại tầm 10 triệu', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 1, 'assistant', 'Với tầm giá 10 triệu, mình gợi ý bạn xem Oppo Reno10 (10.990.000đ) hoặc Samsung A54 (8.490.000đ). Cả hai đều có camera đẹp và pin trâu!', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 2, 'user', 'Chính sách bảo hành như thế nào?', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 2, 'assistant', 'QuangHưng Mobile áp dụng bảo hành chính hãng 12 tháng cho tất cả sản phẩm. Ngoài ra còn có chính sách đổi trả trong 7 ngày nếu lỗi từ nhà sản xuất.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 3, 'user', 'So sánh Samsung S24 Ultra với iPhone 15 Pro Max', NOW()),
(4, 3, 'assistant', 'Cả hai đều là flagship cao cấp! Samsung S24 Ultra có camera 200MP, bút S-Pen, giá 28.990.000đ. iPhone 15 Pro Max có chip A17 Pro mạnh mẽ, hệ sinh thái Apple, giá 32.990.000đ. Bạn ưu tiên tính năng nào?', NOW()),
(5, 4, 'user', 'Có khuyến mãi gì không?', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(5, 4, 'assistant', 'Hiện tại QuangHưng Mobile đang có nhiều mã giảm giá: SALE10 giảm 10%, SALE20 giảm 20%, GIAM500 giảm 500.000đ. Bạn có thể xem chi tiết tại trang Khuyến mãi nhé!', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- Kiểm tra
SELECT 'Migration hoàn tất!' as message;
SELECT COUNT(*) as total_conversations FROM cuoc_hoi_thoai;
SELECT COUNT(*) as total_messages FROM lich_su_chatbot;
