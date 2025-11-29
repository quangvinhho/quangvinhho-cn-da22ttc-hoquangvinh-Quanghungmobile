# Backend API

## Cấu trúc thư mục
```
backend/
├── config/         # Cấu hình database, env
├── controllers/    # Xử lý logic nghiệp vụ
├── models/         # Định nghĩa schema/model CSDL
├── routes/         # Định nghĩa API endpoints
├── middleware/     # Auth, validation, etc.
├── utils/          # Helper functions
├── server.js       # Entry point
└── package.json
```

## Cài đặt
```bash
cd backend
npm install
```

## Chạy server
```bash
npm start
# hoặc
npm run dev
```

## Kết nối Frontend
Frontend sẽ gọi API từ backend thông qua fetch/axios.
Ví dụ: `fetch('http://localhost:3000/api/products')`
