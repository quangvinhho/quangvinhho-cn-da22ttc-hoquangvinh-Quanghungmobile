/* ============================================
   MAIN.JS - QuangHưng Mobile
   Global utilities and functions
   
   NOTE: Cấu trúc mới đã được tạo trong js/app.js
   File này được giữ lại để tương thích với các trang cũ.
   ============================================ */

// Format price to Vietnamese currency
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

// Parse price from string
function parsePrice(priceStr) {
  return parseInt(priceStr.replace(/[^\d]/g, '')) || 0;
}

// Debounce function for search
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

// Show toast notification
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
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Lấy cart key theo user (mỗi user có giỏ hàng riêng)
function getCartKey() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user && user.ma_kh) {
    return `cart_user_${user.ma_kh}`;
  }
  return 'cart_guest';
}

// Update cart badge
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

// Add to cart
function addToCart(product) {
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
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  showToast('Đã thêm vào giỏ hàng!', 'success');
}

// Initialize scroll reveal
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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  updateCartBadge();
  initScrollReveal();
  
  // Listen for storage changes
  window.addEventListener('storage', function(e) {
    if (e.key === 'cart') {
      updateCartBadge();
    }
  });
});

// Export for use in other files
if (typeof window !== 'undefined') {
  window.formatPrice = formatPrice;
  window.parsePrice = parsePrice;
  window.showToast = showToast;
  window.debounce = debounce;
  window.updateCartBadge = updateCartBadge;
  window.addToCart = addToCart;
}
