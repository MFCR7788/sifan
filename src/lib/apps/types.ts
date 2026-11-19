/**
 * 应用层「积木」类型定义
 *
 * 设计原则：一个应用 = 一条注册记录 + 一个页面目录。
 * 新增应用不需要改动任何框架代码，只需：
 *   1) 在 registry.ts 里加一条 AppModule
 *   2) 建 src/app/<模块路由>/page.tsx
 * 应用中心、导航、权限过滤会自动纳入新模块。
 */

export type AppStatus = 'live' | 'beta' | 'coming';

export type AppCategory = '经营' | '营销' | '内容' | '工具' | '系统';

export type AppRole = 'admin' | 'member' | 'public';

export interface AppModule {
  /** 唯一标识（英文短横线），用于路由与埋点 */
  id: string;
  /** 模块名 */
  name: string;
  /** 一句话说明，展示在卡片上 */
  shortDesc: string;
  /** 图标（emoji 或短字符），用于卡片视觉 */
  icon: string;
  /** 入口路由 */
  href: string;
  /** 所属分类 */
  category: AppCategory;
  /** 访问所需角色 */
  requiredRole: AppRole;
  /** 生命周期状态 */
  status: AppStatus;
  /** 版本号 */
  version?: string;
  /** 标签，用于卡片副标题 */
  tags?: string[];
  /** 是否外部链接（新窗口打开） */
  external?: boolean;
}

/** 模块状态的中文标签与配色 */
export const APP_STATUS_META: Record<
  AppStatus,
  { label: string; className: string }
> = {
  live: { label: '已上线', className: 'border-gold/30 text-gold/85 bg-gold/[0.08]' },
  beta: { label: '公测中', className: 'border-sky-400/30 text-sky-300/90 bg-sky-400/[0.08]' },
  coming: { label: '规划中', className: 'border-white/12 text-mist/55 bg-white/[0.04]' },
};

/** 分类的展示顺序 */
export const APP_CATEGORY_ORDER: AppCategory[] = [
  '经营',
  '营销',
  '内容',
  '工具',
  '系统',
];
