-- Xóa database cũ nếu tồn tại
USE master;
GO

IF EXISTS(SELECT name FROM sys.databases WHERE name = 'bookstore')
BEGIN
    ALTER DATABASE bookstore SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE bookstore;
END
GO

-- Tạo database mới với collation Vietnamese
CREATE DATABASE bookstore COLLATE Vietnamese_CI_AS;
GO

USE bookstore;
GO

-- Bảng categories với NVARCHAR cho tiếng Việt
CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    image_url NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng users
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) CHECK (role IN ('customer', 'admin')) DEFAULT 'customer',
    address NVARCHAR(MAX),
    phone NVARCHAR(20),
    avatar_url NVARCHAR(500),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng books với NVARCHAR cho tiếng Việt
CREATE TABLE books (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    author NVARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10, 2) CHECK (original_price >= 0),
    category_id INT,
    description NVARCHAR(MAX),
    image_url NVARCHAR(500),
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    isbn NVARCHAR(20),
    publisher NVARCHAR(100),
    published_date DATE,
    pages INT,
    language NVARCHAR(50) DEFAULT N'Tiếng Việt',
    weight_kg DECIMAL(5,2),
    dimensions NVARCHAR(50),
    is_featured BIT DEFAULT 0,
    is_bestseller BIT DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
    rating_count INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
GO

-- Bảng orders
CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    order_number NVARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status NVARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
    shipping_address NVARCHAR(MAX) NOT NULL,
    shipping_fee DECIMAL(10, 2) DEFAULT 0,
    payment_method NVARCHAR(20) CHECK (payment_method IN ('cod', 'credit_card', 'paypal', 'bank_transfer')) DEFAULT 'cod',
    payment_status NVARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    customer_note NVARCHAR(MAX),
    admin_note NVARCHAR(MAX),
    estimated_delivery DATE,
    delivered_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

-- Bảng order_items
CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
GO

-- Bảng reviews
CREATE TABLE reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title NVARCHAR(200),
    comment NVARCHAR(MAX),
    is_approved BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE (user_id, book_id)
);
GO

-- Bảng wishlist
CREATE TABLE wishlists (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE (user_id, book_id)
);
GO

-- Bảng cart (giỏ hàng tạm thời)
CREATE TABLE carts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE (user_id, book_id)
);
GO

-- Tạo indexes để tối ưu hiệu năng
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_price ON books(price);
CREATE INDEX idx_books_created ON books(created_at);
CREATE INDEX idx_books_featured ON books(is_featured) WHERE is_featured = 1;
CREATE INDEX idx_books_bestseller ON books(is_bestseller) WHERE is_bestseller = 1;

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_book ON order_items(book_id);

CREATE INDEX idx_reviews_book ON reviews(book_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);

CREATE INDEX idx_carts_user ON carts(user_id);
GO

PRINT '✅ Database schema created successfully!';

-- Bảng liên hệ
CREATE TABLE contacts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20),
    subject NVARCHAR(200) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'resolved')),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Bảng hỗ trợ
CREATE TABLE support_tickets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    order_number NVARCHAR(50),
    issue_type NVARCHAR(50) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority NVARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    admin_note NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng ứng tuyển
CREATE TABLE job_applications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    position NVARCHAR(100) NOT NULL,
    experience NVARCHAR(20),
    cv_url NVARCHAR(500),
    cover_letter NVARCHAR(MAX),
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interview', 'rejected', 'accepted')),
    created_at DATETIME2 DEFAULT GETDATE()
);
