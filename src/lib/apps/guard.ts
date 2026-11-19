import type { AppModule, AppRole } from './types';

/**
 * 应用模块的前端可见性过滤
 *
 * 与服务端鉴权（requireAdmin）配合：
 *   前端 —— 决定卡片是否展示、入口是否可点（体验层）
 *   服务端 —— 决定接口能否读写数据（安全层）
 * 前端过滤只是体验优化，**不能替代服务端鉴权**。
 */

export interface ViewerContext {
  /** 是否已登录 */
  isAuthenticated: boolean;
  /** 是否为管理员 */
  isAdmin: boolean;
}

/** 角色等级：public(0) < member(1) < admin(2) */
const ROLE_LEVEL: Record<AppRole, number> = {
  public: 0,
  member: 1,
  admin: 2,
};

/** 当前访问者能否访问该模块 */
export function canAccess(module: AppModule, viewer: ViewerContext): boolean {
  const need = ROLE_LEVEL[module.requiredRole];

  if (need === ROLE_LEVEL.public) return true;
  if (!viewer.isAuthenticated) return false;
  if (need === ROLE_LEVEL.admin) return viewer.isAdmin;

  return true;
}

/** 过滤出可访问的模块 */
export function visibleModules(
  modules: AppModule[],
  viewer: ViewerContext
): AppModule[] {
  return modules.filter((m) => canAccess(m, viewer));
}

/** 按可见性分三档：可用 / 需登录 / 需管理员 */
export function classifyModules(
  modules: AppModule[],
  viewer: ViewerContext
): { accessible: AppModule[]; needLogin: AppModule[]; needAdmin: AppModule[] } {
  const accessible: AppModule[] = [];
  const needLogin: AppModule[] = [];
  const needAdmin: AppModule[] = [];

  for (const m of modules) {
    if (canAccess(m, viewer)) {
      accessible.push(m);
    } else if (m.requiredRole === 'admin') {
      needAdmin.push(m);
    } else {
      needLogin.push(m);
    }
  }

  return { accessible, needLogin, needAdmin };
}
