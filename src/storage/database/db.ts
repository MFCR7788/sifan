import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema';

// 获取数据库连接字符串
const connectionString =
  process.env.PGDATABASE_URL || process.env.DATABASE_URL || '';

// 创建连接池
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// 创建 Drizzle 实例
export const db = drizzle(client, { schema });

// 导出类型
export * from './shared/schema';
