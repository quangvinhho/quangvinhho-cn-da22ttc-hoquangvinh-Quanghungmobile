async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
            
            // If header is loaded, initialize menu highlighting
            if (elementId === 'header') {
                setTimeout(() => {
                    highlightActiveMenu();
                    initMobileMenu();
                }, 100);
            }
        }
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}

// Highlight active menu based on current page
function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop() || 'index.html';
    
    // Desktop navigation - New navbar structure
    const navLinks = document.querySelectorAll('.navbar-nav .nav-item');
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === fileName || 
            (fileName === '' && linkPath === 'index.html') ||
            (fileName === 'index.html' && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Mobile navigation - New structure
    const mobileLinks = document.querySelectorAll('.mobile-nav .mobile-nav-item');
    mobileLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === fileName || 
            (fileName === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Initialize mobile menu functionality
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    }

    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }

    // Close menu when clicking overlay
    if (mobileMenuOverlay && mobileMenu) {
        mobileMenuOverlay.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }

    // Close menu when clicking a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav .mobile-nav-item');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        });
    });
}

// Load all components when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header', 'components/header.html');
    loadComponent('footer', 'components/footer.html');
    
    // Load profile sidebar if it exists on the page
    const profileSidebar = document.getElementById('profile-sidebar');
    if (profileSidebar) {
        loadComponent('profile-sidebar', '/components/profile-sidebar.html');
    }
});
