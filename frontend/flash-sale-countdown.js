/**
 * Flash Sale Countdown Timer
 * Đếm ngược thời gian cho phần Giá Sốc
 */

// Thiết lập thời gian kết thúc (ví dụ: 12 giờ 45 phút 30 giây từ bây giờ)
function initFlashSaleCountdown() {
  // Lấy thời gian kết thúc từ localStorage hoặc tạo mới
  let endTime = localStorage.getItem('flashSaleEndTime');
  
  if (!endTime) {
    // Nếu chưa có, tạo thời gian kết thúc mới (12 giờ từ bây giờ)
    const now = new Date().getTime();
    endTime = now + (12 * 60 * 60 * 1000); // 12 giờ
    localStorage.setItem('flashSaleEndTime', endTime);
  }
  
  // Cập nhật đồng hồ đếm ngược mỗi giây
  const countdownInterval = setInterval(() => {
    updateCountdown(endTime, countdownInterval);
  }, 1000);
  
  // Cập nhật ngay lập tức
  updateCountdown(endTime, countdownInterval);
}

function updateCountdown(endTime, interval) {
  const now = new Date().getTime();
  const distance = endTime - now;
  
  // Tính toán giờ, phút, giây
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
  // Hiển thị với 2 chữ số
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  
  if (hoursEl) hoursEl.textContent = formatNumber(hours);
  if (minutesEl) minutesEl.textContent = formatNumber(minutes);
  if (secondsEl) secondsEl.textContent = formatNumber(seconds);
  
  // Nếu hết thời gian, reset lại
  if (distance < 0) {
    clearInterval(interval);
    localStorage.removeItem('flashSaleEndTime');
    // Reset lại countdown sau 2 giây
    setTimeout(() => {
      initFlashSaleCountdown();
    }, 2000);
  }
}

function formatNumber(num) {
  return num < 10 ? '0' + num : num;
}

// Khởi động countdown khi trang load
document.addEventListener('DOMContentLoaded', () => {
  initFlashSaleCountdown();
});

/**
 * Smooth scroll cho Flash Sale products
 */
function initFlashSaleScroll() {
  const container = document.getElementById('flash-sale-container');
  
  if (!container) return;
  
  let isDown = false;
  let startX;
  let scrollLeft;
  
  container.addEventListener('mousedown', (e) => {
    isDown = true;
    container.style.cursor = 'grabbing';
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });
  
  container.addEventListener('mouseleave', () => {
    isDown = false;
    container.style.cursor = 'grab';
  });
  
  container.addEventListener('mouseup', () => {
    isDown = false;
    container.style.cursor = 'grab';
  });
  
  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    container.scrollLeft = scrollLeft - walk;
  });
}

// Khởi động scroll functionality
document.addEventListener('DOMContentLoaded', () => {
  initFlashSaleScroll();
});

/**
 * Xử lý nút "Mua Ngay" cho Flash Sale
 */
function initFlashSaleBuyButtons() {
  const buyButtons = document.querySelectorAll('.flash-sale-buy-btn');
  
  buyButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Hiệu ứng ripple
      createRipple(e, this);
      
      // Hiển thị thông báo
      showNotification('Đã thêm sản phẩm vào giỏ hàng! 🎉');
      
      // Có thể thêm logic thêm vào giỏ hàng ở đây
      console.log('Product added to cart');
    });
  });
}

function createRipple(event, button) {
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');
  
  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

function showNotification(message) {
  // Tạo notification element
  const notification = document.createElement('div');
  notification.className = 'flash-sale-notification';
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Hiển thị notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Ẩn và xóa notification sau 3 giây
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Khởi động buy button functionality
document.addEventListener('DOMContentLoaded', () => {
  initFlashSaleBuyButtons();
});
