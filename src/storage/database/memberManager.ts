import { eq, and, SQL, sql, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
	members,
	insertMemberSchema,
	updateMemberSchema,
	type Member,
	type InsertMember,
	type UpdateMember,
} from "./shared/schema";
import { memberTransactionManager } from "./memberTransactionManager";

/**
 * 会员管理器
 * 负责会员信息的CRUD操作以及充值、消费等核心业务逻辑
 */
export class MemberManager {
	/**
	 * 创建会员
	 */
	async createMember(data: InsertMember): Promise<Member> {
		const db = await getDb();
		const validated = insertMemberSchema.parse(data);

		const [member] = await db.insert(members).values(validated).returning();
		return member;
	}

	/**
	 * 根据用户ID获取会员
	 */
	async getMemberByUserId(userId: string): Promise<Member | null> {
		const db = await getDb();
		const [member] = await db.select().from(members).where(eq(members.userId, userId));
		return member || null;
	}

	/**
	 * 根据会员ID获取会员
	 */
	async getMemberById(id: string): Promise<Member | null> {
		const db = await getDb();
		const [member] = await db.select().from(members).where(eq(members.id, id));
		return member || null;
	}

	/**
	 * 获取会员列表（支持条件查询和分页）
	 */
	async getMembers(options: {
		skip?: number;
		limit?: number;
		filters?: Partial<Pick<Member, "id" | "userId" | "memberLevel" | "memberStatus">>;
	} = {}): Promise<Member[]> {
		const { skip = 0, limit = 100, filters = {} } = options;
		const db = await getDb();

		const conditions: SQL[] = [];
		if (filters.id !== undefined) {
			conditions.push(eq(members.id, filters.id));
		}
		if (filters.userId !== undefined) {
			conditions.push(eq(members.userId, filters.userId));
		}
		if (filters.memberLevel !== undefined && filters.memberLevel !== null) {
			conditions.push(eq(members.memberLevel, filters.memberLevel));
		}
		if (filters.memberStatus !== undefined && filters.memberStatus !== null) {
			conditions.push(eq(members.memberStatus, filters.memberStatus));
		}

		if (conditions.length > 0) {
			return db
				.select()
				.from(members)
				.where(and(...conditions))
				.limit(limit)
				.offset(skip)
				.orderBy(desc(members.createdAt));
		}

		return db
			.select()
			.from(members)
			.limit(limit)
			.offset(skip)
			.orderBy(desc(members.createdAt));
	}

	/**
	 * 更新会员信息
	 */
	async updateMember(id: string, data: UpdateMember): Promise<Member | null> {
		const db = await getDb();
		const validated = updateMemberSchema.parse(data);
		const [member] = await db
			.update(members)
			.set({ ...validated, updatedAt: new Date().toISOString() })
			.where(eq(members.id, id))
			.returning();
		return member || null;
	}

	/**
	 * 删除会员
	 */
	async deleteMember(id: string): Promise<boolean> {
		const db = await getDb();
		const result = await db.delete(members).where(eq(members.id, id));
		return (result.rowCount ?? 0) > 0;
	}

	/**
	 * 充值
	 * @param memberId 会员ID
	 * @param amount 充值金额（单位：分）
	 * @param description 交易描述
	 * @param paymentMethod 支付方式
	 * @param paymentTransactionId 支付平台交易ID
	 */
	async recharge(
		memberId: string,
		amount: number,
		description: string,
		paymentMethod: string,
		paymentTransactionId?: string,
	): Promise<Member> {
		const db = await getDb();

		// 获取会员当前信息
		const member = await this.getMemberById(memberId);
		if (!member) {
			throw new Error("会员不存在");
		}

		if (amount <= 0) {
			throw new Error("充值金额必须大于0");
		}

		// 计算充值后的余额和累计充值金额
		const balanceAfter = member.balance + amount;
		const totalRechargeAfter = member.totalRecharge + amount;

		// 更新会员余额和累计充值
		const [updatedMember] = await db
			.update(members)
			.set({
				balance: balanceAfter,
				totalRecharge: totalRechargeAfter,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(members.id, memberId))
			.returning();

		// 创建交易记录
		await memberTransactionManager.createTransaction({
			memberId: memberId,
			transactionType: "recharge",
			amount: amount,
			balanceBefore: member.balance,
			balanceAfter: balanceAfter,
			pointsBefore: member.points,
			pointsAfter: member.points,
			description: description,
			status: "completed",
			paymentMethod: paymentMethod,
			paymentTransactionId: paymentTransactionId,
			completedAt: new Date().toISOString(),
		});

		return updatedMember;
	}

	/**
	 * 消费
	 * @param memberId 会员ID
	 * @param amount 消费金额（单位：分）
	 * @param description 交易描述
	 * @param metadata 交易元数据
	 */
	async consume(
		memberId: string,
		amount: number,
		description: string,
		metadata?: Record<string, any>,
	): Promise<Member> {
		const db = await getDb();

		// 获取会员当前信息
		const member = await this.getMemberById(memberId);
		if (!member) {
			throw new Error("会员不存在");
		}

		if (member.memberStatus !== "active") {
			throw new Error("会员状态异常，无法消费");
		}

		if (amount <= 0) {
			throw new Error("消费金额必须大于0");
		}

		if (member.balance < amount) {
			throw new Error("余额不足");
		}

		// 计算消费后的余额和累计消费金额
		const balanceAfter = member.balance - amount;
		const totalConsumptionAfter = member.totalConsumption + amount;

		// 更新会员余额和累计消费
		const [updatedMember] = await db
			.update(members)
			.set({
				balance: balanceAfter,
				totalConsumption: totalConsumptionAfter,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(members.id, memberId))
			.returning();

		// 创建交易记录
		await memberTransactionManager.createTransaction({
			memberId: memberId,
			transactionType: "consumption",
			amount: amount,
			balanceBefore: member.balance,
			balanceAfter: balanceAfter,
			pointsBefore: member.points,
			pointsAfter: member.points,
			description: description,
			status: "completed",
			paymentMethod: "balance",
			metadata: metadata,
			completedAt: new Date().toISOString(),
		});

		return updatedMember;
	}

	/**
	 * 增加积分
	 * @param memberId 会员ID
	 * @param points 增加的积分数量
	 * @param description 交易描述
	 * @param metadata 交易元数据
	 */
	async addPoints(
		memberId: string,
		points: number,
		description: string,
		metadata?: Record<string, any>,
	): Promise<Member> {
		const db = await getDb();

		// 获取会员当前信息
		const member = await this.getMemberById(memberId);
		if (!member) {
			throw new Error("会员不存在");
		}

		if (points <= 0) {
			throw new Error("积分数量必须大于0");
		}

		// 计算增加积分后的数量
		const pointsAfter = member.points + points;

		// 更新会员积分
		const [updatedMember] = await db
			.update(members)
			.set({
				points: pointsAfter,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(members.id, memberId))
			.returning();

		// 创建交易记录（积分调整）
		await memberTransactionManager.createTransaction({
			memberId: memberId,
			transactionType: "points_adjust",
			amount: 0,
			balanceBefore: member.balance,
			balanceAfter: member.balance,
			pointsBefore: member.points,
			pointsAfter: pointsAfter,
			description: description,
			status: "completed",
			metadata: {
				...metadata,
				pointsChange: points,
			},
			completedAt: new Date().toISOString(),
		});

		return updatedMember;
	}

	/**
	 * 扣减积分
	 * @param memberId 会员ID
	 * @param points 扣减的积分数量
	 * @param description 交易描述
	 * @param metadata 交易元数据
	 */
	async deductPoints(
		memberId: string,
		points: number,
		description: string,
		metadata?: Record<string, any>,
	): Promise<Member> {
		const db = await getDb();

		// 获取会员当前信息
		const member = await this.getMemberById(memberId);
		if (!member) {
			throw new Error("会员不存在");
		}

		if (points <= 0) {
			throw new Error("积分数量必须大于0");
		}

		if (member.points < points) {
			throw new Error("积分不足");
		}

		// 计算扣减积分后的数量
		const pointsAfter = member.points - points;

		// 更新会员积分
		const [updatedMember] = await db
			.update(members)
			.set({
				points: pointsAfter,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(members.id, memberId))
			.returning();

		// 创建交易记录（积分调整）
		await memberTransactionManager.createTransaction({
			memberId: memberId,
			transactionType: "points_adjust",
			amount: 0,
			balanceBefore: member.balance,
			balanceAfter: member.balance,
			pointsBefore: member.points,
			pointsAfter: pointsAfter,
			description: description,
			status: "completed",
			metadata: {
				...metadata,
				pointsChange: -points,
			},
			completedAt: new Date().toISOString(),
		});

		return updatedMember;
	}

	/**
	 * 升级会员等级
	 * @param memberId 会员ID
	 * @param newLevel 新的会员等级
	 */
	async upgradeLevel(memberId: string, newLevel: string): Promise<Member | null> {
		const member = await this.getMemberById(memberId);
		if (!member) {
			throw new Error("会员不存在");
		}

		// 会员等级验证（basic < silver < gold < platinum < diamond）
		const levelOrder = ["basic", "silver", "gold", "platinum", "diamond"];
		const currentLevelIndex = levelOrder.indexOf(member.memberLevel || "basic");
		const newLevelIndex = levelOrder.indexOf(newLevel);

		if (currentLevelIndex === -1 || newLevelIndex === -1) {
			throw new Error("无效的会员等级");
		}

		if (newLevelIndex <= currentLevelIndex) {
			throw new Error("新等级必须高于当前等级");
		}

		return this.updateMember(memberId, { memberLevel: newLevel });
	}

	/**
	 * 获取会员统计信息
	 * @param memberId 会员ID
	 */
	async getMemberStats(memberId: string) {
		const member = await this.getMemberById(memberId);
		if (!member) {
			throw new Error("会员不存在");
		}

		const transactions = await memberTransactionManager.getTransactionsByMemberId(
			memberId,
			{ limit: 1000 },
		);

		const rechargeCount = transactions.filter((t) => t.transactionType === "recharge").length;
		const consumptionCount = transactions.filter((t) => t.transactionType === "consumption").length;
		const refundCount = transactions.filter((t) => t.transactionType === "refund").length;

		return {
			memberId: member.id,
			balance: member.balance,
			points: member.points,
			totalRecharge: member.totalRecharge,
			totalConsumption: member.totalConsumption,
			memberLevel: member.memberLevel,
			memberStatus: member.memberStatus,
			transactionCount: transactions.length,
			rechargeCount,
			consumptionCount,
			refundCount,
		};
	}
}

export const memberManager = new MemberManager();
