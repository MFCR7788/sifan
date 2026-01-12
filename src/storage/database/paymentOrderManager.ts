import { db } from './db';
import { paymentOrders } from './shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface CreatePaymentOrderParams {
  userId: string;
  memberId?: string;
  orderType: 'recharge' | 'membership' | 'points';
  amount: number; // 单位：分
  paymentMethod: 'wechat' | 'alipay';
  description?: string;
  metadata?: any;
}

export interface UpdatePaymentOrderParams {
  status?: 'pending' | 'paid' | 'failed' | 'cancelled';
  tradeNo?: string;
  transactionId?: string;
  paidAt?: string;
  metadata?: any;
}

/**
 * 创建支付订单
 */
export async function createPaymentOrder(params: CreatePaymentOrderParams) {
  const orderNo = `${params.orderType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const [order] = await db
    .insert(paymentOrders)
    .values({
      orderNo,
      userId: params.userId,
      memberId: params.memberId,
      orderType: params.orderType,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      description: params.description,
      metadata: params.metadata,
    })
    .returning();

  return order;
}

/**
 * 根据订单号获取支付订单
 */
export async function getPaymentOrderByOrderNo(orderNo: string) {
  const [order] = await db
    .select()
    .from(paymentOrders)
    .where(eq(paymentOrders.orderNo, orderNo))
    .limit(1);

  return order;
}

/**
 * 根据ID获取支付订单
 */
export async function getPaymentOrderById(id: string) {
  const [order] = await db
    .select()
    .from(paymentOrders)
    .where(eq(paymentOrders.id, id))
    .limit(1);

  return order;
}

/**
 * 更新支付订单
 */
export async function updatePaymentOrder(
  orderNo: string,
  params: UpdatePaymentOrderParams
) {
  const [order] = await db
    .update(paymentOrders)
    .set({
      ...params,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(paymentOrders.orderNo, orderNo))
    .returning();

  return order;
}

/**
 * 获取用户的支付订单列表
 */
export async function getUserPaymentOrders(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  const orders = await db
    .select()
    .from(paymentOrders)
    .where(eq(paymentOrders.userId, userId))
    .orderBy(desc(paymentOrders.createdAt))
    .limit(limit)
    .offset(offset);

  return orders;
}

/**
 * 标记订单为已支付
 */
export async function markOrderAsPaid(
  orderNo: string,
  tradeNo: string,
  transactionId: string
) {
  return await updatePaymentOrder(orderNo, {
    status: 'paid',
    tradeNo,
    transactionId,
    paidAt: new Date().toISOString(),
  });
}

/**
 * 标记订单为失败
 */
export async function markOrderAsFailed(orderNo: string) {
  return await updatePaymentOrder(orderNo, {
    status: 'failed',
  });
}
