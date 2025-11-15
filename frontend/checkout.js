// ===== CHECKOUT PAGE LOGIC =====
// QuangHưng Mobile - Modern E-commerce 2025

// ===== GLOBAL VARIABLES =====
let cart = [];
let subtotal = 0;
let shippingFee = 0;
let discount = 0;
let selectedShipping = 'standard';
let selectedPayment = 'cod';

// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ';
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed top-24 right-6 z-50 px-6 py-4 rounded-lg shadow-xl text-white font-semibold animate-slide-in ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== LOAD CART DATA =====
function loadCart() {
  // Get cart from localStorage
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  } else {
    // Demo cart data if empty
    cart = [
      {
        id: 5,
        name: 'iPhone 15 Pro Max 256GB',
        price: 28990000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1695048064998-18d5e69328c6?w=100&h=100&fit=crop',
        color: 'Titan Tự Nhiên',
        storage: '256GB'
      },
      {
        id: 9,
        name: 'Samsung Galaxy S24 Ultra 12GB 256GB',
        price: 29990000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b4?w=100&h=100&fit=crop',
        color: 'Titan Xám',
        storage: '256GB'
      }
    ];
  }
  
  renderCart();
  calculateTotal();
}

// ===== RENDER CART ITEMS =====
function renderCart() {
  const cartItemsContainer = document.getElementById('cartItems');
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-3"></i>
        <p class="text-gray-600">Giỏ hàng trống</p>
        <a href="products.html" class="text-red-600 hover:underline text-sm mt-2 inline-block">
          Tiếp tục mua sắm
        </a>
      </div>
    `;
    return;
  }
  
  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain rounded-lg border border-gray-200">
      <div class="flex-1">
        <h4 class="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">${item.name}</h4>
        ${item.color ? `<p class="text-xs text-gray-600">Màu: ${item.color}</p>` : ''}
        ${item.storage ? `<p class="text-xs text-gray-600">Dung lượng: ${item.storage}</p>` : ''}
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-gray-600">SL: ${item.quantity}</span>
          <span class="font-bold text-red-600 text-sm">${formatPrice(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== CALCULATE TOTAL =====
function calculateTotal() {
  subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Update UI
  document.getElementById('subtotal').textContent = formatPrice(subtotal);
  document.getElementById('shippingFee').textContent = shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee);
  
  if (discount > 0) {
    document.getElementById('discountRow').classList.remove('hidden');
    document.getElementById('discount').textContent = '-' + formatPrice(discount);
  } else {
    document.getElementById('discountRow').classList.add('hidden');
  }
  
  const total = subtotal + shippingFee - discount;
  document.getElementById('total').textContent = formatPrice(total);
}

// ===== SHIPPING METHOD SELECTION =====
function selectShipping(element, method) {
  // Remove selected class from all
  document.querySelectorAll('.shipping-method').forEach(el => {
    el.classList.remove('selected');
  });
  
  // Add selected class to clicked element
  element.classList.add('selected');
  
  // Update radio button
  element.querySelector('input[type="radio"]').checked = true;
  
  // Update shipping fee
  selectedShipping = method;
  if (method === 'express') {
    shippingFee = 30000;
  } else {
    shippingFee = 0;
  }
  
  calculateTotal();
}

// ===== PAYMENT METHOD SELECTION =====
function selectPayment(element, method) {
  // Remove selected class from all
  document.querySelectorAll('.payment-method').forEach(el => {
    el.classList.remove('selected');
  });
  
  // Add selected class to clicked element
  element.classList.add('selected');
  
  // Update radio button
  element.querySelector('input[type="radio"]').checked = true;
  
  selectedPayment = method;
}

// ===== APPLY VOUCHER =====
function applyVoucher() {
  const voucherCode = document.getElementById('voucherCode').value.trim().toUpperCase();
  
  if (!voucherCode) {
    showToast('Vui lòng nhập mã giảm giá!', 'error');
    return;
  }
  
  // Demo voucher codes
  const vouchers = {
    'GIAM50K': 50000,
    'GIAM100K': 100000,
    'GIAM10': subtotal * 0.1, // 10%
    'FREESHIP': shippingFee
  };
  
  if (vouchers[voucherCode]) {
    discount = vouchers[voucherCode];
    calculateTotal();
    showToast(`Áp dụng mã giảm giá thành công! Giảm ${formatPrice(discount)}`, 'success');
  } else {
    showToast('Mã giảm giá không hợp lệ!', 'error');
  }
}

// ===== VALIDATE FORM =====
function validateForm() {
  const fullName = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const province = document.getElementById('province').value;
  const district = document.getElementById('district').value;
  const ward = document.getElementById('ward').value;
  const address = document.getElementById('address').value.trim();
  
  if (!fullName) {
    showToast('Vui lòng nhập họ tên!', 'error');
    document.getElementById('fullName').focus();
    return false;
  }
  
  if (!phone) {
    showToast('Vui lòng nhập số điện thoại!', 'error');
    document.getElementById('phone').focus();
    return false;
  }
  
  // Validate phone number (Vietnamese format)
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    showToast('Số điện thoại không hợp lệ!', 'error');
    document.getElementById('phone').focus();
    return false;
  }
  
  if (!province) {
    showToast('Vui lòng chọn Tỉnh/Thành phố!', 'error');
    document.getElementById('province').focus();
    return false;
  }
  
  if (!district) {
    showToast('Vui lòng chọn Quận/Huyện!', 'error');
    document.getElementById('district').focus();
    return false;
  }
  
  if (!ward) {
    showToast('Vui lòng chọn Phường/Xã!', 'error');
    document.getElementById('ward').focus();
    return false;
  }
  
  if (!address) {
    showToast('Vui lòng nhập địa chỉ cụ thể!', 'error');
    document.getElementById('address').focus();
    return false;
  }
  
  return true;
}

// ===== PLACE ORDER =====
function placeOrder() {
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Check if cart is empty
  if (cart.length === 0) {
    showToast('Giỏ hàng trống! Vui lòng thêm sản phẩm.', 'error');
    return;
  }
  
  // Collect order data
  const orderData = {
    customer: {
      fullName: document.getElementById('fullName').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
    },
    address: {
      province: document.getElementById('province').value,
      district: document.getElementById('district').value,
      ward: document.getElementById('ward').value,
      detail: document.getElementById('address').value.trim(),
      note: document.getElementById('note').value.trim()
    },
    shipping: {
      method: selectedShipping,
      fee: shippingFee
    },
    payment: {
      method: selectedPayment
    },
    items: cart,
    pricing: {
      subtotal: subtotal,
      shippingFee: shippingFee,
      discount: discount,
      total: subtotal + shippingFee - discount
    },
    orderDate: new Date().toISOString()
  };
  
  // Save order to localStorage (demo)
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const orderId = 'DH' + Date.now();
  orderData.orderId = orderId;
  orders.push(orderData);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Clear cart
  localStorage.removeItem('cart');
  
  // Show success message
  showToast('Đặt hàng thành công! Đang chuyển hướng...', 'success');
  
  // Redirect to success page after 2 seconds
  setTimeout(() => {
    window.location.href = `order-success.html?orderId=${orderId}`;
  }, 2000);
}

// ===== PROVINCE/DISTRICT/WARD SELECTION =====
document.getElementById('province')?.addEventListener('change', function() {
  const districtSelect = document.getElementById('district');
  const wardSelect = document.getElementById('ward');
  
  // Reset district and ward
  districtSelect.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
  wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
  
  // Demo districts based on province
  const districts = {
    'hanoi': ['Ba Đình', 'Hoàn Kiếm', 'Đống Đa', 'Hai Bà Trưng', 'Cầu Giấy', 'Thanh Xuân'],
    'hcm': ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 10', 'Bình Thạnh', 'Gò Vấp'],
    'danang': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu'],
    'haiphong': ['Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An'],
    'cantho': ['Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn', 'Thốt Nốt']
  };
  
  const selectedProvince = this.value;
  if (districts[selectedProvince]) {
    districts[selectedProvince].forEach(district => {
      const option = document.createElement('option');
      option.value = district.toLowerCase().replace(/\s/g, '-');
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }
});

document.getElementById('district')?.addEventListener('change', function() {
  const wardSelect = document.getElementById('ward');
  
  // Reset ward
  wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
  
  // Demo wards (simplified)
  const wards = ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5'];
  
  wards.forEach(ward => {
    const option = document.createElement('option');
    option.value = ward.toLowerCase().replace(/\s/g, '-');
    option.textContent = ward;
    wardSelect.appendChild(option);
  });
});

// ===== PAGE INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  
  // Auto-fill demo data (for testing)
  if (window.location.search.includes('demo=1')) {
    document.getElementById('fullName').value = 'Nguyễn Văn A';
    document.getElementById('phone').value = '0912345678';
    document.getElementById('email').value = 'nguyenvana@email.com';
    document.getElementById('province').value = 'hanoi';
    document.getElementById('province').dispatchEvent(new Event('change'));
    setTimeout(() => {
      document.getElementById('district').value = 'cau-giay';
      document.getElementById('district').dispatchEvent(new Event('change'));
      setTimeout(() => {
        document.getElementById('ward').value = 'phuong-1';
        document.getElementById('address').value = 'Số 123, Đường ABC';
      }, 100);
    }, 100);
  }
});
