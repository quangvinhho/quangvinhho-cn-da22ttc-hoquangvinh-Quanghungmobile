const fs = require('fs');

let code = fs.readFileSync('D:/GDDA/backend/routes/chatbot.js', 'utf8');

const regex = /\/\/ API chat với AI[\s\S]*?res\.status\(500\)\.json\(\{\s*error:\s*'Đã xảy ra lỗi, vui lòng thử lại'\s*\}\);\n  \}\n\}\);/;

const newCode = `// API chat với AI
router.post('/chat', async (req, res) => {
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
        const title = generateTitle(message || "Tìm kiếm hình ảnh");
        currentConversationId = await createConversation(userId, title);
        isNewConversation = true;
      }

      if (currentConversationId) {
        history = await getChatHistory(currentConversationId, 10);
        await saveMessage(currentConversationId, userId, 'user', message || "[Đã gửi một hình ảnh]");
      }
    }

    let userMessage;
    let selectedModel = 'llama-3.3-70b-versatile';

    if (image) {
      selectedModel = 'llama-3.2-11b-vision-preview';
      userMessage = {
        role: 'user',
        content: [
          { type: 'text', text: message ? message : "Đây là điện thoại gì? Shop có bán không? Nếu không có thì trả lời lịch sự và giới thiệu sản phẩm khác nhé." },
          { type: 'image_url', image_url: { url: image } }
        ]
      };
    } else {
      userMessage = { role: 'user', content: message };
    }

    // Prepare history format (for vision model it's better if history is strictly text, but groq handles standard formatting)
    history.push(userMessage);

    // Lấy danh sách sản phẩm từ database để AI có thể gợi ý
    const products = await getProductsFromDB();
    const productContext = createProductContext(products);
    
    let imagePromptExtension = "";
    if (image) {
      imagePromptExtension = "\\n\\nKHÁCH HÀNG VỪA GỬI 1 HÌNH ẢNH: Hãy nhận diện điện thoại trong ảnh. Nếu sản phẩm đó có trong danh sách, hãy giới thiệu nó bằng mẫu HTML đã cho sẵn. Nếu KHÔNG CÓ TRONG DANH SÁCH website, hãy trả lời lịch sự và thân thiện (ví dụ: 'Dạ, hiện tại cửa hàng bên em chưa kinh doanh dòng sản phẩm này ạ...', rồi tư vấn sản phẩm tương đương có trong danh sách).";
    }
    const SYSTEM_PROMPT = BASE_SYSTEM_PROMPT + productContext + imagePromptExtension;

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
          ...history
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return res.status(500).json({ error: 'Lỗi kết nối AI' });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

    if (userId && currentConversationId) {
      await saveMessage(currentConversationId, userId, 'assistant', String(aiResponse));
    }

    res.json({
      response: aiResponse,
      conversationId: currentConversationId,
      isNewConversation
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại' });
  }
});`;

if (regex.test(code)) {
  code = code.replace(regex, newCode);
  fs.writeFileSync('D:/GDDA/backend/routes/chatbot.js', code);
  console.log("Successfully replaced router.post('/chat') block");
} else {
  console.log("Could not find block to replace");
}
