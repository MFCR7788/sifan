'use client';

import type { ReactNode } from 'react';
import Reveal from './Reveal';

/**
 * 叙事页通用顶部 Hero：深色渐层 + 网格纹理 + 品牌标识
 */
export function LunaiHero({
  eyebrow,
  title,
  description,
  children,
  compact = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden bg-ink ${
        compact ? 'pb-16 pt-32 md:pb-20 md:pt-40' : 'pb-20 pt-32 md:pb-28 md:pt-44'
      }`}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(110% 80% at 50% 0%, #16233c 0%, #0d1526 48%, #080d18 100%)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 lunai-grid opacity-60" aria-hidden="true" />
      <div
        className="absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(200,169,106,0.12) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        <div className="max-w-4xl">
          {eyebrow && (
            <Reveal className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold/45" />
              <span className="text-xs uppercase tracking-[0.4em] text-gold/75">
                {eyebrow}
              </span>
            </Reveal>
          )}
          <Reveal delay={90}>
            <h1 className="lunai-serif mt-6 text-balance text-[clamp(2.25rem,6vw,4.25rem)] leading-[1.15] text-snow">
              {title}
            </h1>
          </Reveal>
          {description && (
            <Reveal delay={160}>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-mist/85 md:text-lg md:leading-loose">
                {description}
              </p>
            </Reveal>
          )}
          {children && (
            <Reveal delay={220}>
              <div className="mt-10">{children}</div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * 通用区块容器：统一的间距与最大宽度
 */
export function LunaiSection({
  children,
  className = '',
  tone = 'ink',
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: 'ink' | 'ink2';
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative py-20 md:py-28 ${
        tone === 'ink2' ? 'bg-ink-2' : 'bg-ink'
      } ${className}`}
    >
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        {children}
      </div>
    </section>
  );
}

/**
 * 通用数据卡：编号 + 标题 + 描述，用于清单型内容
 */
export function LunaiFeatureCard({
  index,
  title,
  description,
  points,
  className = '',
}: {
  index?: string;
  title: ReactNode;
  description?: ReactNode;
  points?: string[];
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <article className="group relative h-full rounded-xl border border-white/10 bg-ink-3/40 p-7 transition-all duration-500 hover:border-gold/30 md:p-8">
        <span className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gold/70 transition-transform duration-500 group-hover:scale-x-100" />
        {index && (
          <div className="lunai-num text-xs tracking-[0.32em] text-gold/55">
            {index}
          </div>
        )}
        <h3 className="lunai-serif mt-4 text-lg leading-snug text-snow">
          {title}
        </h3>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-mist/95">{description}</p>
        )}
        {points && points.length > 0 && (
          <ul className="mt-5 space-y-2 border-t border-white/10 pt-5">
            {points.map((p) => (
              <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-mist/92">
                <span className="mt-[0.6rem] h-px w-2.5 shrink-0 bg-gold/55" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
      </article>
    </Reveal>
  );
}

/**
 * 浅色长文卡片：承载表格、条款、正文说明
 */
export function LunaiLightCard({
  children,
  className = '',
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
}) {
  return (
    <Reveal className={className}>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white">
        {title && (
          <div className="border-b border-gray-100 px-7 py-5">
            <h3 className="lunai-serif text-lg text-gray-900">{title}</h3>
          </div>
        )}
        <div className="px-7 py-7 text-sm leading-relaxed text-gray-700 md:px-9">
          {children}
        </div>
      </div>
    </Reveal>
  );
}
