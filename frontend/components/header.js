// Header JavaScript - Mobile Menu & Search Functionality

(function initHeader() {
  // ===== USER AUTHENTICATION =====
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
          // Avatar mặc định với chữ cái đầu
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
  
  // Kiểm tra đăng nhập khi load trang
  checkUserLogin();
  
  // Lắng nghe thay đổi localStorage (đăng nhập/đăng xuất từ tab khác)
  window.addEventListener('storage', function(e) {
    if (e.key === 'user' || e.key === 'isLoggedIn') {
      checkUserLogin();
    }
  });
  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  // Toggle mobile menu
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", function () {
      const isHidden = mobileMenu.classList.contains("hidden");
      if (isHidden) {
        mobileMenu.classList.remove("hidden");
        mobileMenuBtn
          .querySelector("i")
          .classList.replace("fa-bars", "fa-times");
      } else {
        mobileMenu.classList.add("hidden");
        mobileMenuBtn
          .querySelector("i")
          .classList.replace("fa-times", "fa-bars");
      }
    });
  }

  // Mobile Search Toggle
  const mobileSearchBtn = document.getElementById("mobile-search-btn");
  const mobileSearchBar = document.getElementById("mobile-search-bar");

  if (mobileSearchBtn && mobileSearchBar) {
    mobileSearchBtn.addEventListener("click", function () {
      mobileSearchBar.classList.toggle("hidden");
    });
  }

  // Search functionality
  function handleSearch(inputElement) {
    const searchTerm = inputElement.value.trim();
    if (searchTerm) {
      window.location.href = `products.html?search=${encodeURIComponent(
        searchTerm
      )}`;
    }
  }

  // Desktop search
  const headerSearchInput = document.getElementById("header-search-input");
  const headerSearchBtn = document.getElementById("header-search-btn");

  if (headerSearchInput) {
    headerSearchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        handleSearch(headerSearchInput);
      }
    });
  }

  if (headerSearchBtn) {
    headerSearchBtn.addEventListener("click", function () {
      handleSearch(headerSearchInput);
    });
  }

  // Mobile search input
  const mobileSearchInput = document.getElementById("mobile-search-input");

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        handleSearch(mobileSearchInput);
      }
    });
  }

  // Lấy cart key theo user (mỗi user có giỏ hàng riêng)
  function getCartKey() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.ma_kh) {
      return `cart_user_${user.ma_kh}`;
    }
    return 'cart_guest';
  }

  // Update cart badge from localStorage
  function updateCartBadge() {
    const cartBadges = document.querySelectorAll(
      ".cart-badge, .mobile-cart-badge"
    );
    const cartCount = document.querySelector(".cart-count");

    // Lấy giỏ hàng theo user
    const cartKey = getCartKey();
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const totalItems = cart.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
    );

    cartBadges.forEach((badge) => {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? "inline-block" : "none";
    });

    if (cartCount) {
      cartCount.textContent =
        totalItems > 0 ? `${totalItems} sản phẩm` : "0 sản phẩm";
    }
  }

  // Update cart badge on page load
  updateCartBadge();

  // Listen for cart updates
  window.addEventListener("storage", function (e) {
    if (e.key === "cart") {
      updateCartBadge();
    }
  });

  // Custom event for cart updates on same page
  window.addEventListener("cartUpdated", updateCartBadge);

  // Highlight active menu item
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const currentSearch = window.location.search;
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const linkHref = link.getAttribute("href");
    const linkPath = linkHref.split("?")[0];
    const linkSearch = linkHref.includes("?") ? "?" + linkHref.split("?")[1] : "";

    // Check if both path and query string match
    if (linkPath === currentPath && linkSearch === currentSearch) {
      link.classList.add("active");
    } else if (currentPath === "index.html" && linkHref === "index.html") {
      link.classList.add("active");
    }
  });

  // Fixed header on scroll with effects
  const header = document.querySelector(".header-wrapper");

  window.addEventListener("scroll", function () {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      // Tăng shadow khi cuộn
      if (header) {
        header.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
      }
    } else {
      // Shadow nhẹ hơn
      if (header) {
        header.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
      }
    }
  });
})();

// Toggle mobile submenu function
function toggleMobileSubmenu() {
  const submenu = document.getElementById("mobile-submenu");
  const icon = document.getElementById("submenu-icon");

  if (submenu && icon) {
    if (submenu.classList.contains("show")) {
      submenu.classList.remove("show");
      // Switch icon to bars when closed
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    } else {
      submenu.classList.add("show");
      // Switch icon to close (X) when open
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-times");
    }
  }
}

// Hàm đăng xuất
function handleLogout() {
  // Xóa thông tin user khỏi localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('isAdmin');
  
  // Thông báo
  alert('Đăng xuất thành công!');
  
  // Chuyển về trang chủ
  window.location.href = 'index.html';
}
