// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');

    // Open mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.remove('hidden');
        });
    }

    // Close mobile menu
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
        });
    }

    // Close when clicking outside
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // Highlight active page in navigation
    highlightActivePage();
});

function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('header nav a, .mobile-menu nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            // Desktop menu
            if (link.closest('header nav')) {
                link.classList.add('text-yellow-300');
                const underline = link.querySelector('span:last-child');
                if (underline) {
                    underline.classList.remove('w-0');
                    underline.classList.add('w-full');
                }
            }
            // Mobile menu
            if (link.closest('.mobile-menu nav')) {
                link.classList.remove('text-gray-700');
                link.classList.add('text-red-600', 'bg-red-50');
            }
        }
    });
}
