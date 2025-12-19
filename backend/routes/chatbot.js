const express = require('express');
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// System prompt cho chatbot
const SYSTEM_PROMPT = `Bạn là trợ lý AI của QuangHưng Mobile - cửa hàng điện thoại di động uy tín.

Thông tin về cửa hàng:
- Tên: QuangHưng Mobile
- Chuyên bán: Điện thoại di động chính hãng (iPhone, Samsung, Xiaomi, OPPO, Vivo, Realme, Sony)
- Dịch vụ: Bán lẻ, trả góp 0%, bảo hành chính hãng, thu cũ đổi mới
- Hotline: 1900.xxxx
- Website: quanghungmobile.com

Chính sách:
- Bảo hành: 12-24 tháng chính hãng
- Đổi trả: 30 ngày nếu lỗi nhà sản xuất
- Trả góp: 0% lãi suất qua thẻ tín dụng
- Giao hàng: Miễn phí toàn quốc

Quy tắc trả lời:
1. Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
2. Tập trung vào tư vấn điện thoại và dịch vụ của cửa hàng
3. Nếu được hỏi về giá, hãy gợi ý khách xem trang sản phẩm để có giá chính xác nhất
4. Giữ câu trả lời ngắn gọn, dễ hiểu (tối đa 3-4 câu)
5. Nếu không biết thông tin cụ thể, hãy hướng dẫn khách liên hệ hotline hoặc xem website`;

// Lưu lịch sử chat theo session (trong memory - production nên dùng Redis)
const chatHistory = new Map();

// API chat với AI
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Vui lòng nhập tin nhắn' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'AI chưa được cấu hình' });
    }

    // Lấy hoặc tạo lịch sử chat
    let history = chatHistory.get(sessionId) || [];
    
    // Thêm tin nhắn user
    history.push({ role: 'user', content: message });
    
    // Giới hạn lịch sử (giữ 10 tin nhắn gần nhất)
    if (history.length > 10) {
      history = history.slice(-10);
    }

    // Gọi Groq API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      return res.status(500).json({ error: 'Lỗi kết nối AI' });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

    // Lưu response vào lịch sử
    history.push({ role: 'assistant', content: aiResponse });
    chatHistory.set(sessionId, history);

    res.json({ 
      response: aiResponse,
      sessionId: sessionId || Date.now().toString()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại' });
  }
});

// Xóa lịch sử chat
router.delete('/history/:sessionId', (req, res) => {
  chatHistory.delete(req.params.sessionId);
  res.json({ message: 'Đã xóa lịch sử chat' });
});

module.exports = router;
