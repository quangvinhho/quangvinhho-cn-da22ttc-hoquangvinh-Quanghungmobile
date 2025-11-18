// Products Page JavaScript

// Banner Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.banner-slide');
const dots = document.querySelectorAll('.slider-dot');

function showSlide(index) {
  if (!slides.length) return;
  
  // Hide all slides
  slides.forEach(slide => {
    slide.style.opacity = '0';
    slide.style.zIndex = '0';
  });
  
  // Show current slide
  if (slides[index]) {
    slides[index].style.opacity = '1';
    slides[index].style.zIndex = '1';
  }
  
  // Update dots
  if (dots.length) {
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.style.backgroundColor = '#d91e23';
        dot.style.width = '24px';
      } else {
        dot.style.backgroundColor = 'rgba(255,255,255,0.5)';
        dot.style.width = '8px';
      }
    });
  }
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

function goToSlide(index) {
  currentSlide = index;
  showSlide(currentSlide);
}

// Auto slide
let autoSlideInterval;
function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
  clearInterval(autoSlideInterval);
}

// Initialize slider
if (slides.length > 0) {
  showSlide(0);
  startAutoSlide();
  
  // Pause on hover
  const bannerSlider = document.getElementById('bannerSlider');
  if (bannerSlider) {
    bannerSlider.addEventListener('mouseenter', stopAutoSlide);
    bannerSlider.addEventListener('mouseleave', startAutoSlide);
  }
}

// Filter Functions
function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const icon = document.getElementById(sectionId.replace('Section', 'Icon'));
  
  if (section && icon) {
    section.classList.toggle('hidden');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
  }
}

function filterByBrand(brand) {
  // Redirect to products page with brand filter
  window.location.href = `products.html?brand=${brand}`;
}

function toggleBrandFilter(brand) {
  applyFilters();
}

function toggleAccessoryFilter(type) {
  applyFilters();
}

function applyFilters() {
  // Get all checked filters
  const brandFilters = Array.from(document.querySelectorAll('.brand-filter:checked')).map(cb => cb.value);
  const priceFilters = Array.from(document.querySelectorAll('.price-filter:checked')).map(cb => cb.value);
  const osFilters = Array.from(document.querySelectorAll('.os-filter:checked')).map(cb => cb.value);
  const romFilters = Array.from(document.querySelectorAll('.rom-filter:checked')).map(cb => cb.value);
  const connectFilters = Array.from(document.querySelectorAll('.connect-filter:checked')).map(cb => cb.value);
  const batteryFilters = Array.from(document.querySelectorAll('.battery-filter:checked')).map(cb => cb.value);
  
  // Build query string
  const params = new URLSearchParams();
  if (brandFilters.length) params.set('brands', brandFilters.join(','));
  if (priceFilters.length) params.set('prices', priceFilters.join(','));
  if (osFilters.length) params.set('os', osFilters.join(','));
  if (romFilters.length) params.set('rom', romFilters.join(','));
  if (connectFilters.length) params.set('connect', connectFilters.join(','));
  if (batteryFilters.length) params.set('battery', batteryFilters.join(','));
  
  // Reload page with filters
  const queryString = params.toString();
  if (queryString) {
    window.location.href = `products.html?${queryString}`;
  }
}

function applyCustomPriceRange() {
  const minPrice = document.getElementById('minPrice')?.value || 0;
  const maxPrice = document.getElementById('maxPrice')?.value || 999999999;
  
  window.location.href = `products.html?minPrice=${minPrice}&maxPrice=${maxPrice}`;
}

// Load products from JSON or API
async function loadProducts() {
  try {
    const response = await fetch('product-data.json');
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function displayProducts(products) {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return;
  
  productsGrid.innerHTML = '';
  
  products.forEach(product => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <div class="relative mb-2">
      ${product.badge ? `<span class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">${product.badge}</span>` : ''}
      ${product.discount ? `<span class="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">-${product.discount}%</span>` : ''}
      <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-contain rounded">
    </div>
    <h4 class="font-bold text-sm mb-1 line-clamp-2 h-10">${product.name}</h4>
    <div class="mb-2">
      <div class="text-lg font-black text-red-600">${formatPrice(product.price)}₫</div>
      ${product.originalPrice ? `<div class="text-xs text-gray-400 line-through">${formatPrice(product.originalPrice)}₫</div>` : ''}
    </div>
    <button onclick="addToCart('${product.id}')" class="cta-button w-full">
      <i class="fas fa-shopping-cart mr-2"></i>Thêm vào giỏ
    </button>
  `;
  
  return card;
}

function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function addToCart(productId) {
  // Add to cart logic
  console.log('Added to cart:', productId);
  
  // Update cart badge
  const event = new Event('cartUpdated');
  window.dispatchEvent(event);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Load products if on products page
  if (document.getElementById('productsGrid')) {
    loadProducts();
  }
});
