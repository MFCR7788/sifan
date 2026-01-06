import { pgTable, varchar, text, timestamp, boolean, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"



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
