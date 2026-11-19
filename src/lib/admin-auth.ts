import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { userManager } from '@/storage/database/userManager';

/**
 * 管理端鉴权
 *
 * ⚠️ 安全说明（2026-11-19 修复）：
 *   旧实现无论是否携带凭据都返回 `isAdmin: true`，导致所有 /api/admin/*
 *   接口对未登录访客开放（可读取用户手机号、订单、会员、交易等数据）。
 *   现改为：必须携带有效身份 → 查库确认 isAdmin → 否则一律 401/403。
 */

export interface AuthedAdmin {
  id: string;
  name: string;
  isAdmin: true;
}

/**
 * 校验请求是否来自管理员。
 * 返回管理员信息；失败时返回 null（调用方负责返回 401/403）。
 */
export async function verifyAdmin(
  request: NextRequest
): Promise<AuthedAdmin | null> {
  try {
    // 1) 取身份标识：优先 header（服务端调用），其次 cookie
    let userId: string | null = request.headers.get('x-user-id');

    if (!userId) {
      const token = request.cookies.get('token')?.value;
      if (token) {
        userId = verifyToken(token)?.userId || null;
      }
    }
    if (!userId) {
      userId = request.cookies.get('userId')?.value || null;
    }

    // 2) 无任何身份标识 → 拒绝
    if (!userId) {
      return null;
    }

    // 3) 查库确认身份与管理员标记
    const user = await userManager.getUserById(userId);
    if (!user || !user.isAdmin || user.isActive === false) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      isAdmin: true,
    };
  } catch (error) {
    // 鉴权失败一律拒绝，绝不因异常而放行
    console.error('[admin-auth] 鉴权异常:', error);
    return null;
  }
}

/**
 * 路由守卫：未通过时直接返回 401/403 响应。
 * 用法：
 *   const guard = await requireAdmin(request);
 *   if (!guard.ok) return guard.response;
 */
export async function requireAdmin(request: NextRequest): Promise<
  | { ok: true; admin: AuthedAdmin }
  | { ok: false; response: NextResponse }
> {
  const admin = await verifyAdmin(request);
  if (admin) {
    return { ok: true, admin };
  }

  // 区分「未登录」与「已登录但非管理员」
  const hasIdentity =
    !!request.headers.get('x-user-id') ||
    !!request.cookies.get('token')?.value ||
    !!request.cookies.get('userId')?.value;

  return {
    ok: false,
    response: NextResponse.json(
      {
        success: false,
        error: hasIdentity ? '无管理员权限' : '请先登录',
      },
      { status: hasIdentity ? 403 : 401 }
    ),
  };
}
