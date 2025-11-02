// Load Header and Navigation component
async function loadHeaderNav() {
  try {
    const response = await fetch('components/header-nav.html');
    const html = await response.text();
    
    // Remove existing header and nav if present
    const existingHeader = document.querySelector('header');
    const existingNav = document.querySelector('nav');
    if (existingHeader) existingHeader.remove();
    if (existingNav) existingNav.remove();
    
    // Insert at the beginning of body
    const body = document.body;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Insert all children from the loaded HTML
    while (tempDiv.firstChild) {
      body.insertBefore(tempDiv.firstChild, body.firstChild);
    }
    
    console.log('Header and navigation loaded successfully');
  } catch (error) {
    console.error('Error loading header:', error);
  }
}

// Load header when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadHeaderNav);
} else {
  loadHeaderNav();
}
