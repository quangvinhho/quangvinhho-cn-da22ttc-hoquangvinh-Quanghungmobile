// ===== PRODUCT DETAIL PAGE - QuangHưng Mobile 2025 =====

// Global Variables
let PRODUCTS = [];
let currentProduct = null;
let selectedRating = 0;
let reviewImages = []; // Lưu base64 của ảnh đánh giá
const API_URL = 'http://localhost:3000/api';

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

// Load product data from API or JSON
async function loadProductData() {
  const API_URL = 'http://localhost:3000/api';
  
  try {
    // Thử lấy từ API trước
    const apiResponse = await fetch(`${API_URL}/products`);
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      if (apiData && apiData.length > 0) {
        PRODUCTS = apiData;
        return;
      }
    }
    throw new Error('API không khả dụng');
  } catch (error) {
    console.log('Fallback to product-data.json:', error.message);
    // Fallback: Lấy từ file JSON
    try {
      const response = await fetch('product-data.json');
      const data = await response.json();
      PRODUCTS = data.products;
    } catch (jsonError) {
      console.error('Error loading products:', jsonError);
      PRODUCTS = getFallbackData();
    }
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
  
  // Load reviews từ API (sẽ cập nhật cả thống kê)
  loadReviews();
  
  // Load rating stats từ API để cập nhật phần header
  loadProductRatingStats(product.id);
}

// Load thống kê rating từ API để cập nhật phần header sản phẩm
async function loadProductRatingStats(productId) {
  try {
    const response = await fetch(`${API_URL}/reviews/product/${productId}/stats`);
    if (response.ok) {
      const stats = await response.json();
      
      // Cập nhật rating ở phần header sản phẩm
      const avgRating = parseFloat(stats.avgRating) || 0;
      document.getElementById('ratingStars').innerHTML = generateStars(avgRating);
      document.getElementById('ratingValue').textContent = avgRating.toFixed(1);
      document.getElementById('reviewCount').textContent = stats.totalReviews || 0;
      
      // Cập nhật tab count
      document.getElementById('tabReviewCount').textContent = stats.totalReviews || 0;
    }
  } catch (error) {
    console.error('Lỗi tải thống kê rating:', error);
  }
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
// Lấy cart key theo user (mỗi user có giỏ hàng riêng)
function getCartKey() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user && user.ma_kh) {
    return `cart_user_${user.ma_kh}`;
  }
  return 'cart_guest';
}

// Kiểm tra đăng nhập
function isLoggedIn() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user && user.ma_kh;
}

// Hiển thị modal yêu cầu đăng nhập
function showLoginRequiredModal() {
  const modal = document.createElement('div');
  modal.id = 'login-required-modal';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-user-lock text-red-500 text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
        <p class="text-gray-600 mb-6">Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng và mua hàng.</p>
        <div class="flex gap-3">
          <button onclick="closeLoginModal()" class="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition">
            Để sau
          </button>
          <a href="login.html" class="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition text-center">
            Đăng nhập
          </a>
        </div>
        <p class="text-sm text-gray-500 mt-4">
          Chưa có tài khoản? <a href="register.html" class="text-red-600 font-semibold hover:underline">Đăng ký ngay</a>
        </p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeLoginModal();
  });
}

function closeLoginModal() {
  const modal = document.getElementById('login-required-modal');
  if (modal) modal.remove();
}

function addToCart() {
  if (!currentProduct) return;
  
  // Kiểm tra đăng nhập trước
  if (!isLoggedIn()) {
    showLoginRequiredModal();
    return;
  }
  
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const cartKey = getCartKey();
  let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
  
  const existingItem = cart.find(item => item.id === currentProduct.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    // Chuẩn hóa dữ liệu giỏ hàng để tương thích với cart.js và checkout.js
    const selectedColor = document.querySelector('.color-option.active');
    const selectedStorage = document.querySelector('.storage-option.active .storage-size');
    
    cart.push({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      originalPrice: currentProduct.oldPrice || currentProduct.price,
      image: currentProduct.image,
      quantity: quantity,
      color: selectedColor ? `Màu ${Array.from(document.querySelectorAll('.color-option')).indexOf(selectedColor) + 1}` : 'Mặc định',
      colorCode: selectedColor ? selectedColor.style.backgroundColor : '#000000',
      storage: selectedStorage ? selectedStorage.textContent : (currentProduct.storage ? `${currentProduct.storage}GB` : '128GB'),
      ram: currentProduct.ram ? `${currentProduct.ram}GB` : null,
      inStock: true,
      badge: currentProduct.discount ? `-${currentProduct.discount}%` : null
    });
  }
  
  localStorage.setItem(cartKey, JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
  
  showToast(`Đã thêm "${currentProduct.name}" vào giỏ hàng!`, 'success');
}

function buyNow() {
  // Kiểm tra đăng nhập trước
  if (!isLoggedIn()) {
    showLoginRequiredModal();
    return;
  }
  addToCart();
  window.location.href = 'checkout.html';
}

function buyInstallment() {
  // Kiểm tra đăng nhập trước
  if (!isLoggedIn()) {
    showLoginRequiredModal();
    return;
  }
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

// Load reviews từ API
async function loadReviews() {
  if (!currentProduct) return;
  
  const reviewsList = document.getElementById('reviewsList');
  
  try {
    // Lấy đánh giá từ API
    const [reviewsRes, statsRes] = await Promise.all([
      fetch(`${API_URL}/reviews/product/${currentProduct.id}`),
      fetch(`${API_URL}/reviews/product/${currentProduct.id}/stats`)
    ]);
    
    if (reviewsRes.ok && statsRes.ok) {
      const reviews = await reviewsRes.json();
      const stats = await statsRes.json();
      
      // Cập nhật thống kê
      updateReviewStats(stats);
      
      // Render danh sách đánh giá
      if (reviews.length === 0) {
        reviewsList.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-comment-slash text-4xl mb-3 text-gray-300"></i>
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            <p class="text-sm mt-2">Hãy là người đầu tiên đánh giá!</p>
          </div>
        `;
      } else {
        reviewsList.innerHTML = reviews.map(review => `
          <div class="review-item">
            <div class="flex items-start gap-4">
              <div class="review-avatar">${review.userName.charAt(0).toUpperCase()}</div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-gray-900">${review.userName}</span>
                  ${review.verified ? '<span class="review-verified"><i class="fas fa-check mr-1"></i>Đã mua hàng</span>' : ''}
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <div class="review-stars">${generateStars(review.rating)}</div>
                  <span class="text-xs text-gray-500">${formatReviewDate(review.date)}</span>
                </div>
                <p class="text-gray-700 text-sm leading-relaxed">${review.comment}</p>
                ${review.images && review.images.length > 0 ? `
                  <div class="flex gap-2 mt-3">
                    ${review.images.map(img => `
                      <img src="${img}" alt="Ảnh đánh giá" class="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:opacity-80" onclick="viewImage('${img}')" />
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('');
      }
    } else {
      throw new Error('Không thể tải đánh giá');
    }
  } catch (error) {
    console.error('Lỗi tải đánh giá:', error);
    // Fallback: hiển thị thông báo lỗi
    reviewsList.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-exclamation-circle text-4xl mb-3 text-red-300"></i>
        <p>Không thể tải đánh giá. Vui lòng thử lại sau.</p>
      </div>
    `;
  }
}

// Cập nhật thống kê đánh giá
function updateReviewStats(stats) {
  // Cập nhật điểm trung bình
  document.getElementById('avgRating').textContent = stats.avgRating || '0';
  document.getElementById('avgStars').innerHTML = generateStars(parseFloat(stats.avgRating) || 0);
  document.getElementById('totalReviewsDisplay').textContent = stats.totalReviews || 0;
  document.getElementById('tabReviewCount').textContent = stats.totalReviews || 0;
  
  // Cập nhật thanh phân bố sao
  const ratingBarsContainer = document.querySelector('.rating-bars-container');
  if (ratingBarsContainer) {
    const dist = stats.distribution;
    ratingBarsContainer.innerHTML = `
      ${[5, 4, 3, 2, 1].map(star => `
        <div class="flex items-center gap-2">
          <span class="text-sm w-8">${star} <i class="fas fa-star text-yellow-400 text-xs"></i></span>
          <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-yellow-400 rounded-full" style="width: ${dist[`star${star}`]?.percent || 0}%"></div>
          </div>
          <span class="text-xs text-gray-500 w-8">${dist[`star${star}`]?.percent || 0}%</span>
        </div>
      `).join('')}
    `;
  }
}

// Format ngày đánh giá
function formatReviewDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Xem ảnh đánh giá
function viewImage(src) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer';
  modal.onclick = () => modal.remove();
  modal.innerHTML = `<img src="${src}" alt="Ảnh đánh giá" class="max-w-[90%] max-h-[90%] object-contain rounded-lg" />`;
  document.body.appendChild(modal);
}

// ===== REVIEW FORM =====
async function toggleReviewForm() {
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
    
    // Kiểm tra đăng nhập và quyền đánh giá
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const loginMsg = document.getElementById('loginRequiredMsg');
    const submitBtn = form.querySelector('button[onclick="submitReview()"]');
    
    if (loginMsg) {
      if (!user || !user.ma_kh) {
        loginMsg.innerHTML = `<i class="fas fa-info-circle mr-2"></i>Vui lòng <a href="login.html" class="text-red-600 font-semibold hover:underline">đăng nhập</a> để đánh giá sản phẩm.`;
        loginMsg.classList.remove('hidden');
        if (submitBtn) submitBtn.disabled = true;
      } else {
        // Kiểm tra quyền đánh giá (đã mua hàng chưa)
        try {
          const response = await fetch(`${API_URL}/reviews/can-review/${currentProduct.id}/${user.ma_kh}`);
          const data = await response.json();
          
          if (!data.canReview) {
            loginMsg.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${data.message}`;
            loginMsg.className = 'mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800';
            loginMsg.classList.remove('hidden');
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
          } else {
            loginMsg.classList.add('hidden');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
          }
        } catch (error) {
          console.error('Lỗi kiểm tra quyền đánh giá:', error);
          loginMsg.classList.add('hidden');
        }
      }
    }
  }
}

function setRating(rating) {
  selectedRating = rating;
  document.querySelectorAll('#ratingInput i').forEach((star, i) => {
    star.className = i < rating ? 'fas fa-star text-yellow-400' : 'far fa-star text-gray-300';
  });
}

// Preview ảnh đánh giá trước khi upload
function previewReviewImages(input) {
  const files = input.files;
  const previewContainer = document.getElementById('reviewImagePreview');
  
  // Giới hạn 5 ảnh
  if (reviewImages.length + files.length > 5) {
    showToast('Chỉ được upload tối đa 5 ảnh!', 'error');
    return;
  }
  
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      showToast('Chỉ chấp nhận file ảnh!', 'error');
      return;
    }
    
    // Giới hạn kích thước 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ảnh không được vượt quá 5MB!', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      reviewImages.push(base64);
      
      // Tạo preview
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'relative';
      imgWrapper.innerHTML = `
        <img src="${base64}" alt="Preview" class="w-20 h-20 object-cover rounded-lg border" />
        <button type="button" onclick="removeReviewImage(${reviewImages.length - 1}, this)" class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition">
          <i class="fas fa-times"></i>
        </button>
      `;
      previewContainer.appendChild(imgWrapper);
    };
    reader.readAsDataURL(file);
  });
  
  // Reset input để có thể chọn lại cùng file
  input.value = '';
}

// Xóa ảnh preview
function removeReviewImage(index, btn) {
  reviewImages.splice(index, 1);
  btn.parentElement.remove();
  
  // Cập nhật lại index của các nút xóa
  const previewContainer = document.getElementById('reviewImagePreview');
  const buttons = previewContainer.querySelectorAll('button');
  buttons.forEach((b, i) => {
    b.setAttribute('onclick', `removeReviewImage(${i}, this)`);
  });
}

async function submitReview() {
  const comment = document.getElementById('reviewComment').value.trim();
  
  // Kiểm tra đăng nhập
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.ma_kh) {
    showToast('Vui lòng đăng nhập để đánh giá!', 'error');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
    }, 1500);
    return;
  }
  
  if (!comment || selectedRating === 0) {
    showToast('Vui lòng chọn số sao và nhập nhận xét!', 'error');
    return;
  }
  
  if (!currentProduct) {
    showToast('Không tìm thấy sản phẩm!', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: currentProduct.id,
        userId: user.ma_kh,
        rating: selectedRating,
        comment: comment,
        images: reviewImages // Gửi mảng ảnh base64
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast('Cảm ơn bạn đã đánh giá!', 'success');
      document.getElementById('reviewForm').classList.add('hidden');
      document.getElementById('reviewComment').value = '';
      document.getElementById('reviewImagePreview').innerHTML = '';
      selectedRating = 0;
      reviewImages = []; // Reset mảng ảnh
      
      // Reload đánh giá
      loadReviews();
    } else {
      // Xử lý lỗi cụ thể
      if (data.code === 'NOT_PURCHASED') {
        showToast('Bạn cần mua sản phẩm này trước khi đánh giá!', 'error');
      } else {
        showToast(data.error || 'Không thể gửi đánh giá!', 'error');
      }
    }
  } catch (error) {
    console.error('Lỗi gửi đánh giá:', error);
    showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
  }
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
