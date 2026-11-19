'use client';

import Image from 'next/image';
import Link from 'next/link';

/**
 * 路耐品牌标识
 *
 * 使用官方 LOGO（LN 图形 + 「路耐 / LUNAI」字标 + ® 注册标记），
 * 提供三套配色以适配不同底色：
 *   gold  —— 深墨蓝底（默认，与品牌主色 #c8a96a 一致）
 *   white —— 深底强调 / 特殊场景
 *   dark  —— 浅色底（白卡片、浅色区块内）
 *
 * 原始 LOGO 为黑字白底，已去白底并生成透明 PNG（public/brand/）。
 */
export default function BrandMark({
  size = 'md',
  variant = 'gold',
  href = '/',
  priority = false,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 配色版本 */
  variant?: 'gold' | 'white' | 'dark';
  /** 传 null 则不渲染为链接 */
  href?: string | null;
  priority?: boolean;
  className?: string;
}) {
  // 官方 LOGO 原始比例 1172 : 448 ≈ 2.616
  const height = { sm: 30, md: 40, lg: 52, xl: 64 }[size];
  const width = Math.round(height * 2.616);

  const src = {
    gold: '/brand/lunai-logo-gold.png',
    white: '/brand/lunai-logo-white.png',
    dark: '/brand/lunai-logo-dark.png',
  }[variant];

  const mark = (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ height, width }}
    >
      <Image
        src={src}
        alt="路耐 LUNAI"
        width={width}
        height={height}
        priority={priority}
        className="h-full w-full object-contain"
        sizes={`${width}px`}
      />
    </span>
  );

  if (!href) return mark;

  return (
    <Link
      href={href}
      className="inline-flex items-center transition-opacity duration-300 hover:opacity-80"
      aria-label="路耐 LUNAI 首页"
    >
      {mark}
    </Link>
  );
}
