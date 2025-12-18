/**
 * Notification Bell Component
 * Hiển thị chuông thông báo cho người dùng đã đăng nhập
 */

class NotificationBell {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || 'http://localhost:3000/api';
    this.containerId = options.containerId || 'notification-bell-container';
    this.userId = null;
    this.userEmail = null;
    this.notifications = [];
    this.unreadCount = 0;
    this.isOpen = false;
    this.pollInterval = options.pollInterval || 30000;
    this.pollTimer = null;
    
    this.init();
  }

  init() {
    // Lấy thông tin user
    this.loadUserInfo();
    
    // Chỉ render nếu user đã đăng nhập
    if (this.userId || this.userEmail) {
      this.render();
      this.loadNotifications();
      this.startPolling();
      
      // Đóng dropdown khi click bên ngoài
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-bell-wrapper')) {
          this.closeDropdown();
        }
      });
    }
  }

  loadUserInfo() {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (isLoggedIn && user && user.ma_kh) {
        this.userId = user.ma_kh;
        this.userEmail = user.email;
        console.log('NotificationBell: User found', { userId: this.userId, email: this.userEmail });
      } else {
        console.log('NotificationBell: User not logged in');
      }
    } catch (e) {
      console.log('NotificationBell: Error loading user', e);
    }
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.warn('NotificationBell: Container not found:', this.containerId);
      return;
    }

    container.innerHTML = `
      <div class="notification-bell-wrapper relative">
        <button class="notification-bell-btn flex items-center justify-center w-10 h-10 text-white hover:text-yellow-300 transition-all" id="notification-bell-btn" title="Thông báo">
          <i class="fas fa-bell text-2xl"></i>
          <span class="notification-badge absolute -top-1 -right-1 bg-yellow-400 text-red-600 text-xs font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-red-600 hidden" id="notification-badge">0</span>
        </button>
        
        <div class="notification-dropdown absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl z-50 hidden overflow-hidden" id="notification-dropdown">
          <div class="notification-header flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white">
            <h4 class="font-bold text-sm flex items-center gap-2">
              <i class="fas fa-bell"></i> Thông báo
            </h4>
            <button class="text-xs hover:underline opacity-90" onclick="notificationBell.markAllAsRead()">
              Đọc tất cả
            </button>
          </div>
          
          <div class="notification-list max-h-80 overflow-y-auto" id="notification-list">
            <div class="p-6 text-center text-gray-400">
              <i class="fas fa-bell-slash text-3xl mb-2"></i>
              <p class="text-sm">Chưa có thông báo</p>
            </div>
          </div>
          
          <div class="notification-footer px-4 py-2 bg-gray-50 border-t text-center">
            <a href="notifications.html" class="text-xs text-red-600 hover:underline font-medium">
              Xem tất cả thông báo
            </a>
          </div>
        </div>
      </div>
    `;

    // Bind click event
    const bellBtn = document.getElementById('notification-bell-btn');
    if (bellBtn) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown();
      });
    }
    
    console.log('NotificationBell: Rendered');
  }

  async loadNotifications() {
    if (!this.userId) return;

    try {
      const url = `${this.apiUrl}/notifications/user/${this.userId}?limit=10`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        this.notifications = data.data || [];
        this.unreadCount = data.unread_count || 0;
        this.updateBadge();
        this.renderNotificationList();
        console.log('NotificationBell: Loaded', this.unreadCount, 'unread notifications');
      }
    } catch (error) {
      console.error('NotificationBell: Error loading', error);
    }
  }

  updateBadge() {
    const badge = document.getElementById('notification-badge');
    const bellBtn = document.getElementById('notification-bell-btn');
    
    if (badge) {
      if (this.unreadCount > 0) {
        badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
        badge.classList.remove('hidden');
        // Animation cho chuông
        if (bellBtn) {
          bellBtn.querySelector('i').style.animation = 'bellRing 1s ease-in-out';
        }
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  renderNotificationList() {
    const list = document.getElementById('notification-list');
    if (!list) return;

    if (this.notifications.length === 0) {
      list.innerHTML = `
        <div class="p-6 text-center text-gray-400">
          <i class="fas fa-bell-slash text-3xl mb-2"></i>
          <p class="text-sm">Chưa có thông báo</p>
        </div>
      `;
      return;
    }

    list.innerHTML = this.notifications.map(n => `
      <div class="notification-item flex gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${n.da_doc ? '' : 'bg-red-50'}" 
           onclick="notificationBell.handleClick(${n.ma_thong_bao}, '${n.lien_ket || ''}')">
        <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${this.getIconBg(n.loai)}">
          <i class="fas ${this.getIcon(n.loai)} text-white text-sm"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800 truncate">${this.escapeHtml(n.tieu_de)}</p>
          <p class="text-xs text-gray-500 line-clamp-2">${this.escapeHtml(n.noi_dung)}</p>
          <p class="text-xs text-gray-400 mt-1">${this.formatTime(n.ngay_tao)}</p>
        </div>
        ${!n.da_doc ? '<div class="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>' : ''}
      </div>
    `).join('');
  }

  getIcon(type) {
    const icons = {
      'contact_response': 'fa-reply',
      'order_update': 'fa-box',
      'promotion': 'fa-gift',
      'system': 'fa-info-circle'
    };
    return icons[type] || 'fa-bell';
  }

  getIconBg(type) {
    const bgs = {
      'contact_response': 'bg-purple-500',
      'order_update': 'bg-green-500',
      'promotion': 'bg-yellow-500',
      'system': 'bg-blue-500'
    };
    return bgs[type] || 'bg-red-500';
  }

  formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async handleClick(id, link) {
    await this.markAsRead(id);
    if (link) {
      window.location.href = link;
    }
    this.closeDropdown();
  }

  async markAsRead(id) {
    try {
      await fetch(`${this.apiUrl}/notifications/${id}/read`, { method: 'PUT' });
      const n = this.notifications.find(x => x.ma_thong_bao === id);
      if (n && !n.da_doc) {
        n.da_doc = 1;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.updateBadge();
        this.renderNotificationList();
      }
    } catch (e) {
      console.error('Error marking as read:', e);
    }
  }

  async markAllAsRead() {
    if (!this.userId) return;
    try {
      await fetch(`${this.apiUrl}/notifications/read-all/${this.userId}`, { method: 'PUT' });
      this.notifications.forEach(n => n.da_doc = 1);
      this.unreadCount = 0;
      this.updateBadge();
      this.renderNotificationList();
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('hidden', !this.isOpen);
    }
    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  closeDropdown() {
    this.isOpen = false;
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
      dropdown.classList.add('hidden');
    }
  }

  startPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => this.loadNotifications(), this.pollInterval);
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  refresh() {
    this.loadUserInfo();
    if (this.userId) {
      this.loadNotifications();
    }
  }
}

// Global instance
let notificationBell = null;

// Khởi tạo notification bell
function initNotificationBell() {
  if (notificationBell) return; // Đã khởi tạo rồi
  
  const container = document.getElementById('notification-bell-container');
  if (!container) return;
  
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (isLoggedIn && user && user.ma_kh) {
    notificationBell = new NotificationBell({
      apiUrl: 'http://localhost:3000/api'
    });
  }
}

// Tự động khởi tạo
initNotificationBell();

// CSS Animation cho chuông
const bellStyle = document.createElement('style');
bellStyle.textContent = `
  @keyframes bellRing {
    0% { transform: rotate(0); }
    10% { transform: rotate(15deg); }
    20% { transform: rotate(-15deg); }
    30% { transform: rotate(10deg); }
    40% { transform: rotate(-10deg); }
    50% { transform: rotate(5deg); }
    60% { transform: rotate(-5deg); }
    70%, 100% { transform: rotate(0); }
  }
  
  .notification-dropdown {
    animation: slideDown 0.2s ease;
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
document.head.appendChild(bellStyle);

