-- Users
CREATE TABLE IF NOT EXISTS sys_users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stores
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200),
    manager_name VARCHAR(50),
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    barcode VARCHAR(50),
    spec VARCHAR(50),
    unit VARCHAR(20) NOT NULL,
    tax_rate DECIMAL(5,2),
    price_base DECIMAL(10,2),
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    status VARCHAR(20) NOT NULL
);

-- Partners (Suppliers/Customers)
CREATE TABLE IF NOT EXISTS partners (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(50),
    phone VARCHAR(20),
    credit_level VARCHAR(10),
    payment_term_days INT,
    payment_method VARCHAR(20),
    outstanding_amount DECIMAL(12,2)
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    store_id VARCHAR(36) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    batch_no VARCHAR(50),
    expire_date DATE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Orders (Sales/Purchase)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL, -- SALES, PURCHASE
    partner_id VARCHAR(36),
    store_id VARCHAR(36),
    total_amount DECIMAL(12,2),
    status VARCHAR(20) NOT NULL,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
