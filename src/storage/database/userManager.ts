import { eq, and, SQL, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { users, insertUserSchema, updateUserSchema, loginSchema } from "./shared/schema";
import type { User, InsertUser, UpdateUser } from "./shared/schema";
import bcrypt from "bcrypt";

export class UserManager {
	async createUser(data: InsertUser): Promise<Omit<User, 'password'>> {
		const db = await getDb();
		const validated = insertUserSchema.parse(data);
		const hashedPassword = await bcrypt.hash(validated.password, 10);
		const emailValue = validated.email && validated.email.trim() ? validated.email.trim() : null;

		const [user] = await db.insert(users).values({
			...validated,
			email: emailValue,
			password: hashedPassword,
		}).returning();

		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async createUserWithPhone(phone: string): Promise<Omit<User, 'password'>> {
		const db = await getDb();

		const [user] = await db.insert(users).values({
			phone,
			name: phone,
			password: '',
			isActive: true,
		}).returning();

		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async getUserByPhone(phone: string): Promise<User | null> {
		const db = await getDb();
		const [user] = await db.select().from(users).where(eq(users.phone, phone));
		return user || null;
	}

	async getUserByEmail(email: string): Promise<User | null> {
		if (!email) return null;
		const db = await getDb();
		const [user] = await db.select().from(users).where(eq(users.email, email));
		return user || null;
	}

	async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
		const db = await getDb();
		const [user] = await db.select().from(users).where(eq(users.id, id));
		if (!user) return null;
		
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async login(phone: string, password: string): Promise<Omit<User, 'password'> | null> {
		const loginData = loginSchema.parse({ phone, password });
		const user = await this.getUserByPhone(loginData.phone);
		if (!user) return null;

		const isValidPassword = await bcrypt.compare(loginData.password, user.password);
		if (!isValidPassword) return null;

		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async isPhoneExists(phone: string, excludeUserId?: string): Promise<boolean> {
		const db = await getDb();
		const conditions = excludeUserId
			? and(eq(users.phone, phone), sql`${users.id} != ${excludeUserId}`)
			: eq(users.phone, phone);
		
		const [user] = await db.select().from(users).where(conditions as SQL);
		return !!user;
	}

	async updateUser(id: string, data: UpdateUser): Promise<Omit<User, 'password'> | null> {
		const db = await getDb();
		const validated = updateUserSchema.parse(data);
		
		const [user] = await db
			.update(users)
			.set({ ...validated, updatedAt: new Date().toISOString() })
			.where(eq(users.id, id))
			.returning();
			
		if (!user) return null;
		
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async changePassword(id: string, oldPassword: string, newPassword: string): Promise<boolean> {
		const db = await getDb();
		
		const [user] = await db.select().from(users).where(eq(users.id, id));
		if (!user) return false;

		const isValidPassword = await bcrypt.compare(oldPassword, user.password);
		if (!isValidPassword) return false;

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		
		const result = await db
			.update(users)
			.set({ password: hashedPassword, updatedAt: new Date().toISOString() })
			.where(eq(users.id, id));
			
		return (result.rowCount ?? 0) > 0;
	}

	async setPassword(id: string, password: string): Promise<boolean> {
		const db = await getDb();
		
		const hashedPassword = await bcrypt.hash(password, 10);
		
		const result = await db
			.update(users)
			.set({ password: hashedPassword, updatedAt: new Date().toISOString() })
			.where(eq(users.id, id));
			
		return (result.rowCount ?? 0) > 0;
	}

	async deleteUser(id: string): Promise<boolean> {
		const db = await getDb();
		const result = await db.delete(users).where(eq(users.id, id));
		return (result.rowCount ?? 0) > 0;
	}
}

export const userManager = new UserManager();