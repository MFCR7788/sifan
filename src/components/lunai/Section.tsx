'use client';

import type { ReactNode } from 'react';
import Reveal from './Reveal';

/**
 * 区块标题：编号 + 英文小标 + 中文大标题 + 描述
 * 全站统一的标题节奏，是「高端感」的主要来源。
 */
export default function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
}) {
  const centered = align === 'center';
  return (
    <Reveal className={`${centered ? 'text-center' : ''} scroll-mt-28`}>
      <div
        className={`flex items-center gap-4 ${centered ? 'justify-center' : ''}`}
      >
        {index && (
          <span className="lunai-num text-xs tracking-[0.35em] text-gold/80">
            {index}
          </span>
        )}
        {index && eyebrow && (
          <span className="h-px w-10 bg-gold/40" aria-hidden="true" />
        )}
        {eyebrow && (
          <span className="text-xs uppercase tracking-[0.42em] text-mist/70">
            {eyebrow}
          </span>
        )}
      </div>

      <h2
        className={`lunai-serif mt-5 text-balance text-[clamp(2rem,5vw,3.75rem)] leading-[1.18] text-snow tracking-tight ${
          centered ? 'mx-auto max-w-4xl' : 'max-w-4xl'
        }`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mt-6 text-base md:text-lg leading-relaxed text-mist/85 ${
            centered ? 'mx-auto max-w-2xl' : 'max-w-2xl'
          }`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
