'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { APP_MODULES, groupByCategory } from '@/lib/apps/registry';
import { classifyModules } from '@/lib/apps/guard';
import { APP_STATUS_META, APP_CATEGORY_ORDER, type AppModule } from '@/lib/apps/types';
import Reveal from '@/components/lunai/Reveal';

/**
 * 应用中心 —— 公司应用层的统一入口
 *
 * 所有模块从 registry 读取，按当前访问者角色过滤；
 * 新增模块只需在 registry 加一条记录，这里自动出现。
 */

function ModuleCard({
  module,
  locked,
  lockHint,
}: {
  module: AppModule;
  locked: boolean;
  lockHint?: string;
}) {
  const status = APP_STATUS_META[module.status];

  const inner = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-xl transition-colors duration-500 ${
            locked
              ? 'border-white/10 bg-white/[0.04] text-mist/35'
              : 'border-gold/25 bg-gold/[0.07] text-gold'
          }`}
        >
          {module.icon}
        </span>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.62rem] tracking-[0.14em] ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <h3
        className={`lunai-serif mt-5 text-lg leading-snug transition-colors duration-300 ${
          locked ? 'text-mist/55' : 'text-snow group-hover:text-gold-light'
        }`}
      >
        {module.name}
      </h3>

      <p
        className={`mt-2.5 text-sm leading-relaxed ${
          locked ? 'text-mist/40' : 'text-mist/75'
        }`}
      >
        {module.shortDesc}
      </p>

      {module.tags && module.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {module.tags.map((t) => (
            <span
              key={t}
              className={`rounded-md border px-2 py-0.5 text-[0.68rem] ${
                locked
                  ? 'border-white/8 text-mist/35'
                  : 'border-white/10 text-mist/60'
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4">
        <span className="lunai-num text-[0.68rem] tracking-wide text-mist/40">
          {module.version ? `v${module.version}` : module.category}
        </span>
        <span
          className={`text-xs tracking-wide transition-colors duration-300 ${
            locked ? 'text-mist/30' : 'text-gold/70 group-hover:text-gold'
          }`}
        >
          {locked ? lockHint || '需授权' : '进入 →'}
        </span>
      </div>
    </>
  );

  if (locked) {
    return (
      <div className="group relative h-full rounded-xl border border-white/[0.07] bg-ink-3/20 p-7">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={module.href}
      target={module.external ? '_blank' : undefined}
      rel={module.external ? 'noreferrer' : undefined}
      className="group relative block h-full rounded-xl border border-white/10 bg-ink-3/40 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold/35 hover:bg-ink-3/70"
    >
      <span className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gold/70 transition-transform duration-500 group-hover:scale-x-100" />
      {inner}
    </Link>
  );
}

export default function AppCenter() {
  const { user, isLoading } = useAuth();
  const [category, setCategory] = useState<string>('全部');

  const viewer = useMemo(
    () => ({ isAuthenticated: !!user, isAdmin: !!user?.isAdmin }),
    [user]
  );

  const { accessible, needLogin, needAdmin } = useMemo(
    () => classifyModules(APP_MODULES, viewer),
    [viewer]
  );

  const groups = useMemo(
    () => groupByCategory(accessible).sort(
      (a, b) =>
        APP_CATEGORY_ORDER.indexOf(a.category as never) -
        APP_CATEGORY_ORDER.indexOf(b.category as never)
    ),
    [accessible]
  );

  const categories = ['全部', ...APP_CATEGORY_ORDER];
  const lockedCount = needLogin.length + needAdmin.length;

  return (
    <div>
      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-2 text-xs tracking-[0.16em] transition-all duration-300 ${
              category === c
                ? 'border-gold/50 bg-gold/[0.12] text-gold'
                : 'border-white/10 text-mist/60 hover:border-white/20 hover:text-mist/85'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 分组展示 */}
      <div className="mt-12 space-y-14">
        {groups
          .filter((g) => category === '全部' || g.category === category)
          .map((group) => (
            <Reveal key={group.category}>
              <div className="flex items-center gap-4">
                <h2 className="lunai-serif text-xl text-snow">{group.category}</h2>
                <span className="lunai-num text-xs text-mist/40">
                  {group.items.length}
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.items.map((m) => (
                  <ModuleCard key={m.id} module={m} locked={false} />
                ))}
              </div>
            </Reveal>
          ))}
      </div>

      {/* 锁定模块 */}
      {category === '全部' && lockedCount > 0 && (
        <Reveal delay={160}>
          <div className="mt-16">
            <div className="flex items-center gap-4">
              <h2 className="lunai-serif text-xl text-mist/60">需授权</h2>
              <span className="lunai-num text-xs text-mist/35">
                {lockedCount}
              </span>
              <span className="h-px flex-1 bg-white/[0.06]" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[
                ...needAdmin.map((m) => ({ m, hint: '需管理员权限' })),
                ...needLogin.map((m) => ({ m, hint: '需登录后访问' })),
              ].map(({ m, hint }) => (
                <ModuleCard key={m.id} module={m} locked lockHint={hint} />
              ))}
            </div>

            {!isLoading && !user && (
              <div className="mt-8 flex flex-col items-start gap-4 rounded-xl border border-gold/20 bg-gold/[0.05] p-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-mist/75">
                  登录后即可解锁属于你的应用模块与数据。
                </p>
                <Link
                  href="/login"
                  className="shrink-0 rounded-full bg-gradient-to-r from-gold-light to-gold px-6 py-2.5 text-sm font-semibold text-ink transition-shadow hover:shadow-[0_0_30px_-8px_rgba(200,169,106,0.6)]"
                >
                  系统登录
                </Link>
              </div>
            )}
          </div>
        </Reveal>
      )}
    </div>
  );
}
