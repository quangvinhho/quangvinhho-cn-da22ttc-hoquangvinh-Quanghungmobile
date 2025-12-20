/**
 * Floating Share Buttons Component
 * Hiển thị nút chia sẻ nổi với các liên kết mạng xã hội
 * Không hiển thị trên trang login, register, admin
 */

(function() {
    // Kiểm tra trang hiện tại - không hiển thị trên login, register, admin
    const currentPage = window.location.pathname.toLowerCase();
    const excludedPages = ['login.html', 'register.html', 'admin.html', 'admin-login.html', 'forgot-password.html'];
    
    const isExcluded = excludedPages.some(page => currentPage.includes(page));
    if (isExcluded) return;

    // Tạo CSS cho floating share buttons
    const style = document.createElement('style');
    style.textContent = `
        /* Floating Share Container */
        .floating-share-container {
            position: fixed;
            right: 20px;
            bottom: 100px;
            z-index: 9998;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        /* Nút Share chính */
        .share-toggle-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #e53935;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 0 8px rgba(229, 57, 53, 0.25), 0 0 0 16px rgba(229, 57, 53, 0.15);
            transition: all 0.3s ease;
            position: relative;
            z-index: 10;
        }

        .share-toggle-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 0 0 10px rgba(229, 57, 53, 0.3), 0 0 0 20px rgba(229, 57, 53, 0.2);
        }

        .share-toggle-btn i {
            color: white;
            font-size: 24px;
            transition: transform 0.4s ease;
        }

        .share-toggle-btn.active i {
            transform: rotate(360deg);
        }

        /* Pulse animation cho nút share */
        .share-toggle-btn::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(229, 57, 53, 0.4);
            animation: sharePulse 2s ease-in-out infinite;
            z-index: -1;
        }

        @keyframes sharePulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.4); opacity: 0; }
        }

        /* Container các nút social */
        .share-buttons-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .share-buttons-list.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        /* Các nút social với vòng tròn kép */
        .share-btn {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            text-decoration: none;
            position: relative;
            opacity: 0;
            transform: scale(0);
        }

        .share-btn:hover {
            transform: scale(1.15) !important;
        }

        .share-btn i {
            font-size: 22px;
            color: white;
            position: relative;
            z-index: 2;
        }

        /* Tooltip */
        .share-btn::after {
            content: attr(data-tooltip);
            position: absolute;
            right: 65px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            pointer-events: none;
        }

        .share-btn:hover::after {
            opacity: 1;
            visibility: visible;
            right: 70px;
        }

        /* ===== Màu sắc theo hình ===== */
        
        /* Location - Đỏ với vòng tròn kép */
        .share-btn.location {
            background: #e53935;
            box-shadow: 0 0 0 6px rgba(229, 57, 53, 0.3), 0 0 0 12px rgba(229, 57, 53, 0.15);
        }
        .share-btn.location:hover {
            box-shadow: 0 0 0 8px rgba(229, 57, 53, 0.4), 0 0 0 16px rgba(229, 57, 53, 0.2);
        }

        /* Email - Vàng với vòng tròn kép */
        .share-btn.email {
            background: #fdd835;
            box-shadow: 0 0 0 6px rgba(253, 216, 53, 0.35), 0 0 0 12px rgba(253, 216, 53, 0.18);
        }
        .share-btn.email:hover {
            box-shadow: 0 0 0 8px rgba(253, 216, 53, 0.45), 0 0 0 16px rgba(253, 216, 53, 0.25);
        }
        .share-btn.email i {
            color: white;
        }

        /* Facebook - Xanh dương với vòng tròn kép */
        .share-btn.facebook {
            background: #1877f2;
            box-shadow: 0 0 0 6px rgba(24, 119, 242, 0.3), 0 0 0 12px rgba(24, 119, 242, 0.15);
        }
        .share-btn.facebook:hover {
            box-shadow: 0 0 0 8px rgba(24, 119, 242, 0.4), 0 0 0 16px rgba(24, 119, 242, 0.2);
        }

        /* Messenger - Tím với vòng tròn kép */
        .share-btn.messenger {
            background: #a855f7;
            box-shadow: 0 0 0 6px rgba(168, 85, 247, 0.3), 0 0 0 12px rgba(168, 85, 247, 0.15);
        }
        .share-btn.messenger:hover {
            box-shadow: 0 0 0 8px rgba(168, 85, 247, 0.4), 0 0 0 16px rgba(168, 85, 247, 0.2);
        }

        /* TikTok - Đen với vòng tròn kép xám */
        .share-btn.tiktok {
            background: #000000;
            box-shadow: 0 0 0 6px rgba(100, 100, 100, 0.35), 0 0 0 12px rgba(100, 100, 100, 0.18);
        }
        .share-btn.tiktok:hover {
            box-shadow: 0 0 0 8px rgba(100, 100, 100, 0.45), 0 0 0 16px rgba(100, 100, 100, 0.25);
        }

        /* Zalo - Xanh dương nhạt với vòng tròn kép */
        .share-btn.zalo {
            background: #0068ff;
            box-shadow: 0 0 0 6px rgba(0, 104, 255, 0.3), 0 0 0 12px rgba(0, 104, 255, 0.15);
        }
        .share-btn.zalo:hover {
            box-shadow: 0 0 0 8px rgba(0, 104, 255, 0.4), 0 0 0 16px rgba(0, 104, 255, 0.2);
        }

        /* Animation cho từng nút khi hiện - bounce effect */
        .share-buttons-list.show .share-btn:nth-child(1) { animation: shareBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards 0.05s; }
        .share-buttons-list.show .share-btn:nth-child(2) { animation: shareBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards 0.1s; }
        .share-buttons-list.show .share-btn:nth-child(3) { animation: shareBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards 0.15s; }
        .share-buttons-list.show .share-btn:nth-child(4) { animation: shareBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards 0.2s; }
        .share-buttons-list.show .share-btn:nth-child(5) { animation: shareBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards 0.25s; }
        .share-buttons-list.show .share-btn:nth-child(6) { animation: shareBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards 0.3s; }

        @keyframes shareBounceIn {
            0% { 
                transform: scale(0) rotate(-180deg); 
                opacity: 0; 
            }
            60% { 
                transform: scale(1.2) rotate(10deg); 
                opacity: 1; 
            }
            100% { 
                transform: scale(1) rotate(0deg); 
                opacity: 1; 
            }
        }

        /* Hiệu ứng nhấp nháy nhẹ cho các nút */
        .share-buttons-list.show .share-btn {
            animation-fill-mode: forwards;
        }

        /* Floating animation khi đã hiện */
        @keyframes floatBtn {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }

        .share-buttons-list.show .share-btn:nth-child(odd) {
            animation: shareBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards, floatBtn 3s ease-in-out infinite 0.6s;
        }

        .share-buttons-list.show .share-btn:nth-child(even) {
            animation: shareBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards, floatBtn 3s ease-in-out infinite 0.9s;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .floating-share-container {
                right: 15px;
                bottom: 80px;
            }

            .share-toggle-btn {
                width: 52px;
                height: 52px;
                box-shadow: 0 0 0 6px rgba(229, 57, 53, 0.25), 0 0 0 12px rgba(229, 57, 53, 0.15);
            }

            .share-toggle-btn i {
                font-size: 20px;
            }

            .share-btn {
                width: 46px;
                height: 46px;
            }

            .share-btn i {
                font-size: 18px;
            }

            .share-btn::after {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);

    // Tạo HTML cho floating share buttons
    const container = document.createElement('div');
    container.className = 'floating-share-container';
    container.innerHTML = `
        <!-- Các nút social -->
        <div class="share-buttons-list" id="shareButtonsList">
            <a href="https://maps.google.com/?q=Nam+Kỳ+Khởi+Nghĩa,+Phường+2,+Trà+Vinh" target="_blank" class="share-btn location" data-tooltip="Vị trí cửa hàng">
                <i class="fas fa-map-marker-alt"></i>
            </a>
            <a href="https://www.facebook.com/share/183XCxD3i5/" target="_blank" class="share-btn facebook" data-tooltip="Facebook">
                <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.tiktok.com/@qv25084?_r=1&_t=ZS-92NB3IAtk5n" target="_blank" class="share-btn tiktok" data-tooltip="TikTok">
                <i class="fab fa-tiktok"></i>
            </a>
            <a href="https://zalo.me/0388516888" target="_blank" class="share-btn zalo" data-tooltip="Chat Zalo">
                <span style="font-weight: bold; font-size: 14px; color: white;">Zalo</span>
            </a>
        </div>
        
        <!-- Nút toggle chính -->
        <button class="share-toggle-btn" id="shareToggleBtn" title="Chia sẻ & Liên hệ">
            <i class="fas fa-share-alt"></i>
        </button>
    `;

    // Thêm vào body khi DOM ready
    function init() {
        document.body.appendChild(container);

        // Toggle hiển thị các nút social
        const toggleBtn = document.getElementById('shareToggleBtn');
        const buttonsList = document.getElementById('shareButtonsList');

        toggleBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            buttonsList.classList.toggle('show');
        });

        // Đóng khi click ra ngoài
        document.addEventListener('click', function(e) {
            if (!container.contains(e.target)) {
                toggleBtn.classList.remove('active');
                buttonsList.classList.remove('show');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
