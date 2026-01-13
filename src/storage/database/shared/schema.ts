import { pgTable, varchar, text, timestamp, index, unique, jsonb, integer, foreignKey, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// Zod schema factory with date coercion
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
	coerce: { date: true },
})

export const contactMessages = pgTable("contact_messages", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	phone: varchar({ length: 20 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	orderNumber: varchar("order_number", { length: 32 }).notNull(),
	customerName: varchar("customer_name", { length: 128 }).notNull(),
	customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
	customerEmail: varchar("customer_email", { length: 255 }).notNull(),
	platform: varchar({ length: 50 }).notNull(),
	serviceLevel: varchar("service_level", { length: 50 }),
	selectedFeatures: jsonb("selected_features").notNull(),
	valueServices: jsonb("value_services"),
	totalPrice: integer("total_price").notNull(),
	monthlyFee: integer("monthly_fee").default(0),
	status: varchar({ length: 50 }).default('pending').notNull(),
	paymentMethod: varchar("payment_method", { length: 50 }),
	paymentTime: timestamp("payment_time", { withTimezone: true, mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("orders_order_number_idx").using("btree", table.orderNumber.asc().nullsLast().op("text_ops")),
	index("orders_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	unique("orders_order_number_key").on(table.orderNumber),
]);

export const members = pgTable("members", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	memberLevel: varchar("member_level", { length: 50 }).default('basic'),
	balance: integer().default(0).notNull(),
	points: integer().default(0).notNull(),
	totalRecharge: integer("total_recharge").default(0).notNull(),
	totalConsumption: integer("total_consumption").default(0).notNull(),
	memberStatus: varchar("member_status", { length: 50 }).default('active'),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "members_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("members_user_id_unique").on(table.userId),
]);

export const memberTransactions = pgTable("member_transactions", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	memberId: varchar("member_id", { length: 36 }).notNull(),
	transactionType: varchar("transaction_type", { length: 50 }).notNull(),
	amount: integer().notNull(),
	balanceBefore: integer("balance_before").notNull(),
	balanceAfter: integer("balance_after").notNull(),
	pointsBefore: integer("points_before").default(0).notNull(),
	pointsAfter: integer("points_after").default(0).notNull(),
	description: varchar({ length: 500 }),
	status: varchar({ length: 50 }).default('pending'),
	paymentMethod: varchar("payment_method", { length: 50 }),
	paymentTransactionId: varchar("payment_transaction_id", { length: 255 }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("member_transactions_member_id_idx").using("btree", table.memberId.asc().nullsLast().op("text_ops")),
	index("member_transactions_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("member_transactions_transaction_type_idx").using("btree", table.transactionType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [members.id],
			name: "member_transactions_member_id_members_id_fk"
		}).onDelete("cascade"),
]);

// 支付订单表
export const paymentOrders = pgTable("payment_orders", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	orderNo: varchar("order_no", { length: 64 }).notNull().unique(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	memberId: varchar("member_id", { length: 36 }),
	orderType: varchar("order_type", { length: 50 }).notNull(), // 'recharge' | 'membership' | 'points'
	amount: integer().notNull(), // 单位：分
	paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // 'wechat' | 'alipay'
	status: varchar("status", { length: 50 }).default('pending').notNull(), // 'pending' | 'paid' | 'failed' | 'cancelled'
	tradeNo: varchar("trade_no", { length: 128 }), // 第三方支付平台的交易号
	transactionId: varchar("transaction_id", { length: 128 }), // 支付平台的订单号
	qrCodeUrl: varchar("qr_code_url", { length: 500 }), // 二维码链接
	description: varchar("description", { length: 255 }),
	metadata: jsonb(),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("payment_orders_order_no_idx").using("btree", table.orderNo.asc().nullsLast().op("text_ops")),
	index("payment_orders_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("payment_orders_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payment_orders_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [members.id],
			name: "payment_orders_member_id_members_id_fk"
		}).onDelete("set null"),
]);

export const users = pgTable("users", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	email: varchar({ length: 255 }),
	name: varchar({ length: 128 }).notNull(),
	password: text().notNull(),
	phone: varchar({ length: 20 }).notNull(),
	avatar: varchar({ length: 500 }),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	isAdmin: boolean("is_admin").default(false).notNull(),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
	unique("users_phone_unique").on(table.phone),
]);

// 知识库表
export const knowledgeBase = pgTable("knowledge_base", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	category: varchar({ length: 100 }).notNull(), // 分类：产品、服务、技术、价格等
	question: text().notNull(), // 问题
	answer: text().notNull(), // 答案
	keywords: text(), // 关键词，用于搜索匹配
	priority: integer().default(0).notNull(), // 优先级，数字越大越优先匹配
	isActive: boolean("is_active").default(true).notNull(), // 是否启用
	viewCount: integer("view_count").default(0).notNull(), // 查看次数
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdBy: varchar("created_by", { length: 36 }), // 创建人ID
}, (table) => [
	index("knowledge_base_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("knowledge_base_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "knowledge_base_created_by_users_id_fk"
	}).onDelete("set null"),
]);

// ==================== Zod Schemas ====================

// Contact Messages
export const insertContactMessageSchema = createCoercedInsertSchema(contactMessages)
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>
export type ContactMessage = typeof contactMessages.$inferSelect

// Orders
export const insertOrderSchema = createCoercedInsertSchema(orders).omit({
	id: true,
	orderNumber: true,
})
export type InsertOrder = z.infer<typeof insertOrderSchema>
export type Order = typeof orders.$inferSelect

// Members
export const insertMemberSchema = createCoercedInsertSchema(members)
export const updateMemberSchema = createCoercedInsertSchema(members).partial()
export type InsertMember = z.infer<typeof insertMemberSchema>
export type UpdateMember = z.infer<typeof updateMemberSchema>
export type Member = typeof members.$inferSelect

// Member Transactions
export const insertMemberTransactionSchema = createCoercedInsertSchema(memberTransactions)
export const updateMemberTransactionSchema = createCoercedInsertSchema(memberTransactions).partial()
export type InsertMemberTransaction = z.infer<typeof insertMemberTransactionSchema>
export type UpdateMemberTransaction = z.infer<typeof updateMemberTransactionSchema>
export type MemberTransaction = typeof memberTransactions.$inferSelect

// Payment Orders
export const insertPaymentOrderSchema = createCoercedInsertSchema(paymentOrders)
export const updatePaymentOrderSchema = createCoercedInsertSchema(paymentOrders).partial()
export type InsertPaymentOrder = z.infer<typeof insertPaymentOrderSchema>
export type UpdatePaymentOrder = z.infer<typeof updatePaymentOrderSchema>
export type PaymentOrder = typeof paymentOrders.$inferSelect

// Users
export const insertUserSchema = createCoercedInsertSchema(users).pick({
	phone: true,
	name: true,
	email: true,
	password: true,
	avatar: true,
	isAdmin: true,
	isActive: true,
})
export const updateUserSchema = createCoercedInsertSchema(users)
	.pick({
		email: true,
		name: true,
		avatar: true,
		phone: true,
	})
	.partial()
export const loginSchema = z.object({
	phone: z.string(),
	password: z.string(),
})
export type InsertUser = z.infer<typeof insertUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
export type User = typeof users.$inferSelect

// Knowledge Base
export const insertKnowledgeBaseSchema = createCoercedInsertSchema(knowledgeBase)
export const updateKnowledgeBaseSchema = createCoercedInsertSchema(knowledgeBase).partial()
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>
export type UpdateKnowledgeBase = z.infer<typeof updateKnowledgeBaseSchema>
export type KnowledgeBase = typeof knowledgeBase.$inferSelect
