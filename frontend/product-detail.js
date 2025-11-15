// ===== PRODUCT DETAIL PAGE LOGIC =====
// QuangHưng Mobile - Modern E-commerce 2025

// ===== GLOBAL VARIABLES =====
let PRODUCTS = [];
let currentProduct = null;

// ===== LOAD PRODUCT DATA FROM JSON =====
async function loadProductData() {
  try {
    const response = await fetch('product-data.json');
    const data = await response.json();
    PRODUCTS = data.products;
    return true;
  } catch (error) {
    console.error('Error loading product data:', error);
    // Fallback to inline data if JSON fails
    PRODUCTS = getFallbackData();
    return false;
  }
}

// Fallback data in case JSON loading fails
function getFallbackData() {
  return [
    {id:1,name:'Samsung Galaxy A06 5G 4GB 128GB',brand:'samsung',category:'dienthoai',price:3420000,oldPrice:3920000,discount:13,ram:4,storage:128,screen:'6.7 inch',camera:'50MP',battery:'5000 mAh',os:'Android 14',features:['tragop','freeship'],colors:['#e8f5e9','#000000'],image:'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',sku:'SSG-A06-5G-128',rating:4.5,reviews:152},
    {id:5,name:'iPhone 15 Pro Max 256GB',brand:'iphone',category:'dienthoai',price:28990000,oldPrice:34990000,discount:17,ram:8,storage:256,screen:'6.7"',camera:'48MP',battery:'4422 mAh',os:'iOS 17',features:['tragop','freeship'],colors:['#4a4a4a','#e8e8e8','#ffd700'],image:'https://images.unsplash.com/photo-1695048064998-18d5e69328c6?w=400&h=400&fit=crop',sku:'APL-IP15PM-256',rating:4.9,reviews:512},
    {id:9,name:'Samsung Galaxy S24 Ultra 12GB 256GB',brand:'samsung',category:'dienthoai',price:29990000,oldPrice:33990000,discount:12,ram:12,storage:256,screen:'6.8" Dynamic AMOLED 2X',camera:'200MP',battery:'5000 mAh',os:'Android 14',features:['tragop','freeship'],colors:['#9e9e9e','#000000','#b39ddb'],image:'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b4?w=400&h=400&fit=crop',sku:'SSG-S24U-256',rating:4.8,reviews:687}
  ];
}

// ===== UTILITY FUNCTIONS =====

// Format price
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ';
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} text-xl text-${type === 'success' ? 'green' : 'red'}-600"></i>
    <span class="font-medium">${message}</span>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== RENDER PRODUCT DETAILS =====
function renderProductDetail(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  currentProduct = product;
  
  if (!product) {
    document.getElementById('productContainer').innerHTML = `
      <div class="col-span-2 text-center py-20 animate-slide-up">
        <div class="mb-6">
          <i class="fas fa-exclamation-triangle text-7xl text-red-600 mb-4 opacity-50"></i>
        </div>
        <h2 class="text-3xl font-bold mb-3 text-gray-900">Không tìm thấy sản phẩm</h2>
        <p class="text-gray-600 mb-8 text-lg">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã được gỡ bỏ.</p>
        <a href="products.html" class="btn-primary inline-flex items-center gap-2">
          <i class="fas fa-arrow-left"></i>
          <span>Quay lại trang sản phẩm</span>
        </a>
      </div>
    `;
    return;
  }

  // Update breadcrumb dynamically
  document.getElementById('breadcrumbProduct').textContent = product.name;
  document.title = `${product.name} - QuangHưng Mobile`;

  // Calculate ratings
  const rating = product.rating || (4 + Math.random() * 1);
  const reviews = product.reviews || Math.floor(Math.random() * 200) + 50;
  const sold = Math.floor(Math.random() * 500) + 100;
  const stock = Math.floor(Math.random() * 50) + 10;
  
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let starsHTML = '';
  for(let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
  if(halfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
  for(let i = fullStars + (halfStar ? 1 : 0); i < 5; i++) starsHTML += '<i class="far fa-star"></i>';

  // Render product HTML with lazy loading images
  const productHTML = `
    <!-- Left Column: Image Gallery với Swiper Slider -->
    <div class="animate-slide-up">
      <!-- Main Swiper Gallery -->
      <div class="product-gallery">
        <div class="swiper mainSwiper zoom-container">
          <div class="swiper-wrapper">
            <div class="swiper-slide">
              <img src="${product.image}" alt="${product.name}" class="gallery-main-image zoom-image" loading="lazy" />
            </div>
            <div class="swiper-slide">
              <img src="${product.image}" alt="${product.name} view 2" class="gallery-main-image zoom-image" loading="lazy" />
            </div>
            <div class="swiper-slide">
              <img src="${product.image}" alt="${product.name} view 3" class="gallery-main-image zoom-image" loading="lazy" />
            </div>
            <div class="swiper-slide">
              <img src="${product.image}" alt="${product.name} view 4" class="gallery-main-image zoom-image" loading="lazy" />
            </div>
          </div>
          <div class="swiper-button-next"></div>
          <div class="swiper-button-prev"></div>
          <div class="swiper-pagination"></div>
        </div>
      </div>

      <!-- Thumbnail Swiper -->
      <div thumbsSlider="" class="swiper thumbSwiper mt-4">
        <div class="swiper-wrapper">
          <div class="swiper-slide cursor-pointer">
            <div class="thumbnail-item active">
              <img src="${product.image}" alt="Thumb 1" class="w-full h-20 object-contain" loading="lazy" />
            </div>
          </div>
          <div class="swiper-slide cursor-pointer">
            <div class="thumbnail-item">
              <img src="${product.image}" alt="Thumb 2" class="w-full h-20 object-contain" loading="lazy" />
            </div>
          </div>
          <div class="swiper-slide cursor-pointer">
            <div class="thumbnail-item">
              <img src="${product.image}" alt="Thumb 3" class="w-full h-20 object-contain" loading="lazy" />
            </div>
          </div>
          <div class="swiper-slide cursor-pointer">
            <div class="thumbnail-item">
              <img src="${product.image}" alt="Thumb 4" class="w-full h-20 object-contain" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Product Info Card Modern -->
    <div class="animate-slide-up" id="buySection">
      <div class="product-card lg:sticky lg:top-4">
        <!-- Badges Modern - Đơn giản -->
        <div class="mb-4 flex flex-wrap gap-2">
          ${product.discount ? `<span class="badge badge-red"><i class="fas fa-tag mr-1"></i>-${product.discount}%</span>` : ''}
          <span class="badge badge-green"><i class="fas fa-check-circle mr-1"></i>Còn hàng</span>
          ${product.features && product.features.includes('freeship') ? '<span class="badge badge-blue"><i class="fas fa-shipping-fast mr-1"></i>Freeship</span>' : ''}
          ${product.features && product.features.includes('tragop') ? '<span class="badge badge-blue"><i class="fas fa-credit-card mr-1"></i>Trả góp 0%</span>' : ''}
        </div>
        
        <!-- Product Name Modern - 22-26px -->
        <h1 style="font-size: 24px; line-height: 1.3; font-weight: 700; margin-bottom: 18px; color: #212121;">${product.name}</h1>
        
        <!-- Rating & Reviews Modern with Sold Count -->
        <div class="flex items-center flex-wrap mb-5 gap-2.5">
          <div class="text-yellow-400 flex gap-0.5 text-base">
            ${starsHTML}
          </div>
          <span class="text-base font-bold text-gray-900">${rating.toFixed(1)}</span>
          <span class="text-gray-300">|</span>
          <span class="text-sm text-gray-600 hover:text-red-600 cursor-pointer transition">${reviews} đánh giá</span>
          <span class="text-gray-300">|</span>
          <span class="text-sm font-semibold text-gray-900">Đã bán ${sold}+</span>
        </div>

        <!-- Social Share Icons -->
        <div class="flex items-center gap-2.5 mb-5 pb-5 border-b border-gray-200">
          <span class="text-sm font-medium text-gray-700">Chia sẻ:</span>
          <button onclick="shareProduct('facebook')" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-50 transition-all hover:scale-110" title="Share on Facebook">
            <i class="fab fa-facebook text-blue-600 text-lg"></i>
          </button>
          <button onclick="shareProduct('twitter')" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-sky-50 transition-all hover:scale-110" title="Share on Twitter">
            <i class="fab fa-twitter text-sky-500 text-lg"></i>
          </button>
          <button onclick="shareProduct('zalo')" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-50 transition-all hover:scale-110" title="Share on Zalo">
            <i class="fas fa-comment-dots text-blue-500 text-lg"></i>
          </button>
          <button onclick="copyLink()" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all hover:scale-110" title="Copy link">
            <i class="fas fa-link text-gray-600 text-lg"></i>
          </button>
        </div>

        <!-- Price Modern - Lớn hơn, nổi bật hơn -->
        <div class="mb-6 pb-6 border-b border-gray-200">
          <div class="flex items-baseline gap-3 mb-2">
            <span class="price-main">${formatPrice(product.price)}</span>
            ${product.oldPrice ? `<span class="text-base text-gray-400 line-through font-medium">${formatPrice(product.oldPrice)}</span>` : ''}
          </div>
          ${product.oldPrice ? `<div class="mt-2">
            <span class="badge badge-red"><i class="fas fa-piggy-bank mr-1.5"></i>Tiết kiệm ${formatPrice(product.oldPrice - product.price)}</span>
          </div>` : ''}
        </div>

        <!-- Action Buttons Modern - CTA nổi bật hơn -->
        <div class="space-y-3 mb-6">
          <button onclick="buyNow()" class="btn-primary w-full flex items-center justify-center gap-2.5">
            <i class="fas fa-bolt text-lg"></i>
            <span class="font-bold text-base">Mua ngay</span>
          </button>
          <div class="grid grid-cols-2 gap-3">
            <button onclick="addToCart()" class="btn-outline flex items-center justify-center gap-2">
              <i class="fas fa-shopping-cart"></i>
              <span class="font-semibold">Thêm giỏ</span>
            </button>
            <button onclick="buyInstallment()" class="btn-outline flex items-center justify-center gap-2">
              <i class="fas fa-credit-card"></i>
              <span class="font-semibold">Trả góp 0%</span>
            </button>
          </div>
        </div>

        ${product.colors && product.colors.length > 0 ? `
        <!-- Color Selection Modern -->
        <div class="mb-5 pb-5 border-b border-gray-200">
          <h3 class="font-semibold text-base mb-3.5 text-gray-900">Chọn màu sắc</h3>
          <div class="flex flex-wrap gap-3">
            ${product.colors.map((color, index) => `
              <button class="color-option ${index === 0 ? 'selected' : ''}" 
                      style="background-color: ${color};"
                      onclick="selectColor(this)">
                ${index === 0 ? '<i class="fas fa-check text-white text-sm drop-shadow-lg"></i>' : ''}
              </button>
            `).join('')}
          </div>
        </div>
        ` : ''}

        ${product.category === 'dienthoai' && product.storage ? `
        <!-- Storage Selection Modern -->
        <div class="mb-5 pb-5 border-b border-gray-200">
          <h3 class="font-semibold text-base mb-3.5 text-gray-900">Dung lượng</h3>
          <div class="grid grid-cols-3 gap-3">
            <button class="option-selector selected" onclick="selectStorage(this)" style="text-align: center;">
              <div class="text-sm font-bold text-gray-900">${product.storage}GB</div>
            </button>
            ${product.storage < 256 ? `<button class="option-selector" onclick="selectStorage(this)" style="text-align: center;">
              <div class="text-sm font-bold text-gray-800">256GB</div>
              <div class="text-xs text-gray-500 mt-1">+2tr</div>
            </button>` : ''}
            ${product.storage < 512 ? `<button class="option-selector" onclick="selectStorage(this)" style="text-align: center;">
              <div class="text-sm font-bold text-gray-800">512GB</div>
              <div class="text-xs text-gray-500 mt-1">+4tr</div>
            </button>` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Quantity Selection Modern -->
        <div class="mb-0">
          <h3 class="font-semibold text-base mb-3 text-gray-900">Số lượng</h3>
          <div class="flex items-center gap-4">
            <div class="flex items-center border-2 rounded-lg overflow-hidden border-gray-200 hover:border-red-500 transition">
              <button class="px-4 py-3 hover:bg-gray-100 transition active:bg-gray-200" onclick="decreaseQuantity()">
                <i class="fas fa-minus text-sm text-gray-700"></i>
              </button>
              <input type="number" id="quantity" value="1" min="1" max="${stock}" 
                     class="w-16 text-center border-x-2 py-3 outline-none font-bold text-base border-gray-200" />
              <button class="px-4 py-3 hover:bg-gray-100 transition active:bg-gray-200" onclick="increaseQuantity()">
                <i class="fas fa-plus text-sm text-gray-700"></i>
              </button>
            </div>
            <span class="text-sm text-gray-600">Còn <strong class="text-red-600 font-bold">${stock}</strong> sản phẩm</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('productContainer').innerHTML = productHTML;

  // Update sticky buy button price
  document.getElementById('stickyPrice').textContent = formatPrice(product.price);

  // Update SEO meta tags
  updateSEO(product);

  // Initialize Swiper after rendering
  setTimeout(() => {
    initSwiper();
  }, 100);
}

// ===== SEO FUNCTIONS =====
function updateSEO(product) {
  const currentUrl = window.location.href;
  const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
  
  const productName = product.name;
  const productPrice = product.price;
  const productImage = product.image;
  const rating = product.rating || 4.5;
  const reviews = product.reviews || 152;
  const sku = product.sku || `PROD-${product.id}`;
  
  // Dynamic title and description
  const title = `Mua ${productName} chính hãng - Giá rẻ ${formatPrice(productPrice)} tại QuangHưng Mobile`;
  const description = `${productName} chính hãng, giá ${formatPrice(productPrice)}${product.oldPrice ? ` (tiết kiệm ${formatPrice(product.oldPrice - product.price)})` : ''}, trả góp 0%, freeship toàn quốc. Bảo hành 12 tháng chính hãng. ☎ Hotline: 1900.xxxx`;
  
  // Update page title and meta description (guarded)
  const elPageTitle = document.getElementById('pageTitle');
  if (elPageTitle) elPageTitle.textContent = title;
  document.title = title;
  const elPageDesc = document.getElementById('pageDescription');
  if (elPageDesc) elPageDesc.setAttribute('content', description);
  const elPageKeywords = document.getElementById('pageKeywords');
  if (elPageKeywords) elPageKeywords.setAttribute('content', `${productName}, mua ${productName}, ${productName} giá rẻ, ${productName} chính hãng, ${product.brand}`);

  // Update Open Graph (guarded)
  const elOgTitle = document.getElementById('ogTitle'); if (elOgTitle) elOgTitle.setAttribute('content', title);
  const elOgDesc = document.getElementById('ogDescription'); if (elOgDesc) elOgDesc.setAttribute('content', description);
  const elOgImage = document.getElementById('ogImage'); if (elOgImage) elOgImage.setAttribute('content', productImage);
  const elOgUrl = document.getElementById('ogUrl'); if (elOgUrl) elOgUrl.setAttribute('content', currentUrl);

  // Update Twitter Card (guarded)
  const elTwTitle = document.getElementById('twitterTitle'); if (elTwTitle) elTwTitle.setAttribute('content', title);
  const elTwDesc = document.getElementById('twitterDescription'); if (elTwDesc) elTwDesc.setAttribute('content', description);
  const elTwImage = document.getElementById('twitterImage'); if (elTwImage) elTwImage.setAttribute('content', productImage);

  // Update canonical URL (guarded)
  const elCanonical = document.getElementById('canonical'); if (elCanonical) elCanonical.setAttribute('href', currentUrl);

  // Update Product JSON-LD Structured Data (guarded)
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productName,
    "image": [productImage],
    "description": description,
    "sku": sku,
    "brand": {
      "@type": "Brand",
      "name": product.brand ? product.brand.toUpperCase() : "QuangHưng Mobile"
    },
    "offers": {
      "@type": "Offer",
      "url": currentUrl,
      "priceCurrency": "VND",
      "price": productPrice,
      "availability": "https://schema.org/InStock",
      "priceValidUntil": new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "QuangHưng Mobile"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating.toFixed(1),
      "reviewCount": reviews.toString(),
      "bestRating": "5",
      "worstRating": "1"
    }
  };
  
  const elProductSchema = document.getElementById('productSchema');
  if (elProductSchema) elProductSchema.textContent = JSON.stringify(productSchema, null, 2);

  // Update Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": baseUrl + "/index.html"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Sản phẩm",
        "item": baseUrl + "/products.html"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": productName,
        "item": currentUrl
      }
    ]
  };
  
  const elBreadcrumbSchema = document.getElementById('breadcrumbSchema');
  if (elBreadcrumbSchema) elBreadcrumbSchema.textContent = JSON.stringify(breadcrumbSchema, null, 2);
}

// Initialize Swiper Slider
function initSwiper() {
  // Thumbnail Swiper
  const thumbSwiper = new Swiper('.thumbSwiper', {
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
  });

  // Main Swiper
  const mainSwiper = new Swiper('.mainSwiper', {
    spaceBetween: 10,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    thumbs: {
      swiper: thumbSwiper,
    },
  });
}

// ===== TAB FUNCTIONS =====
function switchTab(tabName, ev) {
  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  const target = ev ? (ev.currentTarget || ev.target) : (window.event ? window.event.target : null);
  if (target) target.classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
  });
  const tab = document.getElementById('tab-' + tabName);
  if (tab) tab.classList.remove('hidden');

  // Load content based on tab
  if (tabName === 'reviews') {
    loadReviews();
  } else if (tabName === 'specs') {
    loadSpecs();
  } else if (tabName === 'description') {
    loadDescription();
  }
}

// Load Product Description
function loadDescription() {
  if (!currentProduct) return;
  
  const descContainer = document.getElementById('productDescription');
  descContainer.innerHTML = `
    <div class="space-y-5">
      <p class="text-gray-700 leading-relaxed text-base">
        <strong class="text-gray-900">${currentProduct.name}</strong> là sản phẩm cao cấp đến từ thương hiệu <strong class="text-red-600">${currentProduct.brand.toUpperCase()}</strong>, 
        mang đến cho bạn trải nghiệm tuyệt vời với thiết kế hiện đại và cấu hình mạnh mẽ.
      </p>
      
      <h4 class="text-xl font-bold text-gray-900 mt-6 mb-4"><i class="fas fa-star text-yellow-400 mr-2"></i>Điểm nổi bật</h4>
      <ul class="space-y-3">
        ${currentProduct.screen ? `<li class="flex items-start gap-3"><i class="fas fa-check-circle text-green-600 mt-1 text-lg"></i><span class="text-gray-700 text-base">Màn hình ${currentProduct.screen} sắc nét, màu sắc sống động</span></li>` : ''}
        ${currentProduct.camera ? `<li class="flex items-start gap-3"><i class="fas fa-check-circle text-green-600 mt-1 text-lg"></i><span class="text-gray-700 text-base">Camera ${currentProduct.camera} cho ảnh chụp chuyên nghiệp</span></li>` : ''}
        ${currentProduct.ram ? `<li class="flex items-start gap-3"><i class="fas fa-check-circle text-green-600 mt-1 text-lg"></i><span class="text-gray-700 text-base">RAM ${currentProduct.ram}GB đa nhiệm mượt mà</span></li>` : ''}
        ${currentProduct.battery ? `<li class="flex items-start gap-3"><i class="fas fa-check-circle text-green-600 mt-1 text-lg"></i><span class="text-gray-700 text-base">Pin ${currentProduct.battery} sử dụng cả ngày</span></li>` : ''}
        <li class="flex items-start gap-3"><i class="fas fa-check-circle text-green-600 mt-1 text-lg"></i><span class="text-gray-700 text-base">Thiết kế sang trọng, chất liệu cao cấp</span></li>
        <li class="flex items-start gap-3"><i class="fas fa-check-circle text-green-600 mt-1 text-lg"></i><span class="text-gray-700 text-base">Hiệu năng mạnh mẽ, xử lý mọi tác vụ</span></li>
      </ul>

      <h4 class="text-xl font-bold text-gray-900 mt-8 mb-4"><i class="fas fa-shield-alt text-blue-600 mr-2"></i>Cam kết từ QuangHưng Mobile</h4>
      <ul class="space-y-3 bg-blue-50 p-5 rounded-lg border border-blue-100">
        <li class="flex items-start gap-3"><i class="fas fa-badge-check text-blue-600 mt-1 text-lg"></i><span class="text-gray-700 text-base font-medium">100% sản phẩm chính hãng, nguyên seal</span></li>
        <li class="flex items-start gap-3"><i class="fas fa-box text-blue-600 mt-1 text-lg"></i><span class="text-gray-700 text-base font-medium">Bảo hành chính hãng 12 tháng</span></li>
        <li class="flex items-start gap-3"><i class="fas fa-exchange-alt text-blue-600 mt-1 text-lg"></i><span class="text-gray-700 text-base font-medium">Đổi trả miễn phí trong 7 ngày</span></li>
        <li class="flex items-start gap-3"><i class="fas fa-shipping-fast text-blue-600 mt-1 text-lg"></i><span class="text-gray-700 text-base font-medium">Giao hàng nhanh chóng toàn quốc</span></li>
      </ul>
    </div>
  `;
}

// Load Specifications Table
function loadSpecs() {
  if (!currentProduct) return;
  
  const specsContainer = document.getElementById('productSpecs');

  if (currentProduct.category === 'dienthoai') {
    specsContainer.innerHTML = `
      <table class="specs-table">
        <tbody>
          ${currentProduct.screen ? `
            <tr>
              <td><i class="fas fa-mobile-alt mr-2 text-red-600"></i>Màn hình</td>
              <td>${currentProduct.screen}</td>
            </tr>
          ` : ''}
          ${currentProduct.os ? `
            <tr>
              <td><i class="fas fa-cog mr-2 text-red-600"></i>Hệ điều hành</td>
              <td>${currentProduct.os}</td>
            </tr>
          ` : ''}
          ${currentProduct.camera ? `
            <tr>
              <td><i class="fas fa-camera mr-2 text-red-600"></i>Camera</td>
              <td>${currentProduct.camera}</td>
            </tr>
          ` : ''}
          ${currentProduct.ram ? `
            <tr>
              <td><i class="fas fa-memory mr-2 text-red-600"></i>RAM</td>
              <td>${currentProduct.ram}GB</td>
            </tr>
          ` : ''}
          ${currentProduct.storage ? `
            <tr>
              <td><i class="fas fa-hdd mr-2 text-red-600"></i>Bộ nhớ trong</td>
              <td>${currentProduct.storage}GB</td>
            </tr>
          ` : ''}
          ${currentProduct.battery ? `
            <tr>
              <td><i class="fas fa-battery-full mr-2 text-red-600"></i>Pin</td>
              <td>${currentProduct.battery}</td>
            </tr>
          ` : ''}
          <tr>
            <td><i class="fas fa-wifi mr-2 text-red-600"></i>Kết nối</td>
            <td>5G, Wi-Fi 6, Bluetooth 5.3, NFC</td>
          </tr>
          <tr>
            <td><i class="fas fa-fingerprint mr-2 text-red-600"></i>Bảo mật</td>
            <td>Vân tay, Face ID</td>
          </tr>
        </tbody>
      </table>
    `;
  } else {
    specsContainer.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-info-circle text-4xl text-gray-300 mb-3"></i>
        <p class="text-gray-600 text-base">Thông số kỹ thuật chi tiết đang được cập nhật...</p>
      </div>
    `;
  }
}

// Load Reviews
function loadReviews() {
  if (!currentProduct) return;
  
  const reviewsList = document.getElementById('reviewsList');
  const rating = currentProduct.rating || 4.5;
  const reviews = currentProduct.reviews || 152;

  // Update review count
  document.getElementById('totalReviews').textContent = reviews;
  document.getElementById('avgRating').textContent = rating.toFixed(1);

  // Generate stars for average rating
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let starsHTML = '';
  for(let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
  if(halfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
  for(let i = fullStars + (halfStar ? 1 : 0); i < 5; i++) starsHTML += '<i class="far fa-star"></i>';
  document.getElementById('avgStars').innerHTML = starsHTML;

  // Sample reviews
  const sampleReviews = [
    {
      name: 'Nguyễn Văn A',
      rating: 5,
      date: '3 ngày trước',
      comment: 'Sản phẩm rất tốt, giao hàng nhanh. Màn hình đẹp, pin trâu. Rất hài lòng!',
      verified: true
    },
    {
      name: 'Trần Thị B',
      rating: 5,
      date: '5 ngày trước',
      comment: 'Mình rất thích thiết kế và hiệu năng. Camera chụp ảnh đẹp lắm. Đóng gói cẩn thận, shop tư vấn nhiệt tình.',
      verified: true
    },
    {
      name: 'Lê Văn C',
      rating: 4,
      date: '1 tuần trước',
      comment: 'Sản phẩm ok, chỉ có điều hơi nặng một chút. Nhưng nhìn chung rất đáng đồng tiền.',
      verified: false
    },
    {
      name: 'Phạm Minh D',
      rating: 5,
      date: '2 tuần trước',
      comment: 'Chất lượng tuyệt vời, đúng như mô tả. Sẽ ủng hộ shop dài dài!',
      verified: true
    }
  ];

  reviewsList.innerHTML = sampleReviews.map(review => {
    let reviewStars = '';
    for(let i = 0; i < review.rating; i++) reviewStars += '<i class="fas fa-star"></i>';
    for(let i = review.rating; i < 5; i++) reviewStars += '<i class="far fa-star"></i>';

    return `
      <div class="border-b border-gray-200 pb-6 last:border-0">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
            ${review.name.charAt(0)}
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2.5 mb-2">
              <p class="font-bold text-gray-900 text-base">${review.name}</p>
              ${review.verified ? '<span class="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><i class="fas fa-check-circle"></i>Đã mua hàng</span>' : ''}
            </div>
            <div class="text-yellow-400 text-sm mb-2">${reviewStars}</div>
            <p class="text-xs text-gray-500 mb-2.5"><i class="far fa-clock mr-1"></i>${review.date}</p>
            <p class="text-gray-700 leading-relaxed text-base">${review.comment}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== INTERACTION FUNCTIONS =====

// Quantity controls
function increaseQuantity() {
  const input = document.getElementById('quantity');
  if (input && parseInt(input.value) < parseInt(input.max)) {
    input.value = parseInt(input.value) + 1;
  }
}

function decreaseQuantity() {
  const input = document.getElementById('quantity');
  if (input && parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
  }
}

// Select Color
function selectColor(element) {
  document.querySelectorAll('.color-option').forEach(btn => {
    btn.classList.remove('selected');
    btn.innerHTML = '';
  });
  element.classList.add('selected');
  element.innerHTML = '<i class="fas fa-check text-white text-sm drop-shadow"></i>';
}

// Select Storage
function selectStorage(element) {
  document.querySelectorAll('.option-selector').forEach(btn => {
    btn.classList.remove('selected');
  });
  element.classList.add('selected');
}

// Buy Now
function buyNow() {
  showToast('Đang chuyển đến trang thanh toán...', 'success');
  setTimeout(() => {
    // Redirect to checkout page
    // window.location.href = 'checkout.html';
  }, 1000);
}

// Buy Installment
function buyInstallment() {
  showToast('Trả góp 0% - Duyệt hồ sơ nhanh chóng!', 'success');
}

// Add to Cart
function addToCart() {
  const quantity = document.getElementById('quantity').value;
  showToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, 'success');
  
  // Add animation to cart icon if exists
  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.classList.add('bounce');
    setTimeout(() => cartIcon.classList.remove('bounce'), 500);
  }
}

// Social Share Functions
function shareProduct(platform) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.querySelector('h1').textContent);
  
  switch(platform) {
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
      break;
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank', 'width=600,height=400');
      break;
    case 'zalo':
      window.open(`https://zalo.me/share?url=${url}`, '_blank', 'width=600,height=400');
      break;
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast('Đã sao chép link sản phẩm!', 'success');
  });
}

// ===== REVIEW FUNCTIONS =====
let selectedRating = 0;

function toggleReviewForm() {
  const form = document.getElementById('reviewForm');
  form.classList.toggle('hidden');
}

function setRating(stars) {
  selectedRating = stars;
  const starButtons = document.querySelectorAll('.rating-star');
  starButtons.forEach((btn, index) => {
    const icon = btn.querySelector('i');
    if (index < stars) {
      icon.className = 'fas fa-star';
      btn.classList.remove('text-gray-300');
      btn.classList.add('text-yellow-400');
    } else {
      icon.className = 'far fa-star';
      btn.classList.remove('text-yellow-400');
      btn.classList.add('text-gray-300');
    }
  });
}

function submitReview() {
  const name = document.getElementById('reviewName').value;
  const comment = document.getElementById('reviewComment').value;

  if (!selectedRating) {
    showToast('Vui lòng chọn số sao đánh giá!', 'error');
    return;
  }
  if (!name || !comment) {
    showToast('Vui lòng điền đầy đủ thông tin!', 'error');
    return;
  }

  showToast('Cảm ơn bạn đã đánh giá! Đánh giá sẽ được duyệt sau ít phút.', 'success');
  document.getElementById('reviewForm').classList.add('hidden');
  document.getElementById('reviewName').value = '';
  document.getElementById('reviewComment').value = '';
  selectedRating = 0;
  setRating(0);
}

function filterReviews(stars, ev) {
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  const target = ev ? (ev.currentTarget || ev.target) : (window.event ? window.event.target : null);
  if (target) target.classList.add('active');

  // Filter logic (demo)
  console.log('Filter by:', stars);
  showToast(`Đang lọc đánh giá ${stars === 'all' ? 'tất cả' : stars + ' sao'}...`, 'success');
}

// ===== RELATED PRODUCTS =====
function renderRelatedProducts(currentProductId) {
  const currentProduct = PRODUCTS.find(p => p.id === currentProductId);
  if (!currentProduct) return;

  // Find related products
  let relatedProducts = PRODUCTS.filter(p => 
    p.id !== currentProductId && 
    (p.brand === currentProduct.brand || p.category === currentProduct.category)
  );

  // Prioritize same brand, then shuffle
  relatedProducts.sort((a, b) => {
    if (a.brand === currentProduct.brand && b.brand !== currentProduct.brand) return -1;
    if (a.brand !== currentProduct.brand && b.brand === currentProduct.brand) return 1;
    return Math.random() - 0.5;
  });

  relatedProducts = relatedProducts.slice(0, 4);

  const container = document.getElementById('relatedProducts');
  if (!container) return;

  container.innerHTML = relatedProducts.map(product => {
    const rating = product.rating || (4 + Math.random() * 1);
    const reviews = product.reviews || Math.floor(Math.random() * 200) + 50;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    let starsHTML = '';
    for(let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
    if(halfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
    for(let i = fullStars + (halfStar ? 1 : 0); i < 5; i++) starsHTML += '<i class="far fa-star"></i>';

    return `
      <a href="product-detail.html?id=${product.id}" class="product-item bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 group hover:shadow-lg">
        <div class="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
          ${product.discount ? `
            <div class="absolute top-3 left-0 z-10">
              <div class="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-r-full shadow-lg flex items-center gap-1">
                <i class="fas fa-tag"></i>
                <span>-${product.discount}%</span>
              </div>
            </div>
          ` : ''}
          <div class="p-4">
            <img src="${product.image}" 
                 alt="${product.name}" 
                 class="w-full h-40 sm:h-52 object-contain group-hover:scale-110 transition-transform duration-500" 
                 loading="lazy" />
          </div>
        </div>
        <div class="p-4 sm:p-5">
          <h3 class="font-bold mb-3 text-sm sm:text-base line-clamp-2 min-h-[42px] text-gray-800 group-hover:text-red-600 transition-colors">${product.name}</h3>
          
          <div class="flex items-center mb-3 gap-2">
            <div class="text-yellow-400 text-xs sm:text-sm flex">
              ${starsHTML}
            </div>
            <span class="text-gray-500 text-xs sm:text-sm">(${reviews})</span>
          </div>
          
          <div class="space-y-1">
            <div class="flex items-baseline gap-2">
              <span class="text-xl sm:text-2xl font-bold text-red-600">${formatPrice(product.price)}</span>
              ${product.oldPrice ? `<span class="text-xs sm:text-sm text-gray-400 line-through">${formatPrice(product.oldPrice)}</span>` : ''}
            </div>
            ${product.discount ? `
              <div class="inline-block">
                <span class="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-semibold">
                  Tiết kiệm ${formatPrice(product.oldPrice - product.price)}
                </span>
              </div>
            ` : ''}
          </div>
          
          <div class="mt-4 pt-3 border-t border-gray-100">
            <button class="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform group-hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm">
              <i class="fas fa-eye"></i>
              Xem chi tiết
            </button>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

// ===== STICKY BUY BUTTON =====
window.addEventListener('scroll', () => {
  const buySection = document.getElementById('buySection');
  const stickyBuy = document.getElementById('stickyBuy');
  
  if (buySection && stickyBuy) {
    const buySectionRect = buySection.getBoundingClientRect();
    if (buySectionRect.top < -100) {
      stickyBuy.classList.add('active');
    } else {
      stickyBuy.classList.remove('active');
    }
  }
});

// ===== PAGE INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  // Load product data
  await loadProductData();
  
  // Get product ID from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id')) || 5;
  
  // Render product details
  renderProductDetail(productId);
  
  // Render related products
  renderRelatedProducts(productId);

  // Load default tab (Description)
  setTimeout(() => {
    loadDescription();
  }, 200);
});
