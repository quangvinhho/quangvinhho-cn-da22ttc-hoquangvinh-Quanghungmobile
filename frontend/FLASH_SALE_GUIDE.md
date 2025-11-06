# 🔥 Hướng Dẫn Thiết Kế "Giá Sốc" / Flash Sale - QuangHưng Mobile

## 🎯 Mục tiêu
Tạo phần Flash Sale ấn tượng, thu hút khách hàng và tăng tỷ lệ chuyển đổi cho website bán điện thoại.

---

## 📐 Bố Cục & Cấu Trúc

### 1. Vị Trí Đặt Phần "Giá Sốc"
```
✅ Trang chủ: Ngay sau banner chính
✅ Trang sản phẩm: Đầu danh mục
✅ Trang chi tiết: Section đề xuất
```

### 2. Cấu Trúc Phần Flash Sale

```html
<section class="flash-sale-section">
  ├── Flash Sale Wrapper (Container chính)
  │   ├── Animated Background (Hiệu ứng nền)
  │   ├── Header Section
  │   │   ├── Title Section (Icon + Tiêu đề)
  │   │   └── Countdown Timer (Đếm ngược)
  │   └── Products Grid (Danh sách sản phẩm)
  │       └── Product Cards (Các thẻ sản phẩm)
</section>
```

---

## 🎨 Màu Sắc - Color Scheme

### Màu Chủ Đạo
```css
Background Gradient:
  - Cam đỏ: #ff264a → #ff5722 → #ff9800
  - Tạo cảm giác nóng bỏng, khẩn cấp

Text Colors:
  - Tiêu đề: #ffffff (trắng)
  - Giá khuyến mãi: #ff264a (đỏ cam)
  - Giá gốc: #888888 (xám mờ)

Accents:
  - Badge giảm giá: #ff264a
  - Countdown: #ff264a gradient
  - Border highlight: #ffd54f (vàng)
  - Button: #005bea (xanh chủ đạo)
```

### Tâm Lý Màu Sắc
- **Đỏ/Cam**: Sự khẩn cấp, hành động nhanh
- **Vàng**: Giá trị, tiết kiệm
- **Xanh**: Tin cậy, hành động

---

## 📏 Kích Cỡ Chữ - Typography

### Tiêu Đề "GIÁ SỐC"
```css
font-size: 36px (Desktop) / 28px (Tablet) / 24px (Mobile)
font-weight: 800 (Extra Bold)
font-family: 'Montserrat'
text-transform: uppercase
letter-spacing: 2px
color: #ffffff
text-shadow: 2px 2px 8px rgba(0,0,0,0.3)
```

### Subtitle
```css
font-size: 14px
font-weight: 600
color: #ffffff
Example: "🔥 Số lượng có hạn - Nhanh tay đặt hàng!"
```

### Giá Sản Phẩm

**Giá Khuyến Mãi:**
```css
font-size: 24px
font-weight: 800
font-family: 'Montserrat'
color: #ff264a
```

**Giá Gốc:**
```css
font-size: 14px
font-weight: 400
color: #888888
text-decoration: line-through
```

### Countdown Numbers
```css
font-size: 24px
font-weight: 800
font-family: 'Montserrat'
color: #ffffff
background: gradient #ff264a
```

---

## 🎯 Các Thành Phần Quan Trọng

### 1. Icon Flash Sale
```html
<div class="flash-sale-icon">
  <i class="fas fa-bolt"></i>
</div>
```

**Đặc điểm:**
- Kích thước: 60px × 60px (Desktop), 50px × 50px (Mobile)
- Background: Trắng (#ffffff)
- Icon color: Vàng (#ff9800)
- Border-radius: 16px
- Animation: Bounce effect

### 2. Countdown Timer

**Cấu trúc:**
```
[ICON CLOCK] KẾT THÚC SAU
    12  :  45  :  30
   (Giờ) (Phút) (Giây)
```

**Styling:**
```css
Container:
  - Background: #ffffff
  - Border: 3px solid #ffd54f
  - Border-radius: 16px
  - Shadow: 0 8px 24px rgba(0,0,0,0.2)

Numbers:
  - Background: Gradient #ff264a
  - Size: 24px
  - Font: Montserrat Bold
  - Padding: 10px 14px
  - Min-width: 50px
```

### 3. Product Card

**Cấu trúc Card:**
```
┌─────────────────────────┐
│ [IMAGE]   [-30% Badge]  │
│           [Stock Info]  │
├─────────────────────────┤
│ Product Name            │
│ 28.990.000₫            │
│ 33.990.000₫            │
│ ▓▓▓▓▓▓░░░░ 60%        │
│ Đã bán 15/25           │
│ [MUA NGAY BUTTON]      │
└─────────────────────────┘
```

**Dimensions:**
```css
Desktop: 220px min-width
Tablet: 200px min-width
Mobile: 180px min-width

Image height:
  Desktop: 180px
  Mobile: 140px
```

**Styling:**
```css
Background: #ffffff
Border: 3px solid #ffd54f
Border-radius: 16px
Padding: 16px
Shadow: 0 8px 24px rgba(0,0,0,0.15)

Hover Effect:
  - Transform: translateY(-8px)
  - Shadow: 0 16px 40px rgba(0,0,0,0.25)
  - Border-color: #ffc107
```

### 4. Badges

**Badge Giảm Giá (-30%):**
```css
Position: Top-left của image
Background: Gradient #ff264a → #e91e63
Font-size: 14px
Font-weight: 800
Padding: 6px 12px
Border-radius: 8px
Color: #ffffff
Shadow: 0 4px 12px rgba(255,38,74,0.5)
```

**Badge Tồn Kho (⚠️ Chỉ còn 5):**
```css
Position: Bottom-left của image
Background: #ffc107
Font-size: 11px
Font-weight: 700
Padding: 4px 10px
Border-radius: 6px
Color: #222222
```

### 5. Progress Bar (Thanh Tiến Độ Bán)

```css
Container:
  - Width: 100%
  - Height: 8px
  - Background: #e0e0e0
  - Border-radius: 10px

Fill:
  - Background: Gradient #ff9800 → #ff264a
  - Border-radius: 10px
  - Shadow: 0 0 8px rgba(255,152,0,0.6)
  - Animation: Width transition 0.5s ease
```

**Text hiển thị:**
```
Đã bán 15/25 sản phẩm
Font-size: 12px
Color: #444444
Font-weight: 600
```

### 6. Button "Mua Ngay"

```css
Width: 100%
Background: Gradient #005bea → #0066ff
Font-size: 15px
Font-weight: 700
Font-family: 'Montserrat'
Padding: 12px 16px
Border-radius: 10px
Color: #ffffff
Text-transform: uppercase
Letter-spacing: 0.5px
Shadow: 0 4px 12px rgba(0,91,234,0.3)

Hover:
  - Background: #0047b3 → #0052cc
  - Transform: translateY(-2px)
  - Shadow: 0 6px 20px rgba(0,91,234,0.5)

Icon:
  - <i class="fas fa-shopping-cart"></i>
  - Margin-right: 8px
```

---

## ✨ Hiệu Ứng & Animation

### 1. Background Animation
```css
@keyframes float-effect {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, 20px) scale(1.1); }
}

Áp dụng: Các vòng tròn mờ trên nền
Duration: 6s
Easing: ease-in-out infinite
```

### 2. Icon Bounce
```css
@keyframes icon-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

Duration: 2s
Easing: ease-in-out infinite
```

### 3. Countdown Shimmer
```css
@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

Hiệu ứng: Ánh sáng chạy qua số đếm ngược
Duration: 3s infinite
```

### 4. Clock Pulse
```css
@keyframes pulse-icon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

Áp dụng: Icon đồng hồ
Duration: 2s infinite
```

### 5. Card Hover
```css
Hover effect:
  - translateY(-8px)
  - Shadow increase
  - Border color change
  - Image scale(1.08)

Transition: all 0.3s ease
```

### 6. Ripple Effect (Button Click)
```css
@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

Duration: 0.6s ease-out
```

---

## 📱 Responsive Design

### Desktop (≥1024px)
```
- Full layout
- 6-7 cards visible
- Font-size: Max
- Icon: 60px
- Card width: 220px
```

### Tablet (768px - 1023px)
```
- Compact layout
- 4-5 cards visible
- Font-size: Medium
- Icon: 50px
- Card width: 200px
```

### Mobile (<768px)
```
- Stack layout
- 2-3 cards visible (scroll)
- Font-size: Small
- Icon: 50px
- Card width: 180px
- Countdown: Full width
```

---

## 🎬 JavaScript Functionality

### 1. Countdown Timer
```javascript
// Auto update every second
// Format: HH:MM:SS
// Reset when expired
// Store in localStorage
```

### 2. Smooth Scroll
```javascript
// Horizontal scroll for products
// Snap to card
// Mouse drag support
// Touch swipe support
```

### 3. Buy Button Handler
```javascript
// Click effect
// Add to cart
// Show notification
// Ripple animation
```

---

## 📋 Checklist Thiết Kế Flash Sale

- [ ] Màu nền gradient đỏ/cam nổi bật
- [ ] Icon flash bolt với animation
- [ ] Tiêu đề "GIÁ SỐC" viết hoa, in đậm 36px
- [ ] Countdown timer working với số lớn
- [ ] Badge giảm giá (-%) đỏ nổi bật
- [ ] Badge tồn kho màu vàng
- [ ] Giá khuyến mãi đỏ, lớn, in đậm
- [ ] Giá gốc xám, gạch ngang
- [ ] Progress bar hiển thị % đã bán
- [ ] Button "MUA NGAY" xanh, toàn bộ chiều rộng
- [ ] Hover effect cho card
- [ ] Ripple effect cho button
- [ ] Notification khi add to cart
- [ ] Responsive trên mọi thiết bị

---

## 💡 Tips Tối Ưu

### Tăng Chuyển Đổi
1. **Sử dụng số cụ thể**: "Chỉ còn 5" thay vì "Sắp hết"
2. **Countdown thật**: Tạo tính khan hiếm
3. **% giảm giá lớn**: -30%, -35%, -40%
4. **Progress bar**: Thể hiện sản phẩm đang bán chạy
5. **Button CTA rõ ràng**: "MUA NGAY" thay vì "Xem thêm"

### UX/UI
1. **Màu sắc tương phản cao**: Dễ nhận diện
2. **Animation vừa phải**: Không làm rối mắt
3. **Font lớn, rõ ràng**: Dễ đọc
4. **Touch-friendly**: Button đủ lớn cho mobile
5. **Loading nhanh**: Optimize images

### Performance
1. **Lazy load images**: Chỉ load khi cần
2. **Optimize countdown**: Không re-render toàn bộ
3. **CSS animations**: Dùng transform thay vì position
4. **Debounce scroll**: Tránh lag

---

## 🚀 Kết Luận

Phần Flash Sale được thiết kế với:
- **Màu sắc**: Nóng bỏng (đỏ/cam/vàng)
- **Typography**: Lớn, đậm, rõ ràng
- **Layout**: Nổi bật, dễ thấy
- **Animation**: Sinh động nhưng không quá
- **CTA**: Mạnh mẽ, rõ ràng

**Mục tiêu cuối cùng**: Tạo cảm giác khẩn cấp → Hành động ngay lập tức!
