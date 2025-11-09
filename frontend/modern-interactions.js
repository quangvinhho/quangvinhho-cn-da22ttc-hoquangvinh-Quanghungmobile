// ===== MODERN E-COMMERCE INTERACTIONS =====
// Các hiệu ứng tương tác theo chuẩn thương mại điện tử hiện đại

document.addEventListener('DOMContentLoaded', function() {
  
  // 1. SCROLL TO TOP BUTTON
  createScrollToTopButton();
  
  // 2. LAZY LOAD IMAGES
  lazyLoadImages();
  
  // 3. PRODUCT CARD ANIMATIONS
  animateProductCards();
  
  // 4. SMOOTH SCROLL FOR ANCHOR LINKS
  smoothScrollLinks();
  
  // 5. ADD TO CART ANIMATION
  setupAddToCartButtons();
  
  // 6. SEARCH SUGGESTIONS
  setupSearchSuggestions();
  
  // 7. NOTIFICATION ANIMATIONS
  setupNotifications();
  
  // 8. PARALLAX EFFECTS
  setupParallaxEffects();
});

// 1. Scroll to Top Button
function createScrollToTopButton() {
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-to-top';
  scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  scrollBtn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(scrollBtn);
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });
  
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// 2. Lazy Load Images
function lazyLoadImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => img.classList.add('loaded'));
  }
}

// 3. Product Card Animations
function animateProductCards() {
  const cards = document.querySelectorAll('.product-card, [class*="min-w-"]');
  
  if ('IntersectionObserver' in window) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 50);
        }
      });
    }, {
      threshold: 0.1
    });
    
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'all 0.5s ease';
      cardObserver.observe(card);
    });
  }
}

// 4. Smooth Scroll for Anchor Links
function smoothScrollLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '#!') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}

// 5. Add to Cart Animation
function setupAddToCartButtons() {
  document.addEventListener('click', function(e) {
    if (e.target.closest('.add-to-cart-btn')) {
      const btn = e.target.closest('.add-to-cart-btn');
      const productCard = btn.closest('.product-card, [class*="min-w-"]');
      
      if (productCard) {
        // Tạo hiệu ứng bay vào giỏ hàng
        const productImg = productCard.querySelector('img');
        if (productImg) {
          createFlyToCartAnimation(productImg);
        }
        
        // Hiển thị thông báo
        showNotification('Đã thêm vào giỏ hàng!', 'success');
        
        // Cập nhật số lượng giỏ hàng
        updateCartCount();
      }
    }
  });
}

function createFlyToCartAnimation(imgElement) {
  const cartIcon = document.querySelector('[href="cart.html"]');
  if (!cartIcon) return;
  
  const flyingImg = imgElement.cloneNode(true);
  const imgRect = imgElement.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();
  
  flyingImg.style.position = 'fixed';
  flyingImg.style.top = imgRect.top + 'px';
  flyingImg.style.left = imgRect.left + 'px';
  flyingImg.style.width = imgRect.width + 'px';
  flyingImg.style.height = imgRect.height + 'px';
  flyingImg.style.zIndex = '9999';
  flyingImg.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  flyingImg.style.pointerEvents = 'none';
  
  document.body.appendChild(flyingImg);
  
  setTimeout(() => {
    flyingImg.style.top = cartRect.top + 'px';
    flyingImg.style.left = cartRect.left + 'px';
    flyingImg.style.width = '40px';
    flyingImg.style.height = '40px';
    flyingImg.style.opacity = '0';
  }, 10);
  
  setTimeout(() => {
    flyingImg.remove();
  }, 850);
}

function updateCartCount() {
  const cartBadge = document.querySelector('.notification-badge');
  if (cartBadge) {
    const currentCount = parseInt(cartBadge.textContent) || 0;
    cartBadge.textContent = currentCount + 1;
    
    // Animation
    cartBadge.style.transform = 'scale(1.3)';
    setTimeout(() => {
      cartBadge.style.transform = 'scale(1)';
    }, 200);
  }
}

// 6. Search Suggestions
function setupSearchSuggestions() {
  const searchInputs = document.querySelectorAll('#desktop-search-input, #mobile-search-input');
  
  searchInputs.forEach(input => {
    let suggestionsContainer = input.parentElement.querySelector('.search-suggestions');
    
    if (!suggestionsContainer) {
      suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'search-suggestions';
      input.parentElement.appendChild(suggestionsContainer);
    }
    
    input.addEventListener('input', function() {
      const query = this.value.trim();
      
      if (query.length >= 2) {
        // Giả lập gợi ý tìm kiếm
        const suggestions = [
          'iPhone 16 Pro Max',
          'Samsung Galaxy S25 Ultra',
          'Sony Xperia 1 VI',
          'Google Pixel 9 Pro',
          'Xiaomi 14 Ultra'
        ].filter(item => item.toLowerCase().includes(query.toLowerCase()));
        
        if (suggestions.length > 0) {
          suggestionsContainer.innerHTML = suggestions.map(item => 
            `<div class="suggestion-item">${item}</div>`
          ).join('');
          suggestionsContainer.classList.add('active');
        } else {
          suggestionsContainer.classList.remove('active');
        }
      } else {
        suggestionsContainer.classList.remove('active');
      }
    });
    
    // Click vào suggestion
    suggestionsContainer.addEventListener('click', function(e) {
      if (e.target.classList.contains('suggestion-item')) {
        input.value = e.target.textContent;
        suggestionsContainer.classList.remove('active');
        // Trigger search
        const searchBtn = input.parentElement.querySelector('button');
        if (searchBtn) searchBtn.click();
      }
    });
    
    // Đóng suggestions khi click ra ngoài
    document.addEventListener('click', function(e) {
      if (!input.parentElement.contains(e.target)) {
        suggestionsContainer.classList.remove('active');
      }
    });
  });
}

// 7. Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${type === 'success' ? '#00752e' : type === 'error' ? '#d91e23' : '#4a4a4a'};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    animation: slideInRight 0.3s ease;
  `;
  
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  notification.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

function setupNotifications() {
  // Notification system is ready
}

// 8. Parallax Effects
function setupParallaxEffects() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  if (parallaxElements.length === 0) return;
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach(element => {
      const speed = element.dataset.parallax || 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  });
}

// 9. Product Quick View (Bonus)
function setupQuickView() {
  document.addEventListener('click', function(e) {
    if (e.target.closest('.quick-view-btn')) {
      e.preventDefault();
      const productCard = e.target.closest('.product-card');
      // Implement quick view modal here
      showNotification('Tính năng xem nhanh đang được phát triển', 'info');
    }
  });
}

// 10. Wishlist Toggle (Bonus)
function setupWishlist() {
  document.addEventListener('click', function(e) {
    if (e.target.closest('.wishlist-btn')) {
      e.preventDefault();
      const btn = e.target.closest('.wishlist-btn');
      const icon = btn.querySelector('i');
      
      if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        showNotification('Đã thêm vào yêu thích!', 'success');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        showNotification('Đã xóa khỏi yêu thích', 'info');
      }
    }
  });
}

// Initialize bonus features
setupQuickView();
setupWishlist();

// Export functions for external use
window.ecommerceUtils = {
  showNotification,
  updateCartCount,
  createFlyToCartAnimation
};


// ===== ADVANCED PRODUCT ANIMATIONS =====

// 11. Product Card Entrance Animations
function initProductEntranceAnimations() {
  const productCards = document.querySelectorAll('.product-card, [class*="min-w-"]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animate-in');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  productCards.forEach(card => {
    observer.observe(card);
  });
}

// 12. Add Product Overlay Buttons
function addProductOverlays() {
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    const imgWrapper = card.querySelector('img')?.parentElement;
    if (!imgWrapper || imgWrapper.querySelector('.product-overlay')) return;
    
    imgWrapper.classList.add('product-image-wrapper');
    
    const overlay = document.createElement('div');
    overlay.className = 'product-overlay';
    overlay.innerHTML = `
      <button class="product-overlay-btn quick-view-btn" title="Xem nhanh">
        <i class="fas fa-eye"></i>
      </button>
      <button class="product-overlay-btn wishlist-btn" title="Yêu thích">
        <i class="far fa-heart"></i>
      </button>
      <button class="product-overlay-btn compare-btn" title="So sánh">
        <i class="fas fa-exchange-alt"></i>
      </button>
    `;
    
    imgWrapper.appendChild(overlay);
  });
}

// 13. Wishlist Toggle with Animation
function setupWishlistAnimation() {
  document.addEventListener('click', function(e) {
    const wishlistBtn = e.target.closest('.wishlist-btn');
    if (wishlistBtn) {
      e.preventDefault();
      e.stopPropagation();
      
      const icon = wishlistBtn.querySelector('i');
      wishlistBtn.classList.add('active');
      
      if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        showNotification('❤️ Đã thêm vào yêu thích!', 'success');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        showNotification('Đã xóa khỏi yêu thích', 'info');
      }
      
      setTimeout(() => {
        wishlistBtn.classList.remove('active');
      }, 600);
    }
  });
}

// 14. Product Image Zoom on Click
function setupImageZoom() {
  document.addEventListener('click', function(e) {
    const productImg = e.target.closest('.product-card img');
    if (productImg && !e.target.closest('.product-overlay')) {
      productImg.classList.toggle('zoomed');
      
      setTimeout(() => {
        productImg.classList.remove('zoomed');
      }, 300);
    }
  });
}

// 15. Countdown Timer Animation
function animateCountdown() {
  const countdownItems = document.querySelectorAll('.countdown-item');
  
  setInterval(() => {
    countdownItems.forEach(item => {
      item.style.animation = 'none';
      setTimeout(() => {
        item.style.animation = 'flip-number 0.6s ease-in-out';
      }, 10);
    });
  }, 1000);
}

// 16. Stock Progress Bar Animation
function animateStockProgress() {
  const progressBars = document.querySelectorAll('.progress-fill');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const progressBar = entry.target;
        const targetWidth = progressBar.style.width || '0%';
        progressBar.style.width = '0%';
        
        setTimeout(() => {
          progressBar.style.width = targetWidth;
        }, 100);
        
        observer.unobserve(progressBar);
      }
    });
  });
  
  progressBars.forEach(bar => {
    bar.parentElement.classList.add('stock-progress');
    observer.observe(bar);
  });
}

// 17. Add Shimmer Effect to Product Cards
function addShimmerEffect() {
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.animation = 'card-glow 1.5s ease-in-out infinite';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.animation = 'none';
    });
  });
}

// 18. Stagger Animation for Product Grid
function staggerProductGrid() {
  const grids = document.querySelectorAll('.product-grid');
  
  grids.forEach(grid => {
    const cards = grid.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  });
}

// 19. Add Floating Effect to Featured Products
function addFloatingEffect() {
  const featuredProducts = document.querySelectorAll('[data-featured="true"]');
  
  featuredProducts.forEach(product => {
    product.classList.add('product-featured');
  });
}

// 20. Price Animation on Hover
function animatePriceOnHover() {
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    const priceElement = card.querySelector('.price-current');
    if (!priceElement) return;
    
    card.addEventListener('mouseenter', function() {
      priceElement.style.transform = 'scale(1.1)';
      priceElement.style.color = '#ff1744';
    });
    
    card.addEventListener('mouseleave', function() {
      priceElement.style.transform = 'scale(1)';
      priceElement.style.color = '#d91e23';
    });
  });
}

// 21. Add Quick View Modal
function setupQuickViewModal() {
  document.addEventListener('click', function(e) {
    if (e.target.closest('.quick-view-btn')) {
      e.preventDefault();
      e.stopPropagation();
      
      const productCard = e.target.closest('.product-card');
      const productName = productCard.querySelector('h4')?.textContent || 'Sản phẩm';
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'quick-view-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      `;
      
      modal.innerHTML = `
        <div style="
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 600px;
          width: 90%;
          position: relative;
          animation: slideUp 0.3s ease;
        ">
          <button class="close-modal" style="
            position: absolute;
            top: 16px;
            right: 16px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #f0f0f0;
            border: none;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <i class="fas fa-times"></i>
          </button>
          
          <h3 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px;">
            ${productName}
          </h3>
          
          <div style="text-align: center; margin: 24px 0;">
            <img src="${productCard.querySelector('img')?.src}" 
                 alt="${productName}"
                 style="max-width: 100%; height: auto; max-height: 300px; object-fit: contain;" />
          </div>
          
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="btn-primary" style="flex: 1;">
              <i class="fas fa-cart-plus"></i> Thêm vào giỏ
            </button>
            <button class="btn-secondary" style="flex: 1;">
              Xem chi tiết
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Close modal
      modal.addEventListener('click', function(e) {
        if (e.target === modal || e.target.closest('.close-modal')) {
          modal.style.animation = 'fadeOut 0.3s ease';
          setTimeout(() => modal.remove(), 300);
        }
      });
    }
  });
}

// Add CSS animations for modal
const modalStyles = document.createElement('style');
modalStyles.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(modalStyles);

// Initialize all advanced animations
document.addEventListener('DOMContentLoaded', function() {
  initProductEntranceAnimations();
  addProductOverlays();
  setupWishlistAnimation();
  setupImageZoom();
  animateCountdown();
  animateStockProgress();
  addShimmerEffect();
  staggerProductGrid();
  addFloatingEffect();
  animatePriceOnHover();
  setupQuickViewModal();
  
  console.log('✨ Advanced product animations initialized!');
});

// Export for external use
window.productAnimations = {
  initProductEntranceAnimations,
  addProductOverlays,
  animateStockProgress,
  addFloatingEffect
};
