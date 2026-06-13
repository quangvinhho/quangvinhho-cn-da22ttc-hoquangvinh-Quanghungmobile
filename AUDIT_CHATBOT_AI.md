# AUDIT KỸ CHATBOT AI - QuangHưng Mobile

Ngày audit: 10.06.2026 | Trạng thái: HOẠT ĐỘNG - CÓ HẠNG MỤC CẦN FIX

═══════════════════════════════════════════════════════════════════

## 1. RASA CHATBOT

✅ ĐÃ CÓ:
- domain.yml (11 intents, 3 entities, 3 slots, 1 form, response buttons)
- config.yml (DIETClassifier + ResponseSelector + FallbackClassifier=0.4)
- data/nlu.yml: 50-100 examples/intent, tiếng Việt có dấu + không dấu
- actions/actions.py: 4 custom actions (rag, clarify_address, get_store, get_delivery)

⚠️ VẤN ĐỀ NGHIÊM TRỌNG - mock_rasa_server.py CHỈ LÀ MOCK:
  - Dòng 1-11: "⚠️ MOCK RASA SERVER — KHÔNG DÙNG PRODUCTION"
  - Backend BYPASS Rasa hoàn toàn, gọi trực tiếp RAG/Groq LLM (chatbot.js:287)
  - Rasa model KHÔNG DEPLOY, chỉ giữ "để tham chiếu"
  - KẾT LUẬN: Module Rasa có nhưng không dùng

❌ CHƯA CÓ:
  - Training data quá ít (~550-1100 samples, Tiki/Shopee hàng ngàn)
  - Thiếu intents: ask_warranty, ask_return_policy, ask_promotion
  - Rasa server thật chưa train/deploy

═══════════════════════════════════════════════════════════════════

## 2. RAG SERVICE

✅ ĐÃ CÓ:
- main.py: HTTP server FastAPI, rate limiter (30 req/min), admin token
- rag_engine.py:
  * LLM: ChatGroq (llama-3.1-8b-instant)
  * Embeddings: HuggingFace (sentence-transformers/all-MiniLM-L6-v2)
  * Vector Store: ChromaDB (./chroma_db/)
  * Knowledge từ MySQL: san_pham, don_hang, khuyen_mai, cau_hinh
  * Cache: 60s TTL cho FAQ
- recommend_engine.py: KNN + Apriori association rules
- products_dump.txt: 50+ sản phẩm JSON (301 dòng)

⚠️ VẤN ĐỀ NGHIÊM TRỌNG - KHÔNG AUTO-SYNC với MySQL:
  - products_dump.txt LÀ STATIC FILE
  - Admin update sản phẩm → phải manual gọi /api/reload-vectorstore
  - NẾU QUÊN: chatbot gợi ý sản phẩm cũ/hết hàng
  - RỦI RO: Kinh doanh 20+ sản phẩm/ngày → dễ quên
  - Code (chatbot-knowledge.js:5-28): 3s timeout, chỉ tự động trong dev

⚠️ VẤN ĐỀ KHÁC:
  - Embedding model nhỏ (all-MiniLM), không tốt cho FAQ tiếng Việt
  - Recommend engine chỉ mock, không training trên user behavior thực tế

❌ CHƯA CÓ:
  - Webhook notification khi product update
  - Cron job auto-reload (VD: 30 phút)
  - Batch update API

═══════════════════════════════════════════════════════════════════

## 3. BACKEND CHATBOT ROUTE (chatbot.js)

✅ ĐÃ CÓ:
- Endpoint: POST /api/chatbot/chat (dòng 213)
  Input: message, image, userId, conversationId
  Output: response, conversationId, isNewConversation, suggestions
- Circuit breaker cho RAG (3 fail → open 30s, fallback Groq)
- Keyword matching + LLM pipeline (dòng 304-346)
  1. Có "địa chỉ" → clarify
  2. Có "giao hàng" + login → query don_hang
  3. Tư vấn chung → RAG + Groq
- Lưu lịch sử chat (cuoc_hoi_thoai, lich_su_chatbot tables)
- Cá nhân hóa: query so_thich_khach_hang (interests) → system prompt
- System prompt chi tiết (dòng 116-155): HTML cards, guardrails

⚠️ VẤN ĐỀ:
  - Không streaming response (one-shot, chờ 2-5s)
  - Keyword matching cứng (300+ dòng) → khó maintain
  - System prompt quá dài (~1500 tokens + product list)
  - Không detect teen code ("mua cái j mà mắc v")

❌ CHƯA CÓ:
  - Rate limit per user
  - Request validation (injection)
  - Logging + monitoring chi tiết

═══════════════════════════════════════════════════════════════════

## 4. FRONTEND CHATBOT UI (ai-chatbot.js/css)

✅ ĐÃ CÓ:
- Widget: Floating button + chat window + sidebar lịch sử
- Suggestion chips (4 cố định): 📱 Tư vấn, 💰 Trả góp, 📍 Địa chỉ, 🎁 Khuyến mãi
- Auto-detect suggestions từ bot response
- HTML render: innerHTML + escapeHtml() (an toàn XSS)
- HTML product cards: ảnh + giá + "Xem chi tiết"
- Typing indicator có
- Lịch sử: nhóm theo ngày

⚠️ VẤN ĐỀ:
  - "Thêm vào giỏ" button: onclick="addToCart(...)" nhưng function undefined
  - Không rich media cards (like Tiki/Shopee)
  - Voice input: button tồn tại nhưng handler không có
  - Không pagination lịch sử (load all conversations)

❌ CHƯA CÓ:
  - Handoff sang nhân viên thật
  - Feedback (thumbs up/down)
  - Export chat as PDF
  - Streaming response

═══════════════════════════════════════════════════════════════════

## 5. ĐÁNH GIÁ TỔNG QUAN

Hạng Mục                        Điểm    Ghi Chú
─────────────────────────────────────────────────────────────────
Chất lượng NLU                  6/10    Training data ít, intent chưa đủ
Chất lượng Response             7/10    HTML tốt nhưng cứng keywords
Tích hợp sản phẩm real-time     5/10    Static dump, cần manual reload
UX widget                       7/10    Tốt nhưng voice/addToCart chưa xong
Semantic search (RAG)           6/10    Embedding model nhỏ
Tiếng Việt hỗ trợ              8/10    Có dấu + không dấu, chưa teen code
─────────────────────────────────────────────────────────────────
% HOÀN THÀNH TỔNG:              63%     Dùng được nhưng cần fix

═══════════════════════════════════════════════════════════════════

## 6. TOP 5 HẠN MỤC CẦN FIX NGAY (1-2 TUẦN)

1. [ƯU TIÊN CAO] Auto-sync Products → Vector Store
   Vấn đề: products_dump.txt static → giá/tồn kho outdated
   Giải pháp: Webhook khi update OR cron 30 phút
   Effort: 2-4 giờ | Impact: Tránh gợi ý hết hàng

2. [ƯU TIÊN CAO] Thêm intents & training data
   Vấn đề: 11 intents, 50 examples/intent (quá ít)
   Giải pháp: Thêm ask_warranty, ask_return_policy; mỗi 100+ examples
   Effort: 1-2 tuần | Impact: Accuracy 70% → 85%+

3. [ƯU TIÊN TRUNG] Refactor cứng coded keywords (300+ dòng)
   Vấn đề: Khó maintain, khó scale
   Giải pháp: Deploy Rasa OR semantic similarity
   Effort: 3-5 giờ | Impact: Dễ maintain

4. [ƯU TIÊN TRUNG] Fix UI bugs (Voice + addToCart)
   Vấn đề: Button tồn tại nhưng handler không có
   Giải pháp: Web Speech API + cart event emit
   Effort: 2 giờ | Impact: UX tốt hơn

5. [ƯU TIÊN TRUNG] Streaming response + dynamic suggestions
   Vấn đề: One-shot chờ lâu; suggestions cố định
   Giải pháp: Server-Sent Events (SSE)
   Effort: 4-6 giờ | Impact: UX tương tự ChatGPT

═══════════════════════════════════════════════════════════════════

## 7. SO SÁNH CHUẨN (Tiki/Shopee/CellphoneS)

Feature                 Tiki    Shopee  CellphoneS  QuangHưng
───────────────────────────────────────────────────────────────
Suggestion chips        ✅      ✅      ✅          ✅
Product cards           ✅      ✅      ✅          ⚠️ text only
Streaming               ✅      ✅      ❌          ❌
Handoff to agent        ✅      ✅      ✅          ❌
Chat history            ✅      ✅      ❌          ✅
Real-time sync          ✅      ✅      ✅          ❌ CRITICAL
Voice input             ✅      ✅      ❌          ❌
───────────────────────────────────────────────────────────────
Nhận xét: ~70% tương đương, thiếu real-time + handoff + streaming

═══════════════════════════════════════════════════════════════════

## 8. LƯU Ý BẢO MẬT

❌ DB password hardcode: mock_rasa_server.py:50 "Vinh123456789@"
✅ RAG endpoint: Kiểm tra ADMIN_TOKEN
✅ Access control: User chỉ xem chat của mình
✅ XSS prevention: escapeHtml() trước innerHTML

═══════════════════════════════════════════════════════════════════

## KẾT LUẬN

✅ Hoạt động được, không fail hàng ngày
⚠️ KHÔNG real-time sync sản phẩm → RỦI RO CAO cho e-commerce
⚠️ NLU training data ít → accuracy ~70%
⚠️ Keyword matching cứng → khó maintain

KHUYẾN CÁO: Implement priority 1-2 trong 2 tuần. Hiện tại có thể
live nhưng cần monitoring chặt sản phẩm updates.

═══════════════════════════════════════════════════════════════════
