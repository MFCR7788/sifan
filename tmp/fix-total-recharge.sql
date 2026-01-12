-- ==========================================
-- 修复充值总金额计算逻辑
-- ==========================================
-- 问题：totalRecharge 包含了所有支付订单的金额（余额充值、积分充值、购买会员）
-- 解决：totalRecharge 应该只包含余额充值的金额
-- ==========================================

-- 1. 查看当前所有会员的 totalRecharge 和实际充值金额对比
SELECT
  m.id AS member_id,
  m.user_id,
  m.total_recharge AS current_total_recharge,
  COALESCE(SUM(CASE WHEN mt.transaction_type = 'recharge' THEN mt.amount ELSE 0 END), 0) AS actual_recharge_amount,
  m.total_recharge - COALESCE(SUM(CASE WHEN mt.transaction_type = 'recharge' THEN mt.amount ELSE 0 END), 0) AS difference
FROM members m
LEFT JOIN member_transactions mt ON m.id = mt.member_id
GROUP BY m.id, m.user_id, m.total_recharge
ORDER BY difference DESC;

-- 2. 修复所有会员的 totalRecharge
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
);

-- 3. 验证修复结果
SELECT
  m.id AS member_id,
  m.user_id,
  m.total_recharge AS corrected_total_recharge,
  COALESCE(SUM(CASE WHEN mt.transaction_type = 'recharge' THEN mt.amount ELSE 0 END), 0) AS verified_recharge_amount,
  m.total_recharge - COALESCE(SUM(CASE WHEN mt.transaction_type = 'recharge' THEN mt.amount ELSE 0 END), 0) AS difference
FROM members m
LEFT JOIN member_transactions mt ON m.id = mt.member_id
GROUP BY m.id, m.user_id, m.total_recharge
ORDER BY m.user_id;
