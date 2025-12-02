// Products Page JavaScript
// QuangHưng Mobile - Kết nối MySQL

// API URL
const API_URL = 'http://localhost:3000/api';

// Biến lưu dữ liệu sản phẩm từ API
let PRODUCTS = [];

// Biến lưu trạng thái bộ lọc
let selectedBrands = [];
let selectedPriceRanges = [];
let selectedCategories = [];
let selectedAccessoryTypes = [];
let currentSort = 'featured';
let searchQuery = '';

// Hàm fetch sản phẩm từ API hoặc JSON file
async function fetchProducts() {
    try {
        // Thử lấy từ API trước
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('API không khả dụng');
        const data = await response.json();
        if (data && data.length > 0) {
            PRODUCTS = data;
            console.log('Loaded products from API:', PRODUCTS.length);
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
            console.log('Loaded products from JSON:', PRODUCTS.length);
            return PRODUCTS;
        } catch (jsonError) {
            console.error('Lỗi lấy sản phẩm:', jsonError);
            PRODUCTS = [];
            return [];
        }
    }
}

// --- SLIDER LOGIC ---
let currentSlide = 0;

function showSlide(index) {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.slider-dot');
    
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
    
    // Update slide counter
    const slideNum = document.getElementById('currentSlideNum');
    if (slideNum) slideNum.textContent = index + 1;
}

function nextSlide() {
    const slides = document.querySelectorAll('.banner-slide');
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    const slides = document.querySelectorAll('.banner-slide');
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

// --- FILTER SECTION TOGGLE ---
function toggleFilterSection(sectionName) {
    const section = document.querySelector(`.filter-section[data-section="${sectionName}"]`);
    if (section) {
        section.classList.toggle('expanded');
    }
}

function toggleMoreBrands() {
    console.log('Toggle more brands');
}


// --- FILTER FUNCTIONS ---
function filterByBrand(brand) {
    window.location.href = `products.html?brand=${brand}`;
}

function toggleBrandFilter(brand) {
    const idx = selectedBrands.indexOf(brand);
    if (idx > -1) selectedBrands.splice(idx, 1);
    else selectedBrands.push(brand);
    applyFilters();
}

function toggleAccessoryFilter(type) {
    const idx = selectedAccessoryTypes.indexOf(type);
    if (idx > -1) selectedAccessoryTypes.splice(idx, 1);
    else selectedAccessoryTypes.push(type);
    applyFilters();
}

function applyCustomPriceRange() {
    const min = document.getElementById('minPrice')?.value;
    const max = document.getElementById('maxPrice')?.value;
    if (min && max) {
        selectedPriceRanges = [`${min}-${max}`];
        document.querySelectorAll('.price-filter').forEach(cb => cb.checked = false);
        applyFilters();
    }
}

function applyFilters() {
    // Collect price filters
    selectedPriceRanges = [];
    document.querySelectorAll('.price-filter:checked').forEach(cb => {
        if (cb.value !== 'all') selectedPriceRanges.push(cb.value);
    });
    
    // Collect brand filters
    selectedBrands = [];
    document.querySelectorAll('.brand-filter:checked').forEach(cb => {
        selectedBrands.push(cb.value);
    });
    
    updateFilterTags();
    renderProducts();
}

function updateFilterTags() {
    const container = document.getElementById('filterTags');
    if (!container) return;
    
    let tags = [];
    
    // Brand tags
    selectedBrands.forEach(brand => {
        tags.push(`<span class="filter-tag">${brand.toUpperCase()} <span onclick="removeBrandFilter('${brand}')" class="cursor-pointer ml-1">×</span></span>`);
    });
    
    // Price tags
    selectedPriceRanges.forEach(range => {
        const [min, max] = range.split('-').map(Number);
        const label = max > 100000000 ? `> ${min/1000000}tr` : `${min/1000000}-${max/1000000}tr`;
        tags.push(`<span class="filter-tag">${label} <span onclick="removePriceFilter('${range}')" class="cursor-pointer ml-1">×</span></span>`);
    });
    
    if (tags.length > 0) {
        tags.push(`<button onclick="clearAllFilters()" class="text-red-600 text-xs font-bold ml-2 hover:underline">Xóa tất cả</button>`);
    }
    
    container.innerHTML = tags.join(' ');
}

function removeBrandFilter(brand) {
    const checkbox = document.querySelector(`.brand-filter[value="${brand}"]`);
    if (checkbox) checkbox.checked = false;
    selectedBrands = selectedBrands.filter(b => b !== brand);
    applyFilters();
}

function removePriceFilter(range) {
    const checkbox = document.querySelector(`.price-filter[value="${range}"]`);
    if (checkbox) checkbox.checked = false;
    selectedPriceRanges = selectedPriceRanges.filter(r => r !== range);
    applyFilters();
}

function clearAllFilters() {
    selectedBrands = [];
    selectedPriceRanges = [];
    selectedCategories = [];
    searchQuery = '';
    
    document.querySelectorAll('.brand-filter, .price-filter').forEach(cb => cb.checked = false);
    
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


// --- RENDER PRODUCTS ---
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const countEl = document.getElementById('productCount');
    
    if (!grid) {
        console.error('Products grid not found!');
        return;
    }
    
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
        
        // Accessory type filter
        if (product.category === 'phukien' && selectedAccessoryTypes.length > 0 && !selectedAccessoryTypes.includes(product.type)) return false;
        
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
        case 'tragop':
            filtered = filtered.filter(p => p.features && p.features.includes('tragop'));
            break;
        case 'featured':
        default:
            // Keep original order
            break;
    }
    
    // Update product count
    if (countEl) countEl.textContent = filtered.length;
    
    // Render products
    grid.innerHTML = '';
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
                <button onclick="clearAllFilters()" class="mt-4 text-red-600 font-semibold hover:underline">Xóa bộ lọc</button>
            </div>
        `;
        return;
    }
    
    filtered.forEach(product => {
        grid.appendChild(createProductCard(product));
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer';
    
    const discountBadge = product.discount ? 
        `<span class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded z-10">-${product.discount}%</span>` : '';
    
    const reviewCount = product.reviews || Math.floor(Math.random() * 200) + 20;
    
    card.innerHTML = `
        <div class="flex flex-col h-full" onclick="window.location.href='product-detail.html?id=${product.id}'">
            <div class="relative aspect-square p-3 flex items-center justify-center bg-white group overflow-hidden">
                ${discountBadge}
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                     style="mix-blend-mode: multiply; max-height: 100%; max-width: 100%;"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='images/iphone17.avif';">
            </div>
            
            <div class="p-4 flex flex-col flex-1">
                <h3 class="font-bold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px] hover:text-red-600 transition-colors">
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
                </div>
            </div>
        </div>
        <div class="px-4 pb-4">
            <button onclick="event.stopPropagation(); addToCart(${product.id})" 
                class="w-full bg-red-50 text-red-600 border border-red-200 font-bold py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all text-sm flex items-center justify-center gap-2">
                <i class="fas fa-cart-plus"></i> Thêm vào giỏ
            </button>
        </div>
    `;
    return card;
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}


// --- CART FUNCTIONS ---
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

function addToCart(productId) {
    // Kiểm tra đăng nhập trước
    if (!isLoggedIn()) {
        showLoginRequiredModal();
        return;
    }
    
    const product = PRODUCTS.find(p => p.id === productId);
    if (product) {
        const cartKey = getCartKey();
        let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
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
        showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
    }
}

function showToast(message, type = 'success') {
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

// --- LOAD MORE ---
function loadMoreProducts() {
    // For now, just re-render with current filters
    renderProducts();
}

// --- MOBILE FILTER ---
function toggleMobileFilter() {
    const overlay = document.getElementById('mobileFilterOverlay');
    const sidebar = document.getElementById('mobileFilterSidebar');
    
    if (overlay && sidebar) {
        overlay.classList.toggle('hidden');
        sidebar.classList.toggle('-translate-x-full');
    }
}

// --- PARSE URL PARAMS ---
function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const brand = params.get('brand');
    const category = params.get('category');
    const search = params.get('search');
    
    if (brand) {
        selectedBrands = [brand];
        const checkbox = document.querySelector(`.brand-filter[value="${brand}"]`);
        if (checkbox) checkbox.checked = true;
    }
    
    if (category) {
        selectedCategories = [category];
    }
    
    if (search) {
        searchQuery = search;
    }
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Products page initializing...');
    
    // Fetch products from API or JSON
    await fetchProducts();
    console.log('Products loaded:', PRODUCTS.length);
    
    // Parse URL params
    parseUrlParams();
    
    // Initialize slider
    const slides = document.querySelectorAll('.banner-slide');
    if (slides.length > 0) {
        showSlide(0);
        startAutoSlide();
        
        const bannerSlider = document.getElementById('bannerSlider');
        if (bannerSlider) {
            bannerSlider.addEventListener('mouseenter', stopAutoSlide);
            bannerSlider.addEventListener('mouseleave', startAutoSlide);
        }
    }
    
    // Render products
    renderProducts();
    updateFilterTags();
    
    console.log('Products page initialized successfully!');
});
