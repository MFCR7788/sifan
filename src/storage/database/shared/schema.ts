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

// 资源分类表
export const resourceCategories = pgTable("resource_categories", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(), // 分类名称：前沿资讯、系统文档、魔法学院
	slug: varchar({ length: 100 }).notNull().unique(), // URL友好名称
	description: text(), // 分类描述
	icon: varchar({ length: 50 }), // 图标
	sortOrder: integer("sort_order").default(0).notNull(), // 排序
	isActive: boolean("is_active").default(true).notNull(), // 是否启用
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("resource_categories_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("resource_categories_sort_order_idx").using("btree", table.sortOrder.asc().nullsLast().op("text_ops")),
]);

// 资源内容表
export const resources = pgTable("resources", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	categoryId: varchar("category_id", { length: 36 }).notNull(), // 分类ID
	title: varchar({ length: 255 }).notNull(), // 标题
	slug: varchar({ length: 255 }).notNull(), // URL友好名称
	content: text(), // 内容（Markdown格式）
	contentType: varchar("content_type", { length: 50 }).notNull(), // 内容类型：document, video
	videoUrl: varchar("video_url", { length: 500 }), // 视频URL
	thumbnail: varchar({ length: 500 }), // 缩略图
	summary: text(), // 摘要
	tags: text(), // 标签，逗号分隔
	viewCount: integer("view_count").default(0).notNull(), // 查看次数
	sortOrder: integer("sort_order").default(0).notNull(), // 排序
	isPublished: boolean("is_published").default(false).notNull(), // 是否发布
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }), // 发布时间
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdBy: varchar("created_by", { length: 36 }), // 创建人ID
}, (table) => [
	index("resources_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("text_ops")),
	index("resources_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("resources_is_published_idx").using("btree", table.isPublished.asc().nullsLast().op("text_ops")),
	index("resources_sort_order_idx").using("btree", table.sortOrder.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.categoryId],
		foreignColumns: [resourceCategories.id],
		name: "resources_category_id_resource_categories_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "resources_created_by_users_id_fk"
	}).onDelete("set null"),
]);

// 封面图生成记录表
export const coverImages = pgTable("cover_images", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(), // 生成用户ID
	userName: varchar("user_name", { length: 128 }).notNull(), // 用户姓名
	platform: varchar({ length: 50 }).notNull(), // 平台：抖音、小红书、公众号
	style: varchar({ length: 50 }), // 风格：简约、清新、商务等
	ratio: varchar({ length: 10 }), // 比例：16:9、9:16、1:1、4:3
	size: varchar({ length: 20 }), // 尺寸：1920x1080等
	prompt: text(), // 生图prompt
	inputText: text().notNull(), // 用户输入的文案内容
	imageUrl: varchar("image_url", { length: 1000 }).notNull(), // 生成的图片URL
	isPublic: boolean("is_public").default(false).notNull(), // 是否公开
	viewCount: integer("view_count").default(0).notNull(), // 查看次数
	downloadCount: integer("download_count").default(0).notNull(), // 下载次数
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("cover_images_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("cover_images_platform_idx").using("btree", table.platform.asc().nullsLast().op("text_ops")),
	index("cover_images_is_public_idx").using("btree", table.isPublic.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "cover_images_user_id_users_id_fk"
	}).onDelete("cascade"),
]);

// AI图像生成记录表
export const aiImages = pgTable("ai_images", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(), // 生成用户ID
	userName: varchar("user_name", { length: 128 }).notNull(), // 用户姓名
	themeContent: text("theme_content").notNull(), // 主题内容
	style: varchar({ length: 50 }), // 风格：写实摄影、动漫风格等
	detailRequirement: text("detail_requirement"), // 细节要求
	quality: varchar({ length: 10 }), // 质量：2K、4K
	lighting: varchar({ length: 50 }), // 光照：自然光线、柔和光线等
	ratio: varchar({ length: 10 }), // 比例：16:9、9:16、1:1、4:3
	size: varchar({ length: 20 }), // 尺寸：1920x1080等
	prompt: text(), // 生图prompt
	imageUrl: varchar("image_url", { length: 1000 }).notNull(), // 生成的图片URL
	isPublic: boolean("is_public").default(false).notNull(), // 是否公开
	viewCount: integer("view_count").default(0).notNull(), // 查看次数
	downloadCount: integer("download_count").default(0).notNull(), // 下载次数
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ai_images_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("ai_images_style_idx").using("btree", table.style.asc().nullsLast().op("text_ops")),
	index("ai_images_is_public_idx").using("btree", table.isPublic.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "ai_images_user_id_users_id_fk"
	}).onDelete("cascade"),
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

// Resource Categories
export const insertResourceCategorySchema = createCoercedInsertSchema(resourceCategories)
export const updateResourceCategorySchema = createCoercedInsertSchema(resourceCategories).partial()
export type InsertResourceCategory = z.infer<typeof insertResourceCategorySchema>
export type UpdateResourceCategory = z.infer<typeof updateResourceCategorySchema>
export type ResourceCategory = typeof resourceCategories.$inferSelect

// Resources
export const insertResourceSchema = createCoercedInsertSchema(resources)
export const updateResourceSchema = createCoercedInsertSchema(resources).partial()
export type InsertResource = z.infer<typeof insertResourceSchema>
export type UpdateResource = z.infer<typeof updateResourceSchema>
export type Resource = typeof resources.$inferSelect

// Cover Images
export const insertCoverImageSchema = createCoercedInsertSchema(coverImages).pick({
	userId: true,
	userName: true,
	platform: true,
	style: true,
	ratio: true,
	size: true,
	prompt: true,
	inputText: true,
	imageUrl: true,
	isPublic: true,
})
export const updateCoverImageSchema = createCoercedInsertSchema(coverImages).partial()
export type InsertCoverImage = z.infer<typeof insertCoverImageSchema>
export type UpdateCoverImage = z.infer<typeof updateCoverImageSchema>
export type CoverImage = typeof coverImages.$inferSelect

// AI Images
export const insertAiImageSchema = createCoercedInsertSchema(aiImages).pick({
	userId: true,
	userName: true,
	themeContent: true,
	style: true,
	detailRequirement: true,
	quality: true,
	lighting: true,
	ratio: true,
	size: true,
	prompt: true,
	imageUrl: true,
	isPublic: true,
})
export const updateAiImageSchema = createCoercedInsertSchema(aiImages).partial()
export type InsertAiImage = z.infer<typeof insertAiImageSchema>
export type UpdateAiImage = z.infer<typeof updateAiImageSchema>
export type AiImage = typeof aiImages.$inferSelect
