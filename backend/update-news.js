// Script cập nhật dữ liệu tin tức
require('dotenv').config();
const { pool } = require('./config/database');

const newsData = [
    {
        tieu_de: 'Apple ra mắt iPhone 16 Pro Max với nhiều tính năng đột phá',
        noi_dung: `Apple vừa chính thức ra mắt dòng iPhone 16 series với nhiều cải tiến đáng chú ý. Trong đó, iPhone 16 Pro Max là phiên bản cao cấp nhất với khung titanium, camera zoom quang học 5x và nhiều tính năng độc đáo khác.

Lần đầu tiên trong lịch sử iPhone, Apple sử dụng khung viền làm từ Titanium cao cấp. Titanium mang lại độ bền cực cao nhưng lại nhẹ hơn thép không gỉ tới 45%.

Camera chính 48MP với cảm biến lớn hơn, zoom quang học 5x cho khả năng chụp ảnh và quay video chuyên nghiệp.

A18 Pro là chip đầu tiên trong ngành smartphone được sản xuất trên tiến trình 3nm tiên tiến.`,
        anh_dai_dien: 'https://images.unsplash.com/photo-1695048064998-18d5e69328c6?w=800&h=400&fit=crop'
    },
    {
        tieu_de: 'Samsung Galaxy S24 Ultra - Flagship Android mạnh nhất 2024',
        noi_dung: `Samsung vừa ra mắt Galaxy S24 Ultra với nhiều cải tiến vượt trội. Đây là smartphone Android mạnh nhất hiện tại với chip Snapdragon 8 Gen 3 for Galaxy.

Màn hình Dynamic AMOLED 2X 6.8 inch với độ phân giải QHD+ và tần số quét 120Hz mang lại trải nghiệm hiển thị tuyệt vời.

Camera 200MP chính với OIS, camera telephoto 50MP zoom quang 5x. Khả năng quay video 8K 30fps.

Pin 5000mAh với sạc nhanh 45W, sạc không dây 15W. Hỗ trợ S Pen tích hợp.`,
        anh_dai_dien: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=400&fit=crop'
    },
    {
        tieu_de: 'Xiaomi 14 Ultra - Camera Leica đỉnh cao',
        noi_dung: `Xiaomi 14 Ultra là flagship mới nhất của Xiaomi với hệ thống camera Leica chuyên nghiệp.

Hệ thống 4 camera Leica Summilux với cảm biến chính Sony LYT-900 1 inch 50MP.

Chip Snapdragon 8 Gen 3 mạnh mẽ, RAM 16GB và bộ nhớ trong 512GB.

Pin 5000mAh với sạc nhanh 90W có dây và 80W không dây.`,
        anh_dai_dien: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&h=400&fit=crop'
    },
    {
        tieu_de: 'OPPO Find X7 Ultra - Đột phá công nghệ camera',
        noi_dung: `OPPO Find X7 Ultra đánh dấu bước tiến lớn trong công nghệ camera smartphone.

Hai camera telephoto periscope cho phép zoom quang học 3x và 6x.

Chip Snapdragon 8 Gen 3, RAM 16GB, bộ nhớ 512GB.

Pin 5000mAh với sạc nhanh SUPERVOOC 100W.`,
        anh_dai_dien: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=400&fit=crop'
    },
    {
        tieu_de: 'Vivo X100 Pro - Chip Dimensity 9300 đầu tiên',
        noi_dung: `Vivo X100 Pro là smartphone đầu tiên trang bị chip MediaTek Dimensity 9300.

Camera ZEISS với cảm biến chính 50MP, camera telephoto 100MP với zoom quang 4.3x.

Màn hình LTPO AMOLED 6.78 inch với độ phân giải 2K, tần số quét 120Hz.

Pin 5400mAh với sạc nhanh 100W.`,
        anh_dai_dien: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=400&fit=crop'
    },
    {
        tieu_de: 'Google Pixel 8 Pro - AI smartphone tốt nhất',
        noi_dung: `Google Pixel 8 Pro là smartphone với khả năng AI mạnh mẽ nhất hiện tại nhờ chip Tensor G3.

Tính năng Magic Eraser, Photo Unblur, Best Take và nhiều công cụ AI khác.

Camera 50MP với cảm biến lớn, camera telephoto 48MP zoom quang 5x.

Màn hình LTPO OLED 6.7 inch với độ phân giải QHD+ và tần số quét 120Hz.`,
        anh_dai_dien: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800&h=400&fit=crop'
    }
];

async function updateNews() {
    try {
        await pool.query('DELETE FROM tin_tuc');
        
        for (const news of newsData) {
            await pool.query(
                'INSERT INTO tin_tuc (tieu_de, noi_dung, anh_dai_dien, ma_admin, ngay_dang) VALUES (?, ?, ?, 1, NOW())',
                [news.tieu_de, news.noi_dung, news.anh_dai_dien]
            );
        }
        
        console.log('Da cap nhat du lieu tin tuc thanh cong!');
        process.exit(0);
    } catch (error) {
        console.error('Loi:', error);
        process.exit(1);
    }
}

updateNews();
