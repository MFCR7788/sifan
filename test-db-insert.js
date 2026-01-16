const { execSql } = require('coze-coding-dev-sdk');

(async () => {
  try {
    console.log('测试数据库插入...');
    
    // 创建 users 表（如果不存在）
    await execSql(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE,
        name VARCHAR(128) NOT NULL,
        password TEXT NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        avatar VARCHAR(500),
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE,
        is_admin BOOLEAN DEFAULT false NOT NULL
      );
    `);
    
    console.log('✅ 表创建/检查成功');
    
    // 插入管理员
    const result = await execSql(`
      INSERT INTO users (id, phone, email, name, password, is_admin, is_active)
      VALUES ('admin-id', '15967675767', 'admin@magic-superman.com', 'Admin', 
        '\$2b\$10\$abcdefghijklmnopqrstuvwxyz1234567890', true, true)
      ON CONFLICT (phone) DO NOTHING
      RETURNING id, phone, email, is_admin;
    `);
    
    console.log('插入结果:', result);
  } catch (error) {
    console.error('错误:', error.message);
  }
})();
