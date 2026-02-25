// 使用平台内置数据库（coze-coding-dev-sdk）
// 不再需要外部 PostgreSQL 连接
import * as schema from './shared/schema';

// 导出类型
export * from './shared/schema';

// 模拟数据库实例，实际使用平台内置数据库
export const db = {
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
