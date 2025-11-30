// ===== CHECKOUT PAGE LOGIC =====
// QuangHưng Mobile - Modern E-commerce 2025

// ===== GLOBAL VARIABLES =====
const API_URL = 'http://localhost:3000/api';
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

// Lấy cart key theo user (mỗi user có giỏ hàng riêng)
function getCartKey() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user && user.ma_kh) {
    return `cart_user_${user.ma_kh}`;
  }
  return 'cart_guest';
}

// ===== LOAD CART DATA =====
async function loadCart() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Nếu user đã đăng nhập, thử load từ database trước
  if (user && user.ma_kh) {
    try {
      const response = await fetch(`${API_URL}/cart/${user.ma_kh}`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        cart = data.data;
        renderCart();
        calculateTotal();
        return;
      }
    } catch (error) {
      console.log('Fallback to localStorage:', error.message);
    }
  }
  
  // Fallback: Get cart from localStorage theo user
  const cartKey = getCartKey();
  const savedCart = localStorage.getItem(cartKey);
  
  if (savedCart) {
    const parsedCart = JSON.parse(savedCart);
    // Chỉ dùng nếu cart có sản phẩm
    if (parsedCart && parsedCart.length > 0) {
      cart = parsedCart;
    } else {
      cart = [];
    }
  } else {
    // Không có giỏ hàng - để trống, không dùng demo data
    cart = [];
  }
  
  // Nếu giỏ hàng trống, hiển thị thông báo và redirect
  if (cart.length === 0) {
    showToast('Giỏ hàng trống! Đang chuyển về trang sản phẩm...', 'error');
    setTimeout(() => {
      window.location.href = 'products.html';
    }, 2000);
    return;
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
  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
  
  selectedPayment = method;
}

// ===== TOGGLE MOMO OPTIONS =====
function toggleMoMoOptions() {
  const options = document.getElementById('momoOptions');
  const arrow = document.getElementById('momoArrow');
  
  if (options.classList.contains('hidden')) {
    options.classList.remove('hidden');
    arrow.style.transform = 'rotate(180deg)';
  } else {
    options.classList.add('hidden');
    arrow.style.transform = 'rotate(0deg)';
  }
}

// ===== GET SELECTED PAYMENT METHOD =====
function getSelectedPayment() {
  const selected = document.querySelector('input[name="payment"]:checked');
  return selected ? selected.value : 'cod';
}

// ===== GET MOMO PAYMENT TYPE =====
function getMoMoPaymentType(paymentMethod) {
  const typeMap = {
    'momo_qr': 'qr',
    'momo_wallet': 'wallet',
    'momo_atm': 'atm',
    'momo_credit': 'credit',
    'momo': 'qr' // default
  };
  return typeMap[paymentMethod] || 'qr';
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
      method: getSelectedPayment()
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
    status: getSelectedPayment() === 'cod' ? 'confirmed' : 'pending_payment'
  };
  
  const paymentMethod = getSelectedPayment();
  
  // Check if payment method is MoMo (any type)
  if (paymentMethod.startsWith('momo')) {
    const momoType = getMoMoPaymentType(paymentMethod);
    showMoMoPaymentModal(orderData, momoType);
    return;
  }
  
  // For COD, proceed directly
  completeOrder(orderData);
}

// ===== MOMO PAYMENT VARIABLES =====
let currentMoMoPayUrl = null;
let currentMoMoDeeplink = null;
let momoCheckInterval = null;

// ===== DEMO MODE - Không cần API MoMo thật =====
const DEMO_MODE = true;

// ===== MOMO PAYMENT TYPE LABELS =====
const MOMO_TYPE_LABELS = {
  qr: { icon: 'fa-qrcode', name: 'Quét mã QR', desc: 'Quét mã bằng app MoMo' },
  wallet: { icon: 'fa-wallet', name: 'Ví MoMo', desc: 'Thanh toán từ ví MoMo' },
  atm: { icon: 'fa-credit-card', name: 'Thẻ ATM', desc: 'Thẻ ngân hàng nội địa' },
  credit: { icon: 'fa-cc-visa', name: 'Thẻ quốc tế', desc: 'Visa, Mastercard, JCB' }
};

// ===== SHOW MOMO PAYMENT MODAL (ĐA PHƯƠNG THỨC) =====
async function showMoMoPaymentModal(orderData, paymentType = 'qr') {
  const modal = document.getElementById('qrPaymentModal');
  const total = orderData.pricing.total;
  const typeInfo = MOMO_TYPE_LABELS[paymentType] || MOMO_TYPE_LABELS.qr;
  
  // Update modal info
  document.getElementById('qrOrderId').textContent = orderData.orderId;
  document.getElementById('qrAmount').textContent = formatPrice(total);
  document.getElementById('qrPaymentMethod').textContent = 'QUANG HUNG MOBILE';
  
  // Show loading state
  const container = document.getElementById('qrCodeContainer');
  container.innerHTML = `
    <div class="w-52 h-52 flex flex-col items-center justify-center">
      <i class="fas fa-spinner fa-spin text-4xl text-pink-600 mb-3"></i>
      <p class="text-sm text-gray-600">Đang tạo thanh toán ${typeInfo.name}...</p>
    </div>
  `;
  
  // Show modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  
  // Save pending order with payment type
  orderData.momoPaymentType = paymentType;
  localStorage.setItem('pendingOrder', JSON.stringify(orderData));
  
  // DEMO MODE: Tạo demo ngay lập tức
  if (DEMO_MODE) {
    setTimeout(() => {
      generateDemoPayment(orderData, paymentType);
      qrTimeRemaining = 5 * 60;
      startQRCountdown();
    }, 800);
    return;
  }
  
  // PRODUCTION MODE: Gọi API MoMo thật
  try {
    const response = await fetch(`${API_URL}/payment/momo/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderData.orderId,
        amount: total,
        paymentType: paymentType,
        orderInfo: `Thanh toán đơn hàng ${orderData.orderId} - QuangHưng Mobile`,
        items: orderData.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      currentMoMoPayUrl = result.data.payUrl;
      currentMoMoDeeplink = result.data.deeplink;
      
      // Với QR thì generate QR, với các loại khác thì redirect
      if (paymentType === 'qr') {
        generateMoMoQR(result.data);
      } else {
        // Redirect đến trang thanh toán MoMo
        showRedirectPayment(result.data, paymentType);
      }
      
      qrTimeRemaining = 30 * 60;
      startQRCountdown();
      startMoMoStatusCheck(orderData.orderId);
    } else {
      showQRError(result.message);
    }
  } catch (error) {
    console.error('MoMo Payment Error:', error);
    showQRError('Lỗi kết nối');
  }
}

// ===== GENERATE DEMO PAYMENT (ĐA PHƯƠNG THỨC) =====
function generateDemoPayment(orderData, paymentType) {
  const container = document.getElementById('qrCodeContainer');
  const wrapper = document.getElementById('qrCodeWrapper');
  const total = orderData.pricing.total;
  const typeInfo = MOMO_TYPE_LABELS[paymentType] || MOMO_TYPE_LABELS.qr;
  
  // Reset container và wrapper
  container.innerHTML = '';
  if (wrapper) {
    wrapper.className = 'flex justify-center w-full';
  }
  
  // Xóa các button cũ nếu có
  const oldBtns = document.querySelectorAll('.demo-btn-container');
  oldBtns?.forEach(btn => btn.remove());
  
  if (paymentType === 'qr') {
    // Generate QR Code
    container.className = 'bg-white p-3 rounded-xl border-2 border-pink-200 shadow-lg';
    if (typeof QRCode !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.className = 'rounded-lg';
      container.appendChild(canvas);
      
      const demoContent = `MOMO-DEMO|${orderData.orderId}|${total}|QuangHungMobile`;
      QRCode.toCanvas(canvas, demoContent, {
        width: 180,
        margin: 1,
        color: { dark: '#ae2070', light: '#ffffff' }
      });
    }
    addDemoButtons(container, paymentType);
  } else if (paymentType === 'wallet') {
    // Ví MoMo - hiển thị hướng dẫn
    container.className = 'w-44 h-44 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border-2 border-pink-200';
    container.innerHTML = `
      <i class="fas fa-wallet text-4xl text-pink-600 mb-3"></i>
      <p class="font-bold text-gray-800 text-sm">Ví MoMo</p>
      <p class="text-xs text-gray-600 text-center mt-1 px-2">Mở app MoMo để thanh toán</p>
    `;
    addDemoButtons(container, paymentType);
  } else {
    // ATM / Credit - hiển thị form nhập thẻ
    container.className = 'w-full max-w-xs bg-white p-4 rounded-xl border border-gray-200';
    showCardInputForm(container, paymentType, orderData);
  }
}

// ===== ADD DEMO BUTTONS =====
function addDemoButtons(container, paymentType) {
  const wrapper = document.getElementById('qrCodeWrapper');
  const parent = wrapper?.parentElement;
  
  if (!parent) return;
  
  const btnContainer = document.createElement('div');
  btnContainer.className = 'demo-btn-container mt-3 flex justify-center';
  btnContainer.innerHTML = `
    <button onclick="confirmDemoPayment()" class="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
      <i class="fas fa-check-circle mr-1"></i> Xác nhận (Demo)
    </button>
  `;
  parent.appendChild(btnContainer);
}

// ===== SHOW CARD INPUT FORM =====
function showCardInputForm(container, paymentType, orderData) {
  const isCredit = paymentType === 'credit';
  const title = isCredit ? 'Thẻ quốc tế' : 'Thẻ ATM';
  const banks = isCredit 
    ? ['Visa', 'Master', 'JCB'] 
    : ['VCB', 'BIDV', 'TCB', 'VPB', 'MB', 'ACB'];
  
  container.innerHTML = `
    <div class="w-full">
      <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2 justify-center text-sm">
        <i class="fas ${isCredit ? 'fa-cc-visa text-blue-600' : 'fa-credit-card text-green-600'}"></i>
        ${title}
      </h4>
      
      <!-- Chọn ngân hàng/loại thẻ -->
      <div class="mb-3">
        <div class="grid grid-cols-3 gap-1.5">
          ${banks.map((bank, i) => `
            <button type="button" onclick="selectBank(this, '${bank}')" class="bank-option py-1.5 px-2 border ${i === 0 ? 'border-pink-500 bg-pink-50' : 'border-gray-200'} rounded text-xs font-medium hover:border-pink-400 transition">
              ${bank}
            </button>
          `).join('')}
        </div>
      </div>
      
      <!-- Số thẻ -->
      <div class="mb-2">
        <input type="text" id="cardNumber" placeholder="Số thẻ" 
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
          maxlength="19" oninput="formatCardNumber(this)">
      </div>
      
      <!-- Tên chủ thẻ -->
      <div class="mb-2">
        <input type="text" id="cardName" placeholder="Tên chủ thẻ" 
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase focus:border-pink-500 focus:outline-none">
      </div>
      
      <!-- Ngày hết hạn & CVV -->
      <div class="grid grid-cols-2 gap-2 mb-3">
        <input type="text" id="cardExpiry" placeholder="MM/YY" 
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
          maxlength="5" oninput="formatExpiry(this)">
        <input type="text" id="cardCvv" placeholder="${isCredit ? 'CVV' : 'OTP'}" 
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
          maxlength="${isCredit ? 4 : 6}">
      </div>
      
      <!-- Nút thanh toán -->
      <button onclick="processCardPayment('${paymentType}')" 
        class="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-2.5 rounded-lg font-semibold transition text-sm">
        <i class="fas fa-lock mr-1"></i> Thanh toán
      </button>
      
      <p class="text-xs text-gray-400 text-center mt-2">
        <i class="fas fa-shield-alt text-green-500"></i> Bảo mật bởi MoMo
      </p>
    </div>
  `;
}

// ===== SELECT BANK =====
function selectBank(btn, bankName) {
  document.querySelectorAll('.bank-option').forEach(b => {
    b.classList.remove('border-pink-500', 'bg-pink-50');
    b.classList.add('border-gray-200');
  });
  btn.classList.remove('border-gray-200');
  btn.classList.add('border-pink-500', 'bg-pink-50');
}

// ===== FORMAT CARD NUMBER =====
function formatCardNumber(input) {
  let value = input.value.replace(/\s/g, '').replace(/\D/g, '');
  let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
  input.value = formatted;
}

// ===== FORMAT EXPIRY =====
function formatExpiry(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2);
  }
  input.value = value;
}

// ===== PROCESS CARD PAYMENT =====
function processCardPayment(paymentType) {
  const cardNumber = document.getElementById('cardNumber')?.value;
  const cardName = document.getElementById('cardName')?.value;
  const cardExpiry = document.getElementById('cardExpiry')?.value;
  const cardCvv = document.getElementById('cardCvv')?.value;
  
  // Validate
  if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
    showToast('Vui lòng nhập số thẻ hợp lệ!', 'error');
    return;
  }
  if (!cardName) {
    showToast('Vui lòng nhập tên chủ thẻ!', 'error');
    return;
  }
  if (!cardExpiry || cardExpiry.length < 5) {
    showToast('Vui lòng nhập ngày hết hạn!', 'error');
    return;
  }
  if (!cardCvv) {
    showToast('Vui lòng nhập mã CVV/OTP!', 'error');
    return;
  }
  
  // Demo: Xử lý thanh toán
  showToast('Đang xử lý thanh toán...', 'info');
  
  // Hiển thị loading
  const container = document.getElementById('qrCodeContainer');
  container.innerHTML = `
    <div class="w-full flex flex-col items-center justify-center py-8">
      <i class="fas fa-spinner fa-spin text-4xl text-pink-600 mb-4"></i>
      <p class="text-gray-600">Đang xác thực thẻ...</p>
    </div>
  `;
  
  setTimeout(() => {
    confirmDemoPayment();
  }, 2000);
}

// ===== SHOW REDIRECT PAYMENT =====
function showRedirectPayment(paymentData, paymentType) {
  const container = document.getElementById('qrCodeContainer');
  const typeInfo = MOMO_TYPE_LABELS[paymentType] || MOMO_TYPE_LABELS.qr;
  
  container.innerHTML = `
    <div class="w-52 h-52 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
      <i class="fas ${typeInfo.icon} text-5xl text-pink-600 mb-4"></i>
      <p class="font-bold text-gray-800">${typeInfo.name}</p>
      <p class="text-sm text-gray-600 text-center mt-2 px-4">Nhấn nút bên dưới để chuyển đến trang thanh toán</p>
    </div>
  `;
  
  // Thêm nút redirect
  const btnContainer = document.createElement('div');
  btnContainer.className = 'mt-4';
  btnContainer.innerHTML = `
    <a href="${paymentData.payUrl}" target="_blank" class="block w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-4 py-3 rounded-lg text-sm font-semibold transition text-center">
      <i class="fas fa-external-link-alt mr-2"></i> Thanh toán ngay
    </a>
  `;
  container.parentElement.appendChild(btnContainer);
}

// ===== OPEN MOMO PAYMENT =====
function openMoMoPayment() {
  if (currentMoMoPayUrl) {
    window.open(currentMoMoPayUrl, '_blank');
  } else {
    showToast('Đang tạo link thanh toán...', 'info');
  }
}

// ===== CONFIRM DEMO PAYMENT =====
function confirmDemoPayment() {
  const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
  if (pendingOrder) {
    showToast('Đang xử lý thanh toán...', 'info');
    
    setTimeout(() => {
      pendingOrder.status = 'paid';
      pendingOrder.paidAt = new Date().toISOString();
      pendingOrder.transactionId = 'DEMO_' + Date.now();
      
      closeQRModal();
      completeOrder(pendingOrder);
      showToast('Thanh toán thành công! (Demo)', 'success');
    }, 1500);
  }
}

// ===== LEGACY: SHOW MOMO QR MODAL (backward compatible) =====
async function showMoMoQRModal(orderData) {
  return showMoMoPaymentModal(orderData, 'qr');
}

// ===== GENERATE DEMO QR CODE =====
function generateDemoQR(content, orderData) {
  const container = document.getElementById('qrCodeContainer');
  container.innerHTML = '';
  
  if (typeof QRCode !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.className = 'rounded-lg';
    container.appendChild(canvas);
    
    QRCode.toCanvas(canvas, content, {
      width: 200,
      margin: 2,
      color: {
        dark: '#ae2070', // Màu hồng MoMo
        light: '#ffffff'
      }
    }, function(error) {
      if (error) {
        console.error('QR generation error:', error);
        showQRError('Không thể tạo mã QR');
      }
    });
    
    // Thêm nút xác nhận thanh toán demo
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'mt-4 w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2';
    confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Xác nhận đã thanh toán (Demo)';
    confirmBtn.onclick = () => confirmDemoPayment(orderData);
    container.parentElement.appendChild(confirmBtn);
    
  } else {
    showQRError('Thư viện QR chưa tải');
  }
}

// ===== CONFIRM DEMO PAYMENT =====
function confirmDemoPayment() {
  const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
  if (!pendingOrder) {
    showToast('Không tìm thấy đơn hàng!', 'error');
    return;
  }
  
  showToast('Đang xử lý thanh toán...', 'info');
  
  setTimeout(() => {
    pendingOrder.status = 'paid';
    pendingOrder.paidAt = new Date().toISOString();
    pendingOrder.transactionId = 'DEMO_' + Date.now();
    
    closeQRModal();
    completeOrder(pendingOrder);
    showToast('Thanh toán thành công! (Demo)', 'success');
  }, 1500);
}

// ===== SHOW QR ERROR =====
function showQRError(message) {
  const container = document.getElementById('qrCodeContainer');
  container.innerHTML = `
    <div class="w-52 h-52 flex flex-col items-center justify-center text-red-600">
      <i class="fas fa-exclamation-circle text-4xl mb-3"></i>
      <p class="text-sm font-semibold text-center">${message}</p>
      <button onclick="retryMoMoPayment()" class="mt-3 bg-pink-600 text-white px-4 py-2 rounded-lg text-sm">
        Thử lại
      </button>
    </div>
  `;
}

// ===== GENERATE MOMO QR CODE =====
function generateMoMoQR(paymentData) {
  const container = document.getElementById('qrCodeContainer');
  container.innerHTML = '';
  
  // Luôn generate QR từ payUrl vì qrCodeUrl từ MoMo test là deeplink, không phải hình ảnh
  if (paymentData.payUrl) {
    generateQRFromPayUrl(paymentData.payUrl);
  } else {
    container.innerHTML = `
      <div class="w-52 h-52 flex flex-col items-center justify-center text-red-600">
        <i class="fas fa-exclamation-circle text-4xl mb-3"></i>
        <p class="text-sm font-semibold">Không có link thanh toán</p>
      </div>
    `;
    return;
  }
  
  // Thêm nút mở trang thanh toán MoMo
  const payUrlBtn = document.createElement('a');
  payUrlBtn.href = paymentData.payUrl;
  payUrlBtn.target = '_blank';
  payUrlBtn.className = 'mt-3 inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition';
  payUrlBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Mở trang thanh toán';
  container.parentElement.appendChild(payUrlBtn);
  
  // Thêm nút mở app MoMo (cho mobile)
  if (paymentData.deeplink) {
    const deeplinkBtn = document.createElement('a');
    deeplinkBtn.href = paymentData.deeplink;
    deeplinkBtn.className = 'mt-2 inline-flex items-center gap-2 bg-white border-2 border-pink-600 text-pink-600 hover:bg-pink-50 px-4 py-2 rounded-lg text-sm font-semibold transition';
    deeplinkBtn.innerHTML = '<i class="fas fa-mobile-alt"></i> Mở app MoMo';
    container.parentElement.appendChild(deeplinkBtn);
  }
}

// ===== GENERATE QR FROM PAY URL =====
function generateQRFromPayUrl(payUrl) {
  const container = document.getElementById('qrCodeContainer');
  container.innerHTML = '';
  
  if (typeof QRCode !== 'undefined') {
    // Tạo canvas element cho QR code
    const canvas = document.createElement('canvas');
    canvas.className = 'rounded-lg';
    container.appendChild(canvas);
    
    // Generate QR code vào canvas
    QRCode.toCanvas(canvas, payUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, function(error) {
      if (error) {
        console.error('QR Code generation error:', error);
        // Fallback nếu generate lỗi
        container.innerHTML = `
          <div class="w-52 h-52 bg-pink-50 rounded-lg flex flex-col items-center justify-center p-4">
            <i class="fas fa-qrcode text-4xl text-pink-600 mb-3"></i>
            <p class="text-sm text-gray-600 text-center mb-2">Quét mã không khả dụng</p>
            <a href="${payUrl}" target="_blank" class="text-pink-600 font-semibold hover:underline text-sm">
              Nhấn để thanh toán
            </a>
          </div>
        `;
      }
    });
  } else {
    // Fallback - link đến trang thanh toán
    container.innerHTML = `
      <div class="w-52 h-52 bg-pink-50 rounded-lg flex flex-col items-center justify-center p-4">
        <i class="fas fa-qrcode text-4xl text-pink-600 mb-3"></i>
        <p class="text-sm text-gray-600 text-center mb-2">Thư viện QR chưa tải</p>
        <a href="${payUrl}" target="_blank" class="text-pink-600 font-semibold hover:underline text-sm">
          Nhấn để thanh toán
        </a>
      </div>
    `;
  }
}

// ===== RETRY MOMO PAYMENT =====
function retryMoMoPayment() {
  const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
  if (pendingOrder) {
    showMoMoQRModal(pendingOrder);
  }
}

// ===== START MOMO STATUS CHECK =====
function startMoMoStatusCheck(orderId) {
  // Clear existing interval
  if (momoCheckInterval) {
    clearInterval(momoCheckInterval);
  }
  
  // Kiểm tra mỗi 5 giây
  momoCheckInterval = setInterval(async () => {
    try {
      const response = await fetch(`${API_URL}/payment/momo/check-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });
      
      const result = await response.json();
      
      if (result.success && result.data.resultCode === 0) {
        // Thanh toán thành công!
        clearInterval(momoCheckInterval);
        showToast('Thanh toán MoMo thành công!', 'success');
        
        // Hoàn tất đơn hàng
        const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
        if (pendingOrder) {
          pendingOrder.status = 'paid';
          pendingOrder.paidAt = new Date().toISOString();
          pendingOrder.transactionId = result.data.transId;
          completeOrder(pendingOrder);
        }
        closeQRModal();
      }
    } catch (error) {
      console.log('Status check error:', error);
    }
  }, 5000);
}

// ===== OPEN MOMO APP =====
function openMoMoApp() {
  if (currentMoMoDeeplink) {
    window.location.href = currentMoMoDeeplink;
  } else if (currentMoMoPayUrl) {
    window.open(currentMoMoPayUrl, '_blank');
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
  
  // Clear MoMo status check interval
  if (momoCheckInterval) {
    clearInterval(momoCheckInterval);
  }
  
  // Reset MoMo variables
  currentMoMoPayUrl = null;
  currentMoMoDeeplink = null;
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
async function completeOrder(orderData) {
  // Lưu đơn hàng vào database
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Tạo địa chỉ đầy đủ
    const provinceText = document.getElementById('province-text')?.textContent || '';
    const districtText = document.getElementById('district-text')?.textContent || '';
    const wardText = document.getElementById('ward-text')?.textContent || '';
    const fullAddress = `${orderData.address.detail}, ${wardText}, ${districtText}, ${provinceText}`;
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: user?.ma_kh || null,
        customerName: orderData.customer.fullName,
        phone: orderData.customer.phone,
        address: fullAddress,
        items: orderData.items,
        subtotal: orderData.pricing.subtotal,
        shippingFee: orderData.pricing.shippingFee,
        discount: orderData.pricing.discount,
        total: orderData.pricing.total,
        paymentMethod: orderData.payment.method,
        voucherCode: null
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Cập nhật orderId từ database
      orderData.dbOrderId = result.data.orderId;
      
      // Nếu đã thanh toán, cập nhật trạng thái
      if (orderData.status === 'paid') {
        await fetch(`${API_URL}/orders/${result.data.orderId}/payment`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'success',
            transactionId: orderData.transactionId || null
          })
        });
      }
    }
  } catch (error) {
    console.error('Lỗi lưu đơn hàng vào DB:', error);
    // Vẫn tiếp tục xử lý dù lỗi DB
  }
  
  // Save order to localStorage theo user
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const ordersKey = user?.ma_kh ? `orders_user_${user.ma_kh}` : 'orders_guest';
  const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
  orders.push(orderData);
  localStorage.setItem(ordersKey, JSON.stringify(orders));
  
  // Lưu địa chỉ giao hàng để dùng cho lần sau
  saveShippingAddress();
  
  // Clear cart and pending order - dùng đúng cart key
  const cartKey = getCartKey();
  localStorage.removeItem(cartKey);
  localStorage.removeItem('pendingOrder');
  
  // Dispatch event để cập nhật cart badge
  window.dispatchEvent(new Event('cartUpdated'));
  
  // Show success message
  showToast('Đặt hàng thành công! Đang chuyển hướng...', 'success');
  
  // Redirect to success page after 2 seconds
  setTimeout(() => {
    window.location.href = `order-success.html?orderId=${orderData.orderId}`;
  }, 2000);
}

// ===== CUSTOM DROPDOWN FUNCTIONS =====
let activeDropdown = null;

// Toggle dropdown visibility
function toggleDropdown(type) {
  const dropdown = document.getElementById(`${type}-dropdown`);
  const arrow = document.getElementById(`${type}-arrow`);
  const btn = dropdown.previousElementSibling;
  
  // Close other dropdowns
  ['province', 'district', 'ward'].forEach(t => {
    if (t !== type) {
      const otherDropdown = document.getElementById(`${t}-dropdown`);
      const otherArrow = document.getElementById(`${t}-arrow`);
      const otherBtn = otherDropdown?.previousElementSibling;
      if (otherDropdown) otherDropdown.classList.add('hidden');
      if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
      if (otherBtn) otherBtn.classList.remove('open');
    }
  });
  
  // Toggle current dropdown
  const isHidden = dropdown.classList.contains('hidden');
  if (isHidden) {
    dropdown.classList.remove('hidden');
    arrow.style.transform = 'rotate(180deg)';
    btn.classList.add('open');
    activeDropdown = type;
  } else {
    dropdown.classList.add('hidden');
    arrow.style.transform = 'rotate(0deg)';
    btn.classList.remove('open');
    activeDropdown = null;
  }
}

// Select option from dropdown
function selectOption(type, value, text) {
  const input = document.getElementById(type);
  const textEl = document.getElementById(`${type}-text`);
  const dropdown = document.getElementById(`${type}-dropdown`);
  const arrow = document.getElementById(`${type}-arrow`);
  const btn = dropdown.previousElementSibling;
  
  // Update value and text
  input.value = value;
  textEl.textContent = text;
  textEl.classList.remove('text-gray-500');
  textEl.classList.add('text-gray-900');
  
  // Close dropdown
  dropdown.classList.add('hidden');
  arrow.style.transform = 'rotate(0deg)';
  btn.classList.remove('open');
  activeDropdown = null;
  
  // Update selected state
  dropdown.querySelectorAll('.custom-dropdown-item').forEach(item => {
    item.classList.remove('selected');
    if (item.dataset.value === value) {
      item.classList.add('selected');
    }
  });
  
  // Trigger change event based on type
  if (type === 'province') {
    onProvinceChange(value);
  } else if (type === 'district') {
    onDistrictChange(value);
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.custom-select-wrapper')) {
    ['province', 'district', 'ward'].forEach(type => {
      const dropdown = document.getElementById(`${type}-dropdown`);
      const arrow = document.getElementById(`${type}-arrow`);
      const btn = dropdown?.previousElementSibling;
      if (dropdown) dropdown.classList.add('hidden');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
      if (btn) btn.classList.remove('open');
    });
    activeDropdown = null;
  }
});

// ===== PROVINCE/DISTRICT/WARD SELECTION =====
// Biến lưu tỉnh/huyện đang chọn
let selectedProvinceKey = '';
let selectedDistrictKey = '';

// Load danh sách tỉnh/thành phố khi trang load
function loadProvinces() {
  const dropdown = document.getElementById('province-dropdown');
  if (!dropdown || typeof VIETNAM_ADDRESS === 'undefined') return;
  
  dropdown.innerHTML = '';
  
  // Sắp xếp theo tên
  const sortedProvinces = Object.entries(VIETNAM_ADDRESS).sort((a, b) => 
    a[1].name.localeCompare(b[1].name, 'vi')
  );
  
  sortedProvinces.forEach(([key, province]) => {
    const item = document.createElement('div');
    item.className = 'custom-dropdown-item';
    item.dataset.value = key;
    item.textContent = province.name;
    item.onclick = () => selectOption('province', key, province.name);
    dropdown.appendChild(item);
  });
}

// Xử lý khi chọn tỉnh/thành phố
function onProvinceChange(value) {
  const districtDropdown = document.getElementById('district-dropdown');
  const wardDropdown = document.getElementById('ward-dropdown');
  
  // Reset district and ward
  districtDropdown.innerHTML = '';
  wardDropdown.innerHTML = '';
  document.getElementById('district').value = '';
  document.getElementById('district-text').textContent = 'Chọn Quận/Huyện';
  document.getElementById('district-text').classList.add('text-gray-500');
  document.getElementById('district-text').classList.remove('text-gray-900');
  document.getElementById('ward').value = '';
  document.getElementById('ward-text').textContent = 'Chọn Phường/Xã';
  document.getElementById('ward-text').classList.add('text-gray-500');
  document.getElementById('ward-text').classList.remove('text-gray-900');
  
  selectedProvinceKey = value;
  selectedDistrictKey = '';
  
  if (!selectedProvinceKey || typeof VIETNAM_ADDRESS === 'undefined') return;
  
  const province = VIETNAM_ADDRESS[selectedProvinceKey];
  if (!province || !province.districts) return;
  
  // Sắp xếp quận/huyện theo tên
  const sortedDistricts = Object.entries(province.districts).sort((a, b) => 
    a[1].name.localeCompare(b[1].name, 'vi')
  );
  
  sortedDistricts.forEach(([key, district]) => {
    const item = document.createElement('div');
    item.className = 'custom-dropdown-item';
    item.dataset.value = key;
    item.textContent = district.name;
    item.onclick = () => selectOption('district', key, district.name);
    districtDropdown.appendChild(item);
  });
}

// Xử lý khi chọn quận/huyện
function onDistrictChange(value) {
  const wardDropdown = document.getElementById('ward-dropdown');
  
  // Reset ward
  wardDropdown.innerHTML = '';
  document.getElementById('ward').value = '';
  document.getElementById('ward-text').textContent = 'Chọn Phường/Xã';
  document.getElementById('ward-text').classList.add('text-gray-500');
  document.getElementById('ward-text').classList.remove('text-gray-900');
  
  selectedDistrictKey = value;
  
  if (!selectedProvinceKey || !selectedDistrictKey || typeof VIETNAM_ADDRESS === 'undefined') return;
  
  const province = VIETNAM_ADDRESS[selectedProvinceKey];
  if (!province || !province.districts) return;
  
  const district = province.districts[selectedDistrictKey];
  if (!district || !district.wards) return;
  
  // Sắp xếp phường/xã theo tên
  const sortedWards = [...district.wards].sort((a, b) => a.localeCompare(b, 'vi'));
  
  sortedWards.forEach(ward => {
    const wardValue = ward.toLowerCase().replace(/\s/g, '-');
    const item = document.createElement('div');
    item.className = 'custom-dropdown-item';
    item.dataset.value = wardValue;
    item.textContent = ward;
    item.onclick = () => selectOption('ward', wardValue, ward);
    wardDropdown.appendChild(item);
  });
}

// ===== AUTO-FILL USER INFO =====
function autoFillUserInfo() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return;
  
  // Điền thông tin cơ bản
  if (user.ho_ten) {
    document.getElementById('fullName').value = user.ho_ten;
  }
  if (user.so_dt) {
    document.getElementById('phone').value = user.so_dt;
  }
  if (user.email) {
    document.getElementById('email').value = user.email;
  }
  
  // Ưu tiên 1: Kiểm tra địa chỉ đã lưu từ đơn hàng trước (có đầy đủ key)
  const savedAddress = localStorage.getItem('savedShippingAddress');
  if (savedAddress) {
    try {
      const addressData = JSON.parse(savedAddress);
      if (addressData.provinceKey) {
        autoFillAddressFromObject(addressData);
        return;
      }
    } catch (e) {
      console.log('Không thể parse địa chỉ đã lưu');
    }
  }
  
  // Ưu tiên 2: Xử lý địa chỉ từ profile user
  if (user.dia_chi) {
    if (typeof user.dia_chi === 'object' && user.dia_chi.provinceKey) {
      // Nếu địa chỉ là object với đầy đủ thông tin
      autoFillAddressFromObject(user.dia_chi);
    } else if (typeof user.dia_chi === 'string') {
      // Nếu địa chỉ là chuỗi, parse và tìm trong VIETNAM_ADDRESS
      parseAndFillAddressFromString(user.dia_chi);
    }
  }
}

// Parse địa chỉ từ chuỗi và điền vào form
function parseAndFillAddressFromString(addressString) {
  if (!addressString || typeof VIETNAM_ADDRESS === 'undefined') return;
  
  // Chuẩn hóa chuỗi địa chỉ
  const normalizedAddress = addressString.toLowerCase().trim();
  
  // Tìm tỉnh/thành phố
  let foundProvince = null;
  let foundProvinceKey = null;
  
  for (const [key, province] of Object.entries(VIETNAM_ADDRESS)) {
    const provinceName = province.name.toLowerCase();
    // Kiểm tra tên tỉnh có trong địa chỉ không
    if (normalizedAddress.includes(provinceName) || 
        normalizedAddress.includes(provinceName.replace('tỉnh ', '').replace('thành phố ', ''))) {
      foundProvince = province;
      foundProvinceKey = key;
      break;
    }
  }
  
  if (!foundProvince) {
    // Không tìm thấy tỉnh, chỉ điền địa chỉ cụ thể
    document.getElementById('address').value = addressString;
    return;
  }
  
  // Tìm quận/huyện
  let foundDistrict = null;
  let foundDistrictKey = null;
  
  if (foundProvince.districts) {
    for (const [key, district] of Object.entries(foundProvince.districts)) {
      const districtName = district.name.toLowerCase();
      if (normalizedAddress.includes(districtName) ||
          normalizedAddress.includes(districtName.replace('quận ', '').replace('huyện ', '').replace('thị xã ', '').replace('thành phố ', ''))) {
        foundDistrict = district;
        foundDistrictKey = key;
        break;
      }
    }
  }
  
  // Tìm phường/xã
  let foundWard = null;
  let foundWardKey = null;
  
  if (foundDistrict && foundDistrict.wards) {
    for (const ward of foundDistrict.wards) {
      const wardName = ward.toLowerCase();
      if (normalizedAddress.includes(wardName) ||
          normalizedAddress.includes(wardName.replace('phường ', '').replace('xã ', '').replace('thị trấn ', ''))) {
        foundWard = ward;
        foundWardKey = ward.toLowerCase().replace(/\s/g, '-');
        break;
      }
    }
  }
  
  // Điền vào form
  // 1. Điền tỉnh/thành phố
  document.getElementById('province').value = foundProvinceKey;
  document.getElementById('province-text').textContent = foundProvince.name;
  document.getElementById('province-text').classList.remove('text-gray-500');
  document.getElementById('province-text').classList.add('text-gray-900');
  selectedProvinceKey = foundProvinceKey;
  
  // Load quận/huyện
  loadDistrictsForProvince(foundProvinceKey);
  
  // 2. Điền quận/huyện (sau khi load xong)
  setTimeout(() => {
    if (foundDistrictKey) {
      document.getElementById('district').value = foundDistrictKey;
      document.getElementById('district-text').textContent = foundDistrict.name;
      document.getElementById('district-text').classList.remove('text-gray-500');
      document.getElementById('district-text').classList.add('text-gray-900');
      selectedDistrictKey = foundDistrictKey;
      
      // Load phường/xã
      loadWardsForDistrict(foundProvinceKey, foundDistrictKey);
      
      // 3. Điền phường/xã (sau khi load xong)
      setTimeout(() => {
        if (foundWardKey) {
          document.getElementById('ward').value = foundWardKey;
          document.getElementById('ward-text').textContent = foundWard;
          document.getElementById('ward-text').classList.remove('text-gray-500');
          document.getElementById('ward-text').classList.add('text-gray-900');
        }
        
        // Tách phần địa chỉ chi tiết (số nhà, đường...)
        // Loại bỏ tên tỉnh, huyện, xã khỏi địa chỉ để lấy phần chi tiết
        let detailAddress = addressString;
        if (foundProvince) detailAddress = detailAddress.replace(new RegExp(foundProvince.name, 'gi'), '');
        if (foundDistrict) detailAddress = detailAddress.replace(new RegExp(foundDistrict.name, 'gi'), '');
        if (foundWard) detailAddress = detailAddress.replace(new RegExp(foundWard, 'gi'), '');
        detailAddress = detailAddress.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim();
        
        if (detailAddress) {
          document.getElementById('address').value = detailAddress;
        }
      }, 150);
    }
  }, 150);
}

// Điền địa chỉ từ object
function autoFillAddressFromObject(addressData) {
  if (!addressData) return;
  
  // Điền địa chỉ cụ thể
  if (addressData.detail) {
    document.getElementById('address').value = addressData.detail;
  }
  
  // Điền ghi chú nếu có
  if (addressData.note) {
    document.getElementById('note').value = addressData.note;
  }
  
  // Điền tỉnh/thành phố
  if (addressData.provinceKey && typeof VIETNAM_ADDRESS !== 'undefined') {
    const province = VIETNAM_ADDRESS[addressData.provinceKey];
    if (province) {
      // Set giá trị và hiển thị
      document.getElementById('province').value = addressData.provinceKey;
      document.getElementById('province-text').textContent = province.name;
      document.getElementById('province-text').classList.remove('text-gray-500');
      document.getElementById('province-text').classList.add('text-gray-900');
      
      // Load quận/huyện
      selectedProvinceKey = addressData.provinceKey;
      loadDistrictsForProvince(addressData.provinceKey);
      
      // Sau khi load xong quận/huyện, điền quận/huyện
      setTimeout(() => {
        if (addressData.districtKey && province.districts && province.districts[addressData.districtKey]) {
          const district = province.districts[addressData.districtKey];
          document.getElementById('district').value = addressData.districtKey;
          document.getElementById('district-text').textContent = district.name;
          document.getElementById('district-text').classList.remove('text-gray-500');
          document.getElementById('district-text').classList.add('text-gray-900');
          
          // Load phường/xã
          selectedDistrictKey = addressData.districtKey;
          loadWardsForDistrict(addressData.provinceKey, addressData.districtKey);
          
          // Sau khi load xong phường/xã, điền phường/xã
          setTimeout(() => {
            if (addressData.wardKey) {
              const wardDropdown = document.getElementById('ward-dropdown');
              const wardItem = wardDropdown.querySelector(`[data-value="${addressData.wardKey}"]`);
              if (wardItem) {
                document.getElementById('ward').value = addressData.wardKey;
                document.getElementById('ward-text').textContent = wardItem.textContent;
                document.getElementById('ward-text').classList.remove('text-gray-500');
                document.getElementById('ward-text').classList.add('text-gray-900');
              }
            }
          }, 100);
        }
      }, 100);
    }
  }
}

// Load quận/huyện cho tỉnh (không reset)
function loadDistrictsForProvince(provinceKey) {
  const districtDropdown = document.getElementById('district-dropdown');
  if (!districtDropdown || typeof VIETNAM_ADDRESS === 'undefined') return;
  
  const province = VIETNAM_ADDRESS[provinceKey];
  if (!province || !province.districts) return;
  
  districtDropdown.innerHTML = '';
  
  const sortedDistricts = Object.entries(province.districts).sort((a, b) => 
    a[1].name.localeCompare(b[1].name, 'vi')
  );
  
  sortedDistricts.forEach(([key, district]) => {
    const item = document.createElement('div');
    item.className = 'custom-dropdown-item';
    item.dataset.value = key;
    item.textContent = district.name;
    item.onclick = () => selectOption('district', key, district.name);
    districtDropdown.appendChild(item);
  });
}

// Load phường/xã cho quận/huyện (không reset)
function loadWardsForDistrict(provinceKey, districtKey) {
  const wardDropdown = document.getElementById('ward-dropdown');
  if (!wardDropdown || typeof VIETNAM_ADDRESS === 'undefined') return;
  
  const province = VIETNAM_ADDRESS[provinceKey];
  if (!province || !province.districts) return;
  
  const district = province.districts[districtKey];
  if (!district || !district.wards) return;
  
  wardDropdown.innerHTML = '';
  
  const sortedWards = [...district.wards].sort((a, b) => a.localeCompare(b, 'vi'));
  
  sortedWards.forEach(ward => {
    const wardValue = ward.toLowerCase().replace(/\s/g, '-');
    const item = document.createElement('div');
    item.className = 'custom-dropdown-item';
    item.dataset.value = wardValue;
    item.textContent = ward;
    item.onclick = () => selectOption('ward', wardValue, ward);
    wardDropdown.appendChild(item);
  });
}

// Lưu địa chỉ giao hàng để dùng cho lần sau
function saveShippingAddress() {
  const addressData = {
    provinceKey: selectedProvinceKey,
    districtKey: selectedDistrictKey,
    wardKey: document.getElementById('ward').value,
    detail: document.getElementById('address').value.trim(),
    note: document.getElementById('note').value.trim()
  };
  
  localStorage.setItem('savedShippingAddress', JSON.stringify(addressData));
}

// ===== PAGE INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Scroll về đầu trang ngay khi load
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  
  // Load danh sách tỉnh/thành phố
  loadProvinces();
  
  // Load giỏ hàng
  loadCart();
  
  // Auto-fill thông tin user nếu đã đăng nhập (không gây scroll)
  setTimeout(() => {
    // Lưu vị trí scroll hiện tại
    const scrollPos = window.scrollY;
    
    autoFillUserInfo();
    
    // Khôi phục vị trí scroll về đầu trang
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    
    // Đảm bảo scroll về đầu sau khi mọi thứ hoàn tất
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 600);
  }, 200);
});
