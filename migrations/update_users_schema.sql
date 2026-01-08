-- 迁移脚本：更新 users 表结构以匹配新的 schema 定义
-- 执行时间：2026-01-06

-- 步骤1：添加 is_admin 字段（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false NOT NULL;
    END IF;
END $$;

-- 步骤2：更新 email 字段，允许为 NULL
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- 步骤3：更新 phone 字段，设置为 NOT NULL
-- 注意：由于现有数据都有 phone 值，这个操作是安全的
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;

-- 步骤4：添加 phone 字段的唯一约束
-- 首先检查是否已存在该约束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'users_phone_unique'
    ) THEN
        -- 检查是否有重复的 phone 值
        IF EXISTS (
            SELECT phone, COUNT(*) 
            FROM users 
            GROUP BY phone 
            HAVING COUNT(*) > 1
        ) THEN
            RAISE NOTICE '发现重复的 phone 值，请先处理重复数据';
        ELSE
            ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);
        END IF;
    END IF;
END $$;

-- 验证迁移结果
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 检查约束
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
ORDER BY conname;
