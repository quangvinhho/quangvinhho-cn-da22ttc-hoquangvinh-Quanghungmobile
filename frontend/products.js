// Products Page JavaScript
// QuangHưng Mobile - Kết nối MySQL

// API URL
const API_URL = 'http://localhost:3000/api';

// Biến lưu dữ liệu sản phẩm từ API
let PRODUCTS = [];

// Hàm fetch sản phẩm từ API hoặc JSON file
async function fetchProducts() {
    try {
        // Thử lấy từ API trước
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('API không khả dụng');
        const data = await response.json();
        if (data && data.length > 0) {
            PRODUCTS = data;
            return data;
        }
        throw new Error('Không có dữ liệu từ API');
    } catch (error) {
        console.log('Fallback to product-data.json:', error.message);
        // Fallback: Lấy từ file JSON
        try {
            const jsonResponse = await fetch('product-data.json');
            const jsonData = await jsonResponse.json();
            PRODUCTS = jsonData.products || [];
            return PRODUCTS;
        } catch (jsonError) {
            console.error('Lỗi lấy sản phẩm:', jsonError);
            PRODUCTS = [];
            return [];
        }
    }
}

// --- LOGIC XỬ LÝ ---

// Slider Logic
let currentSlide = 0;
const slides = document.querySelectorAll('.banner-slide');
const dots = document.querySelectorAll('.slider-dot');

function showSlide(index) {
  if (!slides.length) return;
    
  slides.forEach(slide => {
    slide.style.opacity = '0';
    slide.style.zIndex = '0';
  });
    
  if (slides[index]) {
    slides[index].style.opacity = '1';
    slides[index].style.zIndex = '1';
  }
    
  if (dots.length) {
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.style.backgroundColor = '#d91e23';
        dot.style.width = '24px';
      } else {
        dot.style.backgroundColor = 'rgba(255,255,255,0.5)';
        dot.style.width = '8px';
      }
    });
  }
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

function goToSlide(index) {
  currentSlide = index;
  showSlide(currentSlide);
}

let autoSlideInterval;
function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
  clearInterval(autoSlideInterval);
}

if (slides.length > 0) {
  showSlide(0);
  startAutoSlide();
  const bannerSlider = document.getElementById('bannerSlider');
  if (bannerSlider) {
    bannerSlider.addEventListener('mouseenter', stopAutoSlide);
    bannerSlider.addEventListener('mouseleave', startAutoSlide);
  }
}

// Filter & Render Logic
let selectedBrands = [];
let selectedPriceRanges = [];
let selectedCategories = [];
let selectedAccessoryTypes = [];
let currentSort = 'featured';
let searchQuery = '';

// Parse URL Params
document.addEventListener('DOMContentLoaded', async () => { 
  // Fetch sản phẩm từ API trước
  await fetchProducts();
  
  // Initialize filters and render products
  if (document.getElementById('quickBrandContainer')) {
    initQuickBrands();
    initBrandDropdown();
  }
  
  renderProducts();
  updateFilterTags();
});

function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const icon = document.getElementById(sectionId.replace('Section', 'Icon'));
  if (section && icon) {
    section.classList.toggle('hidden');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
  }
}

function filterByBrand(brand) {
  window.location.href = `products.html?brand=${brand}`;
}

function toggleBrandFilter(brand) {
  const idx = selectedBrands.indexOf(brand);
  if (idx > -1) selectedBrands.splice(idx, 1);
  else selectedBrands.push(brand);
  applyFiltersOriginal();
}

function toggleAccessoryFilter(type) {
  const idx = selectedAccessoryTypes.indexOf(type);
  if (idx > -1) selectedAccessoryTypes.splice(idx, 1);
  else selectedAccessoryTypes.push(type);
  applyFiltersOriginal();
}

function applyCustomPriceRange() {
  const min = document.getElementById('minPrice').value;
  const max = document.getElementById('maxPrice').value;
  if (min && max) {
    selectedPriceRanges = [`${min}-${max}`];
    document.querySelectorAll('.price-filter').forEach(cb => cb.checked = false);
    applyFiltersOriginal();
  }
}

function applyFiltersOriginal() {
  selectedPriceRanges = [];
  document.querySelectorAll('.price-filter:checked').forEach(cb => {
    if (cb.value !== 'all') selectedPriceRanges.push(cb.value);
  });
  updateFilterTags();
  renderProducts();
}

function updateFilterTags() {
  const container = document.getElementById('filterTags');
  if (!container) return;
  container.innerHTML = '';

  selectedBrands.forEach(brand => {
    const tag = document.createElement('span');
    tag.className = 'filter-tag';
    tag.innerHTML = `${brand.toUpperCase()} <span class="close" onclick="removeBrandFilter('${brand}')">✕</span>`;
    container.appendChild(tag);
  });

  if (selectedBrands.length > 0 || selectedPriceRanges.length > 0) {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'text-red-600 text-sm font-semibold hover:underline ml-2';
    clearBtn.textContent = 'Xóa tất cả';
    clearBtn.onclick = clearAllFilters;
    container.appendChild(clearBtn);
  }
}

function removeBrandFilter(brand) { 
  const checkbox = document.querySelector(`.brand-filter[value="${brand}"]`);
  if (checkbox) {
    checkbox.checked = false;
    toggleBrandFilter(brand);
  } else {
    const idx = selectedBrands.indexOf(brand);
    if (idx > -1) selectedBrands.splice(idx, 1);
    applyFiltersOriginal();
  }
}

function clearAllFilters() {
  selectedBrands = [];
  selectedPriceRanges = [];
  document.querySelectorAll('.price-filter').forEach(cb => cb.checked = false);
  document.querySelectorAll('.brand-filter').forEach(cb => cb.checked = false);
  updateFilterTags();
  renderProducts();
}

function sortProducts(type, event) {
  currentSort = type;
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.classList.remove('bg-red-600', 'text-white');
    btn.classList.add('hover:bg-gray-100', 'border-gray-300');
  });
  if (event && event.target) {
    event.target.classList.add('bg-red-600', 'text-white');
    event.target.classList.remove('hover:bg-gray-100');
  }
  renderProducts();
}

function renderProducts() {
  let filtered = PRODUCTS.filter(p => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
    if (p.category === 'phukien' && selectedAccessoryTypes.length > 0 && !selectedAccessoryTypes.includes(p.type)) return false;
    if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
        
    if (selectedPriceRanges.length > 0) {
      const matchesPrice = selectedPriceRanges.some(range => {
        const [min, max] = range.split('-').map(Number);
        return p.price >= min && p.price <= max;
      });
      if (!matchesPrice) return false;
    }
        
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (currentSort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (currentSort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (currentSort === 'tragop') filtered = filtered.filter(p => p.features.includes('tragop'));

  const grid = document.getElementById('productsGrid');
  const countEl = document.getElementById('productCount');
    
  if (grid) {
    // QUAN TRỌNG: Đảm bảo grid luôn hiển thị
    grid.style.display = 'grid';
    grid.innerHTML = '';
        
    if (filtered.length === 0) {
      grid.style.display = 'block';
      grid.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-search text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
          <button onclick="clearAllFilters()" class="mt-4 text-red-600 font-semibold hover:underline">Xóa bộ lọc</button>
        </div>
      `;
    } else {
      filtered.forEach(product => {
        grid.appendChild(createProductCard(product));
      });
    }
  }
    
  if (countEl) countEl.textContent = filtered.length;
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full';
    
  const discountBadge = product.discount ? 
    `<span class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded z-10">-${product.discount}%</span>` : '';
    
  const rating = 4 + Math.random();
  const reviewCount = Math.floor(Math.random() * 200) + 20;
    
  card.innerHTML = `
    <a href="product-detail.html?id=${product.id}" class="flex flex-col h-full">
      <div class="relative aspect-square p-3 flex items-center justify-center bg-white group overflow-hidden">
        ${discountBadge}
        <img src="${product.image}" 
             alt="${product.name}" 
             class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" 
             style="mix-blend-mode: multiply; max-height: 100%; max-width: 100%;"
             loading="lazy"
             onerror="this.onerror=null; this.src='images/iphone17.avif'; console.error('Failed to load image:', '${product.image}');">
      </div>
            
      <div class="p-4 flex flex-col flex-1">
        <h3 class="font-bold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px] group-hover:text-red-600 transition-colors">
          ${product.name}
        </h3>
                
        <div class="flex items-center gap-1 mb-2">
          <div class="flex text-yellow-400 text-xs">
            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
          </div>
          <span class="text-xs text-gray-500">(${reviewCount})</span>
        </div>
                
        <div class="mt-auto">
          <div class="flex flex-wrap items-baseline gap-2 mb-3">
            <span class="text-lg font-black text-red-600">${formatPrice(product.price)}</span>
            ${product.oldPrice ? `<span class="text-xs text-gray-400 line-through">${formatPrice(product.oldPrice)}</span>` : ''}
          </div>
                    
          <button onclick="event.preventDefault(); addToCart(${product.id})" 
              class="w-full bg-red-50 text-red-600 border border-red-200 font-bold py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all text-sm flex items-center justify-center gap-2">
            <i class="fas fa-cart-plus"></i> Thêm vào giỏ
          </button>
        </div>
      </div>
    </a>
  `;
  return card;
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

// Lấy cart key theo user
function getCartKey() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user && user.ma_kh) {
    return `cart_user_${user.ma_kh}`;
  }
  return 'cart_guest';
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (product) {
    const cartKey = getCartKey();
    let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const existingItem = cart.find(item => item.id === product.id);
        
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      // Chuẩn hóa dữ liệu giỏ hàng để tương thích với cart.js và checkout.js
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.oldPrice || product.price,
        image: product.image,
        quantity: 1,
        color: product.color || 'Mặc định',
        colorCode: product.colorCode || '#000000',
        storage: product.storage ? `${product.storage}GB` : '128GB',
        ram: product.ram ? `${product.ram}GB` : null,
        inStock: true,
        badge: product.discount ? `-${product.discount}%` : null
      });
    }
        
    localStorage.setItem(cartKey, JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    showToastProducts(`Đã thêm "${product.name}" vào giỏ hàng!`);
  }
}

// Toast notification cho products page
function showToastProducts(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform ${
    type === 'success' ? 'bg-green-500 text-white' : 
    type === 'error' ? 'bg-red-500 text-white' : 
    'bg-gray-800 text-white'
  }`;
  toast.innerHTML = `<div class="flex items-center gap-2"><i class="fas fa-check-circle"></i>${message}</div>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Hàm renderProducts chính
function renderProducts() {
  if (typeof filterState !== 'undefined' && document.getElementById('quickBrandContainer')) {
    renderProductsFPT();
  } else {
    // Use original render logic
    originalRenderProducts();
  }
}

// Hàm renderProducts gốc (original)
function originalRenderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  // Filter products
  let filtered = PRODUCTS.filter(product => {
    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
    
    // Price filter
    if (selectedPriceRanges.length > 0) {
      const match = selectedPriceRanges.some(range => {
        const [min, max] = range.split('-').map(Number);
        return product.price >= min && product.price <= max;
      });
      if (!match) return false;
    }
    
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;
    
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  // Sort products
  switch(currentSort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'featured':
    default:
      // Keep original order
      break;
  }

  // Update product count
  const countElement = document.getElementById('productCount');
  if (countElement) countElement.innerText = filtered.length;

  // Render products
  grid.innerHTML = '';
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">Không tìm thấy sản phẩm phù hợp</div>';
    return;
  }

  filtered.forEach(product => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });
}

/* ------------------------------------------------------------------
   FPT-style Horizontal Filter UI (new) -- appended to override/augment
   the previous filter behavior on products.html pages.
------------------------------------------------------------------- */

// --- LOGIC XỬ LÝ MỚI (FPT STYLE) ---

// Biến lưu trạng thái bộ lọc
let filterState = {
  brands: [],
  prices: [],
  rams: [],
  features: [],
  sort: 'featured'
};

document.addEventListener('DOMContentLoaded', () => {
  // If the new layout exists on this page, initialize the new toolbar widgets
  if (document.getElementById('quickBrandContainer')) {
    initQuickBrands();
    initBrandDropdown();
    renderProducts();

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.group-filter')) closeAllDropdowns();
    });
  }
});

function initQuickBrands() {
  const brands = [...new Set(PRODUCTS.map(p => p.brand))];
  const container = document.getElementById('quickBrandContainer');
  if (!container) return;

  container.innerHTML = `<button onclick="resetFilters()" class="quick-brand-btn active">Tất cả</button>`;
  brands.forEach(brand => {
    container.innerHTML += `\n      <button onclick="toggleQuickBrand('${brand}')" class="quick-brand-btn uppercase" data-brand="${brand}">${brand}</button>`;
  });
}

function initBrandDropdown() {
  const brands = [...new Set(PRODUCTS.map(p => p.brand))];
  const container = document.getElementById('brandListCheckbox');
  if (!container) return;
  container.innerHTML = '';
  brands.forEach(brand => {
    container.innerHTML += `\n      <label class="fpt-item capitalize"><input type="checkbox" class="brand-cb" value="${brand}"> ${brand}</label>`;
  });
}

function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  if (!dropdown) return;
  const isHidden = dropdown.classList.contains('hidden');
  closeAllDropdowns();
  if (isHidden) { dropdown.classList.remove('hidden'); dropdown.previousElementSibling.classList.add('active'); }
}

function closeAllDropdowns() {
  document.querySelectorAll('.fpt-dropdown').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.fpt-btn').forEach(el => el.classList.remove('active'));

  if (filterState.brands.length) document.getElementById('btn-brand')?.classList.add('active');
  if (filterState.prices.length) document.getElementById('btn-price')?.classList.add('active');
  if (filterState.rams.length || filterState.features.length) document.getElementById('btn-feature')?.classList.add('active');
}

function applyFiltersFPT() {
  filterState.brands = Array.from(document.querySelectorAll('.brand-cb:checked')).map(cb => cb.value);
  filterState.prices = Array.from(document.querySelectorAll('.price-filter:checked')).map(cb => cb.value);
  filterState.rams = Array.from(document.querySelectorAll('.ram-filter:checked')).map(cb => parseInt(cb.value));
  filterState.features = Array.from(document.querySelectorAll('.feature-filter:checked')).map(cb => cb.value);

  closeAllDropdowns();
  renderTags();
  renderProductsFPT();
  updateQuickBrandUI();
}

// Alias cho tương thích
window.applyFilters = function() {
  if (document.getElementById('quickBrandContainer')) {
    applyFiltersFPT();
  } else {
    // Gọi hàm applyFilters gốc
    applyFiltersOriginal();
  }
};

function toggleQuickBrand(brand) {
  filterState.brands = [brand];
  document.querySelectorAll('.brand-cb').forEach(cb => cb.checked = cb.value === brand);
  document.querySelectorAll('.price-filter, .ram-filter, .feature-filter').forEach(cb => cb.checked = false);
  filterState.prices = []; filterState.rams = []; filterState.features = [];
  applyFiltersFPT();
}

function resetFilters() {
  if (document.getElementById('filterToolbar')) {
    document.querySelectorAll('#filterToolbar input[type="checkbox"]').forEach(cb => cb.checked = false);
    applyFiltersFPT();
  } else {
    selectedBrands = [];
    selectedPriceRanges = [];
    document.querySelectorAll('.price-filter').forEach(cb => cb.checked = false);
    document.querySelectorAll('.brand-filter').forEach(cb => cb.checked = false);
    updateFilterTags();
    renderProducts();
  }
}

function renderTags() {
  const container = document.getElementById('filterTags');
  if (!container) return;
  let html = '';
  filterState.brands.forEach(b => html += createTag(b.toUpperCase(), `removeFilter('brand', '${b}')`));
  filterState.prices.forEach(p => {
    const [min,max] = p.split('-');
    const text = max > 100000000 ? `> ${min/1000000}tr` : `${min/1000000}-${max/1000000}tr`;
    html += createTag(text, `removeFilter('price', '${p}')`);
  });
  filterState.features.forEach(f => html += createTag(f === 'tragop' ? 'Trả góp 0%' : f, `removeFilter('feature', '${f}')`));
  filterState.rams.forEach(r => html += createTag(`${r}GB RAM`, `removeFilter('ram', '${r}')`));

  if (html) html += `<button onclick="resetFilters()" class="text-red-600 text-xs font-bold ml-2 hover:underline">Xóa tất cả</button>`;
  container.innerHTML = html;
}

function createTag(text, action) { return `<span class="filter-tag">${text} <span class="cursor-pointer ml-1 hover:text-red-800" onclick="${action}">✕</span></span>`; }

function removeFilter(type, val) {
  if (type === 'brand') {
    const el = document.querySelector(`.brand-cb[value="${val}"]`);
    if (el) el.checked = false;
  }
  if (type === 'price') {
    const el = document.querySelector(`.price-filter[value="${val}"]`);
    if (el) el.checked = false;
  }
  if (type === 'feature') {
    const el = document.querySelector(`.feature-filter[value="${val}"]`);
    if (el) el.checked = false;
  }
  if (type === 'ram') {
    const el = document.querySelector(`.ram-filter[value="${val}"]`);
    if (el) el.checked = false;
  }
  applyFilters();
}

function updateQuickBrandUI() {
  document.querySelectorAll('.quick-brand-btn').forEach(btn => btn.classList.remove('active'));
  if (filterState.brands.length === 0) document.querySelector('.quick-brand-btn:first-child')?.classList.add('active');
  else if (filterState.brands.length === 1) {
    const btn = document.querySelector(`.quick-brand-btn[data-brand="${filterState.brands[0]}"]`);
    if (btn) btn.classList.add('active');
  }
}

// Hàm loadMoreProducts
function loadMoreProducts() {
  // For now, just re-render with current filters
  // In the future, this could load more products from API with pagination
  renderProducts();
}

// Hàm updateFilterTags
function updateFilterTags() {
  const container = document.getElementById('filterTags');
  if (!container) return;
  
  let tags = [];
  
  // Brand tags
  selectedBrands.forEach(brand => {
    tags.push(`<span class="filter-tag">${brand.toUpperCase()} <span onclick="removeFilter('brand', '${brand}')">×</span></span>`);
  });
  
  // Price tags
  selectedPriceRanges.forEach(range => {
    const [min, max] = range.split('-');
    const label = max > 100000000 ? `> ${min/1000000}tr` : `${min/1000000}-${max/1000000}tr`;
    tags.push(`<span class="filter-tag">${label} <span onclick="removeFilter('price', '${range}')">×</span></span>`);
  });
  
  // Category tags
  selectedCategories.forEach(cat => {
    tags.push(`<span class="filter-tag">${cat} <span onclick="removeFilter('category', '${cat}')">×</span></span>`);
  });
  
  if (tags.length > 0) {
    tags.push(`<button onclick="clearAllFilters()" class="text-red-600 text-xs font-bold ml-2 hover:underline">Xóa tất cả</button>`);
  }
  
  container.innerHTML = tags.join(' ');
}

// Hàm removeFilter
function removeFilter(type, value) {
  if (type === 'brand') {
    selectedBrands = selectedBrands.filter(b => b !== value);
    const checkbox = document.querySelector(`.brand-filter[value="${value}"]`);
    if (checkbox) checkbox.checked = false;
  } else if (type === 'price') {
    selectedPriceRanges = selectedPriceRanges.filter(r => r !== value);
    const checkbox = document.querySelector(`.price-filter[value="${value}"]`);
    if (checkbox) checkbox.checked = false;
  } else if (type === 'category') {
    selectedCategories = selectedCategories.filter(c => c !== value);
  }
  
  renderProducts();
  updateFilterTags();
}

// Hàm clearAllFilters
function clearAllFilters() {
  selectedBrands = [];
  selectedPriceRanges = [];
  selectedCategories = [];
  searchQuery = '';
  
  document.querySelectorAll('.brand-filter, .price-filter, .category-filter').forEach(cb => cb.checked = false);
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  
  renderProducts();
  updateFilterTags();
}

// Hàm sortProducts cho FPT style (nếu có filterState)
if (typeof filterState !== 'undefined') {
  window.sortProductsFPT = function(val) { 
    filterState.sort = val; 
    renderProductsFPT(); 
  };
}

// Hàm renderProducts cho FPT style
function renderProductsFPT() {
  // if horizontal layout present, use the new filterState rules; otherwise fallback to earlier render
  const grid = document.getElementById('productsGrid');
  if (!grid) return originalRenderProducts();

  // Filter
  let filtered = PRODUCTS.filter(p => {
    if (filterState.brands.length && !filterState.brands.includes(p.brand)) return false;
    if (filterState.prices.length) {
      const match = filterState.prices.some(range => {
        const [min,max] = range.split('-').map(Number);
        return p.price >= min && p.price <= max;
      }); if (!match) return false;
    }
    if (filterState.rams.length && !filterState.rams.includes(p.ram)) return false;
    if (filterState.features.length) {
      const match = filterState.features.every(f => p.features && p.features.includes(f));
      if (!match) return false;
    }
    return true;
  });

  // Sort
  if (filterState.sort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
  else if (filterState.sort === 'price-desc') filtered.sort((a,b) => b.price - a.price);

  const count = document.getElementById('productCount'); if (count) count.innerText = filtered.length;

  grid.innerHTML = '';
  if (filtered.length === 0) { grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500">Không tìm thấy sản phẩm</div>`; return; }

  filtered.forEach(p => {
    const price = new Intl.NumberFormat('vi-VN').format(p.price) + '₫';
    const oldPrice = p.oldPrice ? new Intl.NumberFormat('vi-VN').format(p.oldPrice) + '₫' : '';
    const discountBadge = p.discount ? `<div class="absolute top-0 left-0 bg-[#cb1c22] text-white text-[11px] font-bold px-2 py-1 rounded-br-lg z-20">Giảm ${p.discount}%</div>` : '';
    const installmentBadge = p.features && p.features.includes('tragop') ? `<div class="absolute top-2 right-2 bg-gray-100 text-[#333] text-[10px] px-2 py-0.5 rounded z-20 border">Trả góp 0%</div>` : '';
    const imgUrl = p.image;

    grid.innerHTML += `
      <div class="product-card flex flex-col h-full p-3 group relative">
        <a href="product-detail.html?id=${p.id}" class="block flex-1 relative">
          ${discountBadge}
          ${installmentBadge}
          <div class="relative aspect-square mb-2 flex items-center justify-center pt-2 bg-white overflow-hidden">
            <img src="${imgUrl}" 
                 alt="${p.name}"
                 class="img-scale w-[85%] h-auto object-contain" 
                 style="mix-blend-mode: multiply; max-height: 100%; max-width: 100%;"
                 loading="lazy"
                 onerror="this.onerror=null; this.src='images/iphone17.avif'; console.error('Failed to load:', '${imgUrl}');" />
          </div>
          <h3 class="text-[14px] font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[42px] group-hover:text-red-600 transition-colors leading-snug">${p.name}</h3>
          <div class="flex flex-wrap gap-1 mb-2">
            <span class="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded border">${p.ram}GB</span>
            <span class="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded border">${p.storage}GB</span>
          </div>
          <div class="mt-auto">
            <div class="flex flex-wrap items-baseline gap-x-2 mb-1">
              <span class="text-[16px] font-bold text-red-600">${price}</span>
              ${oldPrice ? `<span class="text-[12px] text-gray-400 line-through">${oldPrice}</span>` : ''}
            </div>
            <div class="flex text-yellow-400 text-[10px]"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
          </div>
        </a>
        <button onclick="addToCart(${p.id})" class="mt-3 w-full bg-white border border-red-600 text-red-600 font-semibold py-1.5 rounded hover:bg-red-600 hover:text-white transition-all text-xs flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200"><i class="fas fa-cart-plus"></i> Thêm vào giỏ</button>
      </div>`;
  });
}