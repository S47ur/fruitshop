-- =============================================
-- 水果店进销存管理系统 - MySQL 数据库脚本
-- 创建日期: 2025-12-14
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS fruitshop DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fruitshop;

-- =============================================
-- 1. 门店表
-- =============================================
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50),
    code VARCHAR(20),
    address VARCHAR(255),
    phone VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 2. 用户表
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_CASHIER',
    email VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户门店关联表
CREATE TABLE IF NOT EXISTS user_stores (
    username VARCHAR(50) NOT NULL,
    store_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 3. 商品表
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    barcode VARCHAR(50),
    spec VARCHAR(100),
    unit VARCHAR(20),
    description VARCHAR(500),
    tax_rate DECIMAL(10,4),
    price_base DECIMAL(10,2),
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'CNY',
    status VARCHAR(20) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品标签表
CREATE TABLE IF NOT EXISTS product_tags (
    product_id VARCHAR(50) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 4. 合作伙伴表 (供应商/客户)
-- =============================================
CREATE TABLE IF NOT EXISTS partners (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(100),
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    settlement_method VARCHAR(20),
    payment_term_days INT DEFAULT 30,
    status VARCHAR(20) DEFAULT 'active',
    outstanding_amount DECIMAL(12,2) DEFAULT 0,
    total_volume_kg DECIMAL(12,2) DEFAULT 0,
    preferred BOOLEAN DEFAULT FALSE,
    history_notes TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 5. 库存表
-- =============================================
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(50) PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50),
    fruit VARCHAR(100),
    on_hand_kg DECIMAL(12,2) DEFAULT 0,
    unit_cost DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    reorder_level_kg DECIMAL(12,2) DEFAULT 80,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 6. 采购订单表
-- =============================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id VARCHAR(50) PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL,
    supplier_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'PENDING',
    expected_date DATE,
    payment_term_days INT DEFAULT 7,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 采购订单行
CREATE TABLE IF NOT EXISTS purchase_order_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50),
    fruit VARCHAR(100),
    quantity_kg DECIMAL(12,2),
    unit_cost DECIMAL(10,2),
    batch_required BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 采购时间线事件
CREATE TABLE IF NOT EXISTS purchase_timeline_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id VARCHAR(50) NOT NULL,
    event_time VARCHAR(50),
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 7. 销售订单表
-- =============================================
CREATE TABLE IF NOT EXISTS sales_orders (
    id VARCHAR(50) PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL,
    date DATE,
    customer VARCHAR(100),
    customer_id VARCHAR(50),
    channel VARCHAR(50),
    fruit VARCHAR(100),
    quantity_kg DECIMAL(12,2),
    unit_price DECIMAL(10,2),
    payment_method VARCHAR(20),
    status VARCHAR(20) DEFAULT 'PENDING',
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 8. 库存调整表
-- =============================================
CREATE TABLE IF NOT EXISTS adjustments (
    id VARCHAR(50) PRIMARY KEY,
    inventory_id VARCHAR(50) NOT NULL,
    reason VARCHAR(255),
    delta_kg DECIMAL(12,2),
    created_by VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 9. 发票表
-- =============================================
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL,
    sales_order_id VARCHAR(50),
    due_date DATE,
    amount DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'PENDING',
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 10. 会员表
-- =============================================
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(20),
    balance DECIMAL(12,2) DEFAULT 0,
    points DECIMAL(12,2) DEFAULT 0,
    level INT DEFAULT 1,
    tier VARCHAR(50),
    total_spend DECIMAL(12,2) DEFAULT 0,
    join_date DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 11. 系统参数表
-- =============================================
CREATE TABLE IF NOT EXISTS system_parameters (
    param_key VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100),
    param_value VARCHAR(255),
    description VARCHAR(500)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 12. 角色权限矩阵表
-- =============================================
CREATE TABLE IF NOT EXISTS role_matrix (
    role VARCHAR(30) PRIMARY KEY,
    label VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 角色权限关联
CREATE TABLE IF NOT EXISTS role_permissions (
    role VARCHAR(30) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    FOREIGN KEY (role) REFERENCES role_matrix(role) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 角色数据域关联
CREATE TABLE IF NOT EXISTS role_data_domains (
    role VARCHAR(30) NOT NULL,
    data_domain VARCHAR(100) NOT NULL,
    FOREIGN KEY (role) REFERENCES role_matrix(role) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 13. 审批流程表
-- =============================================
CREATE TABLE IF NOT EXISTS approval_flows (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    document_type VARCHAR(50),
    trigger_condition VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    last_updated VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 审批步骤表
CREATE TABLE IF NOT EXISTS approval_steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    approval_flow_id VARCHAR(50),
    step_order INT,
    approver VARCHAR(30),
    role VARCHAR(50),
    threshold DECIMAL(12,2),
    FOREIGN KEY (approval_flow_id) REFERENCES approval_flows(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 14. 集成配置表
-- =============================================
CREATE TABLE IF NOT EXISTS integrations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(50),
    target VARCHAR(255),
    secret VARCHAR(255),
    connected BOOLEAN DEFAULT FALSE,
    last_sync DATETIME,
    status VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 15. 自动化任务表
-- =============================================
CREATE TABLE IF NOT EXISTS automations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(500),
    schedule VARCHAR(50),
    channel VARCHAR(20),
    enabled BOOLEAN DEFAULT FALSE,
    last_run VARCHAR(50),
    last_execution_count INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 16. 审计日志表
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    actor VARCHAR(100),
    action VARCHAR(255),
    entity VARCHAR(100),
    entity_id VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 17. 渠道配置表
-- =============================================
CREATE TABLE IF NOT EXISTS channel_configs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    enabled BOOLEAN DEFAULT TRUE,
    revenue_share DECIMAL(10,2),
    settlement_days INT DEFAULT 0,
    fee_rate DECIMAL(10,4),
    split_mode VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 18. 账龄分析表
-- =============================================
CREATE TABLE IF NOT EXISTS aging_buckets (
    id VARCHAR(50) PRIMARY KEY,
    bucket VARCHAR(50),
    label VARCHAR(50),
    min_days INT,
    max_days INT,
    amount DECIMAL(12,2),
    receivables DECIMAL(12,2),
    payables DECIMAL(12,2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 索引优化
-- =============================================
CREATE INDEX idx_inventory_store ON inventory(store_id);
CREATE INDEX idx_purchase_store ON purchase_orders(store_id);
CREATE INDEX idx_sales_store ON sales_orders(store_id);
CREATE INDEX idx_sales_date ON sales_orders(date);
CREATE INDEX idx_invoice_store ON invoices(store_id);
CREATE INDEX idx_member_phone ON members(phone);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
