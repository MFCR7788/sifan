'use client';

import Link from 'next/link';
import LunaiShell from '@/components/lunai/LunaiShell';
import { LunaiHero, LunaiSection } from '@/components/lunai/Blocks';
import Reveal from '@/components/lunai/Reveal';

/**
 * 渠道合作中心（规划中）
 *
 * 这是「积木式应用层」的一个占位模块：注册表里已登记，
 * 页面先落地，后续补齐业务能力即可上线，无需改动框架。
 */
export default function PartnerPage() {
  const planned = [
    { t: '区域公司协同', d: '区域负责人、门店督导、内容运营三条线的在线协作与任务派发' },
    { t: '开店进度看板', d: '样板店 → 区域公司 → 省内加密 → 跨省复制，四阶段进度可视' },
    { t: '渠道方数据', d: '区域销量、库存周转、团购核销率按区域下钻' },
    { t: '品牌露出授权', d: '书面授权状态与投放口径统一管理' },
  ];

  return (
    <LunaiShell>
      <LunaiHero
        eyebrow="Partner Hub"
        title={
          <>
            渠道合作中心
            
            <span className="mt-2.5 block text-[0.38em] font-normal tracking-[0.05em] text-mist/45">
              建设中
            </span>
          </>
        }
        description="面向区域公司与店中店合作方的在线协同空间：任务、进度、数据与品牌授权统一在一个地方。当前处于规划阶段，功能将分批上线。"
      >
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-light to-gold px-8 py-3.5 text-sm font-semibold tracking-wide text-ink transition-shadow duration-300 hover:shadow-[0_0_36px_-8px_rgba(200,169,106,0.6)]"
        >
          洽谈合作：400-0678-558
        </Link>
      </LunaiHero>

      <LunaiSection tone="ink2">
        <Reveal>
          <div className="flex items-center gap-4">
            <h2 className="lunai-serif text-xl text-snow">规划中的能力</h2>
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {planned.map((p, i) => (
            <Reveal key={p.t} delay={i * 90}>
              <article className="relative h-full rounded-xl border border-white/10 bg-ink-3/40 p-7">
                <div className="flex items-start gap-4">
                  <span className="lunai-num mt-1 text-xs text-gold/55">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="lunai-serif text-base text-snow">{p.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-mist/70">
                      {p.d}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-12">
          <div className="rounded-xl border border-gold/20 bg-gradient-to-r from-gold/[0.07] to-transparent p-7">
            <p className="lunai-serif text-lg text-snow">
              这是一块已经留好位置的积木
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist/75">
              模块已在应用中心登记，功能补齐后即可直接上架，无需改动导航、权限与列表逻辑。
            </p>
          </div>
        </Reveal>
      </LunaiSection>
    </LunaiShell>
  );
}
