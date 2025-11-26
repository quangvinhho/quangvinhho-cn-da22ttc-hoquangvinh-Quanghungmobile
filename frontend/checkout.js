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

// ===== QR CODE PAYMENT VARIABLES =====
let qrCountdownInterval = null;
let qrTimeRemaining = 30 * 60; // 30 minutes in seconds
let currentOrderId = null;

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
  
  // Generate order ID
  const orderId = 'DH' + Date.now();
  currentOrderId = orderId;
  
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
    orderDate: new Date().toISOString(),
    orderId: orderId,
    status: selectedPayment === 'cod' ? 'confirmed' : 'pending_payment'
  };
  
  // Check if payment method requires QR code
  if (['bank', 'momo', 'vnpay'].includes(selectedPayment)) {
    // Show QR code modal
    showQRPaymentModal(orderData);
    return;
  }
  
  // For COD and installment, proceed directly
  completeOrder(orderData);
}

// ===== SHOW QR PAYMENT MODAL =====
function showQRPaymentModal(orderData) {
  const modal = document.getElementById('qrPaymentModal');
  const total = orderData.pricing.total;
  
  // Update modal info
  document.getElementById('qrOrderId').textContent = orderData.orderId;
  document.getElementById('qrAmount').textContent = formatPrice(total);
  document.getElementById('bankTransferContent').textContent = orderData.orderId;
  
  // Set payment method name
  const paymentNames = {
    'bank': 'Chuyển khoản ngân hàng',
    'momo': 'Ví MoMo',
    'vnpay': 'VNPay'
  };
  document.getElementById('qrPaymentMethod').textContent = paymentNames[selectedPayment] || selectedPayment;
  
  // Show/hide bank info section
  const bankInfoSection = document.getElementById('bankInfoSection');
  if (selectedPayment === 'bank') {
    bankInfoSection.classList.remove('hidden');
  } else {
    bankInfoSection.classList.add('hidden');
  }
  
  // Generate QR Code
  generateQRCode(orderData);
  
  // Start countdown
  qrTimeRemaining = 30 * 60; // Reset to 30 minutes
  startQRCountdown();
  
  // Show modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  
  // Save pending order
  localStorage.setItem('pendingOrder', JSON.stringify(orderData));
}

// ===== GENERATE QR CODE =====
function generateQRCode(orderData) {
  const container = document.getElementById('qrCodeContainer');
  container.innerHTML = ''; // Clear previous QR
  
  // Create QR data (payment info)
  const qrData = {
    orderId: orderData.orderId,
    amount: orderData.pricing.total,
    method: selectedPayment,
    bank: 'Vietcombank',
    account: '1234567890123',
    name: 'QUANG HUNG MOBILE',
    content: orderData.orderId,
    expiry: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  };
  
  // For bank transfer, create VietQR format
  let qrString = '';
  if (selectedPayment === 'bank') {
    // VietQR format (simplified)
    qrString = `https://img.vietqr.io/image/VCB-1234567890123-compact2.png?amount=${orderData.pricing.total}&addInfo=${orderData.orderId}&accountName=QUANG%20HUNG%20MOBILE`;
    
    // Use image for VietQR
    const img = document.createElement('img');
    img.src = qrString;
    img.alt = 'QR Code thanh toán';
    img.className = 'w-48 h-48 object-contain';
    img.onerror = function() {
      // Fallback to generated QR if image fails
      generateFallbackQR(container, JSON.stringify(qrData));
    };
    container.appendChild(img);
  } else {
    // For MoMo/VNPay, generate QR code
    generateFallbackQR(container, JSON.stringify(qrData));
  }
}

// ===== FALLBACK QR GENERATION =====
function generateFallbackQR(container, data) {
  // Check if QRCode library is loaded
  if (typeof QRCode !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 192;
    canvas.height = 192;
    container.appendChild(canvas);
    
    QRCode.toCanvas(canvas, data, {
      width: 192,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } else {
    // Simple fallback - show placeholder
    container.innerHTML = `
      <div class="w-48 h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500">
        <i class="fas fa-qrcode text-5xl mb-2"></i>
        <p class="text-xs text-center px-4">Mã QR thanh toán<br>${data.substring(0, 20)}...</p>
      </div>
    `;
  }
}

// ===== START QR COUNTDOWN =====
function startQRCountdown() {
  // Clear existing interval
  if (qrCountdownInterval) {
    clearInterval(qrCountdownInterval);
  }
  
  updateCountdownDisplay();
  
  qrCountdownInterval = setInterval(() => {
    qrTimeRemaining--;
    updateCountdownDisplay();
    
    if (qrTimeRemaining <= 0) {
      clearInterval(qrCountdownInterval);
      handleQRExpired();
    }
  }, 1000);
}

// ===== UPDATE COUNTDOWN DISPLAY =====
function updateCountdownDisplay() {
  const minutes = Math.floor(qrTimeRemaining / 60);
  const seconds = qrTimeRemaining % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const countdownEl = document.getElementById('qrCountdown');
  if (countdownEl) {
    countdownEl.textContent = display;
    
    // Change color when time is running low
    if (qrTimeRemaining <= 300) { // 5 minutes
      countdownEl.classList.add('text-orange-600');
      countdownEl.classList.remove('text-red-600');
    }
    if (qrTimeRemaining <= 60) { // 1 minute
      countdownEl.classList.add('animate-pulse');
    }
  }
}

// ===== HANDLE QR EXPIRED =====
function handleQRExpired() {
  const container = document.getElementById('qrCodeContainer');
  container.classList.add('qr-expired');
  
  document.getElementById('qrCountdown').textContent = 'Hết hạn';
  document.getElementById('qrCountdown').classList.add('text-gray-500');
  
  // Show expired message
  const expiredMsg = document.createElement('div');
  expiredMsg.className = 'absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-xl';
  expiredMsg.innerHTML = `
    <i class="fas fa-clock text-4xl text-gray-400 mb-2"></i>
    <p class="font-bold text-gray-700">Mã QR đã hết hạn</p>
    <button onclick="regenerateQR()" class="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
      <i class="fas fa-redo mr-1"></i> Tạo mã mới
    </button>
  `;
  container.parentElement.style.position = 'relative';
  container.parentElement.appendChild(expiredMsg);
  
  showToast('Mã QR đã hết hạn! Vui lòng tạo mã mới.', 'error');
}

// ===== REGENERATE QR =====
function regenerateQR() {
  const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
  if (pendingOrder) {
    // Generate new order ID
    pendingOrder.orderId = 'DH' + Date.now();
    currentOrderId = pendingOrder.orderId;
    
    // Reset and regenerate
    const container = document.getElementById('qrCodeContainer');
    container.classList.remove('qr-expired');
    
    // Remove expired message
    const expiredMsg = container.parentElement.querySelector('.absolute');
    if (expiredMsg) expiredMsg.remove();
    
    // Update display
    document.getElementById('qrOrderId').textContent = pendingOrder.orderId;
    document.getElementById('bankTransferContent').textContent = pendingOrder.orderId;
    document.getElementById('qrCountdown').classList.remove('text-gray-500', 'text-orange-600', 'animate-pulse');
    document.getElementById('qrCountdown').classList.add('text-red-600');
    
    // Regenerate QR
    generateQRCode(pendingOrder);
    
    // Restart countdown
    qrTimeRemaining = 30 * 60;
    startQRCountdown();
    
    // Update pending order
    localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
    
    showToast('Đã tạo mã QR mới!', 'success');
  }
}

// ===== CLOSE QR MODAL =====
function closeQRModal() {
  const modal = document.getElementById('qrPaymentModal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  
  // Clear countdown
  if (qrCountdownInterval) {
    clearInterval(qrCountdownInterval);
  }
}

// ===== CONFIRM PAYMENT =====
function confirmPayment() {
  const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
  if (pendingOrder) {
    pendingOrder.status = 'paid';
    pendingOrder.paidAt = new Date().toISOString();
    completeOrder(pendingOrder);
  }
  closeQRModal();
}

// ===== COMPLETE ORDER =====
function completeOrder(orderData) {
  // Save order to localStorage
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(orderData);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Clear cart and pending order
  localStorage.removeItem('cart');
  localStorage.removeItem('pendingOrder');
  
  // Show success message
  showToast('Đặt hàng thành công! Đang chuyển hướng...', 'success');
  
  // Redirect to success page after 2 seconds
  setTimeout(() => {
    window.location.href = `order-success.html?orderId=${orderData.orderId}`;
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
