## 🛠️ Cài đặt & Biến môi trường (Environment Variables)

Để chạy được dự án này, bạn cần cấu hình các biến môi trường.

**Bước 1:** Tạo file `.env` tại thư mục gốc của dự án (ngang hàng với `package.json`).

**Bước 2:** Copy nội dung từ file mẫu `.env.example` sang file `.env`:

\`\`\`bash
cp .env.example .env
\`\`\`

**Bước 3:** Điền các giá trị thực tế của bạn vào file `.env` vừa tạo:

- Các thông tin Firebase (`VITE_FIREBASE_...`) lấy từ Firebase Console.

## 🚀 Chạy dự án

Cài đặt các thư viện:

\`\`\`bash
npm install
\`\`\`

Chạy môi trường development:

\`\`\`bash
npm run dev
\`\`\`
