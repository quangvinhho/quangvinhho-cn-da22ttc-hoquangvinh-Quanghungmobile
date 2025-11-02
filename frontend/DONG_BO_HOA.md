# CẤU TRÚC THỨ MỤC VÀ ĐỒNG BỘ HÓA - QUANGHƯNG MOBILE

## 📁 CẤU TRÚC THƯ MỤC

```
frontend/
├── index.html                    # Trang chủ (đã đồng bộ)
├── products.html                 # Trang sản phẩm (đã đồng bộ)
├── product-detail.html           # Chi tiết sản phẩm (đã đồng bộ)
├── cart.html                     # Giỏ hàng (đã đồng bộ)
├── promotions.html               # Khuyến mãi (đã đồng bộ)
├── news.html                     # Tin tức (đã đồng bộ)
├── news-detail.html              # Chi tiết tin tức
├── contact.html                  # Liên hệ (đã đồng bộ)
├── login.html                    # Đăng nhập (đã đồng bộ)
├── register.html                 # Đăng ký (đã đồng bộ)
├── profile.html                  # Tài khoản (đã đồng bộ)
├── template.html                 # Template mẫu (đã đồng bộ)
│
├── style.css                     # CSS chính
├── responsive.css                # CSS responsive (MỚI)
├── mobile-styles.css             # CSS mobile cũ
│
├── components/                   # Thư mục components
│   ├── header-nav.html          # Header & Menu component (đã đồng bộ)
│   ├── load-header.js           # Script load header tự động
│   ├── footer.html              # Footer component
│   └── profile-sidebar.html     # Sidebar profile
│
└── images/                       # Thư mục hình ảnh
    ├── logo.png
    ├── banner-*.jpg
    └── ...
```

## ✅ DANH SÁCH FILE ĐÃ ĐỒNG BỘ

### 1. **Tất cả trang HTML chính (10 files):**
   - ✅ index.html
   - ✅ products.html
   - ✅ product-detail.html
   - ✅ cart.html
   - ✅ promotions.html
   - ✅ news.html
   - ✅ contact.html
   - ✅ login.html
   - ✅ register.html
   - ✅ profile.html
   - ✅ template.html

### 2. **Components (2 files):**
   - ✅ components/header-nav.html
   - ✅ components/load-header.js

### 3. **CSS Files (1 file mới):**
   - ✅ responsive.css (MỚI - Responsive cho mobile, tablet, desktop)

## 🎨 ĐỒNG BỘ HÓA ĐÃ HOÀN THÀNH

### **A. Header & Navigation:**
Tất cả các trang đều có:
- Logo QuangHưng Mobile
- Thanh tìm kiếm (desktop inline, mobile ở dưới)
- Menu: Giỏ hàng | Liên hệ | Đăng nhập
- Hamburger menu cho mobile
- Navigation menu với dropdown (desktop)
- Mobile sidebar menu

### **B. CSS & Styling:**
```html
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="responsive.css">
  <style>
    :root {
      --red-main: #e41e26;
      --red-dark: #c5111a;
    }
  </style>
</head>
```

### **C. Navigation Menu Structure:**

#### Desktop Menu:
1. 🏠 **Trang chủ** → index.html
2. 📱 **Điện thoại** (Dropdown) → products.html
   - 🍎 iPhone
   - 📱 Samsung
   - 📱 Sony Xperia
   - 🔍 Google Pixel
3. 🎧 **Phụ kiện** → products.html?category=phukien
4. 🏷️ **Khuyến mãi** (HOT badge) → promotions.html
5. 📰 **Tin tức** → news.html
6. 🎧 **Liên hệ** → contact.html

#### Right Side Info:
- 🚚 Miễn phí vận chuyển
- 🛡️ Bảo hành chính hãng

#### Mobile Menu (Sidebar):
- 8 mục với icons Font Awesome
- Slide animation từ trái
- Overlay background
- Nút đóng X

## 📱 RESPONSIVE BREAKPOINTS

```css
Mobile:        < 640px  (sm)
Tablet:        640px - 1024px (md, lg)
Desktop:       1024px+ (lg, xl)
Large Desktop: 1280px+ (xl)
Extra Large:   1536px+ (2xl)
```

### Mobile (< 640px):
- Banner: 200px height
- Product grid: 2 columns
- PROMO strip: 2 columns
- Mobile menu: Hamburger + Sidebar

### Tablet (640px - 1024px):
- Banner: 280px height
- Product grid: 3-4 columns
- PROMO strip: 3-5 columns
- Menu: Hamburger + Sidebar

### Desktop (1024px+):
- Banner: 360px height
- Product grid: 5-6 columns
- PROMO strip: 5 columns
- Menu: Full horizontal nav with dropdown

## 🔗 LIÊN KẾT GIỮA CÁC TRANG

```
index.html (Trang chủ)
├── Header Logo → index.html
├── Menu: Trang chủ → index.html
├── Menu: Điện thoại → products.html
│   ├── iPhone → products.html?brand=iphone
│   ├── Samsung → products.html?brand=samsung
│   ├── Sony → products.html?brand=sony
│   └── Google → products.html?brand=google
├── Menu: Phụ kiện → products.html?category=phukien
├── Menu: Khuyến mãi → promotions.html
├── Menu: Tin tức → news.html
├── Menu: Liên hệ → contact.html
├── Right Menu: Giỏ hàng → cart.html
└── Right Menu: Đăng nhập → login.html

products.html → product-detail.html (click sản phẩm)
login.html ↔ register.html (link qua lại)
profile.html → Các trang quản lý
```

## 🎯 TÍNH NĂNG CHUNG

### 1. **Header (Tất cả trang):**
- Sticky top (luôn hiện khi scroll)
- Responsive cho mobile/tablet/desktop
- Search bar động
- Cart icon với badge số lượng (mobile: chỉ icon, desktop: icon + text)

### 2. **Navigation Menu:**
- Desktop: Dropdown menu cho "Điện thoại"
- Mobile: Sidebar slide từ trái
- Hover effects smooth
- Icons Font Awesome

### 3. **Mobile Features:**
- Hamburger menu button
- Sidebar overlay
- Touch-optimized (44px min touch target)
- Mobile search ở dưới logo

### 4. **Styling Consistency:**
- Primary color: #e41e26 (đỏ chính)
- Secondary color: #c5111a (đỏ đậm)
- Font: Tailwind default + Font Awesome icons
- Shadows: Tailwind shadow utilities
- Transitions: 300ms smooth

## 📋 SỬ DỤNG TEMPLATE

Để tạo trang mới, copy `template.html`:

```bash
# Copy template
cp template.html new-page.html

# Chỉnh sửa:
1. Đổi <title>
2. Thêm nội dung vào <main>
3. Header & Footer tự động load
```

## 🚀 TRIỂN KHAI

```bash
# Mở local server
cd frontend
python -m http.server 8000
# hoặc
npx http-server -p 8000

# Truy cập
http://localhost:8000
```

## ✨ TÍNH NĂNG ĐÃ CÓ

✅ Responsive design (mobile, tablet, desktop)
✅ Header & Navigation đồng bộ
✅ Mobile sidebar menu
✅ Dropdown menu desktop
✅ Touch-optimized
✅ Smooth animations
✅ SEO-friendly meta tags
✅ Accessibility support
✅ Print styles
✅ Safe area support (notch devices)

## 📝 GHI CHÚ

- Tất cả file HTML đã được đồng bộ với header/nav mới
- Responsive CSS đã được thêm vào tất cả trang
- Mobile menu hoạt động với JavaScript
- Dropdown menu chỉ hiện trên desktop (≥1024px)
- Components tự động load qua `load-header.js`

---
**Cập nhật:** 22/10/2025
**Phiên bản:** 2.0
**Trạng thái:** ✅ Hoàn tất đồng bộ
