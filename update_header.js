const fs = require('fs');
const content = \<!-- ===== HEADER (Giao diện Mới Cải Tiến) ===== -->
<header class="header-wrapper bg-[#D70018] shadow-md fixed top-0 left-0 right-0 z-50 w-full font-sans text-white">
  <!-- Thanh chứa rộng hơn: max-w-[1400px], chiều cao to hơn: h-[68px] md:h-[72px] -->
  <div class="main-header py-1 md:py-2 flex items-center justify-between max-w-[1400px] mx-auto px-3 lg:px-6 gap-3 lg:gap-4 h-[64px] md:h-[72px]">
    
    <!-- 1. Logo -->
    <a href="index.html" class="flex items-center gap-2 no-underline text-white flex-shrink-0 mr-2 lg:mr-4">
      <img src="images/logo.png" alt="Logo" class="w-11 h-11 md:w-12 md:h-12 rounded-lg bg-white p-0.5 object-cover" />
      <div class="hidden lg:block">
        <h1 class="text-xl xl:text-2xl font-bold tracking-tight leading-none mb-1">QuangHưng Mobile</h1>
        <p class="text-[11px] text-red-100 uppercase tracking-wide leading-none font-medium">Uy tín - Chất lượng - Giá tốt</p>
      </div>
    </a>

    <!-- 2. Nút Danh Mục (Chữ to hơn, Icon rõ hơn) -->
    <div class="hidden lg:block relative group flex-shrink-0 z-50">
      <button class="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-lg transition-colors font-bold text-[15px]">
        <i class="fas fa-bars text-xl"></i> <span class="hidden xl:inline">Danh mục</span>
      </button>
      <ul class="absolute hidden group-hover:block bg-white text-gray-800 shadow-xl rounded-lg w-56 text-[15px] top-full mt-1.5 left-0 border border-gray-100 overflow-hidden font-medium">
        <li><a href="products.html?brand=apple" class="flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 hover:text-red-600 no-underline transition-colors"><i class="fab fa-apple w-5 text-center text-xl text-gray-600 group-hover:text-red-600"></i> iPhone</a></li>
        <li><a href="products.html?category=ipad" class="flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 hover:text-red-600 no-underline transition-colors"><i class="fas fa-tablet-alt w-5 text-center text-xl text-gray-600 group-hover:text-red-600"></i> iPad</a></li>
        <li><a href="products.html?brand=samsung" class="flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 hover:text-red-600 no-underline transition-colors"><i class="fab fa-android w-5 text-center text-xl text-gray-600 group-hover:text-red-600"></i> Samsung</a></li>
        <li><a href="products.html?brand=oppo" class="flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 hover:text-red-600 no-underline transition-colors"><i class="fas fa-mobile w-5 text-center text-xl text-gray-600 group-hover:text-red-600"></i> OPPO</a></li>
        <li><a href="products.html?brand=xiaomi" class="flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 hover:text-red-600 no-underline transition-colors"><i class="fas fa-mobile-alt w-5 text-center text-xl text-gray-600 group-hover:text-red-600"></i> Xiaomi</a></li>
        <li><a href="products.html?category=phukien" class="flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 hover:text-red-600 no-underline transition-colors border-t border-gray-50"><i class="fas fa-headphones w-5 text-center text-xl text-gray-600 group-hover:text-red-600"></i> Phụ kiện</a></li>
        <li><a href="about.html" class="flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 hover:text-red-600 no-underline transition-colors border-t border-gray-50"><i class="fas fa-info-circle w-5 text-center text-xl text-gray-600 group-hover:text-red-600"></i> Giới thiệu</a></li>
      </ul>
    </div>

    <!-- 3. Thanh tìm kiếm Pill Style (Thu nhỏ vừa đủ dùng: max-w-[320px]) -->
    <div class="hidden md:flex lg:flex-grow-0 items-center bg-white rounded-full overflow-hidden w-[340px] max-w-[340px] shadow-sm relative h-[42px] search-container">
      <input id="header-search-input" type="text" class="flex-grow px-4 py-2 bg-transparent text-[14px] text-gray-800 outline-none placeholder-gray-500 font-medium" placeholder="Tìm kiếm..." autocomplete="off" />
      <button class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 flex items-center justify-center rounded-full h-[34px] transition-colors mr-1 shrink-0"><i class="fas fa-search text-[15px]"></i></button>
      <button id="voice-search-btn" class="text-gray-500 hover:text-red-600 px-3 bg-white border-l border-gray-200 transition-colors h-[42px] shrink-0" title="Tìm kiếm bằng giọng nói"><i class="fas fa-microphone text-[17px]"></i></button>
    </div>

    <!-- Mobile Search Toggle -->
    <button id="mobile-search-btn" class="md:hidden text-white p-2 ml-auto hover:bg-white/10 rounded-full"><i class="fas fa-search text-[22px]"></i></button>
    
    <!-- Mobile Notification Bell Container -->
    <div id="notification-bell-container-mobile" class="md:hidden flex items-center"></div>

    <!-- 4. Right Actions (Icon to hơn, chữ to hơn) -->
    <div class="hidden md:flex items-center justify-end flex-grow gap-2 lg:gap-4 flex-shrink-0 text-white">
      
      <!-- Gọi mua hàng -->
      <a href="tel:18006018" class="flex flex-col items-center justify-center hover:text-yellow-300 no-underline text-white group transition-colors px-1">
        <i class="fas fa-phone-volume text-[22px] lg:text-[24px] mb-1 font-light group-hover:scale-110 transition-transform"></i>
        <div class="hidden xl:block text-[12px] lg:text-[13px] font-bold leading-tight text-center whitespace-normal">Gọi mua hàng</div>
      </a>
      
      <!-- Cửa hàng gần bạn -->
      <a href="stores.html" class="flex flex-col items-center justify-center hover:text-yellow-300 no-underline text-white group transition-colors px-1">
        <i class="fas fa-store text-[22px] lg:text-[24px] mb-1 font-light group-hover:scale-110 transition-transform"></i>
        <div class="hidden xl:block text-[12px] lg:text-[13px] font-bold leading-tight text-center whitespace-normal">Cửa hàng</div>
      </a>

      <!-- Tra cứu đơn hàng -->
      <a href="profile.html#orders" class="flex flex-col items-center justify-center hover:text-yellow-300 no-underline text-white group transition-colors px-1">
        <i class="fas fa-file-invoice text-[22px] lg:text-[24px] mb-1 font-light group-hover:scale-110 transition-transform"></i>
        <div class="hidden xl:block text-[12px] lg:text-[13px] font-bold leading-tight text-center whitespace-normal">Tra cứu</div>
      </a>

      <!-- Khuyến mãi -->
      <a href="promotions.html" class="flex flex-col items-center justify-center hover:text-yellow-300 no-underline text-white group transition-colors px-1">
        <i class="fas fa-tags text-[22px] lg:text-[24px] mb-1 font-light group-hover:scale-110 transition-transform"></i>
        <div class="hidden xl:block text-[12px] lg:text-[13px] font-bold leading-tight text-center whitespace-normal">Khuyến mãi</div>
      </a>

      <!-- Tin tức / Hỗ trợ -->
      <a href="news.html" class="flex flex-col items-center justify-center hover:text-yellow-300 no-underline text-white group transition-colors px-1">
        <i class="fas fa-newspaper text-[22px] lg:text-[24px] mb-1 font-light group-hover:scale-110 transition-transform"></i>
        <div class="hidden xl:block text-[12px] lg:text-[13px] font-bold leading-tight text-center whitespace-normal">Tin công nghệ</div>
      </a>
      
      <!-- Notification Desktop -->
      <div id="notification-bell-container" class="hidden flex-col items-center justify-center px-1"></div>

      <!-- Giỏ hàng (Nổi bật hơn) -->
      <a href="cart.html" class="relative flex flex-col items-center justify-center hover:text-yellow-300 no-underline text-white group transition-colors px-2 ml-1">
        <div class="relative">
          <i class="fas fa-shopping-cart text-[24px] lg:text-[26px] mb-1 font-light group-hover:scale-110 transition-transform"></i>
          <span class="cart-badge absolute -top-1.5 -right-3.5 bg-yellow-400 text-red-700 text-[11px] font-black w-[20px] h-[20px] flex items-center justify-center rounded-full border-[2px] border-[#D70018]">0</span>
        </div>
        <div class="hidden xl:block text-[12px] lg:text-[14px] font-black leading-tight text-center mt-0.5 text-yellow-300">Giỏ hàng</div>
      </a>

      <!-- User Login / Profile -->
      <div class="relative group ml-1">
        <a href="login.html" id="login-btn" class="flex flex-col items-center justify-center hover:text-yellow-300 no-underline text-white transition-colors px-1">
          <i class="fas fa-user-circle text-[24px] lg:text-[26px] mb-1 font-light group-hover:scale-110 transition-transform"></i>
          <div class="hidden xl:block text-[12px] lg:text-[13px] font-bold leading-tight text-center">Đăng nhập</div>
        </a>

        <!-- Logged In User -->
        <div id="user-info" class="hidden relative group flex-col items-center justify-center cursor-pointer py-1 ml-2">
          <div class="flex flex-col items-center group-hover:text-yellow-300 transition-colors">
            <img id="user-avatar" src="" alt="Avatar" class="w-8 h-8 mb-0.5 rounded-full object-cover border-[1.5px] border-white/80 group-hover:border-yellow-300">
            <span id="user-name" class="hidden xl:block text-[12px] lg:text-[13px] font-bold max-w-[80px] truncate whitespace-nowrap leading-none">User</span>
          </div>
          
          <!-- Dropdown Profile -->
          <div class="absolute right-0 top-[100%] mt-3 bg-white rounded-lg shadow-xl w-56 py-2 hidden group-hover:block z-50 border border-gray-100 text-gray-800 text-left">
            <div class="px-4 py-3 border-b border-gray-100 min-w-0">
              <p class="text-sm text-gray-500 mb-0.5">Xin chào,</p>
              <p id="dropdown-user-name" class="font-bold text-[15px] truncate">Tên user</p>
            </div>
            <a href="profile.html" class="flex items-center gap-3 px-4 py-3 text-[15px] font-medium hover:bg-red-50 hover:text-red-600 no-underline transition-colors"><i class="fas fa-user w-5 text-center text-gray-400 text-lg"></i> Tài khoản của tôi</a>
            <a href="profile.html#orders" class="flex items-center gap-3 px-4 py-3 text-[15px] font-medium hover:bg-red-50 hover:text-red-600 no-underline transition-colors"><i class="fas fa-box w-5 text-center text-gray-400 text-lg"></i> Đơn hàng</a>
            <a href="profile.html#wishlist" class="flex items-center gap-3 px-4 py-3 text-[15px] font-medium hover:bg-red-50 hover:text-red-600 no-underline transition-colors"><i class="fas fa-heart w-5 text-center text-gray-400 text-lg"></i> Yêu thích</a>
            <a href="notifications.html" class="flex items-center gap-3 px-4 py-3 text-[15px] font-medium hover:bg-red-50 hover:text-red-600 no-underline transition-colors relative"><i class="fas fa-bell w-5 text-center text-gray-400 text-lg"></i> Thông báo <span id="dropdown-notif-badge" class="ml-auto bg-red-500 text-white text-[11px] px-2 py-0.5 rounded-full hidden">0</span></a>
            <div class="border-t border-gray-100 mt-2 pt-2">
              <button onclick="handleLogout()" class="flex items-center gap-3 px-4 py-3 text-[15px] text-red-600 hover:bg-red-50 w-full text-left font-bold transition-colors"><i class="fas fa-sign-out-alt w-5 text-center text-lg"></i> Đăng xuất</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Button -->
    <button id="mobile-menu-btn" class="lg:hidden text-white p-2 ml-2 hover:bg-white/10 rounded-lg"><i class="fas fa-bars text-[22px]"></i></button>

  </div> <!-- End Main Header -->

  <!-- Mobile Search Bar Content (Hidden by default) -->
  <div id="mobile-search-bar" class="hidden md:hidden px-3 pb-3 pt-1 bg-[#D70018]">
    <div class="flex items-center bg-white rounded-full overflow-hidden shadow-inner h-[46px] search-container">
      <input id="mobile-search-input" type="text" class="flex-grow px-4 py-2 bg-transparent text-[15px] text-gray-800 outline-none placeholder-gray-500 font-medium" placeholder="Tìm kiếm điện thoại..." autocomplete="off" />
      <button class="bg-gray-100 text-gray-800 px-5 flex items-center justify-center h-[34px] rounded-full mr-1.5"><i class="fas fa-search text-[16px]"></i></button>
      <button id="mobile-voice-search-btn" class="text-gray-500 hover:text-red-600 px-4 border-l border-gray-200 h-[46px]"><i class="fas fa-microphone text-[18px]"></i></button>
    </div>
  </div>

  <!-- Mobile Menu Navigation (Hidden by default) -->
  <div id="mobile-menu" class="hidden lg:hidden bg-white text-gray-800 shadow-xl border-t border-gray-100 absolute top-full left-0 w-full z-40 max-h-[85vh] overflow-y-auto">
    <nav class="flex flex-col text-[16px]">
      <a href="index.html" class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 border-b border-gray-100 no-underline font-medium"><i class="fas fa-home w-6 text-center text-red-600 text-xl"></i> Trang chủ</a>
      <a href="about.html" class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 border-b border-gray-100 no-underline font-medium"><i class="fas fa-info-circle w-6 text-center text-red-600 text-xl"></i> Giới thiệu</a>
      
      <!-- Mobile Submenu for Products -->
      <div class="flex flex-col border-b border-gray-100">
        <div class="flex items-center justify-between px-5 py-3 hover:bg-gray-50 font-medium">
          <a href="products.html" class="flex items-center gap-4 flex-grow no-underline text-gray-800 py-1"><i class="fas fa-layer-group w-6 text-center text-red-600 text-xl"></i> Sản phẩm</a>
          <button onclick="toggleMobileSubmenu()" class="p-3 -mr-3 text-gray-500"><i class="fas fa-chevron-down text-lg" id="submenu-icon"></i></button>
        </div>
        <div id="mobile-submenu" class="hidden bg-gray-50 py-3 border-t border-gray-100">
           <a href="products.html?brand=apple" class="flex items-center gap-4 px-10 py-3 text-gray-700 hover:text-red-600 no-underline"><i class="fab fa-apple w-6 text-center text-[22px]"></i> iPhone</a>
           <a href="products.html?category=ipad" class="flex items-center gap-4 px-10 py-3 text-gray-700 hover:text-red-600 no-underline"><i class="fas fa-tablet-alt w-6 text-center text-[22px]"></i> iPad</a>
           <a href="products.html?brand=samsung" class="flex items-center gap-4 px-10 py-3 text-gray-700 hover:text-red-600 no-underline"><i class="fab fa-android w-6 text-center text-[22px]"></i> Samsung</a>
           <a href="products.html?brand=oppo" class="flex items-center gap-4 px-10 py-3 text-gray-700 hover:text-red-600 no-underline"><i class="fas fa-mobile w-6 text-center text-[22px]"></i> OPPO</a>
           <a href="products.html?brand=xiaomi" class="flex items-center gap-4 px-10 py-3 text-gray-700 hover:text-red-600 no-underline"><i class="fas fa-mobile-alt w-6 text-center text-[22px]"></i> Xiaomi</a>
           <a href="products.html?category=phukien" class="flex items-center gap-4 px-10 py-3 text-gray-700 hover:text-red-600 no-underline"><i class="fas fa-headphones w-6 text-center text-[22px]"></i> Phụ kiện</a>
        </div>
      </div>

      <a href="promotions.html" class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 border-b border-gray-100 no-underline font-medium"><i class="fas fa-tags w-6 text-center text-red-600 text-xl"></i> Khuyến mãi</a>
      <a href="news.html" class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 border-b border-gray-100 no-underline font-medium"><i class="fas fa-newspaper w-6 text-center text-red-600 text-xl"></i> Tin tức</a>
      <a href="contact.html" class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 no-underline font-medium"><i class="fas fa-headset w-6 text-center text-red-600 text-xl"></i> Hỗ trợ</a>
    </nav>
  </div>
</header>\;
fs.writeFileSync('d:\\\\GDDA\\\\frontend\\\\components\\\\header.html', content, { encoding: 'utf8' });
console.log('Done!');
