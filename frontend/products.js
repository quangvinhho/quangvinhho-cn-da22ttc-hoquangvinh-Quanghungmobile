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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 giây timeout
    
    try {
        // Thử lấy từ API trước
        const response = await fetch(`${API_URL}/products`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('API không khả dụng');
        const data = await response.json();
        if (data && data.length > 0) {
            PRODUCTS = data;
            console.log('Loaded products from API:', PRODUCTS.length);
            return data;
        }
        throw new Error('Không có dữ liệu từ API');
    } catch (error) {
        clearTimeout(timeoutId);
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
    const checkbox = document.querySelector(`.brand-filter[value="${brand}"]`);
    const isChecked = checkbox ? checkbox.checked : false;
    
    // Bỏ tích tất cả các checkbox brand khác (chỉ cho phép chọn 1)
    document.querySelectorAll('.brand-filter').forEach(cb => {
        if (cb.value !== brand) {
            cb.checked = false;
        }
    });
    
    // Cập nhật selectedBrands - chỉ giữ 1 brand
    if (isChecked) {
        selectedBrands = [brand];
    } else {
        selectedBrands = [];
    }
    
    applyFilters();
}

function toggleAccessoryFilter(type) {
    const checkbox = document.querySelector(`.accessory-filter[value="${type}"]`);
    const isChecked = checkbox ? checkbox.checked : false;
    
    // Bỏ tích tất cả các checkbox accessory khác (chỉ cho phép chọn 1)
    document.querySelectorAll('.accessory-filter').forEach(cb => {
        if (cb.value !== type) {
            cb.checked = false;
        }
    });
    
    // Cập nhật selectedAccessoryTypes - chỉ giữ 1 type
    if (isChecked) {
        selectedAccessoryTypes = [type];
    } else {
        selectedAccessoryTypes = [];
    }
    
    applyFilters();
}

// Hàm toggle chung cho tất cả các loại filter - chỉ cho phép chọn 1 ô
function toggleSingleFilter(filterClass, value) {
    const checkbox = document.querySelector(`.${filterClass}[value="${value}"]`);
    const isChecked = checkbox ? checkbox.checked : false;
    
    // Bỏ tích tất cả các checkbox khác trong cùng nhóm (chỉ cho phép chọn 1)
    document.querySelectorAll(`.${filterClass}`).forEach(cb => {
        if (cb.value !== value) {
            cb.checked = false;
        }
    });
    
    applyFilters();
}

// Các hàm toggle cho từng loại filter
function togglePriceFilter(value) {
    toggleSingleFilter('price-filter', value);
}

function toggleOsFilter(value) {
    toggleSingleFilter('os-filter', value);
}

function toggleRomFilter(value) {
    toggleSingleFilter('rom-filter', value);
}

function toggleConnectFilter(value) {
    toggleSingleFilter('connect-filter', value);
}

function toggleBatteryFilter(value) {
    toggleSingleFilter('battery-filter', value);
}

function toggleNetworkFilter(value) {
    toggleSingleFilter('network-filter', value);
}

function toggleRamFilter(value) {
    toggleSingleFilter('ram-filter', value);
}

function toggleSdFilter(value) {
    toggleSingleFilter('sd-filter', value);
}

function toggleScreenFilter(value) {
    toggleSingleFilter('screen-filter', value);
}

function toggleRefreshFilter(value) {
    toggleSingleFilter('refresh-filter', value);
}

function toggleFeatureFilter(value) {
    toggleSingleFilter('feature-filter', value);
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
    // Hàm helper để xử lý logic chỉ chọn 1 checkbox trong mỗi nhóm filter
    function handleSingleSelect(filterClass) {
        const checkedFilters = document.querySelectorAll(`.${filterClass}:checked`);
        if (checkedFilters.length > 1) {
            // Lấy giá trị cuối cùng được chọn và bỏ tích các checkbox khác
            const lastChecked = checkedFilters[checkedFilters.length - 1];
            checkedFilters.forEach(cb => {
                if (cb !== lastChecked) {
                    cb.checked = false;
                }
            });
        }
    }
    
    // Áp dụng logic chỉ chọn 1 cho tất cả các loại filter
    handleSingleSelect('price-filter');
    handleSingleSelect('brand-filter');
    handleSingleSelect('os-filter');
    handleSingleSelect('rom-filter');
    handleSingleSelect('connect-filter');
    handleSingleSelect('battery-filter');
    handleSingleSelect('network-filter');
    handleSingleSelect('ram-filter');
    handleSingleSelect('accessory-filter');
    
    // Collect price filters
    selectedPriceRanges = [];
    const checkedPriceFilter = document.querySelector('.price-filter:checked');
    if (checkedPriceFilter && checkedPriceFilter.value !== 'all') {
        selectedPriceRanges = [checkedPriceFilter.value];
    }
    
    // Collect brand filters
    selectedBrands = [];
    const checkedBrandFilter = document.querySelector('.brand-filter:checked');
    if (checkedBrandFilter) {
        selectedBrands = [checkedBrandFilter.value];
    }
    
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
    
    // Đảm bảo đường dẫn ảnh đúng
    let productImage = product.image;
    if (productImage && !productImage.startsWith('http') && !productImage.startsWith('images/')) {
        productImage = `images/${productImage}`;
    }
    
    card.innerHTML = `
        <div class="flex flex-col h-full" onclick="window.location.href='product-detail.html?id=${product.id}'">
            <div class="relative aspect-square p-3 flex items-center justify-center bg-white group overflow-hidden">
                ${discountBadge}
                <img src="${productImage}" 
                     alt="${product.name}" 
                     class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                     style="mix-blend-mode: multiply; max-height: 100%; max-width: 100%;"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='images/IPHONE17.avif';">
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

async function addToCart(productId) {
    console.log('addToCart called with productId:', productId, 'type:', typeof productId);
    console.log('PRODUCTS array length:', PRODUCTS.length);
    
    // Kiểm tra đăng nhập trước
    if (!isLoggedIn()) {
        showLoginRequiredModal();
        return;
    }
    
    // Tìm sản phẩm - so sánh cả số và chuỗi
    const product = PRODUCTS.find(p => {
        const pId = p.id;
        const searchId = productId;
        return pId == searchId; // So sánh lỏng để xử lý cả number và string
    });
    
    console.log('Found product:', product);
    
    if (!product) {
        console.error('Product not found! ProductId:', productId);
        console.log('Available product IDs:', PRODUCTS.map(p => p.id));
        showToast('Không tìm thấy sản phẩm', 'error');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const firstColor = product.colors && product.colors.length > 0 ? product.colors[0] : '#000000';
    const firstColorName = product.colorNames && product.colorNames.length > 0 ? product.colorNames[0] : 'Mặc định';
    
    // Chuẩn bị thông tin sản phẩm để lưu
    const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.oldPrice || product.price,
        image: product.image,
        quantity: 1,
        color: firstColorName,
        colorCode: firstColor,
        storage: product.storage ? `${product.storage}GB` : '128GB',
        inStock: true
    };
    
    try {
        // Gọi API thêm vào giỏ hàng - gửi kèm thông tin sản phẩm
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.ma_kh,
                productId: product.id,
                quantity: 1,
                productInfo: {
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    color: firstColorName,
                    storage: product.storage ? `${product.storage}GB` : '128GB'
                }
            })
        });
        const data = await response.json();
        console.log('API response:', data);
        
        // Luôn lưu vào localStorage để backup (dù API thành công hay thất bại)
        saveToLocalCart(cartItem);
        
        if (data.success) {
            showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
        } else {
            // API thất bại nhưng đã lưu localStorage, vẫn thông báo thành công
            console.log('API error but saved to localStorage:', data.message);
            showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
        }
    } catch (error) {
        console.error('Lỗi thêm giỏ hàng:', error);
        // Fallback: lưu localStorage nếu API lỗi
        saveToLocalCart(cartItem);
        showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
    }
}

// Hàm helper lưu vào localStorage
function saveToLocalCart(cartItem) {
    const cartKey = getCartKey();
    let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const existingItem = cart.find(item => item.id == cartItem.id); // So sánh lỏng
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(cartItem);
    }
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
    console.log('Cart saved to localStorage:', cart);
    
    // Cập nhật badge
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Gọi trực tiếp updateCartBadge nếu có
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
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

// Hàm ẩn page loader
function hidePageLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Products page initializing...');
    
    try {
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
    } catch (error) {
        console.error('Error initializing products page:', error);
    } finally {
        // Đảm bảo ẩn loader dù có lỗi hay không
        hidePageLoader();
    }
});

