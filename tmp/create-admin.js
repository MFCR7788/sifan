const { getDb } = require('coze-coding-dev-sdk');
const { users, members } = require('./src/storage/database/shared/schema');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const db = await getDb();

    // 检查是否已存在管理员
    const [existingAdmin] = await db.select().from(users).where(users.is_admin.eq(true));
    if (existingAdmin) {
      console.log('管理员用户已存在:', existingAdmin.name);
      process.exit(0);
    }

    // 创建管理员用户
    const hash = await bcrypt.hash('admin123', 10);
    const [adminUser] = await db.insert(users).values({
      id: '29a9c7d1-8a5d-4d8f-9e2b-7f3c5e1a8d9f',
      email: 'admin@magicman.com',
      name: '系统管理员',
      password: hash,
      phone: '13800138000',
      isActive: true,
      isAdmin: true
    }).returning();

    console.log('✅ 管理员用户创建成功:', adminUser.name);

    // 创建会员账户
    const [member] = await db.insert(members).values({
      id: 'f5ca1276-e3b4-4a8f-9c2d-a7f1e3b4c8d9',
      userId: adminUser.id,
      memberLevel: 'platinum',
      balance: 100000,
      points: 10000,
      totalRecharge: 0,
      totalConsumption: 0,
      memberStatus: 'active'
    }).returning();

    console.log('✅ 会员账户创建成功:', member.id);

    console.log('\n登录信息:');
    console.log('手机号: 13800138000');
    console.log('密码: admin123');
  } catch (error) {
    console.error('创建管理员失败:', error);
    process.exit(1);
  }
})();
