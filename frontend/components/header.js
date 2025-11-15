// Header JavaScript - Mobile Menu & Search Functionality

(function initHeader() {
  // Mobile Menu Toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileMenuClose = document.getElementById('mobile-menu-close');

  // Open mobile menu
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      mobileMenu.classList.add('active');
      mobileMenuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  // Close mobile menu
  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  }

  // Mobile submenu toggle
  const submenuToggles = document.querySelectorAll('.mobile-nav-menu .submenu-toggle');
  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const submenu = this.nextElementSibling;
      const icon = this.querySelector('.fa-chevron-down');
      
      if (submenu) {
        submenu.classList.toggle('active');
        if (icon) {
          icon.style.transform = submenu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
        }
      }
    });
  });

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
      if (e.key === 'Enter') {
        handleSearch(headerSearchInput);
      }
    });
  }

  if (headerSearchBtn) {
    headerSearchBtn.addEventListener('click', function() {
      handleSearch(headerSearchInput);
    });
  }

  // Mobile search
  const mobileSearchInput = document.getElementById('mobile-search-input');
  const mobileSearchBtn = document.getElementById('mobile-search-btn');

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleSearch(mobileSearchInput);
      }
    });
  }

  if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener('click', function() {
      handleSearch(mobileSearchInput);
    });
  }

  // Update cart badge from localStorage
  function updateCartBadge() {
    const cartBadges = document.querySelectorAll('.cart-badge, .mobile-cart-badge');
    const cartCount = document.querySelector('.cart-count');
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    cartBadges.forEach(badge => {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
    });
    
    if (cartCount) {
      cartCount.textContent = totalItems > 0 ? `${totalItems} sản phẩm` : '0 sản phẩm';
    }
  }

  // Update cart badge on page load
  updateCartBadge();

  // Listen for cart updates
  window.addEventListener('storage', function(e) {
    if (e.key === 'cart') {
      updateCartBadge();
    }
  });

  // Custom event for cart updates on same page
  window.addEventListener('cartUpdated', updateCartBadge);

  // Highlight active menu item
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('?')[0];
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Fixed header on scroll with effects
  let lastScroll = 0;
  const header = document.querySelector('.header-wrapper');
  
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      // Tăng shadow khi cuộn
      if (header) {
        header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
      }
    } else {
      // Shadow nhẹ hơn
      if (header) {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      }
    }
    
    lastScroll = currentScroll;
  });
})();
