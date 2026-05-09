// AI Chatbot - Với lịch sử cuộc hội thoại giống ChatGPT
(function() {
  const API_URL = 'http://localhost:3000/api';
  let currentUserId = null;
  let currentConversationId = null;
  let conversations = [];
  let historyLoaded = false;
  let sidebarOpen = false;
  let currentImageBase64 = null;
  // Lấy userId từ localStorage
  function getUserId() {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (isLoggedIn && user && user.ma_kh) {
        return user.ma_kh;
      }
      return null;
    } catch (e) {
      console.error('Error getting user:', e);
      return null;
    }
  }
  
  // Kiểm tra user đã thay đổi chưa
  function checkUserChanged() {
    const newUserId = getUserId();
    if (newUserId !== currentUserId) {
      currentUserId = newUserId;
      currentConversationId = null;
      conversations = [];
      historyLoaded = false;
      return true;
    }
    return false;
  }
  
  // Format thời gian
  function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    return date.toLocaleDateString('vi-VN');
  }
  
  // Create chatbot HTML
  function createChatbotHTML() {
    const chatbotHTML = `
      <!-- Chatbot Button -->
      <button class="ai-chatbot-btn" id="ai-chatbot-btn" title="Chat với AI">
        <img src="images/reindeer-avatar.svg" alt="AI Assistant">
      </button>
      
      <!-- Chat Window -->
      <div class="ai-chat-window" id="ai-chat-window">
        <!-- Sidebar lịch sử -->
        <div class="ai-chat-sidebar" id="ai-chat-sidebar">
          <div class="ai-sidebar-header">
            <h4>Lịch sử chat</h4>
            <button class="ai-sidebar-close" id="ai-sidebar-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <button class="ai-new-chat-btn" id="ai-new-chat-btn">
            <i class="fas fa-plus"></i> Cuộc hội thoại mới
          </button>
          <div class="ai-conversations-list" id="ai-conversations-list">
            <!-- Danh sách cuộc hội thoại -->
          </div>
          <div class="ai-sidebar-footer">
            <button class="ai-clear-all-btn" id="ai-clear-all-btn">
              <i class="fas fa-trash"></i> Xóa tất cả
            </button>
          </div>
        </div>
        
        <!-- Main chat area -->
        <div class="ai-chat-main">
          <div class="ai-chat-header">
            <button class="ai-menu-btn" id="ai-menu-btn" title="Lịch sử chat">
              <i class="fas fa-bars"></i>
            </button>
            <div class="ai-chat-avatar">
              <img src="images/reindeer-avatar.svg" alt="AI Assistant">
            </div>
            <div class="ai-chat-info">
              <h3 class="ai-chat-title">AI Tư vấn</h3>
              <div class="ai-chat-status">Trực tuyến</div>
            </div>
            <div class="ai-chat-actions">
              <button class="ai-chat-close" id="ai-chat-close">&times;</button>
            </div>
          </div>
          
          <div class="ai-chat-messages" id="ai-chat-messages">
            <!-- Messages will be added here -->
          </div>
          
          <div class="ai-chat-input-area">
            <div class="ai-chat-input-wrapper">
              <input type="text" class="ai-chat-input" id="ai-chat-input" placeholder="Nhập câu hỏi của bạn..." autocomplete="off" spellcheck="false">
              <button class="ai-chat-send" id="ai-chat-send">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    const container = document.createElement('div');
    container.id = 'ai-chatbot-container';
    container.innerHTML = chatbotHTML;
    document.body.appendChild(container);
  }
  
  // Load danh sách cuộc hội thoại
  async function loadConversations() {
    const userId = getUserId();
    if (!userId) {
      conversations = [];
      renderConversationsList();
      return;
    }
    
    try {
      console.log('Loading conversations for user:', userId);
      const response = await fetch(`${API_URL}/chatbot/conversations?userId=${userId}`);
      if (response.ok) {
        conversations = await response.json();
        console.log('Loaded conversations:', conversations);
        renderConversationsList();
      } else {
        console.error('Failed to load conversations:', response.status);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }
  
  // Render danh sách cuộc hội thoại
  function renderConversationsList() {
    const listContainer = document.getElementById('ai-conversations-list');
    const userId = getUserId();
    
    if (!userId) {
      listContainer.innerHTML = `
        <div class="ai-no-history">
          <i class="fas fa-sign-in-alt"></i>
          <p>Đăng nhập để lưu lịch sử chat</p>
        </div>
      `;
      return;
    }
    
    if (conversations.length === 0) {
      listContainer.innerHTML = `
        <div class="ai-no-history">
          <i class="fas fa-comments"></i>
          <p>Chưa có cuộc hội thoại nào</p>
        </div>
      `;
      return;
    }
    
    // Nhóm theo thời gian
    const today = [];
    const yesterday = [];
    const thisWeek = [];
    const older = [];
    
    const now = new Date();
    conversations.forEach(conv => {
      const date = new Date(conv.updatedAt);
      const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diff === 0) today.push(conv);
      else if (diff === 1) yesterday.push(conv);
      else if (diff < 7) thisWeek.push(conv);
      else older.push(conv);
    });
    
    let html = '';
    
    if (today.length > 0) {
      html += `<div class="ai-conv-group"><div class="ai-conv-group-title">Hôm nay</div>`;
      today.forEach(conv => { html += renderConversationItem(conv); });
      html += `</div>`;
    }
    
    if (yesterday.length > 0) {
      html += `<div class="ai-conv-group"><div class="ai-conv-group-title">Hôm qua</div>`;
      yesterday.forEach(conv => { html += renderConversationItem(conv); });
      html += `</div>`;
    }
    
    if (thisWeek.length > 0) {
      html += `<div class="ai-conv-group"><div class="ai-conv-group-title">Tuần này</div>`;
      thisWeek.forEach(conv => { html += renderConversationItem(conv); });
      html += `</div>`;
    }
    
    if (older.length > 0) {
      html += `<div class="ai-conv-group"><div class="ai-conv-group-title">Trước đó</div>`;
      older.forEach(conv => { html += renderConversationItem(conv); });
      html += `</div>`;
    }
    
    listContainer.innerHTML = html;
    
    // Bind events
    listContainer.querySelectorAll('.ai-conv-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.ai-conv-delete')) {
          const convId = item.dataset.id;
          loadConversation(convId);
        }
      });
    });
    
    listContainer.querySelectorAll('.ai-conv-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const convId = btn.dataset.id;
        deleteConversation(convId);
      });
    });
  }
  
  // Render một item cuộc hội thoại
  function renderConversationItem(conv) {
    const isActive = conv.id == currentConversationId ? 'active' : '';
    return `
      <div class="ai-conv-item ${isActive}" data-id="${conv.id}">
        <i class="fas fa-comment-alt"></i>
        <span class="ai-conv-title">${escapeHtml(conv.title)}</span>
        <button class="ai-conv-delete" data-id="${conv.id}" title="Xóa">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }
  
  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Load một cuộc hội thoại cụ thể
  async function loadConversation(conversationId) {
    currentConversationId = conversationId;
    const messagesContainer = document.getElementById('ai-chat-messages');
    messagesContainer.innerHTML = '';
    
    try {
      console.log('Loading messages for conversation:', conversationId);
      const response = await fetch(`${API_URL}/chatbot/messages/${conversationId}`);
      if (response.ok) {
        const messages = await response.json();
        console.log('Loaded messages:', messages);
        messages.forEach(msg => {
          if (msg.role === 'user') {
            addUserMessage(msg.content);
          } else {
            addBotMessage(msg.content, true);
          }
        });
      } else {
        console.error('Failed to load messages:', response.status);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      addBotMessage('Không thể tải cuộc hội thoại. Vui lòng thử lại.');
    }
    
    // Cập nhật UI
    renderConversationsList();
    closeSidebar();
  }

  
  // Bắt đầu cuộc hội thoại mới
  function startNewConversation() {
    currentConversationId = null;
    const messagesContainer = document.getElementById('ai-chat-messages');
    messagesContainer.innerHTML = '';
    
    const userId = getUserId();
    if (userId) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userName = user.ho_ten || 'bạn';
      addBotMessage(`Xin chào ${userName}! 👋\n\nTôi là trợ lý AI của QuangHưng Mobile. Bạn cần hỗ trợ gì?`);
    } else {
      addBotMessage('Xin chào! Tôi là trợ lý AI của QuangHưng Mobile. 🎄\n\nTôi có thể giúp bạn tư vấn điện thoại, thông tin khuyến mãi, bảo hành và nhiều hơn nữa.\n\n💡 Đăng nhập để lưu lịch sử chat của bạn!');
    }
    
    renderConversationsList();
    closeSidebar();
  }
  
  // Xóa một cuộc hội thoại
  async function deleteConversation(conversationId) {
    if (!confirm('Bạn có chắc muốn xóa cuộc hội thoại này?')) return;
    
    try {
      await fetch(`${API_URL}/chatbot/conversations/${conversationId}`, {
        method: 'DELETE'
      });
      
      // Nếu đang xem cuộc hội thoại này, bắt đầu mới
      if (conversationId == currentConversationId) {
        startNewConversation();
      }
      
      // Reload danh sách
      await loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }
  
  // Xóa tất cả cuộc hội thoại
  async function clearAllConversations() {
    const userId = getUserId();
    if (!userId) return;
    
    if (!confirm('Bạn có chắc muốn xóa TẤT CẢ lịch sử chat?')) return;
    
    try {
      await fetch(`${API_URL}/chatbot/conversations-all?userId=${userId}`, {
        method: 'DELETE'
      });
      
      conversations = [];
      currentConversationId = null;
      startNewConversation();
    } catch (error) {
      console.error('Error clearing all conversations:', error);
    }
  }
  
  // Toggle sidebar
  function toggleSidebar() {
    const sidebar = document.getElementById('ai-chat-sidebar');
    sidebarOpen = !sidebarOpen;
    sidebar.classList.toggle('open', sidebarOpen);
  }
  
  function closeSidebar() {
    const sidebar = document.getElementById('ai-chat-sidebar');
    sidebarOpen = false;
    sidebar.classList.remove('open');
  }
  
  // Load lịch sử chat ban đầu
  async function loadInitialChat() {
    const userId = getUserId();
    const messagesContainer = document.getElementById('ai-chat-messages');
    messagesContainer.innerHTML = '';
    
    if (!userId) {
      addBotMessage('Xin chào! Tôi là trợ lý AI của QuangHưng Mobile. 🎄\n\nTôi có thể giúp bạn tư vấn điện thoại, thông tin khuyến mãi, bảo hành và nhiều hơn nữa.\n\n💡 Đăng nhập để lưu lịch sử chat của bạn!');
      return;
    }
    
    // Load danh sách cuộc hội thoại
    await loadConversations();
    
    // Nếu có cuộc hội thoại, load cuộc hội thoại gần nhất
    if (conversations.length > 0) {
      await loadConversation(conversations[0].id);
    } else {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userName = user.ho_ten || 'bạn';
      addBotMessage(`Xin chào ${userName}! 👋\n\nTôi là trợ lý AI của QuangHưng Mobile. Lịch sử chat của bạn sẽ được lưu lại.\n\nBạn cần hỗ trợ gì?`);
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
      messageDiv.innerHTML = text.replace(/\n/g, '<br>');
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Add user message
  function addUserMessage(text, isHTML = false) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message user';
    if(isHTML) {
      messageDiv.innerHTML = text;
    } else {
      messageDiv.textContent = text;
    }
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
  async function callAI(message, imageBase64 = null) {
    const userId = getUserId();

    try {
      const response = await fetch(`${API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          image: imageBase64,
          userId: userId,
          conversationId: currentConversationId
        })
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();
      
      // Cập nhật conversationId nếu là cuộc hội thoại mới
      if (data.isNewConversation && data.conversationId) {
        currentConversationId = data.conversationId;
        // Reload danh sách cuộc hội thoại
        await loadConversations();
      }
      
      return data.response;
    } catch (error) {
      console.error('AI API error:', error);
      return 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ hotline 1900.xxxx để được hỗ trợ.';
    }
  }
  
  // Send message
  async function sendMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();

    if (!message && !currentImageBase64) return;

    // Show user message with or without image
    if (currentImageBase64) {
      addUserMessage(message ? message + '<br><img src="'+currentImageBase64+'" style="max-width:100px; max-height:100px; border-radius:4px; margin-top:5px;">' : '<img src="'+currentImageBase64+'" style="max-width:100px; max-height:100px; border-radius:4px;">', true);
    } else {
      addUserMessage(message);
    }

    const payloadMessage = message;
    const payloadImage = currentImageBase64;

    input.value = '';
    removePreviewImage();
    input.disabled = true;

    showTyping();

    const response = await callAI(payloadMessage, payloadImage);

    hideTyping();
    input.disabled = false;
    input.focus();

    addBotMessage(response, true);
  }

  function removePreviewImage() {
    currentImageBase64 = null;
  }

  // Initialize chatbot
  function initChatbot() {
    createChatbotHTML();
    
    const chatBtn = document.getElementById('ai-chatbot-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-close');
    const menuBtn = document.getElementById('ai-menu-btn');
    const sidebarCloseBtn = document.getElementById('ai-sidebar-close');
    const newChatBtn = document.getElementById('ai-new-chat-btn');
    const clearAllBtn = document.getElementById('ai-clear-all-btn');
    const sendBtn = document.getElementById('ai-chat-send');
    const input = document.getElementById('ai-chat-input');

    // Mở/đóng chat window

      currentUserId = getUserId();

      chatBtn.addEventListener('click', async () => {
        chatWindow.classList.toggle('active');

        if (chatWindow.classList.contains('active')) {
          window.dispatchEvent(new CustomEvent('chatbot-opened'));

          const userChanged = checkUserChanged();

          if (!historyLoaded || userChanged) {
          await loadInitialChat();
          historyLoaded = true;
        }
        input.focus();
      } else {
        // Phát sự kiện để hiện floating share
        window.dispatchEvent(new CustomEvent('chatbot-closed'));
      }
    });
    
    // Close chat
    closeBtn.addEventListener('click', () => {
      chatWindow.classList.remove('active');
      closeSidebar();
      // Phát sự kiện để hiện floating share
      window.dispatchEvent(new CustomEvent('chatbot-closed'));
    });
    
    // Toggle sidebar
    menuBtn.addEventListener('click', () => {
      toggleSidebar();
    });
    
    // Close sidebar
    sidebarCloseBtn.addEventListener('click', () => {
      closeSidebar();
    });
    
    // New chat
    newChatBtn.addEventListener('click', () => {
      startNewConversation();
    });
    
    // Clear all
    clearAllBtn.addEventListener('click', () => {
      clearAllConversations();
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
    
    // Lắng nghe sự kiện storage
    window.addEventListener('storage', (e) => {
      if (e.key === 'user' || e.key === 'isLoggedIn') {
        historyLoaded = false;
      }
    });
  }
  
  // Load when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
