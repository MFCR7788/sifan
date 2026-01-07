import { pgTable, varchar, text, timestamp, boolean, index, integer, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// Orders table for custom solution orders
export const orders = pgTable(
	"orders",
	{
		id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
		orderNumber: varchar({ length: 32 }).notNull().unique(),
		customerName: varchar({ length: 128 }).notNull(),
		customerPhone: varchar({ length: 20 }).notNull(),
		customerEmail: varchar({ length: 255 }).notNull(),
		platform: varchar({ length: 50 }).notNull(),
		serviceLevel: varchar({ length: 50 }),
		selectedFeatures: jsonb().notNull(),
		valueServices: jsonb(),
		totalPrice: integer().notNull(),
		monthlyFee: integer().default(0),
		status: varchar({ length: 50 }).default("pending").notNull(), // pending, paid, cancelled, completed
		paymentMethod: varchar({ length: 50 }), // wechat, alipay, bank_transfer
		paymentTime: timestamp("payment_time", { withTimezone: true, mode: 'string' }),
		notes: text(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	},
	(table) => ({
		orderNumberIdx: index("orders_order_number_idx").on(table.orderNumber),
		statusIdx: index("orders_status_idx").on(table.status),
	})
);

export const contactMessages = pgTable("contact_messages", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	phone: varchar({ length: 20 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

// Users table
export const users = pgTable(
	"users",
	{
		id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
		email: varchar({ length: 255 }).notNull().unique(),
		name: varchar({ length: 128 }).notNull(),
		password: text().notNull(),
		phone: varchar({ length: 20 }),
		avatar: varchar({ length: 500 }),
		isActive: boolean().default(true).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	},
	(table) => ({
		emailIdx: index("users_email_idx").on(table.email),
	})
);

// Zod schemas for validation
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
	coerce: { date: true },
});

export const insertContactMessageSchema = createCoercedInsertSchema(contactMessages).pick({
	name: true,
	phone: true,
	email: true,
	message: true,
});

export const insertOrderSchema = createCoercedInsertSchema(orders).pick({
	customerName: true,
	customerPhone: true,
	customerEmail: true,
	platform: true,
	serviceLevel: true,
	selectedFeatures: true,
	valueServices: true,
	totalPrice: true,
	monthlyFee: true,
	notes: true,
});

export const insertUserSchema = createCoercedInsertSchema(users).pick({
	email: true,
	name: true,
	password: true,
	phone: true,
	avatar: true,
});

export const updateUserSchema = createCoercedInsertSchema(users)
	.pick({
		name: true,
		phone: true,
		avatar: true,
		isActive: true,
	})
	.partial();

export const loginSchema = z.object({
	email: z.string().email("请输入有效的邮箱地址"),
	password: z.string().min(6, "密码至少6位"),
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// API返回的订单数据类型（使用驼峰命名）
export type OrderData = {
	id: string;
	orderNumber: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	platform: string;
	serviceLevel: string | null;
	selectedFeatures: any[];
	valueServices: any[];
	totalPrice: number;
	monthlyFee: number;
	status: string;
	paymentMethod: string | null;
	paymentTime: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string | null;
};
