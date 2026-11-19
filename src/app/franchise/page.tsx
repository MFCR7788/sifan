'use client';

import Link from 'next/link';
import LunaiShell from '@/components/lunai/LunaiShell';
import { LunaiHero, LunaiSection } from '@/components/lunai/Blocks';
import Reveal from '@/components/lunai/Reveal';

/**
 * 加盟合作
 * 商业条款（加盟费 / 保证金 / 首批商品 / 设备等）沿用原有口径，未作改动；
 * 品牌表述统一为「路耐 LUNAI」。
 */

const policies = [
  { title: '区域保护', desc: '保证每个加盟商的独家经营权，避免恶性竞争' },
  { title: '零加盟费', desc: '免除传统加盟费，降低创业门槛' },
  { title: '灵活合作', desc: '多种合作模式，满足不同创业需求' },
  { title: '长期支持', desc: '从开业到运营，全程专业指导' },
];

const fees = [
  { k: '加盟费', v: '免' },
  { k: '保证金', v: '¥20000' },
  { k: '首批商品', v: '¥20000' },
  { k: '收银设备', v: '¥2500 / 套' },
  { k: '系统费用', v: '按产品选择' },
  { k: '分销点（含开抖店费用，形象招牌）', v: '¥600 / 个' },
  { k: '门头形象（实体店）', v: '¥5000 / 店' },
];

const flow = [
  { no: '1', title: '咨询了解', desc: '联系客服，了解加盟详情' },
  { no: '2', title: '实地考察', desc: '参观总部，考察市场' },
  { no: '3', title: '签订合同', desc: '签署合作协议' },
  { no: '4', title: '开业运营', desc: '系统培训，正式营业' },
];

const supports = [
  { title: '品牌授权', desc: '官方授权，使用路耐 LUNAI 品牌标识' },
  { title: '培训支持', desc: '系统化培训课程，快速上手运营' },
  { title: '运营支持', desc: '专业团队指导，提升运营效率' },
  { title: '营销支持', desc: '提供营销方案和推广素材' },
];

const platforms = [
  '微信小程序商城 — 主要线上销售渠道',
  '支付宝小程序 — 扩展支付场景',
  '抖音 / 快手小店 — 社交电商引流',
  '美团 / 饿了么 — 本地生活服务',
];

const phases = [
  { title: '第一阶段：基础搭建（1-2 周）', desc: '开通小程序，完成商品上架，配置支付和物流，培训员工操作' },
  { title: '第二阶段：流量获取（2-4 周）', desc: '开展线上营销活动，利用社交媒体推广，积累首批客户，建立会员体系' },
  { title: '第三阶段：运营优化（持续）', desc: '数据分析优化，精准营销推送，提升客户体验，扩大市场份额' },
];

export default function FranchisePage() {
  return (
    <LunaiShell>
      <LunaiHero
        eyebrow="Franchise"
        title={
          <>
            加盟合作
            
            <span className="mt-2.5 block text-[0.38em] font-normal tracking-[0.05em] text-mist/72">
              一个可复制的门店模型
            </span>
          </>
        }
        description="50 ㎡ 双品类单店模型，2 人编制，错峰主推，积分闭环。对合作方而言，这是一套自带品牌力、自带货盘、自带引流能力与自带数据管理的门店单元。"
      >
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-light to-gold px-8 py-3.5 text-sm font-semibold tracking-wide text-ink transition-shadow duration-300 hover:shadow-[0_0_36px_-8px_rgba(200,169,106,0.6)]"
        >
          联系我们：400-0678-558
        </Link>
      </LunaiHero>

      {/* 加盟政策 */}
      <LunaiSection tone="ink2">
        <Reveal>
          <h2 className="lunai-serif text-balance text-[clamp(1.75rem,4vw,2.75rem)] text-snow">
            加盟政策
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {policies.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <article className="group relative h-full rounded-xl border border-white/10 bg-ink-2 p-7 transition-all duration-500 hover:border-gold/30">
                <span className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gold/70 transition-transform duration-500 group-hover:scale-x-100" />
                <h3 className="lunai-serif text-lg text-snow">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist/92">{p.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </LunaiSection>

      {/* 费用 + 流程 + 支持 */}
      <LunaiSection>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
          {/* 加盟费用 */}
          <Reveal>
            <h2 className="lunai-serif text-[clamp(1.6rem,3.4vw,2.25rem)] text-snow">
              加盟费用
            </h2>
            <dl className="mt-9 overflow-hidden rounded-xl border border-white/10">
              {fees.map((f) => (
                <div
                  key={f.k}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/[0.07] bg-ink-2/60 px-6 py-4 last:border-0"
                >
                  <dt className="text-sm text-mist/80">{f.k}</dt>
                  <dd className="lunai-num text-base text-gold">{f.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* 加盟流程 */}
          <Reveal delay={120}>
            <h2 className="lunai-serif text-[clamp(1.6rem,3.4vw,2.25rem)] text-snow">
              加盟流程
            </h2>
            <ol className="mt-9 space-y-6">
              {flow.map((f) => (
                <li key={f.no} className="flex items-start gap-5">
                  <span className="lunai-num lunai-serif flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/[0.07] text-base text-gold">
                    {f.no}
                  </span>
                  <div>
                    <h3 className="text-base text-snow">{f.title}</h3>
                    <p className="mt-1 text-sm text-mist/88">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        {/* 品牌支持 */}
        <Reveal delay={160} className="mt-16">
          <h2 className="lunai-serif text-[clamp(1.6rem,3.4vw,2.25rem)] text-snow">
            品牌支持
          </h2>
          <ul className="mt-9 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-2">
            {supports.map((s) => (
              <li key={s.title} className="flex items-start gap-4 bg-ink-2 p-6">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15">
                  <svg className="h-3.5 w-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base text-snow">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-mist/88">{s.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </LunaiSection>

      {/* 全平台运营落地方案 */}
      <LunaiSection tone="ink2">
        <Reveal>
          <h2 className="lunai-serif text-balance text-[clamp(1.75rem,4vw,2.75rem)] text-snow">
            全平台运营落地方案
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <h3 className="lunai-serif text-lg text-snow">核心逻辑</h3>
            <p className="mt-4 text-sm leading-relaxed text-mist/95">
              以「线上 + 线下」融合为核心，通过多平台布局实现全渠道获客，建立私域流量池，
              提升客户留存率和复购率。系统化管理订单、库存、会员，实现数据驱动决策。
            </p>

            <h3 className="lunai-serif mt-10 text-lg text-snow">平台开通指南</h3>
            <ul className="mt-4 space-y-3">
              {platforms.map((p) => (
                <li key={p} className="flex gap-3 text-sm leading-relaxed text-mist/92">
                  <span className="mt-[0.6rem] h-px w-2.5 shrink-0 bg-gold/55" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-7">
            <h3 className="lunai-serif text-lg text-snow">三阶段实施方案</h3>
            <div className="mt-5 space-y-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
              {phases.map((p, i) => (
                <div key={p.title} className="bg-ink-2 p-6">
                  <div className="flex items-baseline gap-4">
                    <span className="lunai-num text-xs text-gold/55">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h4 className="lunai-serif text-base text-snow">{p.title}</h4>
                  </div>
                  <p className="mt-2.5 pl-8 text-sm leading-relaxed text-mist/92">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </LunaiSection>

      {/* CTA */}
      <LunaiSection>
        <Reveal>
          <div className="rounded-xl border border-gold/25 bg-gradient-to-br from-gold/[0.08] to-transparent px-8 py-14 text-center md:px-14 md:py-20">
            <p className="lunai-serif text-[clamp(1.75rem,4.4vw,2.75rem)] leading-tight text-snow">
              山高路远
              <span className="mx-3 text-gold/45">·</span>
              <span className="lunai-grad">一件路耐</span>
            </p>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-mist/95">
              准备好加入我们了吗？加盟与商务洽谈请直接联系我们。
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-light to-gold px-9 py-4 text-sm font-semibold tracking-wide text-ink transition-shadow duration-300 hover:shadow-[0_0_36px_-8px_rgba(200,169,106,0.6)]"
              >
                联系我们：400-0678-558
              </Link>
              <Link
                href="/solution"
                className="inline-flex items-center justify-center rounded-full border border-white/18 px-9 py-4 text-sm tracking-wide text-snow/90 transition-colors duration-300 hover:border-gold/60 hover:text-gold"
              >
                查看运营模式
              </Link>
            </div>
          </div>
        </Reveal>
      </LunaiSection>
    </LunaiShell>
  );
}
