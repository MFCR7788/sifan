import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { userManager } from '@/storage/database/userManager';

/**
 * 通用接口鉴权
 *
 * 与 admin-auth.ts 的 requireAdmin 配套，覆盖「登录用户即可访问」与
 * 「仅本人可访问」两类场景。
 *
 * ⚠️ 安全说明（2026-11-19）：
 *   此前多个接口未做任何鉴权校验，导致订单、客户留言、图片归属等信息
 *   可被任意访客读取；/api/init-admin 甚至允许任意人自助创建管理员。
 *   现统一由本模块把关。
 */

export interface AuthedUser {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  isAdmin: boolean;
}

/** 从请求中解析当前登录用户（不校验是否存在，仅解析身份标识） */
export async function resolveUser(
  request: NextRequest
): Promise<AuthedUser | null> {
  try {
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
    if (!userId) return null;

    const user = await userManager.getUserById(userId);
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      isAdmin: !!user.isAdmin,
    };
  } catch (error) {
    console.error('[api-auth] 解析用户异常:', error);
    return null;
  }
}

/** 守卫：必须已登录 */
export async function requireUser(request: NextRequest): Promise<
  | { ok: true; user: AuthedUser }
  | { ok: false; response: NextResponse }
> {
  const user = await resolveUser(request);
  if (user) return { ok: true, user };
  return {
    ok: false,
    response: NextResponse.json({ error: '请先登录' }, { status: 401 }),
  };
}

/**
 * 守卫：仅限本人访问（管理员可访问任意用户数据）
 * 用于「用户私有数据」类接口，如个人图片列表、个人订单。
 */
export async function requireSelfOrAdmin(
  request: NextRequest,
  targetUserId?: string | null
): Promise<
  | { ok: true; user: AuthedUser }
  | { ok: false; response: NextResponse }
> {
  const guard = await requireUser(request);
  if (!guard.ok) return guard;

  const { user } = guard;

  if (user.isAdmin) return { ok: true, user };

  // 未指定目标用户时，视为操作本人数据
  if (!targetUserId || targetUserId === user.id) {
    return { ok: true, user };
  }

  return {
    ok: false,
    response: NextResponse.json({ error: '无权访问他人数据' }, { status: 403 }),
  };
}
