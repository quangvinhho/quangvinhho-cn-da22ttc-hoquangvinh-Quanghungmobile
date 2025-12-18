/* ============================================
   APP.JS - QuangHưng Mobile
   Main application JavaScript
   ============================================ */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format price to Vietnamese currency
 */
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

/**
 * Parse price from string
 */
function parsePrice(priceStr) {
  return parseInt(priceStr.replace(/[^\d]/g, '')) || 0;
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.toast-notification').forEach(t => t.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast-notification fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform ${
    type === 'success' ? 'bg-green-500 text-white' : 
    type === 'error' ? 'bg-red-500 text-white' : 
    type === 'warning' ? 'bg-yellow-500 text-white' :
    'bg-gray-800 text-white'
  }`;
  
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  
  // Remove after delay
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// COMPONENT LOADER
// ============================================

/**
 * Load HTML component into placeholder
 */
async function loadComponent(elementId, componentPath) {
  try {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const response = await fetch(componentPath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const html = await response.text();
    element.innerHTML = html;
    
    // Initialize component-specific scripts
    if (elementId === 'header-placeholder') {
      initHeader();
    }
    
    return true;
  } catch (error) {
    console.error(`Error loading component ${componentPath}:`, error);
    return false;
  }
}

/**
 * Load all page components
 */
async function loadAllComponents() {
  const components = [
    { id: 'header-placeholder', path: 'components/header.html' },
    { id: 'footer-placeholder', path: 'components/footer.html' },
    { id: 'profile-sidebar', path: 'components/profile-sidebar.html' }
  ];
  
  for (const comp of components) {
    if (document.getElementById(comp.id)) {
      await loadComponent(comp.id, comp.path);
    }
  }
}

// ============================================
// HEADER FUNCTIONALITY
// ============================================

// Kiểm tra và hiển thị thông tin user đăng nhập
function checkUserLogin() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  const loginBtn = document.getElementById('login-btn');
  const userInfo = document.getElementById('user-info');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const dropdownUserName = document.getElementById('dropdown-user-name');
  
  if (isLoggedIn && user) {
    // Ẩn nút đăng nhập, hiện thông tin user
    if (loginBtn) loginBtn.classList.add('hidden');
    if (userInfo) userInfo.classList.remove('hidden');
    
    // Cập nhật tên user
    if (userName) userName.textContent = user.ho_ten || 'Người dùng';
    if (dropdownUserName) dropdownUserName.textContent = user.ho_ten || 'Người dùng';
    
    // Cập nhật avatar
    if (userAvatar) {
      if (user.avt) {
        userAvatar.src = user.avt;
      } else {
        userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.ho_ten || 'U')}&background=dc2626&color=fff&size=128`;
      }
      userAvatar.onerror = function() {
        this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.ho_ten || 'U')}&background=dc2626&color=fff&size=128`;
      };
    }
  } else {
    // Hiện nút đăng nhập, ẩn thông tin user
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (userInfo) userInfo.classList.add('hidden');
  }
}

function initHeader() {
  // ===== USER AUTHENTICATION =====
  checkUserLogin();
  
  // Lắng nghe thay đổi localStorage
  window.addEventListener('storage', function(e) {
    if (e.key === 'user' || e.key === 'isLoggedIn') {
      checkUserLogin();
    }
  });

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        mobileMenuBtn.querySelector('i').classList.replace('fa-bars', 'fa-times');
      } else {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
      }
    });
  }
  
  // Mobile Search Toggle
  const mobileSearchBtn = document.getElementById('mobile-search-btn');
  const mobileSearchBar = document.getElementById('mobile-search-bar');
  
  if (mobileSearchBtn && mobileSearchBar) {
    mobileSearchBtn.addEventListener('click', function() {
      mobileSearchBar.classList.toggle('hidden');
    });
  }
  
  // Search functionality
  function handleSearch(inputElement) {
    const searchTerm = inputElement.value.trim();
    if (searchTerm) {
      window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
    }
  }
  
  // Desktop search
  const headerSearchInput = document.getElementById('header-search-input');
  const headerSearchBtn = document.getElementById('header-search-btn');
  
  if (headerSearchInput) {
    headerSearchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') handleSearch(headerSearchInput);
    });
  }
  
  if (headerSearchBtn) {
    headerSearchBtn.addEventListener('click', function() {
      handleSearch(headerSearchInput);
    });
  }
  
  // Mobile search
  const mobileSearchInput = document.getElementById('mobile-search-input');
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') handleSearch(mobileSearchInput);
    });
  }
  
  // Update cart badge
  updateCartBadge();
  
  // Highlight active menu
  highlightActiveMenu();
  
  // Header scroll effect
  initHeaderScroll();
}

/**
 * Lấy cart key theo user (mỗi user có giỏ hàng riêng)
 */
function getCartKey() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user && user.ma_kh) {
    return `cart_user_${user.ma_kh}`;
  }
  return 'cart_guest';
}

/**
 * Update cart badge count
 */
function updateCartBadge() {
  const cartBadges = document.querySelectorAll('.cart-badge, .mobile-cart-badge');
  const cartKey = getCartKey();
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  cartBadges.forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

/**
 * Highlight active menu item
 */
function highlightActiveMenu() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (!linkHref) return;
    
    const linkPath = linkHref.split('?')[0];
    
    if (linkPath === currentPath || 
        (currentPath === '' && linkPath === 'index.html') ||
        (currentPath === 'index.html' && linkPath === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/**
 * Header scroll effect
 */
function initHeaderScroll() {
  const header = document.querySelector('.header-wrapper');
  if (!header) return;
  
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/**
 * Toggle mobile submenu
 */
function toggleMobileSubmenu() {
  const submenu = document.getElementById('mobile-submenu');
  const icon = document.getElementById('submenu-icon');
  
  if (submenu && icon) {
    submenu.classList.toggle('show');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  }
}

// ============================================
// CART FUNCTIONALITY
// ============================================

/**
 * Kiểm tra user đã đăng nhập chưa
 */
function isLoggedIn() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return loggedIn && user && user.ma_kh;
}

/**
 * Hiển thị modal yêu cầu đăng nhập
 */
function showLoginRequiredModal() {
  // Xóa modal cũ nếu có
  const existingModal = document.getElementById('login-required-modal');
  if (existingModal) existingModal.remove();
  
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
  
  // Click outside to close
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeLoginModal();
  });
}

/**
 * Đóng modal yêu cầu đăng nhập
 */
function closeLoginModal() {
  const modal = document.getElementById('login-required-modal');
  if (modal) modal.remove();
}

/**
 * Add item to cart - YÊU CẦU ĐĂNG NHẬP
 */
function addToCart(product) {
  // Kiểm tra đăng nhập trước
  if (!isLoggedIn()) {
    showLoginRequiredModal();
    return;
  }
  
  const cartKey = getCartKey();
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
  
  const existingIndex = cart.findIndex(item => 
    item.id === product.id && 
    item.color === product.color && 
    item.storage === product.storage
  );
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartBadge();
  
  // Dispatch event for other components
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  
  showToast('Đã thêm vào giỏ hàng!', 'success');
}

/**
 * Remove item from cart
 */
function removeFromCart(index) {
  const cartKey = getCartKey();
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
  cart.splice(index, 1);
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartBadge();
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

/**
 * Update cart item quantity
 */
function updateCartQuantity(index, quantity) {
  const cartKey = getCartKey();
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
  if (quantity <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = quantity;
  }
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartBadge();
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

/**
 * Get cart total
 */
function getCartTotal() {
  const cartKey = getCartKey();
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
  return cart.reduce((total, item) => {
    return total + (parsePrice(item.price) * (item.quantity || 1));
  }, 0);
}

// ============================================
// SCROLL REVEAL
// ============================================

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  if (revealElements.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  revealElements.forEach(el => observer.observe(el));
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Load components
  loadAllComponents();
  
  // Initialize scroll reveal
  initScrollReveal();
  
  // Listen for storage changes (cart updates from other tabs)
  window.addEventListener('storage', function(e) {
    if (e.key === 'cart') {
      updateCartBadge();
    }
  });
});

// ============================================
// EXPORT TO WINDOW
// ============================================

window.formatPrice = formatPrice;
window.parsePrice = parsePrice;
window.showToast = showToast;
window.debounce = debounce;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.getCartTotal = getCartTotal;
window.updateCartBadge = updateCartBadge;
window.toggleMobileSubmenu = toggleMobileSubmenu;
window.isLoggedIn = isLoggedIn;
window.showLoginRequiredModal = showLoginRequiredModal;
window.closeLoginModal = closeLoginModal;

