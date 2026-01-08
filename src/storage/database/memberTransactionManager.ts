import { eq, and, SQL, desc, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
	memberTransactions,
	insertMemberTransactionSchema,
	updateMemberTransactionSchema,
	type MemberTransaction,
	type InsertMemberTransaction,
	type UpdateMemberTransaction,
} from "./shared/schema";

/**
 * 会员交易记录管理器
 * 负责会员交易记录的CRUD操作
 */
export class MemberTransactionManager {
	/**
	 * 创建交易记录
	 */
	async createTransaction(data: InsertMemberTransaction): Promise<MemberTransaction> {
		const db = await getDb();
		const validated = insertMemberTransactionSchema.parse(data);

		const [transaction] = await db.insert(memberTransactions).values(validated).returning();
		return transaction;
	}

	/**
	 * 根据交易ID获取交易记录
	 */
	async getTransactionById(id: string): Promise<MemberTransaction | null> {
		const db = await getDb();
		const [transaction] = await db.select().from(memberTransactions).where(eq(memberTransactions.id, id));
		return transaction || null;
	}

	/**
	 * 根据会员ID获取交易记录
	 */
	async getTransactionsByMemberId(
		memberId: string,
		options: {
			skip?: number;
			limit?: number;
			filters?: Partial<
				Pick<
					MemberTransaction,
					"transactionType" | "status" | "paymentMethod"
				>
			>;
		} = {},
	): Promise<MemberTransaction[]> {
		const { skip = 0, limit = 100, filters = {} } = options;
		const db = await getDb();

		const conditions: SQL[] = [eq(memberTransactions.memberId, memberId)];

		if (filters.transactionType !== undefined) {
			conditions.push(eq(memberTransactions.transactionType, filters.transactionType));
		}
		if (filters.status !== undefined && filters.status !== null) {
			conditions.push(eq(memberTransactions.status, filters.status));
		}
		if (filters.paymentMethod !== undefined && filters.paymentMethod !== null) {
			conditions.push(eq(memberTransactions.paymentMethod, filters.paymentMethod));
		}

		return db
			.select()
			.from(memberTransactions)
			.where(and(...conditions))
			.limit(limit)
			.offset(skip)
			.orderBy(desc(memberTransactions.createdAt));
	}

	/**
	 * 获取交易记录列表（支持条件查询和分页）
	 */
	async getTransactions(options: {
		skip?: number;
		limit?: number;
		filters?: Partial<
			Pick<
				MemberTransaction,
				"id" | "memberId" | "transactionType" | "status" | "paymentMethod"
			>
		>;
	} = {}): Promise<MemberTransaction[]> {
		const { skip = 0, limit = 100, filters = {} } = options;
		const db = await getDb();

		const conditions: SQL[] = [];
		if (filters.id !== undefined) {
			conditions.push(eq(memberTransactions.id, filters.id));
		}
		if (filters.memberId !== undefined) {
			conditions.push(eq(memberTransactions.memberId, filters.memberId));
		}
		if (filters.transactionType !== undefined) {
			conditions.push(eq(memberTransactions.transactionType, filters.transactionType));
		}
		if (filters.status !== undefined && filters.status !== null) {
			conditions.push(eq(memberTransactions.status, filters.status));
		}
		if (filters.paymentMethod !== undefined && filters.paymentMethod !== null) {
			conditions.push(eq(memberTransactions.paymentMethod, filters.paymentMethod));
		}

		if (conditions.length > 0) {
			return db
				.select()
				.from(memberTransactions)
				.where(and(...conditions))
				.limit(limit)
				.offset(skip)
				.orderBy(desc(memberTransactions.createdAt));
		}

		return db
			.select()
			.from(memberTransactions)
			.limit(limit)
			.offset(skip)
			.orderBy(desc(memberTransactions.createdAt));
	}

	/**
	 * 更新交易记录
	 */
	async updateTransaction(
		id: string,
		data: UpdateMemberTransaction,
	): Promise<MemberTransaction | null> {
		const db = await getDb();
		const validated = updateMemberTransactionSchema.parse(data);
		const [transaction] = await db
			.update(memberTransactions)
			.set({ ...validated, updatedAt: new Date().toISOString() })
			.where(eq(memberTransactions.id, id))
			.returning();
		return transaction || null;
	}

	/**
	 * 删除交易记录
	 */
	async deleteTransaction(id: string): Promise<boolean> {
		const db = await getDb();
		const result = await db.delete(memberTransactions).where(eq(memberTransactions.id, id));
		return (result.rowCount ?? 0) > 0;
	}

	/**
	 * 获取交易统计信息
	 * @param memberId 会员ID
	 */
	async getTransactionStats(memberId: string) {
		const transactions = await this.getTransactionsByMemberId(memberId, { limit: 10000 });

		const totalRecharge = transactions
			.filter((t) => t.transactionType === "recharge" && t.status === "completed")
			.reduce((sum, t) => sum + t.amount, 0);

		const totalConsumption = transactions
			.filter((t) => t.transactionType === "consumption" && t.status === "completed")
			.reduce((sum, t) => sum + t.amount, 0);

		const totalRefund = transactions
			.filter((t) => t.transactionType === "refund" && t.status === "completed")
			.reduce((sum, t) => sum + t.amount, 0);

		const pendingTransactions = transactions.filter((t) => t.status === "pending").length;
		const failedTransactions = transactions.filter((t) => t.status === "failed").length;
		const cancelledTransactions = transactions.filter((t) => t.status === "cancelled").length;

		return {
			memberId,
			totalRecharge,
			totalConsumption,
			totalRefund,
			transactionCount: transactions.length,
			pendingTransactions,
			failedTransactions,
			cancelledTransactions,
		};
	}

	/**
	 * 根据支付交易ID查询交易记录
	 */
	async getTransactionByPaymentTransactionId(
		paymentTransactionId: string,
	): Promise<MemberTransaction | null> {
		const db = await getDb();
		const [transaction] = await db
			.select()
			.from(memberTransactions)
			.where(eq(memberTransactions.paymentTransactionId, paymentTransactionId));
		return transaction || null;
	}
}

export const memberTransactionManager = new MemberTransactionManager();
