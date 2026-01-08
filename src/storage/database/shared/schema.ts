import { pgTable, varchar, text, timestamp, index, unique, boolean, jsonb, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

export const contactMessages = pgTable("contact_messages", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	phone: varchar({ length: 20 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	phone: varchar({ length: 20 }).notNull(),
	name: varchar({ length: 128 }).notNull(),
	password: text().notNull(),
	email: varchar({ length: 255 }),
	avatar: varchar({ length: 500 }),
	isAdmin: boolean("is_admin").default(false).notNull(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("users_phone_unique").on(table.phone),
]);

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

// 会员信息表
export const members = pgTable("members", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
	memberLevel: varchar("member_level", { length: 50 }).default('basic'), // 会员等级：basic, silver, gold, platinum, diamond
	balance: integer("balance").default(0).notNull(), // 余额（单位：分）
	points: integer("points").default(0).notNull(), // 积分
	totalRecharge: integer("total_recharge").default(0).notNull(), // 累计充值金额（单位：分）
	totalConsumption: integer("total_consumption").default(0).notNull(), // 累计消费金额（单位：分）
	memberStatus: varchar("member_status", { length: 50 }).default('active'), // 会员状态：active, suspended, expired
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }), // 会员过期时间
	metadata: jsonb("metadata"), // 会员元数据（JSONB）
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("members_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("members_member_level_idx").using("btree", table.memberLevel.asc().nullsLast().op("text_ops")),
	unique("members_user_id_unique").on(table.userId),
]);

// 会员交易记录表
export const memberTransactions = pgTable("member_transactions", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	memberId: varchar("member_id", { length: 36 }).notNull().references(() => members.id, { onDelete: 'cascade' }),
	transactionType: varchar("transaction_type", { length: 50 }).notNull(), // 交易类型：recharge-充值, consumption-消费, refund-退款
	amount: integer("amount").notNull(), // 交易金额（单位：分）
	balanceBefore: integer("balance_before").notNull(), // 交易前余额
	balanceAfter: integer("balance_after").notNull(), // 交易后余额
	pointsBefore: integer("points_before").default(0).notNull(), // 交易前积分
	pointsAfter: integer("points_after").default(0).notNull(), // 交易后积分
	description: varchar("description", { length: 500 }), // 交易描述
	status: varchar("status", { length: 50 }).default('pending'), // 交易状态：pending, completed, failed, cancelled
	paymentMethod: varchar("payment_method", { length: 50 }), // 支付方式：alipay, wechat, balance等
	paymentTransactionId: varchar("payment_transaction_id", { length: 255 }), // 支付平台交易ID
	metadata: jsonb("metadata"), // 交易元数据（JSONB）
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }), // 交易完成时间
}, (table) => [
	index("member_transactions_member_id_idx").using("btree", table.memberId.asc().nullsLast().op("text_ops")),
	index("member_transactions_transaction_type_idx").using("btree", table.transactionType.asc().nullsLast().op("text_ops")),
	index("member_transactions_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("member_transactions_created_at_idx").using("btree", table.createdAt.desc().nullsLast().op("text_ops")),
]);

// 使用 createSchemaFactory 配置 date coercion（处理前端 string → Date 转换）
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
	coerce: { date: true },
});

// Members 表的验证 schema
export const insertMemberSchema = createCoercedInsertSchema(members).pick({
	userId: true,
	memberLevel: true,
	balance: true,
	points: true,
	totalRecharge: true,
	totalConsumption: true,
	memberStatus: true,
	expiresAt: true,
	metadata: true,
	createdAt: true,
});

export const updateMemberSchema = createCoercedInsertSchema(members)
	.pick({
		memberLevel: true,
		balance: true,
		points: true,
		totalRecharge: true,
		totalConsumption: true,
		memberStatus: true,
		expiresAt: true,
		metadata: true,
	})
	.partial();

// MemberTransactions 表的验证 schema
export const insertMemberTransactionSchema = createCoercedInsertSchema(memberTransactions).pick({
	memberId: true,
	transactionType: true,
	amount: true,
	balanceBefore: true,
	balanceAfter: true,
	pointsBefore: true,
	pointsAfter: true,
	description: true,
	status: true,
	paymentMethod: true,
	paymentTransactionId: true,
	metadata: true,
	completedAt: true,
});

export const updateMemberTransactionSchema = createCoercedInsertSchema(memberTransactions)
	.pick({
		status: true,
		description: true,
		paymentMethod: true,
		paymentTransactionId: true,
		metadata: true,
		completedAt: true,
	})
	.partial();

// TypeScript types
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type UpdateMember = z.infer<typeof updateMemberSchema>;
export type MemberTransaction = typeof memberTransactions.$inferSelect;
export type InsertMemberTransaction = z.infer<typeof insertMemberTransactionSchema>;
export type UpdateMemberTransaction = z.infer<typeof updateMemberTransactionSchema>;

// Users 表的验证 schema
export const insertUserSchema = createCoercedInsertSchema(users).pick({
	phone: true,
	name: true,
	password: true,
	email: true,
	avatar: true,
	isAdmin: true,
	isActive: true,
});

export const updateUserSchema = createCoercedInsertSchema(users)
	.pick({
		phone: true,
		name: true,
		email: true,
		avatar: true,
		isAdmin: true,
		isActive: true,
	})
	.partial();

// 登录验证 schema
export const loginSchema = z.object({
	phone: z.string().min(11, "手机号码格式不正确"),
	password: z.string().min(6, "密码至少6位"),
});

// Orders 表的验证 schema
export const insertOrderSchema = createCoercedInsertSchema(orders).pick({
	orderNumber: true,
	customerName: true,
	customerPhone: true,
	customerEmail: true,
	platform: true,
	serviceLevel: true,
	selectedFeatures: true,
	valueServices: true,
	totalPrice: true,
	monthlyFee: true,
	status: true,
	paymentMethod: true,
	paymentTime: true,
	notes: true,
});

export const updateOrderSchema = createCoercedInsertSchema(orders)
	.pick({
		customerName: true,
		customerPhone: true,
		customerEmail: true,
		serviceLevel: true,
		selectedFeatures: true,
		valueServices: true,
		status: true,
		paymentMethod: true,
		paymentTime: true,
		notes: true,
	})
	.partial();

// ContactMessages 表的验证 schema
export const insertContactMessageSchema = createCoercedInsertSchema(contactMessages).pick({
	name: true,
	phone: true,
	email: true,
	message: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

