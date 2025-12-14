-- =============================================
-- 水果店进销存管理系统 - 初始数据
-- =============================================

-- 门店数据
INSERT INTO stores (id, name, city, code, address, phone) VALUES
('store-1', '旗舰店', '南京', 'NJ01', '南京市中心', '13800000001'),
('store-2', '分店A', '南京', 'NJ02', '南京江宁区', '13800000002'),
('store-3', '分店B', '南京', 'NJ03', '南京鼓楼区', '13800000003')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 用户数据
INSERT INTO users (username, password, name, role, email) VALUES
('admin', 'admin123', '管理员', 'ROLE_OWNER', 'admin@fruitshop.com'),
('manager', 'manager123', '店长张三', 'ROLE_MANAGER', 'manager@fruitshop.com'),
('cashier', 'cashier123', '收银员小李', 'ROLE_CASHIER', 'cashier@fruitshop.com'),
('fruitboss', '123456', '李掌柜', 'ROLE_OWNER', 'boss@fruiterp.cn')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 用户门店关联
INSERT INTO user_stores (username, store_id) VALUES
('admin', 'store-1'), ('admin', 'store-2'), ('admin', 'store-3'),
('manager', 'store-1'),
('cashier', 'store-1'),
('fruitboss', 'store-1'), ('fruitboss', 'store-2'), ('fruitboss', 'store-3');

-- 商品数据
INSERT INTO products (id, name, category, barcode, spec, unit, description, tax_rate, price_base, price_min, price_max, status) VALUES
('apple', '苹果', 'fruits', '6900001', '10kg/箱', 'kg', '进口红富士苹果', 0.09, 10.00, 8.00, 15.00, 'active'),
('banana', '香蕉', 'fruits', '6900002', '10kg/箱', 'kg', '海南香蕉', 0.09, 6.00, 4.00, 8.00, 'active'),
('orange', '橙子', 'fruits', '6900003', '10kg/箱', 'kg', '赣南脐橙', 0.09, 8.00, 6.00, 12.00, 'active'),
('grape', '葡萄', 'fruits', '6900004', '5kg/箱', 'kg', '新疆无籽葡萄', 0.09, 20.00, 15.00, 30.00, 'active'),
('watermelon', '西瓜', 'fruits', '6900005', '5kg/个', 'kg', '麒麟西瓜', 0.09, 5.00, 3.00, 8.00, 'active'),
('mango', '芒果', 'fruits', '6900006', '10kg/箱', 'kg', '海南芒果', 0.09, 25.00, 18.00, 35.00, 'active'),
('pear', '梨', 'fruits', '6900007', '10kg/箱', 'kg', '砀山梨', 0.09, 7.00, 5.00, 10.00, 'active'),
('peach', '桃子', 'fruits', '6900008', '5kg/箱', 'kg', '水蜜桃', 0.09, 13.00, 10.00, 18.00, 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 合作伙伴数据
INSERT INTO partners (id, type, name, contact, contact_name, phone, email, payment_term_days, status) VALUES
('sup-1', 'SUPPLIER', '华东水果批发', '李经理', '李经理', '13911111111', 'li@example.com', 30, 'active'),
('sup-2', 'SUPPLIER', '南方水果贸易', '王老板', '王老板', '13922222222', 'wang@example.com', 30, 'active'),
('cus-1', 'CUSTOMER', '大型超市A', '张采购', '张采购', '13933333333', 'zhang@example.com', 30, 'active'),
('cus-2', 'CUSTOMER', '连锁便利店B', '刘店长', '刘店长', '13944444444', 'liu@example.com', 30, 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 库存数据
INSERT INTO inventory (id, store_id, product_id, fruit, on_hand_kg, unit_cost, unit_price, reorder_level_kg) VALUES
('inv-store-1-apple', 'store-1', 'apple', '苹果', 150.00, 6.00, 10.00, 80.00),
('inv-store-1-banana', 'store-1', 'banana', '香蕉', 200.00, 3.50, 6.00, 100.00),
('inv-store-1-orange', 'store-1', 'orange', '橙子', 180.00, 5.00, 8.00, 80.00),
('inv-store-1-grape', 'store-1', 'grape', '葡萄', 100.00, 12.00, 20.00, 50.00),
('inv-store-1-watermelon', 'store-1', 'watermelon', '西瓜', 300.00, 2.50, 5.00, 150.00),
('inv-store-1-mango', 'store-1', 'mango', '芒果', 80.00, 15.00, 25.00, 40.00),
('inv-store-1-pear', 'store-1', 'pear', '梨', 120.00, 4.00, 7.00, 60.00),
('inv-store-1-peach', 'store-1', 'peach', '桃子', 90.00, 8.00, 13.00, 50.00)
ON DUPLICATE KEY UPDATE on_hand_kg=VALUES(on_hand_kg);

-- 会员数据
INSERT INTO members (id, name, phone, balance, points, level, tier, total_spend, join_date) VALUES
('member-1', '王先生', '13866666666', 500.00, 1500.00, 2, '银牌会员', 5000.00, '2024-06-01'),
('member-2', '李女士', '13877777777', 1000.00, 2300.00, 3, '金牌会员', 15000.00, '2024-03-15'),
('member-3', '张老板', '13888888888', 2000.00, 5600.00, 3, '金牌会员', 25000.00, '2024-01-10'),
('member-4', '赵六', '13800000004', 0.00, 100.00, 1, '铜牌会员', 500.00, '2024-09-20')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 系统参数
INSERT INTO system_parameters (param_key, label, param_value, description) VALUES
('TAX_RATE', '税率', '0.06', '默认税率6%'),
('POINTS_RATE', '积分比例', '0.01', '消费1元积1分'),
('LOW_STOCK_ALERT', '低库存预警', '50', '库存低于此值预警'),
('DEFAULT_PAYMENT_TERM', '默认账期', '30', '默认账期天数')
ON DUPLICATE KEY UPDATE param_value=VALUES(param_value);

-- 角色权限矩阵
INSERT INTO role_matrix (role, label) VALUES
('ROLE_OWNER', '店主'),
('ROLE_MANAGER', '店长'),
('ROLE_CASHIER', '收银员'),
('ROLE_AUDITOR', '审计员')
ON DUPLICATE KEY UPDATE label=VALUES(label);

-- 角色权限
INSERT INTO role_permissions (role, permission) VALUES
('ROLE_OWNER', 'dashboard'), ('ROLE_OWNER', 'procurement'), ('ROLE_OWNER', 'sales'),
('ROLE_OWNER', 'inventory'), ('ROLE_OWNER', 'finance'), ('ROLE_OWNER', 'master'), ('ROLE_OWNER', 'system'),
('ROLE_MANAGER', 'dashboard'), ('ROLE_MANAGER', 'procurement'), ('ROLE_MANAGER', 'sales'),
('ROLE_MANAGER', 'inventory'), ('ROLE_MANAGER', 'finance'),
('ROLE_CASHIER', 'dashboard'), ('ROLE_CASHIER', 'sales'),
('ROLE_AUDITOR', 'dashboard'), ('ROLE_AUDITOR', 'finance');

-- 渠道配置
INSERT INTO channel_configs (id, name, enabled, revenue_share, settlement_days, fee_rate, split_mode) VALUES
('channel-pos', '门店POS', true, 45.50, 0, 0.00, 'GROSS'),
('channel-online', '线上商城', true, 32.80, 3, 0.02, 'NET'),
('channel-wholesale', '批发渠道', true, 21.70, 7, 0.01, 'GROSS')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 账龄分析
INSERT INTO aging_buckets (id, bucket, label, min_days, max_days, amount, receivables, payables) VALUES
('aging-current', '0-30天', '当期', 0, 30, 125000.00, 125000.00, 80000.00),
('aging-30', '31-60天', '31-60天', 31, 60, 45000.00, 45000.00, 20000.00),
('aging-60', '61-90天', '61-90天', 61, 90, 18000.00, 12000.00, 5000.00),
('aging-90', '90天+', '90天以上', 91, 999, 7500.00, 5000.00, 0.00)
ON DUPLICATE KEY UPDATE label=VALUES(label);

-- 审计日志
INSERT INTO audit_logs (id, actor, action, entity, timestamp, ip) VALUES
('log-1', 'admin', '系统初始化', 'System', NOW(), '127.0.0.1')
ON DUPLICATE KEY UPDATE action=VALUES(action);
