import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { users, insertUserSchema, updateUserSchema, loginSchema } from "./shared/schema";
import type { User, InsertUser, UpdateUser, LoginData } from "./shared/schema";
import bcrypt from "bcrypt";

export class UserManager {
	/**
	 * 创建用户（注册）
	 */
	async createUser(data: InsertUser): Promise<Omit<User, 'password'>> {
		const db = await getDb();
		const validated = insertUserSchema.parse(data);
		
		// 加密密码
		const hashedPassword = await bcrypt.hash(validated.password, 10);
		
		const [user] = await db.insert(users).values({
			...validated,
			password: hashedPassword,
		}).returning();
		
		// 返回用户信息时不包含密码
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	/**
	 * 根据邮箱查找用户
	 */
	async getUserByEmail(email: string): Promise<User | null> {
		const db = await getDb();
		const [user] = await db.select().from(users).where(eq(users.email, email));
		return user || null;
	}

	/**
	 * 根据ID查找用户
	 */
	async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
		const db = await getDb();
		const [user] = await db.select().from(users).where(eq(users.id, id));
		if (!user) return null;
		
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	/**
	 * 用户登录验证
	 */
	async login(email: string, password: string): Promise<Omit<User, 'password'> | null> {
		const loginData = loginSchema.parse({ email, password });
		
		const user = await this.getUserByEmail(loginData.email);
		if (!user) {
			return null;
		}

		// 验证密码
		const isValidPassword = await bcrypt.compare(loginData.password, user.password);
		if (!isValidPassword) {
			return null;
		}

		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	/**
	 * 更新用户信息
	 */
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

	/**
	 * 更改密码
	 */
	async changePassword(id: string, oldPassword: string, newPassword: string): Promise<boolean> {
		const db = await getDb();
		
		const [user] = await db.select().from(users).where(eq(users.id, id));
		if (!user) return false;

		// 验证旧密码
		const isValidPassword = await bcrypt.compare(oldPassword, user.password);
		if (!isValidPassword) return false;

		// 加密新密码
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		
		const result = await db
			.update(users)
			.set({ 
				password: hashedPassword, 
				updatedAt: new Date().toISOString()
			})
			.where(eq(users.id, id));
			
		return (result.rowCount ?? 0) > 0;
	}

	/**
	 * 删除用户
	 */
	async deleteUser(id: string): Promise<boolean> {
		const db = await getDb();
		const result = await db.delete(users).where(eq(users.id, id));
		return (result.rowCount ?? 0) > 0;
	}
}

export const userManager = new UserManager();
