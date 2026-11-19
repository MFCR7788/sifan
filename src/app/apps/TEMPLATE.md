# 新增一个应用模块（搭积木）

> 全站应用模块由 `src/lib/apps/registry.ts` 统一登记。
> 新增模块**不需要改动框架任何代码**，只需两步。

---

## 第 1 步：在注册中心加一条记录

编辑 `src/lib/apps/registry.ts`：

```ts
export const APP_MODULES: AppModule[] = [
  // …已有模块…
  {
    id: 'my-new-app',              // 唯一标识，英文短横线
    name: '我的新应用',              // 模块名
    shortDesc: '一句话说明，展示在卡片上',
    icon: '🚀',                     // 图标
    href: '/my-new-app',            // 入口路由
    category: '工具',               // 经营 | 营销 | 内容 | 工具 | 系统
    requiredRole: 'member',         // public | member | admin
    status: 'beta',                 // live | beta | coming
    version: '1.0',
    tags: ['标签一', '标签二'],
  },
];
```

**立即生效**：应用中心卡片、分类筛选、权限过滤会自动纳入新模块。

---

## 第 2 步：写页面

新建 `src/app/my-new-app/page.tsx`：

```tsx
'use client';

import LunaiShell from '@/components/lunai/LunaiShell';
import { LunaiHero, LunaiSection } from '@/components/lunai/Blocks';

export default function MyNewAppPage() {
  return (
    <LunaiShell>
      <LunaiHero
        eyebrow="My New App"
        title="我的新应用"
        description="模块说明"
      />
      <LunaiSection>
        {/* 业务内容 */}
      </LunaiSection>
    </LunaiShell>
  );
}
```

---

## 可用组件清单

| 组件 | 用途 |
|---|---|
| `LunaiShell` | 页面外壳（品牌导航 + 页脚 + 深色底） |
| `LunaiHero` | 顶部大标题区 |
| `LunaiSection` | 内容区块容器 |
| `LunaiPageHeader` | 区块标题 |
| `LunaiCard` | 浅色卡片（放表单/表格） |
| `LunaiFeatureCard` | 深色特性卡 |
| `LunaiLightCard` | 浅色长文卡片 |
| `Reveal` | 滚动淡入显现 |
| `BrandMark` | 官方 LOGO |
| `AppCenter` | 应用中心（自动聚合所有模块） |

---

## 权限说明

| requiredRole | 未登录 | 普通会员 | 管理员 |
|---|---|---|---|
| `public` | ✅ 可见可用 | ✅ | ✅ |
| `member` | 🔒 需登录 | ✅ | ✅ |
| `admin` | 🔒 需登录 | 🔒 需管理员 | ✅ |

**重要**：前端过滤只是体验层（控制卡片显示）。
**服务端接口必须自行鉴权**，否则数据仍会泄露。参考 `src/lib/admin-auth.ts` 的 `requireAdmin`：

```ts
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;   // 401 未登录 / 403 无权限
  // …业务逻辑…
}
```

---

## 加进导航栏（可选）

`src/components/lunai/LunaiNav.tsx` 的 `navItems` 增加：

```ts
{ name: '应用中心', href: '/apps' },
```
