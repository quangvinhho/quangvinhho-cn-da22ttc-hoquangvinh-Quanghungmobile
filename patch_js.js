const fs = require('fs');
let code = fs.readFileSync('D:/GDDA/frontend/components/ai-chatbot.js', 'utf8');

// 1. Add base64 image state variable
code = code.replace(
  "  let sidebarOpen = false;",
  "  let sidebarOpen = false;\n  let currentImageBase64 = null;"
);

// 2. Modify sendMessage to use image
const oldSendMessage = `  async function sendMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();

    if (!message) return;

    addUserMessage(message);
    input.value = '';
    input.disabled = true;

    showTyping();

    const response = await callAI(message);

    hideTyping();
    input.disabled = false;
    input.focus();

    addBotMessage(response, true);
  }`;

const newSendMessage = `  async function sendMessage() {
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
    const previewContainer = document.getElementById('ai-image-preview-container');
    const previewImg = document.getElementById('ai-image-preview');
    const uploadInput = document.getElementById('ai-image-upload');
    
    currentImageBase64 = null;
    if(uploadInput) uploadInput.value = '';
    if(previewImg) previewImg.src = '';
    if(previewContainer) previewContainer.style.display = 'none';
  }`;

code = code.replace(oldSendMessage, newSendMessage);

// 3. Modify callAI
const oldCallAI = `  async function callAI(message) {
    const userId = getUserId();

    try {
      const response = await fetch(\`\${API_URL}/chatbot/chat\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          userId: userId,
          conversationId: currentConversationId
        })
      });`;

const newCallAI = `  async function callAI(message, imageBase64 = null) {
    const userId = getUserId();

    try {
      const response = await fetch(\`\${API_URL}/chatbot/chat\`, {
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
      });`;

code = code.replace(oldCallAI, newCallAI);

// 4. Modify addUserMessage to support HTML (to show the image on the user side)
// Currently addUserMessage takes only text
const oldAddUserMsg = `  function addUserMessage(text) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message user';
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }`;

const newAddUserMsg = `  function addUserMessage(text, isHTML = false) {
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
  }`;

code = code.replace(oldAddUserMsg, newAddUserMsg);

// 5. Add event listeners inside initChatbot for image upload
const oldInitChatbotStart = `    function initChatbot() {
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
      const quickBtns = document.querySelectorAll('.ai-quick-btn');`;

const newInitChatbotStart = `    function initChatbot() {
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
      const quickBtns = document.querySelectorAll('.ai-quick-btn');

      // Image upload elements
      const uploadInput = document.getElementById('ai-image-upload');
      const removeImageBtn = document.getElementById('ai-remove-image-btn');
      const previewContainer = document.getElementById('ai-image-preview-container');
      const previewImg = document.getElementById('ai-image-preview');

      if (uploadInput) {
        uploadInput.addEventListener('change', function() {
          const file = this.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
              currentImageBase64 = e.target.result;
              previewImg.src = currentImageBase64;
              previewContainer.style.display = 'flex';
            };
            reader.readAsDataURL(file);
          }
        });
      }

      if (removeImageBtn) {
        removeImageBtn.addEventListener('click', removePreviewImage);
      }`;

code = code.replace(oldInitChatbotStart, newInitChatbotStart);

fs.writeFileSync('D:/GDDA/frontend/components/ai-chatbot.js', code);
console.log("Frontend JS patched with Image Upload Support");
