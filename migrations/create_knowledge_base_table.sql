-- 迁移脚本：创建 knowledge_base 表
-- 执行时间：2026-01-17

-- 创建知识库表
CREATE TABLE IF NOT EXISTS knowledge_base (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT,
    priority INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    view_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(36)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS knowledge_base_category_idx ON knowledge_base (category);
CREATE INDEX IF NOT EXISTS knowledge_base_is_active_idx ON knowledge_base (is_active);

-- 创建外键约束
ALTER TABLE knowledge_base
    ADD CONSTRAINT knowledge_base_created_by_users_id_fk
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- 验证表创建
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'knowledge_base'
ORDER BY ordinal_position;

-- 检查约束
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'knowledge_base'::regclass
ORDER BY conname;
