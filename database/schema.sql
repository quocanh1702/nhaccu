-- ===================================================
-- DLQ Music Store - Database Schema
-- Version: 1.0.0
-- ===================================================

-- Drop tables if exist (for re-creation)
DROP TABLE IF EXISTS repair_requests;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS wishlists;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ===== USERS =====
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed',
    avatar      VARCHAR(255) DEFAULT NULL,
    phone       VARCHAR(20) DEFAULT NULL,
    address     TEXT DEFAULT NULL,
    level       ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    points      INT DEFAULT 0 COMMENT 'Learning achievement points',
    role        ENUM('user', 'admin', 'staff') DEFAULT 'user',
    is_verified TINYINT(1) DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login  TIMESTAMP DEFAULT NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- ===== CATEGORIES =====
CREATE TABLE categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    slug        VARCHAR(50) NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(10) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    parent_id   INT DEFAULT NULL REFERENCES categories(id),
    sort_order  INT DEFAULT 0,
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== PRODUCTS =====
CREATE TABLE products (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    slug          VARCHAR(200) NOT NULL UNIQUE,
    category_id   INT NOT NULL REFERENCES categories(id),
    brand         VARCHAR(100) DEFAULT NULL,
    price         DECIMAL(15, 0) NOT NULL,
    old_price     DECIMAL(15, 0) DEFAULT NULL,
    stock_qty     INT DEFAULT 0,
    image         VARCHAR(255) DEFAULT NULL,
    images        JSON DEFAULT NULL COMMENT 'Array of image URLs',
    description   TEXT DEFAULT NULL,
    material      VARCHAR(200) DEFAULT NULL,
    origin        VARCHAR(100) DEFAULT NULL,
    specs         JSON DEFAULT NULL COMMENT 'Technical specifications',
    suited_for    SET('Beginner', 'Intermediate', 'Advanced') DEFAULT NULL,
    mood_tags     SET('chill', 'sad', 'energetic') DEFAULT NULL,
    badge         ENUM('hot', 'new', 'sale', 'best') DEFAULT NULL,
    is_featured   TINYINT(1) DEFAULT 0,
    is_active     TINYINT(1) DEFAULT 1,
    view_count    INT DEFAULT 0,
    sold_count    INT DEFAULT 0,
    avg_rating    DECIMAL(3, 2) DEFAULT 0.00,
    review_count  INT DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category_id),
    INDEX idx_price (price),
    INDEX idx_featured (is_featured),
    INDEX idx_rating (avg_rating),
    FULLTEXT INDEX ft_search (name, description)
);

-- ===== ORDERS =====
CREATE TABLE orders (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    order_code      VARCHAR(20) NOT NULL UNIQUE COMMENT 'Format: DLQ + timestamp',
    user_id         INT DEFAULT NULL REFERENCES users(id),
    customer_name   VARCHAR(100) NOT NULL,
    customer_email  VARCHAR(150) DEFAULT NULL,
    customer_phone  VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city   VARCHAR(100) NOT NULL,
    subtotal        DECIMAL(15, 0) NOT NULL,
    shipping_fee    DECIMAL(15, 0) DEFAULT 0,
    discount_amount DECIMAL(15, 0) DEFAULT 0,
    total           DECIMAL(15, 0) NOT NULL,
    coupon_code     VARCHAR(50) DEFAULT NULL,
    payment_method  ENUM('cod', 'bank_transfer', 'momo', 'zalopay', 'vnpay') DEFAULT 'cod',
    payment_status  ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    order_status    ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'returned') DEFAULT 'pending',
    note            TEXT DEFAULT NULL,
    confirmed_at    TIMESTAMP DEFAULT NULL,
    shipped_at      TIMESTAMP DEFAULT NULL,
    delivered_at    TIMESTAMP DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_status (order_status),
    INDEX idx_created (created_at)
);

-- ===== ORDER ITEMS =====
CREATE TABLE order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id),
    product_name VARCHAR(200) NOT NULL COMMENT 'Snapshot at order time',
    price       DECIMAL(15, 0) NOT NULL COMMENT 'Price at order time',
    quantity    INT NOT NULL DEFAULT 1,
    subtotal    DECIMAL(15, 0) NOT NULL,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- ===== REVIEWS =====
CREATE TABLE reviews (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id),
    product_id  INT NOT NULL REFERENCES products(id),
    order_id    INT DEFAULT NULL REFERENCES orders(id),
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title       VARCHAR(200) DEFAULT NULL,
    comment     TEXT DEFAULT NULL,
    images      JSON DEFAULT NULL,
    helpful_count INT DEFAULT 0,
    is_verified TINYINT(1) DEFAULT 0 COMMENT 'Verified purchase',
    is_approved TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_product (user_id, product_id),
    INDEX idx_product (product_id),
    INDEX idx_rating (rating)
);

-- ===== LESSONS =====
CREATE TABLE lessons (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    slug        VARCHAR(200) NOT NULL UNIQUE,
    level       ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    category    ENUM('guitar', 'piano', 'drum', 'ukulele', 'violin', 'theory', 'general') DEFAULT 'general',
    description TEXT DEFAULT NULL,
    content     LONGTEXT DEFAULT NULL,
    video_url   VARCHAR(255) DEFAULT NULL,
    thumbnail   VARCHAR(255) DEFAULT NULL,
    duration    INT DEFAULT NULL COMMENT 'Duration in minutes',
    exercises   JSON DEFAULT NULL COMMENT 'Array of exercise descriptions',
    tags        JSON DEFAULT NULL,
    sort_order  INT DEFAULT 0,
    is_free     TINYINT(1) DEFAULT 1,
    price       DECIMAL(15, 0) DEFAULT 0 COMMENT 'For premium lessons',
    view_count  INT DEFAULT 0,
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_category (category),
    FULLTEXT INDEX ft_title (title, description)
);

-- ===== LESSON PROGRESS =====
CREATE TABLE lesson_progress (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id),
    lesson_id   INT NOT NULL REFERENCES lessons(id),
    status      ENUM('started', 'in_progress', 'completed') DEFAULT 'started',
    progress_pct TINYINT DEFAULT 0,
    score       INT DEFAULT NULL,
    completed_at TIMESTAMP DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_lesson (user_id, lesson_id)
);

-- ===== COMMUNITY POSTS =====
CREATE TABLE posts (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id),
    content     TEXT NOT NULL,
    images      JSON DEFAULT NULL COMMENT 'Array of image URLs',
    videos      JSON DEFAULT NULL,
    tags        JSON DEFAULT NULL,
    like_count  INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    view_count  INT DEFAULT 0,
    is_pinned   TINYINT(1) DEFAULT 0,
    is_approved TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at),
    FULLTEXT INDEX ft_content (content)
);

-- ===== POST COMMENTS =====
CREATE TABLE post_comments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    post_id     INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id     INT NOT NULL REFERENCES users(id),
    parent_id   INT DEFAULT NULL REFERENCES post_comments(id),
    content     TEXT NOT NULL,
    like_count  INT DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_post (post_id),
    INDEX idx_user (user_id)
);

-- ===== POST LIKES =====
CREATE TABLE post_likes (
    user_id    INT NOT NULL REFERENCES users(id),
    post_id    INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

-- ===== WISHLISTS =====
CREATE TABLE wishlists (
    user_id    INT NOT NULL REFERENCES users(id),
    product_id INT NOT NULL REFERENCES products(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id)
);

-- ===== REPAIR REQUESTS =====
CREATE TABLE repair_requests (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    request_code    VARCHAR(20) NOT NULL UNIQUE COMMENT 'Format: RPR + timestamp',
    user_id         INT DEFAULT NULL REFERENCES users(id),
    customer_name   VARCHAR(100) NOT NULL,
    customer_phone  VARCHAR(20) NOT NULL,
    customer_email  VARCHAR(150) DEFAULT NULL,
    instrument_type ENUM('guitar', 'piano', 'drum', 'ukulele', 'violin', 'bass', 'other') NOT NULL,
    instrument_name VARCHAR(200) DEFAULT NULL,
    issue_desc      TEXT NOT NULL COMMENT 'Description of the problem',
    images          JSON DEFAULT NULL COMMENT 'Customer-uploaded photos',
    service_id      INT DEFAULT NULL REFERENCES repair_services(id),
    estimated_cost  DECIMAL(15, 0) DEFAULT NULL,
    actual_cost     DECIMAL(15, 0) DEFAULT NULL,
    status          ENUM('pending', 'confirmed', 'diagnosing', 'repairing', 'testing', 'completed', 'cancelled') DEFAULT 'pending',
    status_notes    TEXT DEFAULT NULL COMMENT 'Staff notes on progress',
    scheduled_date  DATE DEFAULT NULL,
    pickup_method   ENUM('drop_off', 'pickup_service') DEFAULT 'drop_off',
    completed_at    TIMESTAMP DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_scheduled (scheduled_date)
);

-- ===== REPAIR SERVICES =====
CREATE TABLE repair_services (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    description     TEXT DEFAULT NULL,
    base_price      DECIMAL(15, 0) NOT NULL,
    instruments     JSON DEFAULT NULL COMMENT 'Array of applicable instrument types',
    estimated_time  VARCHAR(50) DEFAULT NULL COMMENT 'e.g., "1-2 giờ", "2-3 ngày"',
    is_active       TINYINT(1) DEFAULT 1,
    sort_order      INT DEFAULT 0
);

-- ===== COUPONS =====
CREATE TABLE coupons (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(50) NOT NULL UNIQUE,
    type            ENUM('percent', 'fixed') NOT NULL,
    value           DECIMAL(10, 2) NOT NULL COMMENT 'Percent value or fixed amount',
    min_order       DECIMAL(15, 0) DEFAULT 0,
    max_discount    DECIMAL(15, 0) DEFAULT NULL,
    usage_limit     INT DEFAULT NULL,
    used_count      INT DEFAULT 0,
    user_limit      INT DEFAULT 1 COMMENT 'Times per user',
    start_date      DATE DEFAULT NULL,
    end_date        DATE DEFAULT NULL,
    is_active       TINYINT(1) DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
);

-- ===== USER ACTIVITY LOG (for AI recommendations) =====
CREATE TABLE user_activity (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT DEFAULT NULL REFERENCES users(id),
    session_id  VARCHAR(100) DEFAULT NULL,
    action      ENUM('view', 'search', 'add_cart', 'purchase', 'wishlist', 'review') NOT NULL,
    product_id  INT DEFAULT NULL REFERENCES products(id),
    extra_data  JSON DEFAULT NULL COMMENT 'Additional context (search query, etc.)',
    ip_address  VARCHAR(45) DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_product (product_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

-- ===== NOTIFICATIONS =====
CREATE TABLE notifications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id),
    type        VARCHAR(50) NOT NULL COMMENT 'order_status, new_lesson, community, etc.',
    title       VARCHAR(200) NOT NULL,
    message     TEXT DEFAULT NULL,
    link        VARCHAR(255) DEFAULT NULL,
    is_read     TINYINT(1) DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_unread (user_id, is_read)
);

-- ===================================================
-- SAMPLE DATA
-- ===================================================

-- Categories
INSERT INTO categories (slug, name, icon, sort_order) VALUES
('guitar', 'Guitar', '🎸', 1),
('piano', 'Piano & Keyboard', '🎹', 2),
('drum', 'Trống & Bộ gõ', '🥁', 3),
('ukulele', 'Ukulele', '🪗', 4),
('violin', 'Violin & Cello', '🎻', 5),
('wind', 'Nhạc cụ hơi', '🎺', 6),
('accessories', 'Phụ kiện', '🎵', 7);

-- Repair Services
INSERT INTO repair_services (name, base_price, estimated_time, instruments) VALUES
('Thay dây đàn', 50000, '30 phút', '["guitar","bass","ukulele"]'),
('Lên dây, cân chỉnh action', 150000, '1-2 giờ', '["guitar","bass"]'),
('Bảo dưỡng tổng thể guitar', 300000, '2-3 giờ', '["guitar"]'),
('Sửa phím bấm (refretting)', 500000, '1-2 ngày', '["guitar","bass"]'),
('Bảo dưỡng piano điện', 400000, '2-3 giờ', '["piano"]'),
('Lên dây violin', 80000, '30 phút', '["violin"]');

-- Coupons
INSERT INTO coupons (code, type, value, min_order, max_discount) VALUES
('DLQ10', 'percent', 10, 500000, 500000),
('NEWUSER', 'fixed', 50000, 200000, 50000),
('FREESHIP', 'fixed', 50000, 300000, 50000);
