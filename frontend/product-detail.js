// ===== PRODUCT DETAIL PAGE - QuangHưng Mobile 2025 =====

// Global Variables
let PRODUCTS = [];
let currentProduct = null;
let selectedRating = 0;

// Brand logos fallback
const BRAND_LOGOS = {
  iphone: 'images/logo_iphone_ngang_eac93ff477.webp',
  samsung: 'images/logo_samsung_ngang_1624d75bd8.webp',
  oppo: 'images/logo_oppo_ngang_68d31fcd73.webp',
  xiaomi: 'images/logo_xiaomi_ngang_0faf267234.webp',
  sony: 'images/sony-xperia-1-vi.webp',
  pixel: 'images/pixel-9-pro.avif'
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadProductData();
  
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id')) || 1;
  
  renderProductDetail(productId);
  setupScrollListener();
});

// Load product data from JSON
async function loadProductData() {
  try {
    const response = await fetch('product-data.json');
    const data = await response.json();
    PRODUCTS = data.products;
  } catch (error) {
    console.error('Error loading products:', error);
    PRODUCTS = getFallbackData();
  }
}

// Fallback data
function getFallbackData() {
  return [
    {id:1,name:'Samsung Galaxy A36 5G',brand:'samsung',category:'dienthoai',price:8490000,oldPrice:9490000,discount:10,ram:8,storage:128,screen:'6.6" Super AMOLED',camera:'50MP',battery:'5000 mAh',os:'Android 14',features:['tragop','freeship'],colors:['#e8f5e9','#000000'],image:'images/samsung_galaxy_a36_5g.avif',rating:4.5,reviews:152},
    {id:5,name:'iPhone 15 Pro Max 256GB',brand:'iphone',category:'dienthoai',price:28990000,oldPrice:34990000,discount:17,ram:8,storage:256,screen:'6.7" Super Retina XDR',camera:'48MP',battery:'4422 mAh',os:'iOS 17',features:['tragop','freeship'],colors:['#4a4a4a','#e8e8e8','#ffd700'],image:'images/15-256.avif',rating:4.9,reviews:512},
    {id:9,name:'Samsung Galaxy S25 Ultra',brand:'samsung',category:'dienthoai',price:31990000,oldPrice:35990000,discount:11,ram:12,storage:256,screen:'6.8" Dynamic AMOLED 2X',camera:'200MP',battery:'5000 mAh',os:'Android 15',features:['tragop','freeship'],colors:['#9e9e9e','#000000'],image:'images/samsung.webp',rating:4.8,reviews:687}
  ];
}

// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

function generateStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
  if (half) html += '<i class="fas fa-star-half-alt"></i>';
  for (let i = full + (half ? 1 : 0); i < 5; i++) html += '<i class="far fa-star"></i>';
  return html;
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle text-green-500' : 'exclamation-circle text-red-500'} text-xl"></i>
    <span class="font-medium text-gray-800">${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== RENDER PRODUCT DETAIL =====
function renderProductDetail(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  currentProduct = product;
  
  if (!product) {
    document.querySelector('main').innerHTML = `
      <div class="text-center py-20">
        <i class="fas fa-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
        <p class="text-gray-600 mb-6">Sản phẩm bạn tìm kiếm không tồn tại.</p>
        <a href="products.html" class="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
          <i class="fas fa-arrow-left"></i> Quay lại
        </a>
      </div>
    `;
    return;
  }

  // Update page info
  document.title = `${product.name} - QuangHưng Mobile`;
  document.getElementById('breadcrumbProduct').textContent = product.name;
  
  // Calculate stats
  const rating = product.rating || 4.5;
  const reviews = product.reviews || Math.floor(Math.random() * 200) + 50;
  const sold = Math.floor(Math.random() * 500) + 100;
  const stock = Math.floor(Math.random() * 50) + 10;

  // Update main image
  document.getElementById('mainProductImage').src = product.image;
  document.getElementById('mainProductImage').alt = product.name;
  
  // Update discount badge
  if (product.discount) {
    document.getElementById('discountBadge').classList.remove('hidden');
    document.getElementById('discountPercent').textContent = product.discount;
  }
  document.getElementById('brandBadge').classList.remove('hidden');
  
  // Update thumbnails
  renderThumbnails(product);
  
  // Update product info
  document.getElementById('productTitle').textContent = product.name;
  document.getElementById('ratingStars').innerHTML = generateStars(rating);
  document.getElementById('ratingValue').textContent = rating.toFixed(1);
  document.getElementById('reviewCount').textContent = reviews;
  document.getElementById('soldCount').textContent = sold;
  
  // Update prices
  document.getElementById('currentPrice').textContent = formatPrice(product.price);
  if (product.oldPrice) {
    document.getElementById('oldPrice').textContent = formatPrice(product.oldPrice);
    document.getElementById('oldPrice').classList.remove('hidden');
    document.getElementById('savingBadge').classList.remove('hidden');
    document.getElementById('savingAmount').textContent = formatPrice(product.oldPrice - product.price);
  }
  
  // Update stock
  document.getElementById('stockCount').textContent = stock;
  document.getElementById('quantity').max = stock;
  
  // Render color options
  if (product.colors && product.colors.length > 0) {
    document.getElementById('colorSection').classList.remove('hidden');
    renderColorOptions(product.colors);
  }
  
  // Render storage options
  if (product.category === 'dienthoai' && product.storage) {
    document.getElementById('storageSection').classList.remove('hidden');
    renderStorageOptions(product.storage);
  }
  
  // Update sticky bar
  document.getElementById('stickyImage').src = product.image;
  document.getElementById('stickyName').textContent = product.name;
  document.getElementById('stickyPrice').textContent = formatPrice(product.price);
  
  // Update tabs
  document.getElementById('tabReviewCount').textContent = reviews;
  
  // Load initial tab content
  loadDescription();
  
  // Load related products
  renderRelatedProducts(product);
  
  // Update review section
  document.getElementById('avgRating').textContent = rating.toFixed(1);
  document.getElementById('avgStars').innerHTML = generateStars(rating);
  document.getElementById('totalReviewsDisplay').textContent = reviews;
  
  // Load reviews
  loadReviews();
}

// Render thumbnails with multiple images
function renderThumbnails(product) {
  const container = document.getElementById('thumbnailsContainer');
  container.innerHTML = '';
  
  // Sử dụng mảng images nếu có, nếu không thì dùng image chính
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image, product.image, product.image, product.image];
  
  images.forEach((img, i) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `
      <div class="thumbnail-item ${i === 0 ? 'active' : ''}" onclick="selectThumbnail(${i}, '${img}')">
        <img src="${img}" alt="Ảnh ${i + 1}" class="w-full h-16 object-contain" onerror="this.src='images/iphone.jpg'" />
      </div>
    `;
    container.appendChild(slide);
  });
  
  // Khởi tạo Swiper cho thumbnails
  initThumbnailSwiper();
}

// Initialize thumbnail swiper
function initThumbnailSwiper() {
  new Swiper('.thumbSwiper', {
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
  });
}

// Select thumbnail - cập nhật ảnh chính
function selectThumbnail(index, imageSrc) {
  // Cập nhật active state cho thumbnails
  document.querySelectorAll('.thumbnail-item').forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });
  
  // Cập nhật ảnh chính với hiệu ứng fade
  const mainImage = document.getElementById('mainProductImage');
  mainImage.style.opacity = '0';
  
  setTimeout(() => {
    mainImage.src = imageSrc;
    mainImage.style.opacity = '1';
  }, 150);
}

// Render color options
function renderColorOptions(colors) {
  const container = document.getElementById('colorOptions');
  container.innerHTML = colors.map((color, i) => `
    <button class="color-option ${i === 0 ? 'active' : ''}" style="background-color: ${color};" onclick="selectColor(this)" title="Màu ${i + 1}"></button>
  `).join('');
}

// Select color
function selectColor(btn) {
  document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// Render storage options
function renderStorageOptions(currentStorage) {
  const container = document.getElementById('storageOptions');
  const storages = [currentStorage];
  if (currentStorage < 256) storages.push(256);
  if (currentStorage < 512) storages.push(512);
  
  container.innerHTML = storages.map((size, i) => `
    <button class="storage-option ${i === 0 ? 'active' : ''}" onclick="selectStorage(this)">
      <div class="storage-size">${size}GB</div>
      ${i > 0 ? `<div class="storage-price">+${i * 2}tr</div>` : ''}
    </button>
  `).join('');
}

// Select storage
function selectStorage(btn) {
  document.querySelectorAll('.storage-option').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}


// ===== QUANTITY FUNCTIONS =====
function changeQuantity(delta) {
  const input = document.getElementById('quantity');
  const max = parseInt(input.max) || 99;
  let value = parseInt(input.value) || 1;
  value = Math.max(1, Math.min(max, value + delta));
  input.value = value;
}

// ===== CART FUNCTIONS =====
function addToCart() {
  if (!currentProduct) return;
  
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  const existingItem = cart.find(item => item.id === currentProduct.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...currentProduct, quantity });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('storage'));
  
  showToast(`Đã thêm "${currentProduct.name}" vào giỏ hàng!`, 'success');
}

function buyNow() {
  addToCart();
  window.location.href = 'checkout.html';
}

function buyInstallment() {
  addToCart();
  showToast('Chuyển đến trang trả góp...', 'success');
  setTimeout(() => window.location.href = 'checkout.html?installment=true', 1000);
}

function addToWishlist() {
  if (!currentProduct) return;
  showToast(`Đã thêm "${currentProduct.name}" vào danh sách yêu thích!`, 'success');
}

// ===== TAB FUNCTIONS =====
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
  document.getElementById('tab-' + tabName).classList.remove('hidden');
  
  // Load content
  if (tabName === 'description') loadDescription();
  else if (tabName === 'specs') loadSpecs();
  else if (tabName === 'reviews') loadReviews();
}

// Load description
function loadDescription() {
  if (!currentProduct) return;
  
  document.getElementById('productDescription').innerHTML = `
    <div class="space-y-6">
      <p class="text-gray-700 leading-relaxed text-base">
        <strong class="text-gray-900">${currentProduct.name}</strong> là sản phẩm cao cấp đến từ thương hiệu 
        <strong class="text-red-600">${currentProduct.brand.toUpperCase()}</strong>, mang đến trải nghiệm tuyệt vời 
        với thiết kế hiện đại và cấu hình mạnh mẽ.
      </p>
      
      <div class="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-100">
        <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i class="fas fa-star text-yellow-400"></i> Điểm nổi bật
        </h4>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${currentProduct.screen ? `<li class="flex items-center gap-3"><i class="fas fa-check-circle text-green-500"></i><span>Màn hình ${currentProduct.screen} sắc nét</span></li>` : ''}
          ${currentProduct.camera ? `<li class="flex items-center gap-3"><i class="fas fa-check-circle text-green-500"></i><span>Camera ${currentProduct.camera} chuyên nghiệp</span></li>` : ''}
          ${currentProduct.ram ? `<li class="flex items-center gap-3"><i class="fas fa-check-circle text-green-500"></i><span>RAM ${currentProduct.ram}GB đa nhiệm mượt mà</span></li>` : ''}
          ${currentProduct.battery ? `<li class="flex items-center gap-3"><i class="fas fa-check-circle text-green-500"></i><span>Pin ${currentProduct.battery} dùng cả ngày</span></li>` : ''}
          <li class="flex items-center gap-3"><i class="fas fa-check-circle text-green-500"></i><span>Thiết kế sang trọng, cao cấp</span></li>
          <li class="flex items-center gap-3"><i class="fas fa-check-circle text-green-500"></i><span>Hiệu năng mạnh mẽ</span></li>
        </ul>
      </div>
      
      <div class="bg-blue-50 rounded-xl p-5 border border-blue-100">
        <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i class="fas fa-shield-alt text-blue-600"></i> Cam kết từ QuangHưng Mobile
        </h4>
        <ul class="space-y-2">
          <li class="flex items-center gap-3"><i class="fas fa-badge-check text-blue-600"></i><span>100% sản phẩm chính hãng, nguyên seal</span></li>
          <li class="flex items-center gap-3"><i class="fas fa-box text-blue-600"></i><span>Bảo hành chính hãng 12 tháng</span></li>
          <li class="flex items-center gap-3"><i class="fas fa-exchange-alt text-blue-600"></i><span>Đổi trả miễn phí trong 7 ngày</span></li>
          <li class="flex items-center gap-3"><i class="fas fa-shipping-fast text-blue-600"></i><span>Giao hàng nhanh chóng toàn quốc</span></li>
        </ul>
      </div>
    </div>
  `;
}

// Load specifications
function loadSpecs() {
  if (!currentProduct) return;
  
  const specs = [];
  if (currentProduct.screen) specs.push(['<i class="fas fa-mobile-alt text-red-500 mr-2"></i>Màn hình', currentProduct.screen]);
  if (currentProduct.os) specs.push(['<i class="fas fa-cog text-red-500 mr-2"></i>Hệ điều hành', currentProduct.os]);
  if (currentProduct.camera) specs.push(['<i class="fas fa-camera text-red-500 mr-2"></i>Camera', currentProduct.camera]);
  if (currentProduct.ram) specs.push(['<i class="fas fa-memory text-red-500 mr-2"></i>RAM', currentProduct.ram + 'GB']);
  if (currentProduct.storage) specs.push(['<i class="fas fa-hdd text-red-500 mr-2"></i>Bộ nhớ trong', currentProduct.storage + 'GB']);
  if (currentProduct.battery) specs.push(['<i class="fas fa-battery-full text-red-500 mr-2"></i>Pin', currentProduct.battery]);
  specs.push(['<i class="fas fa-wifi text-red-500 mr-2"></i>Kết nối', '5G, Wi-Fi 6, Bluetooth 5.3, NFC']);
  specs.push(['<i class="fas fa-fingerprint text-red-500 mr-2"></i>Bảo mật', 'Vân tay, Face ID']);
  
  document.getElementById('productSpecs').innerHTML = `
    <table class="specs-table w-full">
      <tbody>
        ${specs.map(([label, value]) => `
          <tr>
            <td>${label}</td>
            <td class="text-gray-800">${value}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Load reviews
function loadReviews() {
  const reviewsList = document.getElementById('reviewsList');
  const sampleReviews = [
    { name: 'Nguyễn Văn A', rating: 5, date: '15/11/2025', comment: 'Sản phẩm rất tốt, đóng gói cẩn thận. Giao hàng nhanh, nhân viên tư vấn nhiệt tình. Sẽ ủng hộ shop dài dài!', verified: true },
    { name: 'Trần Thị B', rating: 5, date: '12/11/2025', comment: 'Máy đẹp, chạy mượt. Giá cả hợp lý so với thị trường. Rất hài lòng với dịch vụ của QuangHưng Mobile.', verified: true },
    { name: 'Lê Văn C', rating: 4, date: '10/11/2025', comment: 'Sản phẩm chính hãng, còn nguyên seal. Camera chụp đẹp, pin trâu. Chỉ tiếc là không có sạc nhanh kèm theo.', verified: true },
    { name: 'Phạm Thị D', rating: 5, date: '08/11/2025', comment: 'Mua làm quà tặng người thân, rất ưng ý. Shop tư vấn kỹ, hỗ trợ cài đặt tận tình. 10 điểm!', verified: false }
  ];
  
  reviewsList.innerHTML = sampleReviews.map(review => `
    <div class="review-item">
      <div class="flex items-start gap-4">
        <div class="review-avatar">${review.name.charAt(0)}</div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-semibold text-gray-900">${review.name}</span>
            ${review.verified ? '<span class="review-verified"><i class="fas fa-check mr-1"></i>Đã mua hàng</span>' : ''}
          </div>
          <div class="flex items-center gap-2 mb-2">
            <div class="review-stars">${generateStars(review.rating)}</div>
            <span class="text-xs text-gray-500">${review.date}</span>
          </div>
          <p class="text-gray-700 text-sm leading-relaxed">${review.comment}</p>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== REVIEW FORM =====
function toggleReviewForm() {
  const form = document.getElementById('reviewForm');
  form.classList.toggle('hidden');
  
  // Initialize rating input
  if (!form.classList.contains('hidden')) {
    const ratingInput = document.getElementById('ratingInput');
    ratingInput.innerHTML = [1,2,3,4,5].map(i => `
      <button type="button" onclick="setRating(${i})" class="text-2xl text-gray-300 hover:text-yellow-400 transition">
        <i class="far fa-star" data-rating="${i}"></i>
      </button>
    `).join('');
  }
}

function setRating(rating) {
  selectedRating = rating;
  document.querySelectorAll('#ratingInput i').forEach((star, i) => {
    star.className = i < rating ? 'fas fa-star text-yellow-400' : 'far fa-star text-gray-300';
  });
}

function submitReview() {
  const name = document.getElementById('reviewName').value.trim();
  const comment = document.getElementById('reviewComment').value.trim();
  
  if (!name || !comment || selectedRating === 0) {
    showToast('Vui lòng điền đầy đủ thông tin!', 'error');
    return;
  }
  
  showToast('Cảm ơn bạn đã đánh giá! Đánh giá đang chờ duyệt.', 'success');
  document.getElementById('reviewForm').classList.add('hidden');
  document.getElementById('reviewName').value = '';
  document.getElementById('reviewComment').value = '';
  selectedRating = 0;
}

// ===== RELATED PRODUCTS =====
function renderRelatedProducts(product) {
  const related = PRODUCTS.filter(p => p.id !== product.id && p.brand === product.brand).slice(0, 5);
  const container = document.getElementById('relatedProducts');
  
  if (related.length === 0) {
    container.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">Không có sản phẩm liên quan</p>';
    return;
  }
  
  container.innerHTML = related.map(p => `
    <a href="product-detail.html?id=${p.id}" class="related-product-card group">
      <div class="aspect-square p-4 bg-gray-50 flex items-center justify-center overflow-hidden">
        <img src="${p.image}" alt="${p.name}" class="max-w-full max-h-full object-contain" loading="lazy" />
      </div>
      <div class="p-3">
        <h3 class="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-red-600 transition">${p.name}</h3>
        <div class="flex items-baseline gap-2">
          <span class="font-bold text-red-600">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="text-xs text-gray-400 line-through">${formatPrice(p.oldPrice)}</span>` : ''}
        </div>
        ${p.discount ? `<span class="inline-block mt-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded">-${p.discount}%</span>` : ''}
      </div>
    </a>
  `).join('');
}

// ===== SHARE FUNCTIONS =====
function shareProduct(platform) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(currentProduct?.name || 'Sản phẩm');
  
  const urls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    messenger: `https://www.facebook.com/dialog/send?link=${url}&app_id=YOUR_APP_ID`,
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`
  };
  
  if (urls[platform]) {
    window.open(urls[platform], '_blank', 'width=600,height=400');
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast('Đã sao chép link sản phẩm!', 'success');
  });
}

// ===== SCROLL LISTENER =====
function setupScrollListener() {
  const stickyBar = document.getElementById('stickyBuyBar');
  const buySection = document.querySelector('main');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 600) {
      stickyBar.classList.add('active');
    } else {
      stickyBar.classList.remove('active');
    }
  });
}
