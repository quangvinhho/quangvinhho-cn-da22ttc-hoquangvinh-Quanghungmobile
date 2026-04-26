// Products Page JavaScript
// QuangHưng Mobile - Kết nối MySQL

// API URL
const API_URL = 'http://localhost:3000/api';

// Biến lưu dữ liệu sản phẩm từ API
let PRODUCTS = [];

// Biến lưu danh sách hãng từ API
let BRANDS = [];

// Biến lưu trạng thái bộ lọc
let selectedBrands = [];
let selectedPriceRanges = [];
let selectedCategories = [];
let selectedAccessoryTypes = [];
let currentSort = 'featured';
let searchQuery = '';

// Hàm fetch danh sách hãng từ API
async function fetchBrands() {
    try {
        const response = await fetch(`${API_URL}/products/brands`);
        if (!response.ok) throw new Error('API không khả dụng');
        const data = await response.json();
        BRANDS = data;
        console.log('Loaded brands from API:', BRANDS.length);
        return data;
    } catch (error) {
        console.log('Error fetching brands:', error.message);
        BRANDS = [];
        return [];
    }
}

// Hàm render danh sách hãng vào sidebar filter
function renderBrandFilters() {
    const brandSection = document.getElementById('brandSection');
    if (!brandSection || BRANDS.length === 0) return;
    
    // Xóa nội dung cũ
    brandSection.innerHTML = '';
    
    // Render từng hãng
    BRANDS.forEach((brand, index) => {
        const brandName = brand.ten_hang;
        const brandValue = brandName.toLowerCase();
        const productCount = brand.so_san_pham || 0;
        
        const label = document.createElement('label');
        label.className = 'filter-option';
        if (index >= 5) {
            label.style.display = 'none'; // Ẩn từ hãng thứ 6
        }
        label.innerHTML = `
            <input type="checkbox" class="brand-filter" value="${brandValue}" onchange="toggleBrandFilter('${brandValue}')">
            <span class="custom-checkbox"></span>
            <span class="option-label">${brandName}</span>
            <span class="count-badge">${productCount}</span>
        `;
        brandSection.appendChild(label);
    });
    
    // Thêm nút "Xem thêm" nếu có hơn 5 hãng
    if (BRANDS.length > 5) {
        const seeMoreBtn = document.createElement('div');
        seeMoreBtn.className = 'see-more-btn';
        seeMoreBtn.onclick = toggleMoreBrands;
        seeMoreBtn.innerHTML = `
            <span>Xem thêm ${BRANDS.length - 5} hãng</span>
            <i class="fas fa-chevron-right"></i>
        `;
        brandSection.appendChild(seeMoreBtn);
    }
    
    // Đánh dấu checkbox nếu có brand đã chọn từ URL
    if (selectedBrands.length > 0) {
        selectedBrands.forEach(brand => {
            const checkbox = document.querySelector(`.brand-filter[value="${brand}"]`);
            if (checkbox) {
                checkbox.checked = true;
                // Hiển thị hãng nếu bị ẩn
                const label = checkbox.closest('.filter-option');
                if (label) label.style.display = 'flex';
            }
        });
    }
}

// Hàm fetch sản phẩm từ API hoặc JSON file

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
    const brandSection = document.getElementById('brandSection');
    const seeMoreBtn = brandSection.querySelector('.see-more-btn');
    const btnText = seeMoreBtn.querySelector('span');
    const btnIcon = seeMoreBtn.querySelector('i');
    
    // Lấy tất cả các filter-option trong brand section
    const brandOptions = brandSection.querySelectorAll('.filter-option');
    
    // Toggle class để hiển thị/ẩn
    const isExpanded = brandSection.classList.toggle('brands-expanded');
    
    if (isExpanded) {
        // Hiển thị tất cả các hãng
        brandOptions.forEach((option, index) => {
            if (index >= 5) {
                option.style.display = 'flex';
            }
        });
        btnText.textContent = 'Thu gọn';
        btnIcon.classList.remove('fa-chevron-right');
        btnIcon.classList.add('fa-chevron-up');
    } else {
        // Ẩn các hãng từ thứ 6 trở đi
        brandOptions.forEach((option, index) => {
            if (index >= 5) {
                option.style.display = 'none';
            }
        });
        btnText.textContent = 'Xem thêm ' + (brandOptions.length - 5) + ' hãng';
        btnIcon.classList.remove('fa-chevron-up');
        btnIcon.classList.add('fa-chevron-right');
    }
}

// Hàm ẩn các hãng thừa khi trang load
function initBrandFilter() {
    const brandSection = document.getElementById('brandSection');
    if (!brandSection) return;
    
    const brandOptions = brandSection.querySelectorAll('.filter-option');
    const seeMoreBtn = brandSection.querySelector('.see-more-btn');
    
    // Ẩn các hãng từ thứ 6 trở đi ban đầu
    brandOptions.forEach((option, index) => {
        if (index >= 5) {
            option.style.display = 'none';
        }
    });
    
    // Cập nhật text button
    if (seeMoreBtn && brandOptions.length > 5) {
        const btnText = seeMoreBtn.querySelector('span');
        if (btnText) {
            btnText.textContent = 'Xem thêm ' + (brandOptions.length - 5) + ' hãng';
        }
    } else if (seeMoreBtn && brandOptions.length <= 5) {
        // Ẩn nút nếu không có hãng nào cần ẩn
        seeMoreBtn.style.display = 'none';
    }
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


// Số sản phẩm hiển thị mỗi lần
const PRODUCTS_PER_PAGE = 12;
let currentDisplayCount = PRODUCTS_PER_PAGE;
let allFilteredProducts = [];

// --- RENDER PRODUCTS ---
function renderProducts(loadMore = false) {
    const grid = document.getElementById('productsGrid');
    const countEl = document.getElementById('productCount');
    
    if (!grid) {
        console.error('Products grid not found!');
        return;
    }
    
    // Reset count nếu không phải load more
    if (!loadMore) {
        currentDisplayCount = PRODUCTS_PER_PAGE;
    }
    
    // Filter products
    allFilteredProducts = PRODUCTS.filter(product => {
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
            allFilteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            allFilteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'tragop':
            allFilteredProducts = allFilteredProducts.filter(p => p.features && p.features.includes('tragop'));
            break;
        case 'featured':
        default:
            // Keep original order
            break;
    }
    
    // Update product count
    if (countEl) countEl.textContent = allFilteredProducts.length;
    
    // Render products
    grid.innerHTML = '';
    
    if (allFilteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
                <button onclick="clearAllFilters()" class="mt-4 text-red-600 font-semibold hover:underline">Xóa bộ lọc</button>
            </div>
        `;
        removeLoadMoreButton();
        return;
    }
    
    // Chỉ hiển thị số lượng sản phẩm theo currentDisplayCount
    const productsToShow = allFilteredProducts.slice(0, currentDisplayCount);
    productsToShow.forEach(product => {
        grid.appendChild(createProductCard(product));
    });
    
    // Thêm hoặc cập nhật nút Xem thêm
    updateLoadMoreButton();
}

// Hàm cập nhật nút Xem thêm
function updateLoadMoreButton() {
    const container = document.getElementById('loadMoreContainer');
    const remainingProducts = allFilteredProducts.length - currentDisplayCount;
    
    if (remainingProducts <= 0) {
        removeLoadMoreButton();
        return;
    }
    
    if (!container) {
        // Tạo container cho nút Xem thêm
        const grid = document.getElementById('productsGrid');
        const loadMoreDiv = document.createElement('div');
        loadMoreDiv.id = 'loadMoreContainer';
        loadMoreDiv.className = 'col-span-full flex flex-col items-center justify-center py-8 mt-4';
        loadMoreDiv.innerHTML = `
            <p class="text-gray-500 text-sm mb-4">Đang hiển thị <span class="font-semibold text-gray-700">${currentDisplayCount}</span> / <span class="font-semibold text-red-600">${allFilteredProducts.length}</span> sản phẩm</p>
            <button onclick="loadMoreProducts()" class="load-more-btn group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
                <span>Xem thêm ${remainingProducts} sản phẩm</span>
                <i class="fas fa-chevron-down group-hover:animate-bounce"></i>
            </button>
        `;
        grid.parentNode.insertBefore(loadMoreDiv, grid.nextSibling);
    } else {
        // Cập nhật nội dung nút
        container.innerHTML = `
            <p class="text-gray-500 text-sm mb-4">Đang hiển thị <span class="font-semibold text-gray-700">${currentDisplayCount}</span> / <span class="font-semibold text-red-600">${allFilteredProducts.length}</span> sản phẩm</p>
            <button onclick="loadMoreProducts()" class="load-more-btn group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
                <span>Xem thêm ${remainingProducts} sản phẩm</span>
                <i class="fas fa-chevron-down group-hover:animate-bounce"></i>
            </button>
        `;
    }
}

// Hàm xóa nút Xem thêm
function removeLoadMoreButton() {
    const container = document.getElementById('loadMoreContainer');
    if (container) {
        container.remove();
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    const isOutOfStock = !product.stock || product.stock <= 0;
    
    card.className = `product-card bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer ${isOutOfStock ? 'out-of-stock' : ''}`;
    
    const discountBadge = product.discount && !isOutOfStock ? 
        `<span class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded z-10">-${product.discount}%</span>` : '';
    
    const outOfStockBadge = isOutOfStock ? 
        `<span class="out-of-stock-badge"><i class="fas fa-times-circle mr-1"></i>Hết hàng</span>` : '';
    
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
                ${outOfStockBadge}
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
                        <span class="text-lg font-black ${isOutOfStock ? 'text-gray-400' : 'text-red-600'}">${formatPrice(product.price)}</span>
                        ${product.oldPrice ? `<span class="text-xs text-gray-400 line-through">${formatPrice(product.oldPrice)}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
        <div class="px-4 pb-4">
            ${isOutOfStock ? `
                <button disabled 
                    class="w-full bg-gray-200 text-gray-500 border border-gray-300 font-bold py-2 rounded-lg cursor-not-allowed text-sm flex items-center justify-center gap-2">
                    <i class="fas fa-times-circle"></i> Hết hàng
                </button>
            ` : `
                <button onclick="event.stopPropagation(); addToCart(${product.id})" 
                    class="w-full bg-red-50 text-red-600 border border-red-200 font-bold py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all text-sm flex items-center justify-center gap-2">
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>
            `}
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
    // Tăng số lượng sản phẩm hiển thị thêm 12
    currentDisplayCount += PRODUCTS_PER_PAGE;
    
    // Render lại với flag loadMore = true để không reset count
    renderProducts(true);
    
    // Scroll nhẹ xuống để người dùng thấy sản phẩm mới
    const grid = document.getElementById('productsGrid');
    if (grid) {
        const cards = grid.querySelectorAll('.product-card');
        if (cards.length > PRODUCTS_PER_PAGE) {
            // Scroll đến sản phẩm đầu tiên của batch mới
            const newFirstCard = cards[currentDisplayCount - PRODUCTS_PER_PAGE];
            if (newFirstCard) {
                newFirstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
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

// Hàm điều chỉnh filter sidebar khi scroll - đi theo sản phẩm
function initFilterSidebarScroll() {
    const sidebar = document.getElementById('filterSidebar');
    const productsGrid = document.getElementById('productsGrid');
    
    if (!sidebar || !productsGrid) return;
    
    function adjustSidebar() {
        const windowHeight = window.innerHeight;
        
        // Lấy chiều cao thực của header (fixed header)
        const header = document.querySelector('header.header-wrapper');
        const headerHeight = header ? header.offsetHeight : 140;
        
        // Tính top và max-height
        const topValue = headerHeight + 20;
        const maxHeight = windowHeight - headerHeight - 60;
        
        sidebar.style.top = `${topValue}px`;
        sidebar.style.maxHeight = `${maxHeight}px`;
    }
    
    // Điều chỉnh khi resize và scroll
    window.addEventListener('resize', adjustSidebar);
    window.addEventListener('scroll', adjustSidebar);
    
    // Chạy lần đầu sau khi header load xong
    setTimeout(adjustSidebar, 100);
    setTimeout(adjustSidebar, 500);
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Products page initializing...');
    
    try {
        // Parse URL params first (để biết brand đã chọn trước khi render)
        parseUrlParams();
        
        // Fetch brands và products song song
        await Promise.all([
            fetchBrands(),
            fetchProducts()
        ]);
        console.log('Brands loaded:', BRANDS.length);
        console.log('Products loaded:', PRODUCTS.length);
        
        // Render brand filters động từ API
        renderBrandFilters();
        
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
        
        // Khởi tạo điều chỉnh sidebar khi scroll
        initFilterSidebarScroll();
        
        console.log('Products page initialized successfully!');
    } catch (error) {
        console.error('Error initializing products page:', error);
    } finally {
        // Đảm bảo ẩn loader dù có lỗi hay không
        hidePageLoader();
    }
});

