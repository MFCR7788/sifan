import { getPool } from '/workspace/projects/node_modules/coze-coding-dev-sdk/dist/index.js';

async function testDatabase() {
  try {
    console.log('开始测试数据库连接...');

    const pool = await getPool();
    console.log('✓ 数据库连接成功');

    // 检查表是否存在
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'cover_images'
      );
    `);

    console.log('cover_images 表是否存在:', tableCheck.rows[0].exists);

    // 如果表存在，查看表结构
    if (tableCheck.rows[0].exists) {
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'cover_images'
        ORDER BY ordinal_position;
      `);
      console.log('\n表结构:');
      console.table(columns.rows);
    } else {
      console.log('⚠ 表不存在，需要创建');
    }

    // 测试简单查询
    console.log('\n尝试执行 SELECT * FROM cover_images LIMIT 1...');
    const result = await pool.query('SELECT * FROM cover_images LIMIT 1');
    console.log('✓ 查询成功，返回', result.rowCount, '行');

  } catch (error) {
    console.error('❌ 数据库测试失败:');
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testDatabase();
