/**
 * 修复充值总金额计算逻辑
 * 在服务器上直接执行此脚本
 */

const { getDb } = require('coze-coding-dev-sdk');
const { members, memberTransactions } = require('./src/storage/database/shared/schema');
const { eq, sql } = require('drizzle-orm');

async function fixTotalRecharge() {
  console.log('==========================================');
  console.log('修复充值总金额计算逻辑');
  console.log('时间:', new Date().toISOString());
  console.log('==========================================\n');

  try {
    const db = await getDb();

    // 1. 查看当前所有会员的 totalRecharge 和实际充值金额对比
    console.log('步骤 1: 查看当前所有会员的充值情况...\n');

    const query1 = sql`
      SELECT
        m.id AS member_id,
        m.user_id,
        m.total_recharge AS current_total_recharge,
        COALESCE(SUM(CASE WHEN mt.transaction_type = 'recharge' THEN mt.amount ELSE 0 END), 0) AS actual_recharge_amount,
        m.total_recharge - COALESCE(SUM(CASE WHEN mt.transaction_type = 'recharge' THEN mt.amount ELSE 0 END), 0) AS difference
      FROM members m
      LEFT JOIN member_transactions mt ON m.id = mt.member_id
      GROUP BY m.id, m.user_id, m.total_recharge
      ORDER BY difference DESC
    `;

    const result1 = await db.execute(query1);
    console.table(result1.rows);

    // 2. 修复所有会员的 totalRecharge
    console.log('\n步骤 2: 修复所有会员的 totalRecharge...\n');

    const query2 = sql`
      UPDATE members m
      SET total_recharge = COALESCE(
        (
          SELECT SUM(amount)
          FROM member_transactions
          WHERE member_id = m.id
            AND transaction_type = 'recharge'
            AND status = 'completed'
        ),
        0
      )
    `;

    await db.execute(query2);
    console.log('✓ totalRecharge 已修复\n');

    // 3. 验证修复结果
    console.log('步骤 3: 验证修复结果...\n');

    const query3 = sql`
      SELECT
        m.id AS member_id,
        m.user_id,
        m.total_recharge AS corrected_total_recharge,
        COALESCE(SUM(CASE WHEN mt.transaction_type = 'recharge' THEN mt.amount ELSE 0 END), 0) AS verified_recharge_amount,
        m.total_recharge - COALESCE(SUM(CASE WHEN mt.transaction_type = 'recharge' THEN mt.amount ELSE 0 END), 0) AS difference
      FROM members m
      LEFT JOIN member_transactions mt ON m.id = mt.member_id
      GROUP BY m.id, m.user_id, m.total_recharge
      ORDER BY m.user_id
    `;

    const result3 = await db.execute(query3);
    console.table(result3.rows);

    console.log('\n==========================================');
    console.log('修复完成！');
    console.log('==========================================');

  } catch (error) {
    console.error('修复失败:', error);
    process.exit(1);
  }
}

fixTotalRecharge();
