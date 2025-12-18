// News API Handler
const API_URL = 'http://localhost:3000/api';

// Format ngày tháng
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Rút gọn nội dung
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Lấy ảnh
function getNewsImage(imagePath) {
    if (!imagePath || imagePath === 'null') {
        return 'images/inta.webp';
    }
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath;
}

// Lấy badge màu ngẫu nhiên
function getBadgeColor(index) {
    const colors = ['bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-teal-500'];
    return colors[index % colors.length];
}

// Lấy category
function getCategory(index) {
    const cats = ['Mẹo hay', 'Tin mới', 'Công nghệ', 'Đánh giá', 'Khuyến mãi', 'Thủ thuật'];
    return cats[index % cats.length];
}

// Load và render tin tức
async function loadNews() {
    try {
        const response = await fetch(`${API_URL}/news/featured?limit=20`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            // Tin mới nhất (4 tin đầu tiên)
            renderLatestNews(result.data.slice(0, 4));
            // Tin nổi bật (tin từ 5-8, hoặc từ đầu nếu không đủ)
            const featuredData = result.data.length > 4 ? result.data.slice(4) : result.data;
            renderFeaturedMain(featuredData[0] || result.data[0]);
            renderFeaturedList(featuredData.slice(1, 4) || result.data.slice(1, 4));
            renderAllNews(result.data);
        }
    } catch (error) {
        console.error('Lỗi load tin tức:', error);
        showError();
    }
}

// Render tin mới nhất - section riêng
function renderLatestNews(newsList) {
    const container = document.getElementById('latest-news');
    if (!container) return;
    
    const badgeColors = ['bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-green-500'];
    
    container.innerHTML = newsList.map((news, index) => `
        <article class="group cursor-pointer">
            <a href="news-detail.html?id=${news.ma_tintuc}" class="block">
                <div class="relative h-40 rounded-2xl overflow-hidden mb-3">
                    <img src="${getNewsImage(news.anh_dai_dien)}" 
                         alt="${news.tieu_de}" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                         onerror="this.src='images/inta.webp'">
                    <!-- Badge Mới -->
                    <div class="absolute top-2 left-2">
                        <span class="${badgeColors[index % 4]} text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            Mới
                        </span>
                    </div>
                    <div class="absolute bottom-3 left-3 right-3">
                        <span class="text-white text-xs font-medium">${formatDate(news.ngay_dang)}</span>
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <h4 class="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                    ${news.tieu_de}
                </h4>
            </a>
        </article>
    `).join('');
}

// Render tin chính (bên trái) - giống style index.html
function renderFeaturedMain(news) {
    const container = document.getElementById('featured-main');
    if (!container) return;
    
    container.innerHTML = `
        <a href="news-detail.html?id=${news.ma_tintuc}" class="block group">
            <div class="relative h-[380px] rounded-2xl overflow-hidden">
                <img src="${getNewsImage(news.anh_dai_dien)}" 
                     alt="${news.tieu_de}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                     onerror="this.src='images/inta.webp'">
                
                <!-- Date & Category Badge -->
                <div class="absolute bottom-4 left-4 right-4">
                    <div class="flex items-center gap-2 text-white text-sm mb-3">
                        <span class="font-medium">${formatDate(news.ngay_dang)}</span>
                        <span>•</span>
                        <span class="bg-orange-500 px-3 py-1 rounded-full text-xs font-semibold">Nổi bật</span>
                    </div>
                </div>
                
                <!-- Gradient overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            </div>
            
            <h3 class="text-lg md:text-xl font-bold text-gray-900 mt-4 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                ${news.tieu_de}
            </h3>
            <p class="text-sm md:text-base text-gray-600 line-clamp-2">
                ${truncateText(news.noi_dung, 150)}
            </p>
        </a>
    `;
}

// Render danh sách tin (bên phải)
function renderFeaturedList(newsList) {
    const container = document.getElementById('featured-list');
    if (!container) return;
    
    container.innerHTML = newsList.map((news, index) => `
        <a href="news-detail.html?id=${news.ma_tintuc}" class="flex gap-4 group">
            <div class="relative w-36 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img src="${getNewsImage(news.anh_dai_dien)}" 
                     alt="${news.tieu_de}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                     onerror="this.src='images/uni8.jpg'">
            </div>
            <div class="flex-1 min-w-0 py-1">
                <h4 class="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors mb-2">
                    ${news.tieu_de}
                </h4>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span><i class="far fa-user mr-1"></i>${news.tac_gia || 'Admin'}</span>
                    <span>•</span>
                    <span><i class="far fa-clock mr-1"></i>${formatDate(news.ngay_dang)}</span>
                </div>
            </div>
        </a>
    `).join('');
}

// Render tin xem nhiều - giống style index.html
function renderPopularNews(newsList) {
    const container = document.getElementById('popular-news');
    if (!container) return;
    
    container.innerHTML = newsList.map((news, index) => `
        <article class="group cursor-pointer">
            <a href="news-detail.html?id=${news.ma_tintuc}" class="block">
                <div class="relative h-40 rounded-2xl overflow-hidden mb-3">
                    <img src="${getNewsImage(news.anh_dai_dien)}" 
                         alt="${news.tieu_de}" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                         onerror="this.src='images/inta.webp'">
                    <!-- Date & Category Badge -->
                    <div class="absolute bottom-3 left-3 right-3">
                        <div class="flex items-center gap-2 text-white text-xs">
                            <span class="font-medium">${formatDate(news.ngay_dang)}</span>
                            <span>•</span>
                            <span class="${getBadgeColor(index)} px-2 py-0.5 rounded-full text-xs font-semibold">${getCategory(index)}</span>
                        </div>
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <h4 class="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors mb-1">
                    ${news.tieu_de}
                </h4>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span><i class="far fa-user mr-1"></i>${news.tac_gia || 'Admin'}</span>
                </div>
            </a>
        </article>
    `).join('');
}

// Render tất cả tin tức - giống style index.html
function renderAllNews(newsList) {
    const container = document.getElementById('all-news');
    if (!container) return;
    
    container.innerHTML = newsList.map((news, index) => `
        <article class="group cursor-pointer">
            <a href="news-detail.html?id=${news.ma_tintuc}" class="block">
                <div class="relative h-48 rounded-2xl overflow-hidden mb-4">
                    <img src="${getNewsImage(news.anh_dai_dien)}" 
                         alt="${news.tieu_de}" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                         onerror="this.src='images/uni8.jpg'">
                    <!-- Date & Category Badge -->
                    <div class="absolute bottom-4 left-4 right-4">
                        <div class="flex items-center gap-2 text-white text-sm">
                            <span class="font-medium">${formatDate(news.ngay_dang)}</span>
                            <span>•</span>
                            <span class="${getBadgeColor(index)} px-3 py-1 rounded-full text-xs font-semibold">${getCategory(index)}</span>
                        </div>
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                <h3 class="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    ${news.tieu_de}
                </h3>
                <p class="text-sm text-gray-600 line-clamp-2">
                    ${truncateText(news.noi_dung, 100)}
                </p>
            </a>
        </article>
    `).join('');
}

// Hiển thị lỗi
function showError() {
    const container = document.getElementById('featured-main');
    if (container) {
        container.innerHTML = `
            <div class="bg-gray-100 rounded-2xl p-8 text-center h-[380px] flex flex-col items-center justify-center">
                <i class="fas fa-exclamation-circle text-5xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Không thể tải tin tức. Vui lòng thử lại sau.</p>
            </div>
        `;
    }
}

// ============ NEWS DETAIL PAGE ============

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
        console.error('Lỗi load chi tiết:', error);
        showNewsNotFound();
    }
}

// Chuyển đổi URL video thành embed URL
function getVideoEmbedUrl(url) {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
        return 'https://www.youtube.com/embed/' + youtubeMatch[1];
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        return 'https://player.vimeo.com/video/' + vimeoMatch[1];
    }
    
    // Nếu là link video trực tiếp
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return url;
    }
    
    return url;
}

function renderNewsDetail(news) {
    document.title = `${news.tieu_de} - QuangHưng Mobile`;
    
    const breadcrumb = document.getElementById('breadcrumb-title');
    if (breadcrumb) breadcrumb.textContent = news.tieu_de;

    // Tạo phần video nếu có
    let videoHtml = '';
    if (news.video_url) {
        const embedUrl = getVideoEmbedUrl(news.video_url);
        if (news.video_url.match(/\.(mp4|webm|ogg)$/i)) {
            // Video file trực tiếp
            videoHtml = `
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-video text-red-main mr-2"></i>Video
                    </h3>
                    <video controls class="w-full rounded-2xl shadow-lg" style="max-height: 500px;">
                        <source src="${embedUrl}" type="video/mp4">
                        Trình duyệt của bạn không hỗ trợ video.
                    </video>
                </div>
            `;
        } else {
            // YouTube/Vimeo embed
            videoHtml = `
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-video text-red-main mr-2"></i>Video
                    </h3>
                    <div class="relative w-full rounded-2xl overflow-hidden shadow-lg" style="padding-top: 56.25%;">
                        <iframe src="${embedUrl}" 
                                class="absolute inset-0 w-full h-full" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen></iframe>
                    </div>
                </div>
            `;
        }
    }

    const articleContainer = document.getElementById('news-article');
    if (articleContainer) {
        articleContainer.innerHTML = `
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">${news.tieu_de}</h1>
            
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-200">
                <span class="flex items-center">
                    <i class="far fa-user text-red-main mr-2"></i>${news.tac_gia || 'Admin'}
                </span>
                <span class="flex items-center">
                    <i class="far fa-calendar text-red-main mr-2"></i>${formatDate(news.ngay_dang)}
                </span>
                <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Tin công nghệ</span>
                ${news.video_url ? '<span class="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center"><i class="fas fa-video mr-1"></i>Có video</span>' : ''}
            </div>

            <div class="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-6">
                <img src="${getNewsImage(news.anh_dai_dien)}" alt="${news.tieu_de}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='images/inta.webp'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            ${videoHtml}

            <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                ${news.noi_dung.split('\n').filter(p => p.trim()).map(p => `<p class="mb-4">${p.trim()}</p>`).join('')}
            </div>

            <div class="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center gap-4">
                <span class="text-gray-700 font-semibold">Chia sẻ:</span>
                <div class="flex gap-2">
                    <a href="#" class="w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition text-sm">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" class="w-9 h-9 bg-sky-500 hover:bg-sky-600 rounded-full flex items-center justify-center text-white transition text-sm">
                        <i class="fab fa-twitter"></i>
                    </a>
                    <a href="#" class="w-9 h-9 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition text-sm">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>
        `;
    }
}

function renderRelatedNews(relatedNews) {
    const container = document.getElementById('related-news');
    if (!container || !relatedNews || relatedNews.length === 0) return;

    container.innerHTML = `
        <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span class="w-1 h-5 bg-red-main mr-2 rounded"></span>BÀI VIẾT LIÊN QUAN
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
            ${relatedNews.slice(0, 4).map((news, index) => `
                <a href="news-detail.html?id=${news.ma_tintuc}" class="flex gap-4 group">
                    <div class="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img src="${getNewsImage(news.anh_dai_dien)}" alt="${news.tieu_de}" 
                             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                             onerror="this.src='images/uni8.jpg'">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors mb-1">
                            ${news.tieu_de}
                        </h4>
                        <p class="text-xs text-gray-500">
                            <i class="far fa-clock mr-1"></i>${formatDate(news.ngay_dang)}
                        </p>
                    </div>
                </a>
            `).join('')}
        </div>
    `;
}

function showNewsNotFound() {
    const articleContainer = document.getElementById('news-article');
    if (articleContainer) {
        articleContainer.innerHTML = `
            <div class="py-12 text-center">
                <i class="fas fa-newspaper text-6xl text-gray-300 mb-6"></i>
                <h2 class="text-2xl font-bold text-gray-700 mb-3">Không tìm thấy tin tức</h2>
                <p class="text-gray-500 mb-6">Tin tức bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
                <a href="news.html" class="inline-block bg-red-main text-white px-6 py-2.5 rounded-lg hover:bg-red-dark transition font-semibold">
                    <i class="fas fa-arrow-left mr-2"></i>Quay lại
                </a>
            </div>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const isNewsPage = path.endsWith('news.html') || path.endsWith('news');
    const isNewsDetailPage = path.includes('news-detail');

    if (isNewsPage) {
        loadNews();
    }

    if (isNewsDetailPage) {
        loadNewsDetail();
    }
});

