const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

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

// Tạo tiêu đề tự động từ tin nhắn đầu tiên
function generateTitle(message) {
  let title = message.trim().substring(0, 50);
  if (message.length > 50) title += '...';
  return title;
}

// Lấy lịch sử chat của một cuộc hội thoại
async function getChatHistory(conversationId, limit = 10) {
  try {
    const [rows] = await pool.query(
      `SELECT vai_tro as role, noi_dung as content 
       FROM lich_su_chatbot 
       WHERE ma_cuoc_hoi_thoai = ? 
       ORDER BY thoi_gian DESC 
       LIMIT ?`,
      [conversationId, limit]
    );
    return rows.reverse();
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
}

// Lưu tin nhắn vào database
async function saveMessage(conversationId, maKh, role, content) {
  try {
    await pool.query(
      `INSERT INTO lich_su_chatbot (ma_cuoc_hoi_thoai, ma_kh, vai_tro, noi_dung) VALUES (?, ?, ?, ?)`,
      [conversationId, maKh, role, content]
    );
    await pool.query(
      `UPDATE cuoc_hoi_thoai SET ngay_cap_nhat = NOW() WHERE ma_cuoc_hoi_thoai = ?`,
      [conversationId]
    );
  } catch (error) {
    console.error('Error saving message:', error);
  }
}

// Tạo cuộc hội thoại mới
async function createConversation(maKh, title = 'Cuộc hội thoại mới') {
  try {
    const [result] = await pool.query(
      `INSERT INTO cuoc_hoi_thoai (ma_kh, tieu_de) VALUES (?, ?)`,
      [maKh, title]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
}

// API chat với AI
router.post('/chat', async (req, res) => {
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
    
    history.push({ role: 'user', content: message });

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

    if (userId && currentConversationId) {
      await saveMessage(currentConversationId, userId, 'assistant', aiResponse);
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
});

// Lấy tin nhắn của một cuộc hội thoại - ĐẶT TRƯỚC route có :userId
router.get('/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    console.log('Getting messages for conversation:', conversationId);
    
    const [rows] = await pool.query(
      `SELECT 
        ma_tin_nhan as id,
        vai_tro as role,
        noi_dung as content,
        thoi_gian as timestamp
       FROM lich_su_chatbot 
       WHERE ma_cuoc_hoi_thoai = ? 
       ORDER BY thoi_gian ASC
       LIMIT ?`,
      [conversationId, limit]
    );
    
    console.log('Found messages:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Lỗi lấy tin nhắn' });
  }
});

// Lấy danh sách cuộc hội thoại của user - dùng query param
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.query.userId;
    const limit = parseInt(req.query.limit) || 20;
    
    if (!userId) {
      return res.status(400).json({ error: 'Thiếu userId' });
    }
    
    console.log('Getting conversations for user:', userId);
    
    const [rows] = await pool.query(
      `SELECT 
        ma_cuoc_hoi_thoai as id,
        tieu_de as title,
        ngay_tao as createdAt,
        ngay_cap_nhat as updatedAt
       FROM cuoc_hoi_thoai 
       WHERE ma_kh = ? 
       ORDER BY ngay_cap_nhat DESC
       LIMIT ?`,
      [userId, limit]
    );
    
    console.log('Found conversations:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách cuộc hội thoại' });
  }
});

// Tạo cuộc hội thoại mới
router.post('/conversations', async (req, res) => {
  try {
    const { userId, title } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Vui lòng đăng nhập' });
    }
    
    const conversationId = await createConversation(userId, title || 'Cuộc hội thoại mới');
    
    if (!conversationId) {
      return res.status(500).json({ error: 'Không thể tạo cuộc hội thoại' });
    }
    
    res.json({ 
      id: conversationId,
      title: title || 'Cuộc hội thoại mới',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Lỗi tạo cuộc hội thoại' });
  }
});

// Đổi tên cuộc hội thoại
router.put('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;
    
    await pool.query(
      `UPDATE cuoc_hoi_thoai SET tieu_de = ? WHERE ma_cuoc_hoi_thoai = ?`,
      [title, conversationId]
    );
    
    res.json({ message: 'Đã cập nhật tiêu đề' });
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: 'Lỗi cập nhật cuộc hội thoại' });
  }
});

// Xóa một cuộc hội thoại
router.delete('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    await pool.query('DELETE FROM cuoc_hoi_thoai WHERE ma_cuoc_hoi_thoai = ?', [conversationId]);
    
    res.json({ message: 'Đã xóa cuộc hội thoại' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Lỗi xóa cuộc hội thoại' });
  }
});

// Xóa tất cả cuộc hội thoại của user - dùng query param
router.delete('/conversations-all', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'Thiếu userId' });
    }
    
    await pool.query('DELETE FROM cuoc_hoi_thoai WHERE ma_kh = ?', [userId]);
    
    res.json({ message: 'Đã xóa tất cả cuộc hội thoại' });
  } catch (error) {
    console.error('Error deleting all conversations:', error);
    res.status(500).json({ error: 'Lỗi xóa cuộc hội thoại' });
  }
});

// API cũ để tương thích ngược
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const [conversations] = await pool.query(
      `SELECT ma_cuoc_hoi_thoai FROM cuoc_hoi_thoai WHERE ma_kh = ? ORDER BY ngay_cap_nhat DESC LIMIT 1`,
      [userId]
    );
    
    if (conversations.length === 0) {
      return res.json([]);
    }
    
    const [rows] = await pool.query(
      `SELECT ma_tin_nhan as id, vai_tro as role, noi_dung as content, thoi_gian as timestamp
       FROM lich_su_chatbot 
       WHERE ma_cuoc_hoi_thoai = ? 
       ORDER BY thoi_gian ASC
       LIMIT ?`,
      [conversations[0].ma_cuoc_hoi_thoai, limit]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Lỗi lấy lịch sử chat' });
  }
});

router.delete('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await pool.query('DELETE FROM cuoc_hoi_thoai WHERE ma_kh = ?', [userId]);
    res.json({ message: 'Đã xóa lịch sử chat' });
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ error: 'Lỗi xóa lịch sử chat' });
  }
});

// Kiểm tra kết nối database
router.get('/check', async (req, res) => {
  try {
    const dbName = process.env.DB_NAME || 'QHUNG';
    
    const [convTable] = await pool.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'cuoc_hoi_thoai'`,
      [dbName]
    );
    
    const [msgTable] = await pool.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'lich_su_chatbot'`,
      [dbName]
    );
    
    if (convTable.length === 0 || msgTable.length === 0) {
      return res.json({ 
        status: 'error', 
        message: 'Bảng chatbot chưa tồn tại. Vui lòng chạy file create_chatbot_table.sql',
        tables: {
          cuoc_hoi_thoai: convTable.length > 0,
          lich_su_chatbot: msgTable.length > 0
        }
      });
    }
    
    const [convCount] = await pool.query('SELECT COUNT(*) as total FROM cuoc_hoi_thoai');
    const [msgCount] = await pool.query('SELECT COUNT(*) as total FROM lich_su_chatbot');
    
    res.json({ 
      status: 'ok', 
      message: 'Kết nối database thành công',
      tables: {
        cuoc_hoi_thoai: true,
        lich_su_chatbot: true
      },
      totalConversations: convCount[0].total,
      totalMessages: msgCount[0].total
    });
  } catch (error) {
    console.error('Database check error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
