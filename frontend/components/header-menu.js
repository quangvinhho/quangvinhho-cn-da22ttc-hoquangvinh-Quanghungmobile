// Mobile menu toggle functionality for new header
(function() {
    function initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuSidebar = document.getElementById('mobile-menu-sidebar');
        const mobileMenuClose = document.getElementById('mobile-menu-close');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('hidden');
                setTimeout(() => {
                    mobileMenuSidebar.classList.remove('-translate-x-full');
                }, 10);
                document.body.style.overflow = 'hidden';
            });
        }

        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => {
                mobileMenuSidebar.classList.add('-translate-x-full');
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                    document.body.style.overflow = '';
                }, 300);
            });
        }

        if (mobileMenu) {
            mobileMenu.addEventListener('click', (e) => {
                if (e.target === mobileMenu) {
                    mobileMenuSidebar.classList.add('-translate-x-full');
                    setTimeout(() => {
                        mobileMenu.classList.add('hidden');
                        document.body.style.overflow = '';
                    }, 300);
                }
            });
        }
    }

    // Search functionality
    function handleSearch(input) {
        const searchTerm = input.value.trim();
        if (searchTerm) {
            window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
        }
    }

    function initSearch() {
        // Desktop search
        const desktopSearchInput = document.getElementById('desktop-search-input');
        const desktopSearchBtn = document.getElementById('desktop-search-btn');

        if (desktopSearchInput) {
            desktopSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(desktopSearchInput);
                }
            });
        }

        if (desktopSearchBtn) {
            desktopSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleSearch(desktopSearchInput);
            });
        }

        // Mobile search
        const mobileSearchInput = document.getElementById('mobile-search-input');
        const mobileSearchBtn = document.getElementById('mobile-search-btn');

        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(mobileSearchInput);
                }
            });
        }

        if (mobileSearchBtn) {
            mobileSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleSearch(mobileSearchInput);
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initMobileMenu();
            initSearch();
        });
    } else {
        initMobileMenu();
        initSearch();
    }
})();
