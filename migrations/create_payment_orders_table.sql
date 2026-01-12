-- 迁移脚本：创建 payment_orders 表
-- 执行时间：2026-01-12

-- 创建支付订单表
CREATE TABLE IF NOT EXISTS payment_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(64) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    member_id VARCHAR(36),
    order_type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    trade_no VARCHAR(128),
    transaction_id VARCHAR(128),
    qr_code_url VARCHAR(500),
    description VARCHAR(255),
    metadata JSONB,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS payment_orders_order_no_idx ON payment_orders (order_no);
CREATE INDEX IF NOT EXISTS payment_orders_user_id_idx ON payment_orders (user_id);
CREATE INDEX IF NOT EXISTS payment_orders_status_idx ON payment_orders (status);

-- 创建外键约束
ALTER TABLE payment_orders
    ADD CONSTRAINT payment_orders_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE payment_orders
    ADD CONSTRAINT payment_orders_member_id_members_id_fk
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL;

-- 验证表创建
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payment_orders' 
ORDER BY ordinal_position;

-- 检查约束
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'payment_orders'::regclass
ORDER BY conname;
