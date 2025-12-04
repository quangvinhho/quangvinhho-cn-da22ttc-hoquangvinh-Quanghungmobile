// Admin Dashboard Complete Logic
const API_URL = 'http://localhost:3000/api';
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

// Global data storage
let allProducts = [];
let allNews = [];
let allReviews = [];
let allBrands = [];
let editingProductId = null;
let editingNewsId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-date').textContent = new Date().toLocaleDateString('vi-VN');
  loadBrands();
  loadDashboard();
});

// ==================== NAVIGATION ====================
function showSection(section) {
  // Hide all sections
  document.querySelectorAll('.section-content').forEach(el => el.classList.remove('active'));
  // Remove active from all nav items
  document.querySelectorAll('.sidebar-item').forEach(el => {
    el.classList.remove('active', 'text-white');
    el.classList.add('text-slate-300');
  });
  
  // Show selected section
  document.getElementById('section-' + section).classList.add('active');
  
  // Highlight nav item
  const navItem = document.getElementById('nav-' + section);
  if (navItem) {
    navItem.classList.add('active', 'text-white');
    navItem.classList.remove('text-slate-300');
  }
  
  // Update page title
  const titles = {
    dashboard: 'Tổng quan',
    products: 'Quản lý sản phẩm',
    news: 'Quản lý tin tức',
    reviews: 'Quản lý đánh giá'
  };
  document.getElementById('page-title').textContent = titles[section] || 'Tổng quan';
  
  // Load data for section
  if (section === 'dashboard') loadDashboard();
  else if (section === 'products') loadProducts();
  else if (section === 'news') loadNews();
  else if (section === 'reviews') loadReviews();
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
  try {
    // Load all data
    const [productsRes, newsRes, reviewsRes] = await Promise.all([
      fetch(`${API_URL}/products`),
      fetch(`${API_URL}/admin/news`),
      fetch(`${API_URL}/admin/reviews`)
    ]);
    
    const products = await productsRes.json();
    const newsData = await newsRes.json();
    const reviewsData = await reviewsRes.json();
    
    // Update stats
    document.getElementById('stat-products').textContent = products.length || 0;
    document.getElementById('stat-news').textContent = (newsData.data || newsData).length || 0;
    
    const reviews = reviewsData.data || reviewsData || [];
    document.getElementById('stat-reviews').textContent = reviews.length;
    
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.so_sao, 0) / reviews.length).toFixed(1)
      : 0;
    document.getElementById('stat-avg-rating').textContent = avgRating;
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// ==================== PRODUCTS ====================
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    allProducts = await response.json();
    renderProducts(allProducts);
  } catch (error) {
    console.error('Error loading products:', error);
    showToast('Lỗi tải sản phẩm', 'error');
  }
}

function renderProducts(products) {
  const tbody = document.getElementById('products-table');
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-400">Không có sản phẩm</td></tr>';
    return;
  }
  
  tbody.innerHTML = products.map(p => `
    <tr class="border-b border-slate-50 hover:bg-slate-50">
      <td class="py-4">
        <img src="${p.anh_dai_dien || p.image || PLACEHOLDER_IMAGE}" class="w-16 h-16 object-cover rounded-xl" alt="${p.ten_sp || p.name}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
      </td>
      <td class="py-4">
        <p class="font-medium">${p.ten_sp}</p>
        <p class="text-xs text-slate-500">${p.bo_nho || ''} ${p.mau_sac ? '- ' + p.mau_sac : ''}</p>
      </td>
      <td class="py-4">
        <span class="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium">${getBrandName(p.ma_hang)}</span>
      </td>
      <td class="py-4 font-semibold text-violet-600">${formatCurrency(p.gia)}</td>
      <td class="py-4">
        <span class="px-2 py-1 rounded-lg text-xs font-medium ${getStockClass(p.so_luong_ton)}">
          ${p.so_luong_ton || 0}
        </span>
      </td>
      <td class="py-4 space-x-2">
        <button onclick="viewProduct(${p.ma_sp})" class="text-violet-600 hover:text-violet-800" title="Xem chi tiết">
          <i class="fas fa-eye"></i>
        </button>
        <button onclick="editProduct(${p.ma_sp})" class="text-blue-600 hover:text-blue-800" title="Chỉnh sửa">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteProduct(${p.ma_sp})" class="text-red-600 hover:text-red-800" title="Xóa">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function loadBrands() {
  try {
    const response = await fetch(`${API_URL}/admin/brands`);
    const data = await response.json();
    allBrands = data.data || [];
    
    const select = document.getElementById('product-brand');
    select.innerHTML = '<option value="">Chọn hãng</option>' + 
      allBrands.map(b => `<option value="${b.ma_hang}">${b.ten_hang}</option>`).join('');
  } catch (error) {
    console.error('Error loading brands:', error);
  }
}

function getBrandName(brandId) {
  const brand = allBrands.find(b => b.ma_hang === brandId);
  return brand ? brand.ten_hang : 'N/A';
}

function getStockClass(stock) {
  if (stock > 10) return 'bg-emerald-100 text-emerald-700';
  if (stock > 0) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function openProductModal(productId = null) {
  editingProductId = productId;
  const modal = document.getElementById('product-modal');
  const form = document.getElementById('product-form');
  form.reset();
  
  if (productId) {
    const product = allProducts.find(p => p.ma_sp === productId);
    if (product) {
      document.getElementById('product-modal-title').textContent = 'Chỉnh sửa sản phẩm';
      document.getElementById('product-id').value = product.ma_sp;
      document.getElementById('product-name').value = product.ten_sp;
      document.getElementById('product-brand').value = product.ma_hang;
      document.getElementById('product-price').value = product.gia;
      document.getElementById('product-stock').value = product.so_luong_ton;
      document.getElementById('product-color').value = product.mau_sac || '';
      document.getElementById('product-storage').value = product.bo_nho || '';
      document.getElementById('product-description').value = product.mo_ta || '';
      document.getElementById('product-image').value = product.anh_dai_dien || '';
    }
  } else {
    document.getElementById('product-modal-title').textContent = 'Thêm sản phẩm mới';
  }
  
  modal.classList.add('active');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('active');
  editingProductId = null;
}

function viewProduct(id) {
  const product = allProducts.find(p => p.ma_sp === id);
  if (product) {
    alert(`Chi tiết sản phẩm:\n\nTên: ${product.ten_sp}\nGiá: ${formatCurrency(product.gia)}\nTồn kho: ${product.so_luong_ton}\nMô tả: ${product.mo_ta || 'Không có'}`);
  }
}

function editProduct(id) {
  openProductModal(id);
}

async function deleteProduct(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
  
  try {
    const response = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    
    if (data.success) {
      showToast('Xóa sản phẩm thành công');
      loadProducts();
    } else {
      showToast(data.message || 'Lỗi xóa sản phẩm', 'error');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    showToast('Lỗi xóa sản phẩm', 'error');
  }
}

// Product form submit
document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const productData = {
    ten_sp: document.getElementById('product-name').value,
    ma_hang: document.getElementById('product-brand').value,
    gia: document.getElementById('product-price').value,
    so_luong_ton: document.getElementById('product-stock').value,
    mau_sac: document.getElementById('product-color').value,
    bo_nho: document.getElementById('product-storage').value,
    mo_ta: document.getElementById('product-description').value,
    anh_dai_dien: document.getElementById('product-image').value
  };
  
  try {
    const url = editingProductId 
      ? `${API_URL}/admin/products/${editingProductId}`
      : `${API_URL}/admin/products`;
    const method = editingProductId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast(editingProductId ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
      closeProductModal();
      loadProducts();
      loadDashboard();
    } else {
      showToast(data.message || 'Lỗi lưu sản phẩm', 'error');
    }
  } catch (error) {
    console.error('Error saving product:', error);
    showToast('Lỗi lưu sản phẩm', 'error');
  }
});

// Product search
document.getElementById('product-search').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filtered = allProducts.filter(p => 
    p.ten_sp.toLowerCase().includes(searchTerm) ||
    (p.mo_ta && p.mo_ta.toLowerCase().includes(searchTerm))
  );
  renderProducts(filtered);
});

// ==================== NEWS ====================
async function loadNews() {
  try {
    const response = await fetch(`${API_URL}/admin/news`);
    const data = await response.json();
    allNews = data.data || data || [];
    renderNews(allNews);
  } catch (error) {
    console.error('Error loading news:', error);
    showToast('Lỗi tải tin tức', 'error');
  }
}

function renderNews(news) {
  const tbody = document.getElementById('news-table');
  if (!news.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-400">Không có tin tức</td></tr>';
    return;
  }
  
  tbody.innerHTML = news.map(n => `
    <tr class="border-b border-slate-50 hover:bg-slate-50">
      <td class="py-4">
        ${n.anh_dai_dien 
          ? `<img src="${n.anh_dai_dien}" class="w-20 h-16 object-cover rounded-xl" alt="${n.tieu_de}">`
          : '<div class="w-20 h-16 bg-slate-200 rounded-xl flex items-center justify-center"><i class="fas fa-newspaper text-slate-400"></i></div>'
        }
      </td>
      <td class="py-4">
        <p class="font-medium max-w-md">${n.tieu_de}</p>
        <p class="text-xs text-slate-500 mt-1">${truncateText(n.noi_dung, 100)}</p>
      </td>
      <td class="py-4 text-slate-600">${n.ten_admin || 'Admin'}</td>
      <td class="py-4 text-slate-500">${formatDate(n.ngay_dang)}</td>
      <td class="py-4 space-x-2">
        <button onclick="viewNews(${n.ma_tintuc})" class="text-violet-600 hover:text-violet-800" title="Xem chi tiết">
          <i class="fas fa-eye"></i>
        </button>
        <button onclick="editNews(${n.ma_tintuc})" class="text-blue-600 hover:text-blue-800" title="Chỉnh sửa">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteNews(${n.ma_tintuc})" class="text-red-600 hover:text-red-800" title="Xóa">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function openNewsModal(newsId = null) {
  editingNewsId = newsId;
  const modal = document.getElementById('news-modal');
  const form = document.getElementById('news-form');
  form.reset();
  
  if (newsId) {
    const news = allNews.find(n => n.ma_tintuc === newsId);
    if (news) {
      document.getElementById('news-modal-title').textContent = 'Chỉnh sửa tin tức';
      document.getElementById('news-id').value = news.ma_tintuc;
      document.getElementById('news-title').value = news.tieu_de;
      document.getElementById('news-content').value = news.noi_dung;
      document.getElementById('news-image').value = news.anh_dai_dien || '';
    }
  } else {
    document.getElementById('news-modal-title').textContent = 'Thêm tin tức mới';
  }
  
  modal.classList.add('active');
}

function closeNewsModal() {
  document.getElementById('news-modal').classList.remove('active');
  editingNewsId = null;
}

function viewNews(id) {
  const news = allNews.find(n => n.ma_tintuc === id);
  if (news) {
    alert(`Chi tiết tin tức:\n\nTiêu đề: ${news.tieu_de}\nTác giả: ${news.ten_admin || 'Admin'}\nNgày đăng: ${formatDate(news.ngay_dang)}\n\nNội dung:\n${news.noi_dung}`);
  }
}

function editNews(id) {
  openNewsModal(id);
}

async function deleteNews(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa tin tức này?')) return;
  
  try {
    const response = await fetch(`${API_URL}/admin/news/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    
    if (data.success) {
      showToast('Xóa tin tức thành công');
      loadNews();
      loadDashboard();
    } else {
      showToast(data.message || 'Lỗi xóa tin tức', 'error');
    }
  } catch (error) {
    console.error('Error deleting news:', error);
    showToast('Lỗi xóa tin tức', 'error');
  }
}

// News form submit
document.getElementById('news-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const newsData = {
    tieu_de: document.getElementById('news-title').value,
    noi_dung: document.getElementById('news-content').value,
    anh_dai_dien: document.getElementById('news-image').value || null,
    ma_admin: 1
  };
  
  try {
    const url = editingNewsId 
      ? `${API_URL}/admin/news/${editingNewsId}`
      : `${API_URL}/admin/news`;
    const method = editingNewsId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast(editingNewsId ? 'Cập nhật tin tức thành công' : 'Thêm tin tức thành công');
      closeNewsModal();
      loadNews();
      loadDashboard();
    } else {
      showToast(data.message || 'Lỗi lưu tin tức', 'error');
    }
  } catch (error) {
    console.error('Error saving news:', error);
    showToast('Lỗi lưu tin tức', 'error');
  }
});

// News search
document.getElementById('news-search').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filtered = allNews.filter(n => 
    n.tieu_de.toLowerCase().includes(searchTerm) ||
    n.noi_dung.toLowerCase().includes(searchTerm)
  );
  renderNews(filtered);
});

// ==================== REVIEWS ====================
async function loadReviews() {
  try {
    const response = await fetch(`${API_URL}/admin/reviews`);
    const data = await response.json();
    allReviews = data.data || data || [];
    renderReviews(allReviews);
    updateReviewStats(allReviews);
  } catch (error) {
    console.error('Error loading reviews:', error);
    showToast('Lỗi tải đánh giá', 'error');
  }
}

function renderReviews(reviews) {
  const tbody = document.getElementById('reviews-table');
  if (!reviews.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-400">Không có đánh giá</td></tr>';
    return;
  }
  
  tbody.innerHTML = reviews.map(r => `
    <tr class="border-b border-slate-50 hover:bg-slate-50">
      <td class="py-4">
        <div class="flex items-center gap-2">
          ${r.avt 
            ? `<img src="${r.avt}" class="w-8 h-8 rounded-full object-cover" alt="${r.ho_ten}">`
            : `<div class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-medium text-sm">${(r.ho_ten || 'K').charAt(0)}</div>`
          }
          <span class="font-medium">${r.ho_ten || 'Khách hàng'}</span>
        </div>
      </td>
      <td class="py-4 text-slate-600">${r.ten_sp || 'N/A'}</td>
      <td class="py-4">
        <div class="flex items-center gap-1">
          ${renderStars(r.so_sao)}
        </div>
      </td>
      <td class="py-4 text-slate-600 max-w-xs">
        <p class="truncate">${r.binh_luan || 'Không có bình luận'}</p>
      </td>
      <td class="py-4 text-slate-500">${formatDate(r.ngay_danh_gia)}</td>
      <td class="py-4 space-x-2">
        <button onclick="viewReview(${r.ma_dg})" class="text-violet-600 hover:text-violet-800" title="Xem chi tiết">
          <i class="fas fa-eye"></i>
        </button>
        <button onclick="deleteReview(${r.ma_dg})" class="text-red-600 hover:text-red-800" title="Xóa">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function updateReviewStats(reviews) {
  const total = reviews.length;
  const avg = total > 0 
    ? (reviews.reduce((sum, r) => sum + r.so_sao, 0) / total).toFixed(1)
    : 0;
  const positive = total > 0 
    ? Math.round((reviews.filter(r => r.so_sao >= 4).length / total) * 100)
    : 0;
  const negative = total > 0 
    ? Math.round((reviews.filter(r => r.so_sao <= 2).length / total) * 100)
    : 0;
  
  document.getElementById('avg-rating').textContent = avg;
  document.getElementById('total-reviews').textContent = total;
  document.getElementById('positive-reviews').textContent = positive + '%';
  document.getElementById('negative-reviews').textContent = negative + '%';
}

function viewReview(id) {
  const review = allReviews.find(r => r.ma_dg === id);
  if (!review) return;
  
  const modal = document.getElementById('review-modal');
  const content = document.getElementById('review-detail-content');
  
  content.innerHTML = `
    <div class="space-y-4">
      <div>
        <label class="text-sm font-medium text-slate-500">Khách hàng</label>
        <p class="text-lg font-semibold">${review.ho_ten || 'Khách hàng'}</p>
      </div>
      <div>
        <label class="text-sm font-medium text-slate-500">Sản phẩm</label>
        <p class="text-lg">${review.ten_sp || 'N/A'}</p>
      </div>
      <div>
        <label class="text-sm font-medium text-slate-500">Đánh giá</label>
        <div class="flex items-center gap-1 mt-1">
          ${renderStars(review.so_sao)}
          <span class="ml-2 text-sm text-slate-600">(${review.so_sao}/5)</span>
        </div>
      </div>
      <div>
        <label class="text-sm font-medium text-slate-500">Bình luận</label>
        <p class="text-slate-700 mt-1">${review.binh_luan || 'Không có bình luận'}</p>
      </div>
      ${review.hinh_anh ? `
        <div>
          <label class="text-sm font-medium text-slate-500">Hình ảnh</label>
          <img src="${review.hinh_anh}" class="mt-2 rounded-xl max-w-full" alt="Review image">
        </div>
      ` : ''}
      <div>
        <label class="text-sm font-medium text-slate-500">Ngày đánh giá</label>
        <p class="text-slate-700">${formatDate(review.ngay_danh_gia)}</p>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
}

function closeReviewModal() {
  document.getElementById('review-modal').classList.remove('active');
}

async function deleteReview(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
  
  try {
    const response = await fetch(`${API_URL}/admin/reviews/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    
    if (data.success) {
      showToast('Xóa đánh giá thành công');
      loadReviews();
      loadDashboard();
    } else {
      showToast(data.message || 'Lỗi xóa đánh giá', 'error');
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    showToast('Lỗi xóa đánh giá', 'error');
  }
}

// Review filter
document.getElementById('review-rating-filter').addEventListener('change', (e) => {
  const rating = e.target.value;
  const filtered = rating 
    ? allReviews.filter(r => r.so_sao === parseInt(rating))
    : allReviews;
  renderReviews(filtered);
});

// ==================== UTILITY FUNCTIONS ====================
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(parseFloat(amount) || 0);
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function renderStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<i class="fas fa-star ${i <= rating ? 'text-amber-400' : 'text-slate-200'} text-sm"></i>`;
  }
  return stars;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  const messageEl = document.getElementById('toast-message');
  
  messageEl.textContent = message;
  icon.className = type === 'success' 
    ? 'fas fa-check-circle text-emerald-400'
    : 'fas fa-exclamation-circle text-red-400';
  
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3000);
}

function logout() {
  localStorage.removeItem('admin');
  window.location.href = 'login.html';
}
