# 🎵 DLQ Music Store

> Nền tảng âm nhạc toàn diện – Nhạc cụ chính hãng, học nhạc trực tuyến, cộng đồng âm nhạc sôi động.

## 📋 Giới thiệu

**DLQ Music Store** là website bán nhạc cụ đầy đủ tính năng được xây dựng bằng HTML/CSS/JavaScript thuần (Vanilla JS). Không cần framework, không cần backend – chạy trực tiếp trên trình duyệt.

## 🗂️ Cấu trúc thư mục

```
nhaccu/
├── index.html                  # Trang chủ + Music Mood System
├── pages/
│   ├── product-detail.html     # Chi tiết sản phẩm (zoom ảnh, audio demo, so sánh)
│   ├── interactive-play.html   # Piano/Guitar/Drum ảo (bấm phím → phát âm)
│   ├── learning.html           # Học nhạc (Beginner/Intermediate/Advanced)
│   ├── community.html          # Cộng đồng (posts, rankings, comments)
│   ├── repair-service.html     # Đặt lịch sửa, tracking tiến độ, báo giá
│   ├── blog.html               # Blog (danh sách bài viết, filter theo danh mục)
│   ├── blog-detail.html        # Chi tiết bài viết blog (TOC, comments, related)
│   ├── profile.html            # Trang cá nhân (đơn hàng, wishlist, thành tích)
│   ├── cart.html               # Giỏ hàng
│   ├── checkout.html           # Thanh toán
│   └── search-results.html     # Kết quả tìm kiếm + bộ lọc
├── css/
│   ├── variables.css           # CSS variables (màu sắc, font, spacing)
│   ├── style.css               # Main styles (navbar, footer, components)
│   ├── product.css             # Styles trang sản phẩm
│   ├── interactive.css         # Styles piano/guitar/drum ảo
│   ├── community.css           # Styles trang cộng đồng
│   ├── animations.css          # Animations, scroll effects, mood colors
│   └── responsive.css          # Mobile-first responsive design
├── js/
│   ├── main.js                 # App logic chính (navbar, cart badge, events)
│   ├── product.js              # Logic trang sản phẩm
│   ├── interactive-instruments.js  # Piano (88 keys), Guitar (6 strings), Drum
│   ├── community.js            # Posts, rankings, comments
│   ├── ai-recommend.js         # AI gợi ý sản phẩm thông minh
│   ├── audio-player.js         # Audio demo nhạc cụ
│   ├── mood-system.js          # Music Mood System (Chill/Sad/Energetic)
│   ├── chatbot.js              # Chatbot tư vấn chọn đàn
│   ├── animations.js           # UI effects, floating notes, scroll animations
│   ├── cart.js                 # Giỏ hàng logic
│   └── storage.js              # localStorage management
├── assets/
│   ├── images/
│   │   ├── products/           # Ảnh sản phẩm (đặt file jpg/png vào đây)
│   │   ├── icons/              # Icons
│   │   └── backgrounds/        # Ảnh nền
│   ├── audio/
│   │   ├── instruments/        # Sample âm thanh nhạc cụ (piano, guitar...)
│   │   ├── background-music/   # Nhạc nền cho mood system
│   │   └── sfx/                # Hiệu ứng âm thanh
│   └── data.json               # Sample data (sản phẩm, bài học, blog posts)
├── database/
│   └── schema.sql              # Database schema SQL (7 bảng)
└── README.md
```

## ✨ Tính năng chính

### 1. 🏠 Homepage
- **Music Mood System**: Chọn Chill 😌 / Sad 😢 / Energetic 🔥 → đổi màu sắc, nhạc nền, gợi ý sản phẩm
- Featured products với filter theo mood
- Hero banner với CTA
- Quick links đến các trang chính

### 2. 🛍️ Trang sản phẩm
- Ảnh gallery với zoom (click để phóng to)
- Audio demo (click phát sample âm thanh)
- So sánh sản phẩm cùng loại
- Thông tin kỹ thuật chi tiết
- Đánh giá từ người dùng
- Gợi ý sản phẩm liên quan

### 3. 🎹 Interactive Play (Điểm khác biệt)
- **Piano ảo 88 phím**: Bấm phím hoặc dùng bàn phím máy tính → phát âm đúng pitch
- **Guitar ảo 6 dây**: Click dây → rung âm
- **Trống ảo**: Click ra beat
- Ghi âm + playback

### 4. 📚 Learning Hub
- 3 cấp độ: Beginner / Intermediate / Advanced
- Video tutorials, bài tập luyện
- Tracking progress cá nhân

### 5. 👥 Community
- Đăng bài cover nhạc, khoe nhạc cụ
- Comment, Like, Follow
- Bảng xếp hạng "Người chơi hay nhất tuần"

### 6. 🔧 Repair Service
- Đặt lịch sửa online (form 3 bước)
- Theo dõi tiến độ real-time với timeline
- Báo giá tự động theo loại dịch vụ

### 7. ✍️ Blog
- Bài viết về chọn nhạc cụ, tips luyện tập, review
- Filter theo danh mục
- SEO-friendly content

### 8. 👤 User Profile
- Lịch sử mua hàng
- Wishlist (yêu thích)
- Nhạc cụ đã sở hữu
- Thành tích học nhạc + huy hiệu
- Cài đặt tài khoản

### 9. 🤖 AI & Smart Features
- AI gợi ý sản phẩm theo hành vi xem
- Smart filter (giá, loại, mức độ chơi, xuất xứ)
- Chatbot tư vấn chọn đàn

### 10. 🎨 UI/UX
- Floating music notes khi scroll
- Background đổi màu theo mood
- Hover sounds (nhẹ nhàng)
- Loading animation
- Responsive cho mobile/tablet/desktop

## 🚀 Cách chạy

### Mở trực tiếp
```bash
# Chỉ cần mở file index.html trong trình duyệt
open index.html
```

### Dùng local server (khuyến nghị)
```bash
# Python
python -m http.server 8080

# Node.js
npx serve .

# VS Code: cài Live Server extension, click "Go Live"
```

Sau đó truy cập: `http://localhost:8080`

## 🎵 Thêm audio samples

Để piano/guitar ảo phát âm thanh thực sự, thêm file audio vào:
```
assets/audio/instruments/
├── piano/
│   ├── C4.mp3
│   ├── D4.mp3
│   └── ... (các nốt piano)
├── guitar/
│   ├── string1.mp3
│   └── ... (6 dây guitar)
└── drum/
    ├── kick.mp3
    ├── snare.mp3
    └── ...
```

> **Lưu ý**: Web Audio API sẽ tự tổng hợp âm thanh nếu không có file mp3 (dùng oscillator).

## 📸 Thêm ảnh sản phẩm

Đặt ảnh sản phẩm vào `assets/images/products/` với tên file khớp trong `assets/data.json`.

## 🗄️ Database Schema

Xem file `database/schema.sql` để tham khảo cấu trúc database cho backend:
- **USERS** – Tài khoản người dùng
- **PRODUCTS** – Sản phẩm nhạc cụ
- **ORDERS** – Đơn hàng
- **REVIEWS** – Đánh giá sản phẩm
- **LESSONS** – Bài học
- **POSTS** – Bài đăng cộng đồng
- **REPAIR_REQUEST** – Yêu cầu sửa chữa

## 🛠️ Tech Stack

- **HTML5** – Semantic markup, accessibility (ARIA)
- **CSS3** – Custom properties, Grid, Flexbox, animations
- **JavaScript (Vanilla)** – Web Audio API, localStorage, DOM manipulation
- **Web Audio API** – Tổng hợp âm thanh nhạc cụ

## 📱 Responsive

- ✅ Mobile (< 480px)
- ✅ Tablet (480px – 768px)
- ✅ Desktop (> 768px)

## 📄 License

© 2026 DLQ Music Store. All rights reserved.
