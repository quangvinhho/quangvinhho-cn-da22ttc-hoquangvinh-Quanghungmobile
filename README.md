# Hệ Thống Bán Hàng Tích Hợp Chatbot AI Hỗ Trợ Tư Vấn và Gợi Ý Sản Phẩm

## 📋 Giới Thiệu

Đồ án xây dựng **hệ thống bán hàng tích hợp Chatbot AI hỗ trợ tư vấn và gợi ý sản phẩm** cho cửa hàng điện thoại QuangHưng Mobile, kết hợp các công nghệ AI tiên tiến:

- **Chatbot AI tư vấn thông minh** với RAG (Retrieval-Augmented Generation) sử dụng LangChain + Groq LLM
- **Hệ thống gợi ý sản phẩm cá nhân hóa** dựa trên thuật toán KNN và Apriori
- **Nhận diện khuôn mặt** cho nhân viên sử dụng U-Net + FaceNet + YuNet
- **Quản lý bán hàng, kho, bảo hành, đổi trả** hoàn chỉnh
- **Thanh toán trực tuyến** tích hợp MoMo Payment Gateway

## 🎯 Mục Tiêu

1. **Tư vấn tự động 24/7:** Chatbot AI hỗ trợ khách hàng tìm kiếm và tư vấn sản phẩm phù hợp
2. **Gợi ý sản phẩm thông minh:** Tăng doanh số bằng hệ thống recommend cá nhân hóa
3. **Quản lý bán hàng hiệu quả:** POS tích hợp nhận diện khuôn mặt và xử lý đơn hàng nhanh chóng
4. **Tự động hóa quy trình:** Bảo hành, đổi trả, thanh toán được xử lý tự động

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│              HTML/CSS/JavaScript (Vanilla)                  │
│         Tailwind CSS • AI Chatbot UI • Admin Panel          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├──────────────────────────────────────┐
                  │                                      │
┌─────────────────▼─────────────┐  ┌──────────────────▼──────┐
│     BACKEND (Node.js)         │  │   RAG SERVICE (Python)   │
│  Express.js • REST API        │  │  FastAPI • LangChain     │
│  Session • Passport OAuth     │◄─┤  Groq LLM • ChromaDB    │
│  MySQL • MoMo Payment         │  │  Recommend Engine (KNN)  │
└─────────────────┬─────────────┘  └──────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼──────────┐  ┌─────▼──────────────────┐
│  FACE SERVICE    │  │   DATABASE (MySQL)     │
│  Flask • PyTorch │  │  Sản phẩm • Đơn hàng   │
│  U-Net • FaceNet │  │  Khách hàng • Bảo hành │
│  YuNet Detector  │  │  Vector Embeddings     │
└──────────────────┘  └────────────────────────┘
```

## 📦 Cấu Trúc Thư Mục

```
GDDA/
├── src/
│   ├── backend/              # Node.js Express API
│   │   ├── config/           # Database, Passport config
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Email, Cron jobs, Warranty
│   │   ├── migrations/       # SQL migrations
│   │   └── server.js         # Entry point
│   │
│   ├── frontend/             # Giao diện người dùng
│   │   ├── components/       # Header, Footer, Chatbot UI
│   │   ├── css/              # Styles
│   │   ├── js/               # Client-side logic
│   │   ├── images/           # Assets
│   │   ├── index.html        # Trang chủ
│   │   └── admin.html        # Quản trị
│   │
│   ├── rag_service/          # Python AI Service
│   │   ├── rag_engine.py     # RAG + Chatbot logic
│   │   ├── recommend_engine.py # KNN + Apriori
│   │   ├── main.py           # FastAPI server
│   │   └── chroma_db/        # Vector database
│   │
│   ├── face_service/         # Nhận diện khuôn mặt
│   │   ├── app.py            # Flask API
│   │   ├── model_unet.py     # U-Net segmentation
│   │   ├── register_face.py  # FaceNet + YuNet
│   │   ├── train_unet.py     # Training script
│   │   └── weights/          # Model weights
│   │
│   ├── init.sql              # Database schema
│   └── START_SERVER.bat      # Quick start script
│
└── .docs/                    # Tài liệu đồ án
```

## 🛠️ Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết

| Phần mềm | Phiên bản | Mục đích |
|----------|-----------|----------|
| **Node.js** | ≥ 16.x | Backend API server |
| **Python** | ≥ 3.9 | AI services (RAG, Face) |
| **MySQL** | ≥ 8.0 | Database |
| **Git** | Latest | Version control |

### Thư Viện Python

```txt
# RAG Service
fastapi>=0.104.1
uvicorn>=0.24.0
langchain>=0.1.0
langchain-google-genai>=2.0.0
chromadb>=0.4.15
sentence-transformers>=2.2.2
mysql-connector-python>=8.2.0

# Face Service  
torch>=2.0.0
torchvision>=0.15.0
facenet-pytorch>=2.5.2
opencv-python>=4.8.0
flask>=3.0.0
```

### Thư Viện Node.js

```json
{
  "express": "^4.18.2",
  "mysql2": "^3.6.5",
  "bcryptjs": "^3.0.3",
  "express-session": "^1.18.2",
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0",
  "nodemailer": "^8.0.7",
  "axios": "^1.16.1",
  "cors": "^2.8.5"
}
```

## 🚀 Hướng Dẫn Cài Đặt

### 1. Clone Repository

```bash
git clone https://github.com/quangvinhho/quangvinhho-cn-da22ttc-hoquangvinh-Quanghungmobile.git
cd quangvinhho-cn-da22ttc-hoquangvinh-Quanghungmobile/src
```

### 2. Cài Đặt Database

```bash
# Tạo database MySQL
mysql -u root -p < init.sql

# Hoặc import thủ công vào MySQL Workbench/phpMyAdmin
```

### 3. Cấu Hình Backend (Node.js)

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa .env
```

**Nội dung file `backend/.env`:**

```env
# Server
PORT=3000
NODE_ENV=development

# Database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=QHUNG

# Security
JWT_SECRET=your_jwt_secret_key_here

# MoMo Payment (production)
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key

# Groq AI
GROQ_API_KEY=your_groq_api_key

# OAuth Google (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email SMTP (optional)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Cấu Hình RAG Service (Python)

```bash
cd ../rag_service

# Tạo virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env (nếu cần)
cp ../.env .env
```

### 5. Cấu Hình Face Service (Python)

```bash
cd ../face_service

# Tạo virtual environment
python -m venv venv
venv\Scripts\activate

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env
cp .env.example .env
```

**Nội dung file `face_service/.env`:**

```env
# Database (giống backend)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=QHUNG

# Model
UNET_WEIGHTS=./weights/unet_face_best.pth
RECOGNIZE_THRESHOLD=0.60
FACE_SERVICE_PORT=5001
```

**Lưu ý:** Model weights cần được tải hoặc huấn luyện trước:

```bash
# Huấn luyện U-Net (nếu chưa có weights)
python train_unet.py

# Hoặc tải weights có sẵn vào thư mục weights/
```

## ▶️ Chạy Chương Trình

### Cách 1: Chạy Từng Service Riêng Lẻ

#### Terminal 1: Backend (Node.js)
```bash
cd src/backend
npm start
# Backend chạy tại: http://localhost:3000
```

#### Terminal 2: RAG Service (Python)
```bash
cd src/rag_service
venv\Scripts\activate
python main.py
# RAG Service chạy tại: http://localhost:8000
```

#### Terminal 3: Face Service (Python)
```bash
cd src/face_service
venv\Scripts\activate
python app.py
# Face Service chạy tại: http://localhost:5001
```

#### Truy Cập Ứng Dụng
- **Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin.html
- **API Docs:** http://localhost:8000/docs (RAG Service)

### Cách 2: Sử Dụng Script Tự Động (Windows)

```bash
cd src
START_SERVER.bat
```

**Lưu ý:** Script hiện chỉ khởi động Backend. Để chạy đầy đủ, cần chạy thêm RAG Service và Face Service bằng cách 1.

## 🔑 Tài Khoản Mặc Định

### Admin
- **Username:** `admin`
- **Password:** `admin123`

### Nhân viên
- **Username:** `nhanvien01`
- **Password:** `nhanvien123`

### Khách hàng
- Đăng ký mới tại: http://localhost:3000/register.html

## 📚 Tài Liệu API

### Backend API (Node.js)
- `POST /api/auth/login` - Đăng nhập
- `GET /api/products` - Danh sách sản phẩm
- `POST /api/cart/add` - Thêm vào giỏ hàng
- `POST /api/orders/create` - Tạo đơn hàng
- `POST /api/payment/momo` - Thanh toán MoMo

### RAG Service API (Python)
- `POST /api/chat` - Chatbot AI
- `POST /api/recommend` - Gợi ý sản phẩm
- `POST /api/reload-vectorstore` - Cập nhật knowledge base

### Face Service API (Python)
- `POST /recognize` - Nhận diện khuôn mặt
- `POST /register` - Đăng ký khuôn mặt mới
- `GET /embeddings` - Danh sách nhân viên đã đăng ký

Chi tiết: Xem `src/backend/README.md`

## 🔒 Bảo Mật

Hệ thống đã được gia cố bảo mật (audit 06/2026):
- ✅ Session cookie: `httpOnly`, `secure` (production), `sameSite: lax`
- ✅ CSRF protection: Origin/Referer check
- ✅ Rate limiting: Admin login (10 req/15min), API (300 req/15min)
- ✅ SQL Injection: Parameterized queries
- ✅ OAuth CSRF: State validation
- ✅ Race condition: SELECT FOR UPDATE (voucher, inventory)
- ✅ File upload: MIME validation, 5MB limit
- ✅ Secrets guard: Fail-fast trong production

## 🧪 Kiểm Thử

```bash
# Backend test
cd src/backend
npm test

# Test database connection
node test_keys.js

# Test face recognition
cd ../face_service
python test_python_db.py
```

## 📝 Ghi Chú Quan Trọng

1. **GROQ_API_KEY** là bắt buộc để Chatbot AI hoạt động. Đăng ký miễn phí tại: https://console.groq.com
2. **MoMo Payment** chỉ hoạt động với tài khoản doanh nghiệp đã được duyệt
3. **Face Recognition** yêu cầu GPU (CUDA) để huấn luyện, nhưng có thể chạy trên CPU khi inference
4. **ChromaDB** tự động tạo thư mục `chroma_db/` khi chạy RAG service lần đầu

## 🤝 Đóng Góp

Dự án được phát triển bởi:
- **Sinh viên:** Hồ Quang Vinh
- **MSSV:** 110122201
- **Trường:** Đại học Trà Vinh - Khoa Công Nghệ Thông Tin

## 📄 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.

---

**Liên hệ hỗ trợ:** 
- GitHub: https://github.com/quangvinhho
- Repository: https://github.com/quangvinhho/quangvinhho-cn-da22ttc-hoquangvinh-Quanghungmobile
