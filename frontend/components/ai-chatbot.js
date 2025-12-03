// AI Chatbot - Reindeer Theme
(function() {
  const API_URL = 'http://localhost:3000/api';
  
  // Create chatbot HTML
  function createChatbotHTML() {
    const chatbotHTML = `
      <!-- Chatbot Button -->
      <button class="ai-chatbot-btn" id="ai-chatbot-btn" title="Chat với AI">
        <img src="images/reindeer-avatar.svg" alt="AI Assistant">
      </button>
      
      <!-- Chat Window -->
      <div class="ai-chat-window" id="ai-chat-window">
        <div class="ai-chat-header">
          <div class="ai-chat-avatar">
            <img src="images/reindeer-avatar.svg" alt="AI Assistant">
          </div>
          <div class="ai-chat-info">
            <h3 class="ai-chat-title">AI Tư vấn</h3>
            <div class="ai-chat-status">Trực tuyến</div>
          </div>
          <button class="ai-chat-close" id="ai-chat-close">&times;</button>
        </div>
        
        <div class="ai-chat-messages" id="ai-chat-messages">
          <!-- Messages will be added here -->
        </div>
        
        <div class="ai-quick-actions">
          <button class="ai-quick-btn" data-action="promo">Khuyến mãi</button>
          <button class="ai-quick-btn" data-action="compare">So sánh sản phẩm</button>
          <button class="ai-quick-btn" data-action="warranty">Bảo hành</button>
        </div>
        
        <div class="ai-chat-input-area">
          <div class="ai-chat-input-wrapper">
            <input type="text" class="ai-chat-input" id="ai-chat-input" placeholder="Nhập tin nhắn...">
            <button class="ai-chat-send" id="ai-chat-send">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    
    const container = document.createElement('div');
    container.id = 'ai-chatbot-container';
    container.innerHTML = chatbotHTML;
    document.body.appendChild(container);
  }
  
  // Add welcome message
  function addWelcomeMessage() {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (messagesContainer && messagesContainer.children.length === 0) {
      addBotMessage('Xin chào! Tôi là trợ lý AI của QuangHưng Mobile. Tôi có thể giúp gì cho bạn?');
    }
  }
  
  // Add bot message
  function addBotMessage(text, isHTML = false) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message bot';
    
    if (isHTML) {
      messageDiv.innerHTML = text;
    } else {
      messageDiv.textContent = text;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Add user message
  function addUserMessage(text) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message user';
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Show typing indicator
  function showTyping() {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-typing';
    typingDiv.id = 'ai-typing';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Hide typing indicator
  function hideTyping() {
    const typingDiv = document.getElementById('ai-typing');
    if (typingDiv) typingDiv.remove();
  }
  
  // Format price
  function formatPrice(price) {
    return price.toLocaleString('vi-VN') + '₫';
  }
  
  // Process user message
  async function processMessage(message) {
    const lowerMsg = message.toLowerCase();
    
    // Check for price queries
    const priceMatch = lowerMsg.match(/dưới\s*(\d+)\s*(triệu|tr)/);
    if (priceMatch || lowerMsg.includes('giá') || lowerMsg.includes('rẻ')) {
      let maxPrice = 50000000;
      if (priceMatch) {
        maxPrice = parseInt(priceMatch[1]) * 1000000;
      }
      
      try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        const filtered = products.filter(p => p.price <= maxPrice).slice(0, 3);
        
        if (filtered.length > 0) {
          let html = `<div>Dưới đây là một số điện thoại phù hợp với ngân sách của bạn:</div>
            <div class="product-list">`;
          filtered.forEach(p => {
            html += `<div class="product-item">• <strong>${p.name}</strong> - ${formatPrice(p.price)}</div>`;
          });
          html += '</div>';
          return { text: html, isHTML: true };
        }
      } catch (e) {
        console.error('Error fetching products:', e);
      }
      return { text: 'Xin lỗi, tôi không thể tìm thấy sản phẩm phù hợp. Bạn có thể xem tất cả sản phẩm tại trang Sản phẩm.' };
    }
    
    // Check for brand queries
    const brands = ['iphone', 'samsung', 'xiaomi', 'oppo', 'vivo', 'realme', 'sony'];
    for (const brand of brands) {
      if (lowerMsg.includes(brand)) {
        try {
          const response = await fetch(`${API_URL}/products`);
          const products = await response.json();
          const filtered = products.filter(p => 
            p.name.toLowerCase().includes(brand) || 
            (p.brand && p.brand.toLowerCase().includes(brand))
          ).slice(0, 3);
          
          if (filtered.length > 0) {
            let html = `<div>Đây là một số sản phẩm ${brand.charAt(0).toUpperCase() + brand.slice(1)} nổi bật:</div>
              <div class="product-list">`;
            filtered.forEach(p => {
              html += `<div class="product-item">• <strong>${p.name}</strong> - ${formatPrice(p.price)}</div>`;
            });
            html += '</div>';
            return { text: html, isHTML: true };
          }
        } catch (e) {
          console.error('Error:', e);
        }
        return { text: `Hiện tại chúng tôi có nhiều sản phẩm ${brand.charAt(0).toUpperCase() + brand.slice(1)}. Bạn có thể xem chi tiết tại trang Sản phẩm.` };
      }
    }
    
    // Promotion queries
    if (lowerMsg.includes('khuyến mãi') || lowerMsg.includes('giảm giá') || lowerMsg.includes('sale')) {
      return { text: 'Hiện tại QuangHưng Mobile đang có nhiều chương trình khuyến mãi hấp dẫn:\n• Giảm đến 30% cho iPhone\n• Tặng phụ kiện khi mua Samsung\n• Trả góp 0% lãi suất\n\nBạn có thể xem chi tiết tại trang Khuyến mãi!' };
    }
    
    // Warranty queries
    if (lowerMsg.includes('bảo hành') || lowerMsg.includes('warranty')) {
      return { text: 'Chính sách bảo hành tại QuangHưng Mobile:\n• Bảo hành chính hãng 12-24 tháng\n• Đổi mới trong 30 ngày nếu lỗi nhà sản xuất\n• Hỗ trợ kỹ thuật miễn phí trọn đời\n• Trung tâm bảo hành trên toàn quốc' };
    }
    
    // Compare queries
    if (lowerMsg.includes('so sánh') || lowerMsg.includes('compare')) {
      return { text: 'Bạn muốn so sánh sản phẩm nào? Hãy cho tôi biết 2 sản phẩm bạn quan tâm, ví dụ: "So sánh iPhone 15 và Samsung S24"' };
    }
    
    // Greeting
    if (lowerMsg.includes('xin chào') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      return { text: 'Xin chào! Rất vui được hỗ trợ bạn. Bạn đang tìm kiếm điện thoại nào?' };
    }
    
    // Default response
    return { text: 'Cảm ơn bạn đã liên hệ! Tôi có thể giúp bạn:\n• Tìm điện thoại theo ngân sách\n• Xem khuyến mãi\n• Thông tin bảo hành\n• So sánh sản phẩm\n\nBạn cần hỗ trợ gì?' };
  }
  
  // Send message
  async function sendMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addUserMessage(message);
    input.value = '';
    
    showTyping();
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    hideTyping();
    
    const response = await processMessage(message);
    addBotMessage(response.text, response.isHTML || false);
  }
  
  // Initialize chatbot
  function initChatbot() {
    createChatbotHTML();
    
    const chatBtn = document.getElementById('ai-chatbot-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-close');
    const sendBtn = document.getElementById('ai-chat-send');
    const input = document.getElementById('ai-chat-input');
    const quickBtns = document.querySelectorAll('.ai-quick-btn');
    
    // Toggle chat window
    chatBtn.addEventListener('click', () => {
      chatWindow.classList.toggle('active');
      if (chatWindow.classList.contains('active')) {
        addWelcomeMessage();
        input.focus();
      }
    });
    
    // Close chat
    closeBtn.addEventListener('click', () => {
      chatWindow.classList.remove('active');
    });
    
    // Send message
    sendBtn.addEventListener('click', sendMessage);
    
    // Enter key
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    
    // Quick action buttons
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        let message = '';
        
        switch(action) {
          case 'promo':
            message = 'Cho tôi xem khuyến mãi';
            break;
          case 'compare':
            message = 'Tôi muốn so sánh sản phẩm';
            break;
          case 'warranty':
            message = 'Chính sách bảo hành';
            break;
        }
        
        if (message) {
          document.getElementById('ai-chat-input').value = message;
          sendMessage();
        }
      });
    });
  }
  
  // Load when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
