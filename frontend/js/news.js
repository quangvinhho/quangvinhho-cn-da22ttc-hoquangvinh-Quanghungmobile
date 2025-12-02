// News API Handler
const API_URL = 'http://localhost:3000/api';

// Format ngày tháng
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Rút gọn nội dung
function truncateText(text, maxLength = 150) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Lấy ảnh mặc định nếu không có
function getNewsImage(imagePath) {
    if (!imagePath || imagePath === 'null') {
        return 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=800&h=400&fit=crop';
    }
    // Nếu là URL đầy đủ
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    // Nếu là đường dẫn local
    return `images/news/${imagePath}`;
}

// Load tin tức nổi bật cho trang news.html
async function loadFeaturedNews() {
    try {
        const response = await fetch(`${API_URL}/news/featured?limit=6`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            renderFeaturedNews(result.data);
        }
    } catch (error) {
        console.error('Lỗi load tin tức nổi bật:', error);
    }
}

// Render tin tức nổi bật
function renderFeaturedNews(newsItems) {
    const featuredContainer = document.getElementById('featured-news');
    const newsListContainer = document.getElementById('news-list');

    if (!featuredContainer || !newsListContainer) return;

    // Tin nổi bật đầu tiên
    if (newsItems.length > 0) {
        const featured = newsItems[0];
        featuredContainer.innerHTML = `
            <article class="bg-white rounded-xl shadow-lg overflow-hidden mb-6 hover:shadow-xl transition">
                <a href="news-detail.html?id=${featured.ma_tintuc}">
                    <div class="relative">
                        <img src="${getNewsImage(featured.anh_dai_dien)}" 
                             alt="${featured.tieu_de}" class="w-full h-64 object-cover">
                        <span class="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">Nổi bật</span>
                    </div>
                    <div class="p-6">
                        <h3 class="text-2xl font-bold text-gray-900 mb-3 hover:text-red-600 transition cursor-pointer">
                            ${featured.tieu_de}
                        </h3>
                        <p class="text-gray-600 mb-4">
                            ${truncateText(featured.noi_dung, 200)}
                        </p>
                        <div class="flex items-center text-sm text-gray-500">
                            <i class="fas fa-user-circle mr-2"></i>
                            <span class="mr-4">${featured.tac_gia || 'Admin'}</span>
                            <i class="far fa-clock mr-2"></i>
                            <span>${formatDate(featured.ngay_dang)}</span>
                        </div>
                    </div>
                </a>
            </article>
        `;
    }

    // Danh sách tin tức còn lại
    if (newsItems.length > 1) {
        const otherNews = newsItems.slice(1);
        newsListContainer.innerHTML = otherNews.map(news => `
            <article class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex">
                <a href="news-detail.html?id=${news.ma_tintuc}" class="flex w-full">
                    <img src="${getNewsImage(news.anh_dai_dien)}" 
                         alt="${news.tieu_de}" class="w-32 h-32 object-cover">
                    <div class="p-4 flex-1">
                        <h4 class="font-bold text-gray-900 mb-2 hover:text-red-600 transition cursor-pointer line-clamp-2">
                            ${news.tieu_de}
                        </h4>
                        <div class="flex items-center text-xs text-gray-500">
                            <i class="fas fa-user-circle mr-1"></i>
                            <span class="mr-3">${news.tac_gia || 'Admin'}</span>
                            <i class="far fa-clock mr-1"></i>
                            <span>${formatDate(news.ngay_dang)}</span>
                        </div>
                    </div>
                </a>
            </article>
        `).join('');
    }
}

// Load tất cả tin tức với phân trang
let currentPage = 1;
const newsPerPage = 10;

async function loadAllNews(page = 1) {
    try {
        const response = await fetch(`${API_URL}/news?page=${page}&limit=${newsPerPage}`);
        const result = await response.json();

        if (result.success) {
            renderAllNews(result.data);
            renderPagination(result.pagination);
            currentPage = page;
        }
    } catch (error) {
        console.error('Lỗi load tin tức:', error);
    }
}

// Render tất cả tin tức
function renderAllNews(newsItems) {
    const container = document.getElementById('all-news-list');
    if (!container) return;

    container.innerHTML = newsItems.map(news => `
        <article class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex">
            <a href="news-detail.html?id=${news.ma_tintuc}" class="flex w-full">
                <img src="${getNewsImage(news.anh_dai_dien)}" 
                     alt="${news.tieu_de}" class="w-32 h-32 object-cover">
                <div class="p-4 flex-1">
                    <h4 class="font-bold text-gray-900 mb-2 hover:text-red-600 transition cursor-pointer line-clamp-2">
                        ${news.tieu_de}
                    </h4>
                    <p class="text-gray-600 text-sm mb-2 line-clamp-2">${truncateText(news.noi_dung, 100)}</p>
                    <div class="flex items-center text-xs text-gray-500">
                        <i class="fas fa-user-circle mr-1"></i>
                        <span class="mr-3">${news.tac_gia || 'Admin'}</span>
                        <i class="far fa-clock mr-1"></i>
                        <span>${formatDate(news.ngay_dang)}</span>
                    </div>
                </div>
            </a>
        </article>
    `).join('');
}

// Render phân trang
function renderPagination(pagination) {
    const container = document.getElementById('news-pagination');
    if (!container) return;

    const { page, totalPages } = pagination;
    let html = '';

    if (totalPages > 1) {
        html = `
            <button onclick="loadAllNews(${page - 1})" 
                    class="px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}"
                    ${page === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
            <span class="px-4 py-2">Trang ${page} / ${totalPages}</span>
            <button onclick="loadAllNews(${page + 1})" 
                    class="px-4 py-2 rounded-lg ${page === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}"
                    ${page === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }

    container.innerHTML = html;
}

// Tìm kiếm tin tức
async function searchNews(keyword) {
    if (!keyword.trim()) {
        loadFeaturedNews();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/news/search/${encodeURIComponent(keyword)}`);
        const result = await response.json();

        if (result.success) {
            const newsListContainer = document.getElementById('news-list');
            const featuredContainer = document.getElementById('featured-news');

            if (featuredContainer) {
                featuredContainer.innerHTML = `
                    <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h3 class="text-xl font-bold text-gray-900">
                            Kết quả tìm kiếm cho: "${keyword}" (${result.data.length} kết quả)
                        </h3>
                    </div>
                `;
            }

            if (newsListContainer) {
                if (result.data.length === 0) {
                    newsListContainer.innerHTML = `
                        <div class="bg-white rounded-xl shadow-md p-6 text-center">
                            <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                            <p class="text-gray-600">Không tìm thấy tin tức nào phù hợp</p>
                        </div>
                    `;
                } else {
                    newsListContainer.innerHTML = result.data.map(news => `
                        <article class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex">
                            <a href="news-detail.html?id=${news.ma_tintuc}" class="flex w-full">
                                <img src="${getNewsImage(news.anh_dai_dien)}" 
                                     alt="${news.tieu_de}" class="w-32 h-32 object-cover">
                                <div class="p-4 flex-1">
                                    <h4 class="font-bold text-gray-900 mb-2 hover:text-red-600 transition cursor-pointer line-clamp-2">
                                        ${news.tieu_de}
                                    </h4>
                                    <div class="flex items-center text-xs text-gray-500">
                                        <i class="fas fa-user-circle mr-1"></i>
                                        <span class="mr-3">${news.tac_gia || 'Admin'}</span>
                                        <i class="far fa-clock mr-1"></i>
                                        <span>${formatDate(news.ngay_dang)}</span>
                                    </div>
                                </div>
                            </a>
                        </article>
                    `).join('');
                }
            }
        }
    } catch (error) {
        console.error('Lỗi tìm kiếm tin tức:', error);
    }
}

// Load chi tiết tin tức
async function loadNewsDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    if (!newsId) {
        window.location.href = 'news.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/news/${newsId}`);
        const result = await response.json();

        if (result.success) {
            renderNewsDetail(result.data);
            renderRelatedNews(result.relatedNews);
        } else {
            showNewsNotFound();
        }
    } catch (error) {
        console.error('Lỗi load chi tiết tin tức:', error);
        showNewsNotFound();
    }
}

// Render chi tiết tin tức
function renderNewsDetail(news) {
    // Update page title
    document.title = `${news.tieu_de} - QuangHưng Mobile`;
    
    // Update breadcrumb
    const breadcrumb = document.getElementById('breadcrumb-title');
    if (breadcrumb) {
        breadcrumb.textContent = news.tieu_de;
    }

    // Update article content
    const articleContainer = document.getElementById('news-article');
    if (articleContainer) {
        articleContainer.innerHTML = `
            <img src="${getNewsImage(news.anh_dai_dien)}" alt="${news.tieu_de}" class="w-full h-96 object-cover" />
            
            <div class="p-6">
                <h1 class="text-3xl font-bold mb-4">${news.tieu_de}</h1>
                
                <div class="flex items-center text-sm text-gray-500 mb-6">
                    <div class="flex items-center mr-4">
                        <i class="far fa-calendar mr-2"></i>
                        <span>${formatDate(news.ngay_dang)}</span>
                    </div>
                    <div class="flex items-center mr-4">
                        <i class="far fa-user mr-2"></i>
                        <span>${news.tac_gia || 'Admin'}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="far fa-folder mr-2"></i>
                        <span class="text-red-600">Tin công nghệ</span>
                    </div>
                </div>

                <div class="prose max-w-none">
                    ${news.noi_dung.split('\n').map(p => p.trim() ? `<p class="mb-4 text-gray-700 leading-relaxed">${p.trim()}</p>` : '').join('')}
                </div>

                <div class="mt-6 flex items-center gap-4 pt-6 border-t border-gray-200">
                    <span class="text-gray-700 font-semibold">Chia sẻ:</span>
                    <a href="#" class="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" class="w-10 h-10 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center text-white transition">
                        <i class="fab fa-twitter"></i>
                    </a>
                    <a href="#" class="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white transition">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>
        `;
    }
}

// Render tin tức liên quan
function renderRelatedNews(relatedNews) {
    const container = document.getElementById('related-news');
    if (!container || !relatedNews || relatedNews.length === 0) return;

    container.innerHTML = `
        <h2 class="text-2xl font-bold mb-6">Bài viết liên quan</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${relatedNews.map(news => `
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <a href="news-detail.html?id=${news.ma_tintuc}">
                        <img src="${getNewsImage(news.anh_dai_dien)}" alt="${news.tieu_de}" class="w-full h-48 object-cover" />
                        <div class="p-4">
                            <div class="flex items-center text-sm text-gray-500 mb-2">
                                <i class="far fa-calendar mr-2"></i>
                                <span>${formatDate(news.ngay_dang)}</span>
                            </div>
                            <h3 class="font-semibold mb-2 hover:text-red-600 transition">${news.tieu_de}</h3>
                            <span class="text-red-600 hover:text-red-700 font-semibold">Đọc tiếp</span>
                        </div>
                    </a>
                </div>
            `).join('')}
        </div>
    `;
}

// Hiển thị khi không tìm thấy tin tức
function showNewsNotFound() {
    const articleContainer = document.getElementById('news-article');
    if (articleContainer) {
        articleContainer.innerHTML = `
            <div class="p-6 text-center">
                <i class="fas fa-newspaper text-6xl text-gray-400 mb-4"></i>
                <h2 class="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy tin tức</h2>
                <p class="text-gray-600 mb-4">Tin tức bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                <a href="news.html" class="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">
                    Quay lại trang tin tức
                </a>
            </div>
        `;
    }
}

// Render tin tức mới nhất cho sidebar
function renderRecentNews(newsItems) {
    const container = document.getElementById('recent-news-sidebar');
    if (!container || !newsItems) return;

    container.innerHTML = newsItems.slice(0, 5).map(news => `
        <a href="news-detail.html?id=${news.ma_tintuc}" class="flex items-center space-x-3 mb-4">
            <img src="${getNewsImage(news.anh_dai_dien)}" alt="${news.tieu_de}" class="w-20 h-20 object-cover rounded" />
            <div>
                <h4 class="font-semibold text-sm line-clamp-2">${news.tieu_de}</h4>
                <p class="text-gray-500 text-xs">${formatDate(news.ngay_dang)}</p>
            </div>
        </a>
    `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra trang hiện tại
    const isNewsPage = window.location.pathname.includes('news.html');
    const isNewsDetailPage = window.location.pathname.includes('news-detail.html');

    if (isNewsPage) {
        loadFeaturedNews();
        
        // Setup search
        const searchInput = document.querySelector('input[placeholder*="Tìm"]');
        const searchBtn = document.querySelector('.fa-search')?.parentElement;
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => searchNews(searchInput.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') searchNews(searchInput.value);
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-news');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => loadAllNews(currentPage + 1));
        }
    }

    if (isNewsDetailPage) {
        loadNewsDetail();
    }
});
