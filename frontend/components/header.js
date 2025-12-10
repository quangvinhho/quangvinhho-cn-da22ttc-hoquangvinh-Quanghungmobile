// Header JavaScript - Mobile Menu & Search Functionality

const API_BASE_URL = 'http://localhost:3000/api';

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
    const notificationBellContainer = document.getElementById('notification-bell-container');
    const notificationBellContainerMobile = document.getElementById('notification-bell-container-mobile');
    
    if (isLoggedIn && user) {
      // Ẩn nút đăng nhập, hiện thông tin user
      if (loginBtn) loginBtn.classList.add('hidden');
      if (userInfo) userInfo.classList.remove('hidden');
      
      // Hiện chuông thông báo
      if (notificationBellContainer) {
        notificationBellContainer.classList.remove('hidden');
      }
      if (notificationBellContainerMobile) {
        notificationBellContainerMobile.classList.remove('hidden');
      }
      
      // Lưu userInfo vào localStorage cho notification bell
      localStorage.setItem('userInfo', JSON.stringify({
        ma_kh: user.ma_kh,
        id: user.ma_kh,
        email: user.email,
        ho_ten: user.ho_ten
      }));
      
      // Khởi tạo notification bell nếu chưa có
      if (typeof NotificationBell !== 'undefined') {
        if (!window.notificationBell) {
          window.notificationBell = new NotificationBell({
            apiUrl: API_BASE_URL,
            containerId: 'notification-bell-container'
          });
        } else {
          window.notificationBell.refresh();
        }
      } else if (typeof initNotificationBell === 'function') {
        initNotificationBell();
      }
      
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
      
      // Ẩn chuông thông báo
      if (notificationBellContainer) {
        notificationBellContainer.classList.add('hidden');
      }
      if (notificationBellContainerMobile) {
        notificationBellContainerMobile.classList.add('hidden');
      }
      
      // Xóa userInfo
      localStorage.removeItem('userInfo');
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

  // ===== SEARCH FUNCTIONALITY WITH DATABASE =====
  
  // Lấy thông tin user hiện tại
  function getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    return (isLoggedIn && user) ? user : null;
  }

  // Lưu từ khóa tìm kiếm vào database
  async function saveSearchKeyword(keyword) {
    const user = getCurrentUser();
    try {
      await fetch(`${API_BASE_URL}/search/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tu_khoa: keyword,
          ma_kh: user ? user.ma_kh : null
        })
      });
    } catch (error) {
      console.error('Lỗi lưu từ khóa tìm kiếm:', error);
    }
  }

  // Lấy gợi ý tìm kiếm từ database
  async function fetchSearchSuggestions(query) {
    const user = getCurrentUser();
    try {
      const params = new URLSearchParams({
        q: query || '',
        limit: 8
      });
      if (user) {
        params.append('ma_kh', user.ma_kh);
      }
      
      const response = await fetch(`${API_BASE_URL}/search/suggest?${params}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Lỗi lấy gợi ý tìm kiếm:', error);
      return [];
    }
  }

  // Xóa một từ khóa khỏi lịch sử
  async function deleteSearchHistory(keyword) {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
      await fetch(`${API_BASE_URL}/search/history`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tu_khoa: keyword,
          ma_kh: user.ma_kh
        })
      });
    } catch (error) {
      console.error('Lỗi xóa lịch sử tìm kiếm:', error);
    }
  }

  // Tạo dropdown gợi ý tìm kiếm
  function createSuggestionDropdown(inputElement) {
    // Kiểm tra xem dropdown đã tồn tại chưa
    let existingDropdown = inputElement.parentElement.querySelector('.search-suggestions');
    if (existingDropdown) {
      return existingDropdown;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'search-suggestions absolute top-full left-0 right-0 bg-white rounded-b-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50 hidden';
    dropdown.style.marginTop = '2px';
    
    // Thêm CSS cho container input
    inputElement.parentElement.style.position = 'relative';
    inputElement.parentElement.appendChild(dropdown);
    
    return dropdown;
  }

  // Hiển thị gợi ý tìm kiếm
  function renderSuggestions(dropdown, suggestions, inputElement) {
    if (!suggestions || suggestions.length === 0) {
      dropdown.classList.add('hidden');
      return;
    }

    const user = getCurrentUser();
    
    let html = '';
    
    // Header nếu có lịch sử tìm kiếm
    const hasHistory = suggestions.some(s => s.type === 'history');
    const hasProducts = suggestions.some(s => s.type === 'product' || s.type === 'hot');
    
    if (hasHistory && user && inputElement.value.trim() === '') {
      html += `
        <div class="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
          <span class="text-sm text-gray-600 font-medium">
            <i class="fas fa-history mr-2"></i>Lịch sử tìm kiếm
          </span>
          <button onclick="clearAllSearchHistory()" class="text-xs text-red-500 hover:text-red-700">
            Xóa tất cả
          </button>
        </div>
      `;
    }

    let addedProductHeader = false;

    suggestions.forEach((item, index) => {
      const isHistory = item.type === 'history';
      const isProduct = item.type === 'product' || item.type === 'hot';
      
      // Thêm header cho sản phẩm gợi ý
      if (isProduct && !addedProductHeader && hasHistory) {
        addedProductHeader = true;
        html += `
          <div class="flex items-center px-4 py-2 bg-blue-50 border-b">
            <span class="text-sm text-blue-600 font-medium">
              <i class="fas fa-mobile-alt mr-2"></i>Sản phẩm gợi ý
            </span>
          </div>
        `;
      }

      if (isHistory) {
        // Hiển thị lịch sử tìm kiếm
        html += `
          <div class="suggestion-item flex items-center justify-between px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors border-b border-gray-100" 
               data-text="${item.text}" data-index="${index}">
            <div class="flex items-center gap-3 flex-1" onclick="selectSuggestion('${item.text.replace(/'/g, "\\'")}', null)">
              <i class="fas fa-history text-gray-400 text-sm"></i>
              <span class="text-gray-800">${highlightMatch(item.text, inputElement.value)}</span>
            </div>
            <button onclick="event.stopPropagation(); removeSearchHistoryItem('${item.text.replace(/'/g, "\\'")}', this)" 
                    class="text-gray-400 hover:text-red-500 p-1 transition-colors">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
        `;
      } else if (isProduct) {
        // Hiển thị sản phẩm với hình ảnh và giá
        const formattedPrice = item.gia ? new Intl.NumberFormat('vi-VN').format(item.gia) + 'đ' : '';
        const productImage = item.anh_dai_dien || 'images/default-phone.png';
        
        html += `
          <div class="suggestion-item product-suggestion flex items-center gap-3 px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors border-b border-gray-100" 
               data-text="${item.text}" data-index="${index}" data-ma-sp="${item.ma_sp}"
               onclick="goToProductDetail(${item.ma_sp}, '${item.text.replace(/'/g, "\\'")}')">
            <div class="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <img src="${productImage}" alt="${item.text}" class="w-full h-full object-cover"
                   onerror="this.src='https://via.placeholder.com/48x48?text=📱'">
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-gray-800 font-medium truncate">${highlightMatch(item.text, inputElement.value)}</div>
              <div class="text-red-600 text-sm font-semibold">${formattedPrice}</div>
            </div>
            <i class="fas fa-chevron-right text-gray-300 text-sm"></i>
          </div>
        `;
      }
    });

    // Thêm nút xem tất cả kết quả nếu có từ khóa
    if (inputElement.value.trim() !== '' && hasProducts) {
      html += `
        <div class="px-4 py-3 bg-gray-50 border-t text-center">
          <button onclick="searchAllProducts('${inputElement.value.trim().replace(/'/g, "\\'")}')" 
                  class="text-red-600 hover:text-red-700 font-medium text-sm">
            <i class="fas fa-search mr-2"></i>Xem tất cả kết quả cho "${inputElement.value.trim()}"
          </button>
        </div>
      `;
    }

    dropdown.innerHTML = html;
    dropdown.classList.remove('hidden');
  }

  // Highlight từ khóa khớp
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong class="text-red-600">$1</strong>');
  }

  // Debounce function
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

  // Xử lý tìm kiếm chính
  async function handleSearch(inputElement) {
    const searchTerm = inputElement.value.trim();
    if (searchTerm) {
      // Lưu từ khóa vào database
      await saveSearchKeyword(searchTerm);
      
      // Chuyển đến trang sản phẩm
      window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
    }
  }

  // Khởi tạo search với suggestions
  function initSearchWithSuggestions(inputElement) {
    if (!inputElement) return;

    const dropdown = createSuggestionDropdown(inputElement);
    let selectedIndex = -1;

    // Fetch và hiển thị gợi ý khi gõ
    const debouncedFetch = debounce(async () => {
      const query = inputElement.value.trim();
      const suggestions = await fetchSearchSuggestions(query);
      renderSuggestions(dropdown, suggestions, inputElement);
      selectedIndex = -1;
    }, 300);

    // Sự kiện input
    inputElement.addEventListener('input', debouncedFetch);

    // Hiển thị lịch sử khi focus vào ô tìm kiếm
    inputElement.addEventListener('focus', async () => {
      const query = inputElement.value.trim();
      const suggestions = await fetchSearchSuggestions(query);
      renderSuggestions(dropdown, suggestions, inputElement);
    });

    // Ẩn dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
      if (!inputElement.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    // Xử lý phím điều hướng
    inputElement.addEventListener('keydown', (e) => {
      const items = dropdown.querySelectorAll('.suggestion-item');
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelectedItem(items, selectedIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelectedItem(items, selectedIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          const text = items[selectedIndex].dataset.text;
          inputElement.value = text;
          dropdown.classList.add('hidden');
          handleSearch(inputElement);
        } else {
          handleSearch(inputElement);
        }
      } else if (e.key === 'Escape') {
        dropdown.classList.add('hidden');
        selectedIndex = -1;
      }
    });
  }

  // Cập nhật item được chọn
  function updateSelectedItem(items, index) {
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('bg-red-50');
      } else {
        item.classList.remove('bg-red-50');
      }
    });
  }

  // Desktop search
  const headerSearchInput = document.getElementById("header-search-input");
  const headerSearchBtn = document.getElementById("header-search-btn");

  if (headerSearchInput) {
    initSearchWithSuggestions(headerSearchInput);
    
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
    initSearchWithSuggestions(mobileSearchInput);
    
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

// ===== GLOBAL FUNCTIONS FOR SEARCH SUGGESTIONS =====

// Chuyển đến trang chi tiết sản phẩm
function goToProductDetail(maSp, productName) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  // Ẩn dropdown
  document.querySelectorAll('.search-suggestions').forEach(dropdown => {
    dropdown.classList.add('hidden');
  });
  
  // Lưu từ khóa vào database
  fetch('http://localhost:3000/api/search/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tu_khoa: productName,
      ma_kh: (isLoggedIn && user) ? user.ma_kh : null
    })
  }).catch(err => console.log('Lỗi lưu tìm kiếm:', err));
  
  // Chuyển đến trang chi tiết sản phẩm
  window.location.href = `product-detail.html?id=${maSp}`;
}

// Tìm kiếm tất cả sản phẩm theo từ khóa
function searchAllProducts(keyword) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  // Ẩn dropdown
  document.querySelectorAll('.search-suggestions').forEach(dropdown => {
    dropdown.classList.add('hidden');
  });
  
  // Lưu từ khóa vào database
  fetch('http://localhost:3000/api/search/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tu_khoa: keyword,
      ma_kh: (isLoggedIn && user) ? user.ma_kh : null
    })
  }).catch(err => console.log('Lỗi lưu tìm kiếm:', err));
  
  // Chuyển đến trang sản phẩm với từ khóa
  window.location.href = `products.html?search=${encodeURIComponent(keyword)}`;
}

// Chọn gợi ý tìm kiếm (lịch sử)
function selectSuggestion(text, maSp) {
  const headerInput = document.getElementById("header-search-input");
  const mobileInput = document.getElementById("mobile-search-input");
  
  // Xác định input đang active
  const activeInput = document.activeElement === mobileInput ? mobileInput : headerInput;
  
  if (activeInput) {
    activeInput.value = text;
    
    // Ẩn dropdown
    const dropdown = activeInput.parentElement.querySelector('.search-suggestions');
    if (dropdown) dropdown.classList.add('hidden');
    
    // Thực hiện tìm kiếm
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Lưu từ khóa vào database
    fetch('http://localhost:3000/api/search/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tu_khoa: text,
        ma_kh: (isLoggedIn && user) ? user.ma_kh : null
      })
    }).then(() => {
      // Nếu có mã sản phẩm thì chuyển đến chi tiết, không thì tìm kiếm
      if (maSp) {
        window.location.href = `product-detail.html?id=${maSp}`;
      } else {
        window.location.href = `products.html?search=${encodeURIComponent(text)}`;
      }
    }).catch(() => {
      window.location.href = `products.html?search=${encodeURIComponent(text)}`;
    });
  }
}

// Xóa một từ khóa khỏi lịch sử
async function removeSearchHistoryItem(keyword, buttonElement) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn || !user) return;
  
  try {
    await fetch('http://localhost:3000/api/search/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tu_khoa: keyword,
        ma_kh: user.ma_kh
      })
    });
    
    // Xóa item khỏi DOM
    const item = buttonElement.closest('.suggestion-item');
    if (item) {
      item.remove();
    }
    
    // Kiểm tra nếu không còn item nào
    const dropdown = buttonElement.closest('.search-suggestions');
    if (dropdown && dropdown.querySelectorAll('.suggestion-item').length === 0) {
      dropdown.classList.add('hidden');
    }
  } catch (error) {
    console.error('Lỗi xóa lịch sử:', error);
  }
}

// Xóa tất cả lịch sử tìm kiếm
async function clearAllSearchHistory() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn || !user) return;
  
  if (!confirm('Bạn có chắc muốn xóa tất cả lịch sử tìm kiếm?')) return;
  
  try {
    await fetch(`http://localhost:3000/api/search/history/all/${user.ma_kh}`, {
      method: 'DELETE'
    });
    
    // Ẩn tất cả dropdown
    document.querySelectorAll('.search-suggestions').forEach(dropdown => {
      dropdown.classList.add('hidden');
    });
    
    alert('Đã xóa tất cả lịch sử tìm kiếm!');
  } catch (error) {
    console.error('Lỗi xóa tất cả lịch sử:', error);
  }
}

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
