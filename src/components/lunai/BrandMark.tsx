'use client';

import Link from 'next/link';

/**
 * 「耐」字超级符号 + LUNAI 字标
 * PDF 明确提出「耐」字超级符号贯穿两个系列，是品牌资产的核心载体。
 */
export default function BrandMark({
  size = 'md',
  dark = true,
  withText = true,
  href = '/',
}: {
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
  withText?: boolean;
  href?: string | null;
}) {
  const box = { sm: 'h-8 w-8 text-base', md: 'h-10 w-10 text-xl', lg: 'h-14 w-14 text-3xl' }[size];
  const word = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }[size];
  const track = { sm: 'tracking-[0.3em]', md: 'tracking-[0.34em]', lg: 'tracking-[0.38em]' }[size];

  const inner = (
    <span className="flex items-center gap-3">
      <span
        className={`${box} lunai-serif relative flex shrink-0 items-center justify-center rounded-sm border border-gold/45 bg-gradient-to-br from-gold/22 to-transparent text-gold`}
        aria-hidden="true"
      >
        耐
      </span>
      {withText && (
        <span className="flex flex-col leading-none">
          <span
            className={`${word} ${track} font-semibold ${
              dark ? 'text-snow' : 'text-ink'
            }`}
          >
            路耐
          </span>
          <span
            className={`mt-1 text-[0.55rem] ${track} ${
              dark ? 'text-gold/70' : 'text-gold-dim'
            }`}
          >
            LUNAI
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex transition-opacity hover:opacity-80">
      {inner}
    </Link>
  );
}
