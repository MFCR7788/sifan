'use client';

import type { ReactNode } from 'react';
import LunaiNav from './LunaiNav';
import LunaiFooter from './LunaiFooter';

/**
 * 路耐官网统一外壳
 *
 * 设计约定：深墨蓝页面底 + 浅色内容卡片。
 * 这样既保证全站视觉统一（深底 + 金色点缀 + 衬线标题），
 * 又让表单、表格、输入框等业务控件保持浅底深字的原有可读性，
 * 不需要为每个控件重写一套暗色样式，风险最低。
 *
 * 用法：
 *   <LunaiShell>
 *     <div className="rounded-xl bg-white p-8">…</div>   // 浅色卡片
 *   </LunaiShell>
 */
export default function LunaiShell({
  children,
  nav = true,
  footer = true,
  className = '',
  contentClassName = '',
}: {
  children: ReactNode;
  nav?: boolean;
  footer?: boolean;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className={`min-h-screen bg-ink text-snow ${className}`}>
      {nav && <LunaiNav />}
      <main className={contentClassName}>{children}</main>
      {footer && <LunaiFooter />}
    </div>
  );
}

/**
 * 页面标题区：品牌化的大标题区块
 * 供各页面统一使用，保证标题层级与间距一致。
 */
export function LunaiPageHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  actions?: ReactNode;
}) {
  const centered = align === 'center';
  return (
    <div className={`${centered ? 'text-center' : ''} scroll-mt-28`}>
      {eyebrow && (
        <div
          className={`flex items-center gap-4 ${centered ? 'justify-center' : ''}`}
        >
          <span className="h-px w-8 bg-gold/45" />
          <span className="text-xs uppercase tracking-[0.4em] text-gold/75">
            {eyebrow}
          </span>
        </div>
      )}
      <h1
        className={`lunai-serif mt-5 text-balance text-[clamp(2rem,5vw,3.5rem)] leading-[1.2] text-snow ${
          centered ? 'mx-auto max-w-4xl' : 'max-w-4xl'
        }`}
      >
        {title}
      </h1>
      {description && (
        <p
          className={`mt-6 text-base leading-relaxed text-mist/85 md:text-lg ${
            centered ? 'mx-auto max-w-2xl' : 'max-w-2xl'
          }`}
        >
          {description}
        </p>
      )}
      {actions && <div className="mt-9">{actions}</div>}
    </div>
  );
}

/**
 * 浅色内容卡片：放在深色外壳里承载表单 / 表格 / 长文
 * 保持浅底深字，保证业务控件的可读性与交互体验。
 */
export function LunaiCard({
  children,
  className = '',
  title,
  description,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border border-white/10 bg-white shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)] ${className}`}
    >
      {(title || description) && (
        <header className="border-b border-gray-100 px-7 py-6 md:px-9">
          {title && (
            <h2 className="lunai-serif text-xl text-gray-900 md:text-2xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {description}
            </p>
          )}
        </header>
      )}
      <div className="px-7 py-7 text-gray-700 md:px-9 md:py-8">{children}</div>
    </section>
  );
}
