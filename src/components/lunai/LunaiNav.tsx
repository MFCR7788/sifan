'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BrandMark from './BrandMark';

const navItems = [
  { name: '关于路耐', href: '/about' },
  { name: '运营模式', href: '/solution' },
  { name: '资质背书', href: '/qualifications' },
  { name: '加盟合作', href: '/franchise' },
  { name: '联系我们', href: '/contact' },
];

/**
 * 路耐官网导航
 * 与原 Navigation（SaaS 业务系统导航）并存，互不影响：
 * 官网层用本组件，SaaS 页面继续用原组件，登录态与充值等逻辑零风险。
 */
export default function LunaiNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-white/10 bg-ink/92 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 sm:px-10 md:px-16">
          {/* 官方 LOGO：深墨蓝底使用香槟金版本，与品牌主色统一 */}
          <BrandMark size="md" variant="gold" priority />

          <nav className="hidden items-center gap-9 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm tracking-wide text-mist/80 transition-colors duration-300 hover:text-gold after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-5 py-2 text-sm tracking-wide text-snow/85 transition-colors hover:border-gold/50 hover:text-gold"
            >
              系统登录
            </Link>
            <Link
              href="/contact"
              className="lunai-num rounded-full bg-gradient-to-r from-gold-light to-gold px-6 py-2.5 text-sm font-semibold tracking-wide text-ink transition-shadow duration-300 hover:shadow-[0_0_30px_-8px_rgba(200,169,106,0.7)]"
            >
              400-0678-558
            </Link>
          </nav>

          {/* 移动端菜单按钮 */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-snow md:hidden"
            aria-label={open ? '关闭菜单' : '打开菜单'}
            aria-expanded={open}
          >
            <span className="relative block h-[10px] w-[18px]">
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-all duration-300 ${
                  open ? 'top-1 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-all duration-300 ${
                  open ? 'top-1 -rotate-45' : 'top-2'
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* 移动端抽屉 */}
      <div
        className={`fixed inset-0 z-40 bg-ink/98 backdrop-blur-xl transition-opacity duration-300 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col px-6 pb-10 pt-[92px]">
          <div className="mb-8 border-b border-white/10 pb-8">
            <BrandMark size="lg" variant="gold" />
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="lunai-serif border-b border-white/10 py-5 text-2xl text-snow transition-colors hover:text-gold"
                style={{
                  transitionDelay: `${i * 40}ms`,
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateY(0)' : 'translateY(10px)',
                  transition:
                    'opacity 400ms ease, transform 400ms ease, color 200ms ease',
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block rounded-full border border-white/15 px-6 py-3.5 text-center text-sm text-snow/85"
            >
              系统登录
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="lunai-num block rounded-full bg-gradient-to-r from-gold-light to-gold px-6 py-3.5 text-center text-sm font-semibold text-ink"
            >
              400-0678-558
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
