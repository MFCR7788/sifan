import { eq } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  contactMessages,
  insertContactMessageSchema,
  type ContactMessage,
  type InsertContactMessage,
} from "./shared/schema";

export class ContactManager {
  /**
   * 创建留言
   */
  async createMessage(data: InsertContactMessage): Promise<ContactMessage> {
    const db = await getDb();
    const validated = insertContactMessageSchema.parse(data);
    const [message] = await db.insert(contactMessages).values(validated).returning();
    return message;
  }

  /**
   * 获取所有留言
   */
  async getAllMessages(limit: number = 100, offset: number = 0): Promise<ContactMessage[]> {
    const db = await getDb();
    return db
      .select()
      .from(contactMessages)
      .orderBy(contactMessages.createdAt)
      .limit(limit)
      .offset(offset);
  }

  /**
   * 根据ID获取留言
   */
  async getMessageById(id: string): Promise<ContactMessage | null> {
    const db = await getDb();
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message || null;
  }

  /**
   * 删除留言
   */
  async deleteMessage(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const contactManager = new ContactManager();
