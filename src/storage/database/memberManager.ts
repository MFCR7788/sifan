import { db } from './db';
import { members, memberTransactions, users } from './shared/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * 会员管理器
 */
export class MemberManager {
  /**
   * 根据用户ID获取会员信息
   */
  async getMemberByUserId(userId: string) {
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.userId, userId))
      .limit(1);

    return member;
  }

  /**
   * 获取所有会员
   */
  async getMembers(limit = 50, offset = 0) {
    const allMembers = await db
      .select()
      .from(members)
      .orderBy(desc(members.createdAt))
      .limit(limit)
      .offset(offset);

    return allMembers;
  }

  /**
   * 更新会员信息
   */
  async updateMember(memberId: string, updateData: Partial<typeof members.$inferInsert>) {
    const [updatedMember] = await db
      .update(members)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(members.id, memberId))
      .returning();

    return updatedMember;
  }

  /**
   * 创建会员信息
   */
  async createMember(data: { userId: string; memberLevel?: string; balance?: number; points?: number; totalRecharge?: number; totalConsumption?: number; memberStatus?: string }) {
    const [member] = await db
      .insert(members)
      .values({
        userId: data.userId,
        memberLevel: data.memberLevel || 'basic',
        balance: data.balance || 0,
        points: data.points || 0,
        totalRecharge: data.totalRecharge || 0,
        totalConsumption: data.totalConsumption || 0,
        memberStatus: data.memberStatus || 'active',
      })
      .returning();

    return member;
  }

  /**
   * 确保会员存在
   */
  async ensureMemberExists(userId: string) {
    let member = await this.getMemberByUserId(userId);
    if (!member) {
      member = await this.createMember({ userId });
    }
    return member;
  }

  /**
   * 充值余额
   */
  async rechargeBalance(
    userId: string,
    amount: number, // 单位：分
    paymentMethod: string,
    paymentTransactionId: string,
    description: string
  ) {
    const member = await this.ensureMemberExists(userId);

    // 更新会员余额和总充值金额
    const balanceBefore = member.balance;
    const balanceAfter = balanceBefore + amount;
    const totalRechargeAfter = member.totalRecharge + amount;

    const [updatedMember] = await db
      .update(members)
      .set({
        balance: balanceAfter,
        totalRecharge: totalRechargeAfter,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(members.userId, userId))
      .returning();

    // 创建交易记录
    const [transaction] = await db
      .insert(memberTransactions)
      .values({
        memberId: updatedMember.id,
        transactionType: 'recharge',
        amount,
        balanceBefore,
        balanceAfter,
        pointsBefore: member.points,
        pointsAfter: member.points,
        description,
        status: 'completed',
        paymentMethod,
        paymentTransactionId,
        completedAt: new Date().toISOString(),
      })
      .returning();

    return { member: updatedMember, transaction };
  }

  /**
   * 充值积分
   */
  async rechargePoints(
    userId: string,
    points: number,
    amount: number, // 金额，单位：分
    paymentMethod: string,
    paymentTransactionId: string,
    description: string
  ) {
    const member = await this.ensureMemberExists(userId);

    // 更新会员积分
    const pointsBefore = member.points;
    const pointsAfter = pointsBefore + points;
    const totalRechargeAfter = member.totalRecharge + amount;

    const [updatedMember] = await db
      .update(members)
      .set({
        points: pointsAfter,
        totalRecharge: totalRechargeAfter,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(members.userId, userId))
      .returning();

    // 创建交易记录
    const [transaction] = await db
      .insert(memberTransactions)
      .values({
        memberId: updatedMember.id,
        transactionType: 'points_recharge',
        amount,
        balanceBefore: member.balance,
        balanceAfter: member.balance,
        pointsBefore,
        pointsAfter,
        description,
        status: 'completed',
        paymentMethod,
        paymentTransactionId,
        completedAt: new Date().toISOString(),
      })
      .returning();

    return { member: updatedMember, transaction };
  }

  /**
   * 购买会员
   */
  async purchaseMembership(
    userId: string,
    planId: string, // 会员套餐ID
    amount: number, // 金额，单位：分
    paymentMethod: string,
    paymentTransactionId: string,
    description: string
  ) {
    const member = await this.ensureMemberExists(userId);

    // 根据套餐ID确定会员等级和有效期
    let memberLevel = 'basic';
    let expiresAt: Date | null = null;

    const now = new Date();

    switch (planId) {
      case 'silver':
        memberLevel = 'silver';
        expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
        break;
      case 'gold':
        memberLevel = 'gold';
        expiresAt = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case 'platinum':
        memberLevel = 'platinum';
        expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
        break;
      default:
        break;
    }

    const totalRechargeAfter = member.totalRecharge + amount;

    // 如果当前会员未过期，延长有效期
    if (member.expiresAt && new Date(member.expiresAt) > new Date()) {
      const currentExpires = new Date(member.expiresAt);
      const planDuration = expiresAt
        ? expiresAt.getTime() - now.getTime()
        : 0;
      expiresAt = new Date(currentExpires.getTime() + planDuration);
    }

    const [updatedMember] = await db
      .update(members)
      .set({
        memberLevel,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        totalRecharge: totalRechargeAfter,
        memberStatus: 'active',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(members.userId, userId))
      .returning();

    // 创建交易记录
    const [transaction] = await db
      .insert(memberTransactions)
      .values({
        memberId: updatedMember.id,
        transactionType: 'membership_purchase',
        amount,
        balanceBefore: member.balance,
        balanceAfter: member.balance,
        pointsBefore: member.points,
        pointsAfter: member.points,
        description,
        status: 'completed',
        paymentMethod,
        paymentTransactionId,
        metadata: { planId, memberLevel },
        completedAt: new Date().toISOString(),
      })
      .returning();

    return { member: updatedMember, transaction };
  }

  /**
   * 获取会员交易记录
   */
  async getMemberTransactions(memberId: string, limit = 20, offset = 0) {
    const transactions = await db
      .select()
      .from(memberTransactions)
      .where(eq(memberTransactions.memberId, memberId))
      .orderBy(desc(memberTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    return transactions;
  }

  /**
   * 获取交易记录（支持过滤和分页）
   */
  async getTransactions(
    memberId: string,
    options?: {
      skip?: number;
      limit?: number;
      filters?: { transactionType?: string };
    }
  ) {
    const skip = options?.skip || 0;
    const limit = options?.limit || 20;

    // 构建查询条件
    const conditions = [eq(memberTransactions.memberId, memberId)];

    // 添加过滤条件
    if (options?.filters?.transactionType) {
      // 这里需要添加额外的条件，但目前 Drizzle ORM 的 eq 不支持直接链式调用
      // 简化实现：先查询所有记录，然后在内存中过滤
    }

    const transactions = await db
      .select()
      .from(memberTransactions)
      .where(eq(memberTransactions.memberId, memberId))
      .orderBy(desc(memberTransactions.createdAt))
      .limit(limit)
      .offset(skip);

    // 在内存中应用过滤
    let filteredTransactions = transactions;
    if (options?.filters?.transactionType) {
      filteredTransactions = transactions.filter(
        (t) => t.transactionType === options.filters?.transactionType
      );
    }

    return filteredTransactions;
  }

  /**
   * 获取用户的交易记录
   */
  async getUserTransactions(userId: string, limit = 20, offset = 0) {
    const member = await this.getMemberByUserId(userId);
    if (!member) {
      return [];
    }

    return this.getMemberTransactions(member.id, limit, offset);
  }
}

export const memberManager = new MemberManager();
