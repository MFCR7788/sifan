// 使用平台内置数据库（coze-coding-dev-sdk）
// 在生产环境中使用真实数据库连接，开发环境使用模拟数据
import * as schema from './shared/schema';
import { getDb } from 'coze-coding-dev-sdk';

// 导出类型
export * from './shared/schema';

// 模拟数据库实例，用于开发环境
const mockDb = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve([])
      })
    })
  }),
  insert: () => ({
    values: () => ({
      returning: () => Promise.resolve([])
    })
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: () => Promise.resolve([])
      })
    })
  }),
  delete: () => ({
    from: () => ({
      where: () => Promise.resolve({ rowCount: 0 })
    })
  })
} as any;

// 根据环境变量决定使用真实数据库还是模拟数据库
export let db: any;

if (process.env.NODE_ENV === 'production') {
  // 生产环境：使用真实数据库连接
  db = getDb();
} else {
  // 开发环境：使用模拟数据库
  db = mockDb;
}
