'use client';

import Reveal from './Reveal';
import SectionHeading from './Section';

const chains = [
  {
    cat: '户外装备',
    owner: '浙江三门源头工厂',
    mode: '自有产能 + 柔性外协',
    note: '十件冲锋衣六件三门造 · 通用面料库 · 一次研发双品类共享',
    strong: true,
  },
  {
    cat: '校服',
    owner: '当地校服企业承接生产',
    mode: '路耐输出品牌与标准',
    note: '路耐输出版型、面料、工艺与质量标准并下单，按需生产，不做全量铺货',
    strong: false,
  },
];

const metrics = [
  {
    k: '耐静水压',
    v: '10000mm',
    d: '面料防水硬指标，对应中雨徒步场景',
  },
  {
    k: '国家标准',
    v: '超 GB/T 32614-2016',
    d: '成衣质量高于国标要求',
  },
  {
    k: '第三方检测',
    v: 'SGS 全项过',
    d: '检测报告可查、可随货溯源',
  },
  {
    k: '实战验证',
    v: '72 小时暴雨穿越',
    d: '四姑娘山一线实测记录',
  },
];

export default function SupplyChain() {
  return (
    <section className="relative overflow-hidden bg-ink-2 py-24 md:py-32">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(200,169,106,0.3), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        <SectionHeading
          index="05"
          eyebrow="Supply Chain"
          title={
            <>
              供应链端 · 源头自持 + 柔性协作
            </>
          }
          description="两个品类都不做全量铺货。户外由自有产能保障品质与交付，校服由当地企业承接生产、路耐输出标准。"
        />

        {/* 两条供应链 */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {chains.map((c, i) => (
            <Reveal key={c.cat} delay={i * 120}>
              <article
                className={`relative h-full overflow-hidden rounded-xl border p-8 md:p-10 ${
                  c.strong
                    ? 'border-gold/30 bg-gradient-to-br from-gold/[0.07] to-transparent'
                    : 'border-white/10 bg-ink-3/50'
                }`}
              >
                <div className="text-[0.62rem] uppercase tracking-[0.3em] text-mist/45">
                  {c.cat}
                </div>
                <h3 className="lunai-serif mt-3 text-[clamp(1.35rem,2.6vw,1.85rem)] text-snow">
                  {c.owner}
                </h3>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-1.5">
                  <span className="h-1 w-1 rounded-full bg-gold/80" />
                  <span className="text-xs tracking-wide text-mist/80">{c.mode}</span>
                </div>
                <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-mist/70">
                  {c.note}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* 户外硬指标 */}
        <Reveal delay={180} className="mt-16">
          <div className="rounded-xl border border-white/10 bg-ink/60 p-8 md:p-10">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h3 className="lunai-serif text-xl text-snow md:text-2xl">户外装备硬指标</h3>
              <span className="text-[0.62rem] uppercase tracking-[0.28em] text-gold/60">
                Product Specs
              </span>
            </div>

            <dl className="mt-9 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.k} className="bg-ink-2 p-6">
                  <dt className="text-[0.6rem] uppercase tracking-[0.26em] text-mist/45">
                    {m.k}
                  </dt>
                  <dd className="lunai-num lunai-serif mt-3 text-lg leading-tight text-gold md:text-xl">
                    {m.v}
                  </dd>
                  <dd className="mt-2.5 text-xs leading-relaxed text-mist/60">{m.d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        {/* 校服落地前提 */}
        <Reveal delay={220} className="mt-8">
          <div className="border-l-2 border-gold/45 bg-gold/[0.04] py-5 pl-6">
            <p className="text-sm leading-relaxed text-mist/75">
              <span className="text-gold/85">校服端的落地前提</span>
              ：与当地具备校服生产与服务能力的企业完成洽谈，由其承接生产与交付，
              品牌方负责版型、面料、工艺与质量标准的制定及订单组织。
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
