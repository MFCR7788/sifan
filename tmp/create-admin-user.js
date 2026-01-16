const { getDb } = require('coze-coding-dev-sdk');
const bcrypt = require('bcrypt');
const { users } = require('./src/storage/database/shared/schema');
const { eq } = require('drizzle-orm');

async function createAdmin() {
  try {
    console.log('开始连接数据库...');
    const db = await getDb();
    console.log('✅ 数据库连接成功！');

    // 检查管理员是否已存在
    const existingAdmins = await db.select().from(users).where(eq(users.phone, '15967675767'));
    
    if (existingAdmins.length > 0) {
      const existingAdmin = existingAdmins[0];
      console.log('✅ 管理员账户已存在');
      console.log('ID:', existingAdmin.id);
      console.log('手机号:', existingAdmin.phone);
      console.log('邮箱:', existingAdmin.email);
      console.log('是否管理员:', existingAdmin.isAdmin);
      return;
    }

    // 创建管理员
    const hashedPassword = await bcrypt.hash('Qf229888777', 10);
    const [admin] = await db.insert(users).values({
      id: 'admin-id',
      phone: '15967675767',
      email: 'admin@magic-superman.com',
      name: 'Admin',
      password: hashedPassword,
      isAdmin: true,
      isActive: true,
    }).returning();

    console.log('✅ 管理员账户创建成功！');
    console.log('ID:', admin.id);
    console.log('手机号:', admin.phone);
    console.log('邮箱:', admin.email);
    console.log('是否管理员:', admin.isAdmin);
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
}

createAdmin();
