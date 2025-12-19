// AI Chatbot - Reindeer Theme với Groq AI
(function() {
  const API_URL = 'http://localhost:3000/api';
  let sessionId = localStorage.getItem('chatbot_session') || Date.now().toString();
  
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
      addBotMessage('Xin chào! Tôi là trợ lý AI của QuangHưng Mobile. Tôi có thể giúp bạn tư vấn điện thoại, thông tin khuyến mãi, bảo hành và nhiều hơn nữa. Bạn cần hỗ trợ gì?');
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
      // Format text với line breaks
      messageDiv.innerHTML = text.replace(/\n/g, '<br>');
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
  
  // Call AI API
  async function callAI(message) {
    try {
      const response = await fetch(`${API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();
      
      // Lưu sessionId
      if (data.sessionId) {
        sessionId = data.sessionId;
        localStorage.setItem('chatbot_session', sessionId);
      }

      return data.response;
    } catch (error) {
      console.error('AI API error:', error);
      // Fallback response
      return 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ hotline 1900.xxxx để được hỗ trợ.';
    }
  }
  
  // Send message
  async function sendMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addUserMessage(message);
    input.value = '';
    input.disabled = true;
    
    showTyping();
    
    // Gọi AI API
    const response = await callAI(message);
    
    hideTyping();
    input.disabled = false;
    input.focus();
    
    addBotMessage(response);
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
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    // Quick action buttons
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        let message = '';
        
        switch(action) {
          case 'promo':
            message = 'Cho tôi xem các chương trình khuyến mãi hiện tại';
            break;
          case 'compare':
            message = 'Tôi muốn so sánh các dòng điện thoại';
            break;
          case 'warranty':
            message = 'Chính sách bảo hành như thế nào?';
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
