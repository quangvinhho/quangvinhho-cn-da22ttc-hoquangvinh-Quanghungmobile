// Promotions Page JavaScript
// Kết nối với backend để hiển thị khuyến mãi từ CSDL

const API_BASE = 'http://localhost:3000/api';

// State
let flashSales = [];
let allVouchers = [];
let featuredProducts = [];
let displayedVoucherCount = 6; // Số voucher hiển thị ban đầu
const VOUCHERS_PER_PAGE = 6; // Số voucher mỗi lần load thêm

// ============================================================
// COUNTDOWN TIMER - Đếm ngược Flash Sale
// ============================================================
function initCountdownTimer() {
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  
  if (!hoursEl || !minutesEl || !secondsEl) return;

  // Tính thời gian kết thúc (cuối ngày hôm nay hoặc flash sale hiện tại)
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const updateTimer = () => {
    const current = new Date().getTime();
    const end = endOfDay.getTime();
    const diff = end - current;

    if (diff <= 0) {
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    hoursEl.textContent = hours.toString().padStart(2, '0');
    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
  };

  updateTimer();
  setInterval(updateTimer, 1000);
}

// ============================================================
// LOAD FLASH SALE PRODUCTS - Lấy sản phẩm bán chậm nhất từ DB
// ============================================================
async function loadFlashSaleProducts() {
  const container = document.getElementById('flash-products');
  if (!container) return;

  container.innerHTML = '<div class="col-span-full text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-white/50"></i></div>';

  try {
    // Lấy sản phẩm bán chậm nhất từ API slow-movers (dữ liệu thật từ DB)
    const response = await fetch(`${API_BASE}/promotions/slow-movers`);
    const data = await response.json();

    console.log('Flash Sale - Slow movers data:', data);

    if (data.success && data.data && data.data.length > 0) {
      // Chuyển đổi dữ liệu slow-movers thành format flash sale
      const discounts = [15, 17, 20, 22, 25];
      const flashProducts = data.data.map((p, index) => {
        const discount = discounts[index % discounts.length];
        return {
          productId: p.id,
          name: p.name,
          image: p.image,
          originalPrice: p.price,
          flashPrice: p.price * (1 - discount / 100),
          discountPercent: discount,
          soldQuantity: p.sold || 0,
          totalQuantity: p.stock || 20
        };
      });
      
      renderFlashProducts(flashProducts, container);
    } else {
      // Fallback nếu API slow-movers không có dữ liệu
      await loadProductsAsFlash(container);
    }
  } catch (error) {
    console.error('Error loading flash sale:', error);
    await loadProductsAsFlash(container);
  }
}

async function loadProductsAsFlash(container) {
  try {
    // Fallback: Lấy sản phẩm từ API products
    const response = await fetch(`${API_BASE}/products`);
    let products = await response.json();
    
    if (Array.isArray(products) && products.length > 0) {
      const discounts = [15, 17, 20, 22, 25];
      products = products.slice(0, 4).map((p, index) => ({
        productId: p.ma_sp || p.id,
        name: p.ten_sp || p.name,
        image: p.image || p.anh_dai_dien, // Sẽ được chuẩn hóa trong renderFlashProducts
        originalPrice: parseFloat(p.gia || p.price || 0),
        flashPrice: parseFloat(p.gia || p.price || 0) * (1 - discounts[index % discounts.length] / 100),
        discountPercent: discounts[index % discounts.length],
        soldQuantity: 0,
        totalQuantity: p.so_luong_ton || 20
      }));
      renderFlashProducts(products, container);
    } else {
      container.innerHTML = '<div class="col-span-full text-center py-8 text-white/70">Không có sản phẩm Flash Sale</div>';
    }
  } catch (e) {
    container.innerHTML = '<div class="col-span-full text-center py-8 text-white/70">Không thể tải sản phẩm</div>';
  }
}

function renderFlashProducts(products, container) {
  container.innerHTML = products.map(product => {
    const soldPercent = Math.round((product.soldQuantity / product.totalQuantity) * 100);
    // Xử lý ảnh - tránh lặp images/images/
    const imageUrl = normalizeImageUrl(product.image);
    
    return `
      <a href="product-detail.html?id=${product.productId}" class="product-card block">
        <div class="product-image">
          <img src="${imageUrl}" alt="${product.name}" 
               onerror="this.onerror=null; this.src='images/iphone17.avif';">
          <div class="discount-tag">-${product.discountPercent}%</div>
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price">
            <span class="price-sale">${formatPriceVND(product.flashPrice)}</span>
          </div>
          <div class="text-xs text-gray-400 line-through mb-2">${formatPriceVND(product.originalPrice)}</div>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div class="bg-gradient-to-r from-red-500 to-orange-500 h-1.5 rounded-full" style="width: ${soldPercent}%"></div>
          </div>
          <div class="text-xs text-gray-500 mt-1">Đã bán ${product.soldQuantity}/${product.totalQuantity}</div>
        </div>
      </a>
    `;
  }).join('');
}

// Helper function để chuẩn hóa đường dẫn ảnh
function normalizeImageUrl(imageUrl) {
  if (!imageUrl) return 'images/iphone17.avif';
  
  // Nếu là URL đầy đủ (http/https), giữ nguyên
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // Loại bỏ prefix images/ nếu bị lặp
  let normalized = imageUrl.replace(/^(images\/)+/, '');
  
  // Thêm prefix images/ một lần duy nhất
  return 'images/' + normalized;
}

// ============================================================
// LOAD VOUCHERS - Mã giảm giá từ CSDL
// ============================================================
async function loadVouchers() {
  const container = document.getElementById('vouchers-container');
  const loadMoreBtn = document.getElementById('voucher-load-more');
  const voucherCountEl = document.getElementById('voucher-count');
  
  if (!container) return;

  // Reset số lượng hiển thị
  displayedVoucherCount = VOUCHERS_PER_PAGE;
  
  // Ẩn nút xem thêm và count khi đang load
  if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
  if (voucherCountEl) voucherCountEl.textContent = '';

  container.innerHTML = '<div class="col-span-full text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i></div>';

  try {
    const response = await fetch(`${API_BASE}/promotions/vouchers/available`);
    const data = await response.json();
    
    console.log('Vouchers API response:', data);

    if (!data.success || !data.data || data.data.length === 0) {
      // Thử lấy tất cả voucher để debug
      try {
        const debugRes = await fetch(`${API_BASE}/promotions/vouchers/all`);
        const debugData = await debugRes.json();
        console.log('All vouchers (debug):', debugData);
        
        if (debugData.data && debugData.data.length > 0) {
          // Có voucher nhưng không khả dụng
          const reasons = debugData.data.map(v => `${v.code}: ${v.ly_do}`).join(', ');
          console.log('Voucher status:', reasons);
        }
      } catch(e) { console.log('Debug API not available'); }
      
      container.innerHTML = `
        <div class="col-span-full empty-state">
          <i class="fas fa-ticket-alt"></i>
          <p>Chưa có mã giảm giá khả dụng</p>
          <p class="text-sm text-gray-400 mt-2">Các mã có thể chưa bắt đầu hoặc đã hết hạn</p>
        </div>
      `;
      return;
    }

    allVouchers = data.data;
    renderVouchers(allVouchers);
  } catch (error) {
    console.error('Error loading vouchers:', error);
    container.innerHTML = `
      <div class="col-span-full empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Không thể tải mã giảm giá</p>
        <p class="text-sm text-gray-400 mt-2">Vui lòng thử lại sau</p>
      </div>
    `;
  }
}

function renderVouchers(vouchers, append = false) {
  const container = document.getElementById('vouchers-container');
  const loadMoreBtn = document.getElementById('voucher-load-more');
  const voucherCountEl = document.getElementById('voucher-count');
  const remainingCountEl = document.getElementById('remaining-count');
  
  if (!container) return;

  const savedVouchers = JSON.parse(localStorage.getItem('savedVouchers') || '[]');
  
  // Lấy voucher cần hiển thị
  const vouchersToShow = vouchers.slice(0, displayedVoucherCount);
  const remainingCount = vouchers.length - displayedVoucherCount;
  
  // Cập nhật số lượng hiển thị
  if (voucherCountEl) {
    voucherCountEl.textContent = `Hiển thị ${Math.min(displayedVoucherCount, vouchers.length)}/${vouchers.length} mã`;
  }
  
  // Hiển thị/ẩn nút xem thêm
  if (loadMoreBtn) {
    if (remainingCount > 0) {
      loadMoreBtn.classList.remove('hidden');
      if (remainingCountEl) {
        remainingCountEl.textContent = `+${remainingCount} mã`;
      }
    } else {
      loadMoreBtn.classList.add('hidden');
    }
  }

  const voucherHTML = vouchersToShow.map(voucher => {
    const isSaved = savedVouchers.some(v => v.id === voucher.id || v.code === voucher.code);
    const discountText = voucher.discountType === 'percent' 
      ? `${voucher.discountValue}%` 
      : formatPriceShort(voucher.discountValue);
    const isHot = voucher.daysRemaining <= 3;

    return `
      <div class="voucher-card" 
           data-voucher-id="${voucher.id}"
           data-code="${voucher.code}"
           data-discount-type="${voucher.discountType}"
           data-discount-value="${voucher.discountValue}"
           data-min-order="${voucher.minOrder}"
           data-description="${voucher.description || ''}">
        <div class="voucher-left">
          <div class="voucher-value">${discountText.replace('K', '')}</div>
          <div class="voucher-unit">${voucher.discountType === 'percent' ? 'GIẢM' : 'K'}</div>
        </div>
        <div class="voucher-right">
          <div>
            <div class="voucher-title">${voucher.description || 'Mã giảm giá'}</div>
            <div class="voucher-desc">${voucher.minOrder > 0 ? 'Đơn từ ' + formatPriceShort(voucher.minOrder) : 'Áp dụng mọi đơn hàng'}</div>
            <div class="voucher-code">${voucher.code}</div>
          </div>
          <div class="voucher-footer">
            <span class="voucher-expiry">
              <i class="far fa-clock mr-1"></i>${isHot ? '🔥 Còn ' + voucher.daysRemaining + ' ngày' : 'HSD: ' + voucher.daysRemaining + ' ngày'}
            </span>
            <button 
              class="voucher-btn ${isSaved ? 'saved' : ''}"
              onclick="saveVoucher(${voucher.id}, '${voucher.code}', this)"
              ${isSaved ? 'disabled' : ''}
            >
              ${isSaved ? '✓ Đã lưu' : 'Lưu mã'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = voucherHTML;
}

// Hàm xem thêm voucher
function showMoreVouchers() {
  displayedVoucherCount += VOUCHERS_PER_PAGE;
  renderVouchers(allVouchers);
  
  // Scroll nhẹ xuống để thấy voucher mới
  const container = document.getElementById('vouchers-container');
  if (container) {
    setTimeout(() => {
      container.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}

// Hàm reset về 6 voucher ban đầu (nếu cần)
function resetVoucherDisplay() {
  displayedVoucherCount = VOUCHERS_PER_PAGE;
  renderVouchers(allVouchers);
}

// ============================================================
// LOAD FEATURED PRODUCTS - Sản phẩm nổi bật
// ============================================================
async function loadFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;

  container.innerHTML = '<div class="col-span-full text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i></div>';

  try {
    const response = await fetch(`${API_BASE}/products`);
    let products = await response.json();
    
    if (Array.isArray(products) && products.length > 0) {
      // Lấy 8 sản phẩm ngẫu nhiên
      products = products.sort(() => Math.random() - 0.5).slice(0, 8);
      featuredProducts = products;
      renderFeaturedProducts(products, container);
    } else {
      container.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Không có sản phẩm</div>';
    }
  } catch (error) {
    console.error('Error loading featured products:', error);
    container.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Không thể tải sản phẩm</div>';
  }
}

function renderFeaturedProducts(products, container) {
  container.innerHTML = products.map(p => {
    const price = parseFloat(p.gia || p.price || 0);
    // Sử dụng helper function để chuẩn hóa ảnh
    const image = normalizeImageUrl(p.image || p.anh_dai_dien);
    const name = p.ten_sp || p.name || 'Sản phẩm';
    const id = p.ma_sp || p.id;
    
    return `
      <div class="featured-card" onclick="window.location.href='product-detail.html?id=${id}'">
        <div class="featured-image">
          <img src="${image}" alt="${name}" onerror="this.onerror=null; this.src='images/iphone17.avif';">
          <div class="featured-badge">HOT</div>
        </div>
        <div class="featured-info">
          <h3 class="featured-name">${name}</h3>
          <div class="featured-price">${formatPriceVND(price)}</div>
          <div class="featured-rating">
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star-half-alt"></i>
            <span>(${Math.floor(Math.random() * 100) + 10})</span>
          </div>
          <button class="view-detail-btn" onclick="event.stopPropagation(); window.location.href='product-detail.html?id=${id}'">
            <i class="fas fa-eye mr-2"></i>Xem chi tiết
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// SAVE VOUCHER - Lưu mã giảm giá
// ============================================================
async function saveVoucher(voucherId, code, button) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!user || !user.ma_kh) {
    showToast('Vui lòng đăng nhập để lưu voucher', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=promotions';
    }, 1500);
    return;
  }

  try {
    const savedVouchers = JSON.parse(localStorage.getItem('savedVouchers') || '[]');

    if (savedVouchers.some(v => v.id === voucherId || v.code === code)) {
      showToast('Voucher này đã được lưu', 'info');
      return;
    }

    // Lấy thông tin voucher từ data attribute
    const card = button.closest('.voucher-card');
    const voucherInfo = {
      id: voucherId,
      code: code,
      discountType: card?.dataset.discountType || 'fixed',
      discountValue: parseFloat(card?.dataset.discountValue) || 0,
      minOrder: parseFloat(card?.dataset.minOrder) || 0,
      description: card?.dataset.description || '',
      savedAt: new Date().toISOString()
    };

    // Lưu vào localStorage
    savedVouchers.push(voucherInfo);
    localStorage.setItem('savedVouchers', JSON.stringify(savedVouchers));

    // Gọi API để lưu vào server (nếu có)
    try {
      await fetch(`${API_BASE}/promotions/vouchers/${voucherId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.ma_kh })
      });
    } catch (e) {
      console.log('Server save skipped');
    }

    // Update button
    button.textContent = '✓ Đã lưu';
    button.classList.add('saved');
    button.disabled = true;

    showToast('Đã lưu mã giảm giá!', 'success');
  } catch (error) {
    console.error('Error saving voucher:', error);
    showToast('Không thể lưu voucher', 'error');
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatPriceVND(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

function formatPriceShort(price) {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1) + 'tr';
  } else if (price >= 1000) {
    return (price / 1000).toFixed(0) + 'K';
  }
  return price.toString() + 'đ';
}

function showToast(message, type = 'success') {
  // Remove existing toast
  const existingToast = document.querySelector('.promo-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `promo-toast fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-2xl z-50 transition-all transform ${
    type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 
    type === 'error' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 
    type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
    'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
  }`;
  
  const icon = type === 'success' ? 'fa-check-circle' : 
               type === 'error' ? 'fa-times-circle' : 
               type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
  
  toast.innerHTML = `<div class="flex items-center gap-3"><i class="fas ${icon} text-lg"></i><span class="font-medium">${message}</span></div>`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================
// INITIALIZE PAGE
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initCountdownTimer();
  loadFlashSaleProducts();
  loadVouchers();
  loadFeaturedProducts();
});
