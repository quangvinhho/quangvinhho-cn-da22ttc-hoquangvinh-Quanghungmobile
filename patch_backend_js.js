const fs = require('fs');
let code = fs.readFileSync('D:/GDDA/backend/routes/chatbot.js', 'utf8');

const oldRouterPost = `router.post('/chat', async (req, res) => {
  try {
    const { message, userId, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Vui lòng nhập tin nhắn' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'AI chưa được cấu hình' });
    }

    let history = [];
    let currentConversationId = conversationId;
    let isNewConversation = false;

    if (userId) {
      if (!currentConversationId) {
        const title = generateTitle(message);
        currentConversationId = await createConversation(userId, title);
        isNewConversation = true;
      }

      if (currentConversationId) {
        history = await getChatHistory(currentConversationId, 10);
        await saveMessage(currentConversationId, userId, 'user', message);
      }
    }

    const products = await getProductsFromDB();
    const productContext = createProductContext(products);
    const SYSTEM_PROMPT = BASE_SYSTEM_PROMPT + productContext;

    // Chuẩn bị lịch sử tin nhắn
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${GROQ_API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...formattedHistory,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });`;

const newRouterPost = `router.post('/chat', async (req, res) => {
  try {
    const { message, image, userId, conversationId } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: 'Vui lòng nhập tin nhắn hoặc hình ảnh' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'AI chưa được cấu hình' });
    }

    let history = [];
    let currentConversationId = conversationId;
    let isNewConversation = false;

    if (userId) {
      if (!currentConversationId) {
        const title = generateTitle(message || "Tìm kiếm bằng hình ảnh");
        currentConversationId = await createConversation(userId, title);
        isNewConversation = true;
      }

      if (currentConversationId) {
        history = await getChatHistory(currentConversationId, 10);
        await saveMessage(currentConversationId, userId, 'user', message || "[Hình ảnh tải lên]");
      }
    }

    const products = await getProductsFromDB();
    const productContext = createProductContext(products);
    
    let imagePromptExtension = "";
    if (image) {
      imagePromptExtension = "\\n\\nChú ý hình ảnh được gửi lên: Khách hàng đang hỏi về điện thoại hoặc sản phẩm trong ảnh. Hãy quan sát kỹ và cho biết đó là điện thoại gì, thuộc hãng nào. Nếu sản phẩm đó có trong danh sách cửa hàng, hãy cung cấp thông tin như cấu trúc quy định. Nếu mẫu điện thoại đó không có trong cửa hàng, hãy xin lỗi khách hàng lịch sự và tư vấn các điện thoại tương đương có trong danh sách.";
    }
    const SYSTEM_PROMPT = BASE_SYSTEM_PROMPT + productContext + imagePromptExtension;

    // Chuẩn bị lịch sử tin nhắn
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    let userMessageObject;
    let selectedModel = 'llama-3.3-70b-versatile';
    
    if (image) {
      selectedModel = 'llama-3.2-11b-vision-preview'; // Sử dụng mô hình vision nếu có ảnh
      userMessageObject = {
        role: 'user',
        content: [
          { type: 'text', text: message || "Bạn có biết điện thoại trong ảnh là mẫu nào không? Cửa hàng có bán không?" },
          { type: 'image_url', image_url: { url: image } }
        ]
      };
    } else {
      userMessageObject = { role: 'user', content: message };
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${GROQ_API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...formattedHistory,
          userMessageObject
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });`;

code = code.replace(oldRouterPost, newRouterPost);

fs.writeFileSync('D:/GDDA/backend/routes/chatbot.js', code);
console.log("Backend JS patched with Vision Model API Request");
