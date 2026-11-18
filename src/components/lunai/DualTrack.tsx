'use client';

import Link from 'next/link';
import Reveal from './Reveal';
import SectionHeading from './Section';

const tracks = [
  {
    tag: 'LUNAI JUNIOR',
    name: '路耐少年',
    sub: '校服里外，一身讲究',
    mind: '陪你长大，天天都新',
    market: '¥ 千亿级 · 校服',
    audience: '2 亿+ 中小学生家庭',
    logic: [
      '面料 / 里料 / 工艺 / 服务四大升级',
      '把非标服务做成确定性体验',
      '采购走向市场化与家长自愿选择后，决策链回到家长手里',
    ],
    promise: [
      { k: '耐造', v: '春秋运动服套装', d: '穿 3 年不变' },
      { k: '耐新', v: '正装校服 / 礼服', d: '一年如新' },
      { k: '耐寒', v: '冬季棉服', d: '零下 10 度不失温' },
      { k: '耐晒', v: '夏季短袖短裤', d: 'UPF50+' },
      { k: '耐洗', v: '夏季白衬衫', d: '一洗一晒不发黄' },
    ],
    price: '价格带 80 – 500 元',
    consumer: 'K12 家长（决策）· 学生（穿着）· 学校（影响）',
    accent: 'from-gold/22 to-transparent',
  },
  {
    tag: 'LUNAI OUTDOOR',
    name: '路耐户外',
    sub: '山系通勤，专业户外国货',
    mind: '装备你，山海给你',
    market: '¥ 千亿级 · 户外',
    audience: '数亿户外爱好者',
    logic: [
      '专业户外国货化，把户外从专业小众做成日常高频',
      '承接校服客群的家庭延伸',
      '同一位家长，两个消费场景',
    ],
    promise: [
      { k: '户外运动', v: '冲锋衣 / 抓绒 / 速干 T 恤', d: '品类主力 · 全年常销' },
      { k: '城市通勤', v: '山系通勤，一件多穿', d: '与户外客群高频重合' },
      { k: '亲子户外', v: '家庭客群共享', d: '承接校服家庭客群' },
      { k: '校园户外', v: '校园场景延伸', d: '与校服同场同动线' },
      { k: '户外配饰', v: '帽 / 手套 / 头巾 / 背包', d: '提升客单价' },
    ],
    price: '价格带 200 – 1500 元',
    consumer: '都市 22–40 岁 · 山系通勤 / 户外爱好者',
    accent: 'from-sky-400/16 to-transparent',
  },
];

export default function DualTrack() {
  return (
    <section className="relative overflow-hidden bg-ink-2 py-24 md:py-32">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(200,169,106,0.3), transparent)' }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        <SectionHeading
          index="01"
          eyebrow="Dual Track"
          title={
            <>
              双赛道 · 双千亿市场
              <span className="text-mist/45"> · 一套品牌资产</span>
            </>
          }
          description="路耐少年与路耐户外共享同一套供应链、会员体系与「耐」字符号资产。B 端为院校批量采购与招投标准入，C 端为亲子线下零售与全域线上——两者共用同一副底牌。"
        />

        {/* 成熟经营模式提示 */}
        <Reveal delay={120} className="mt-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-gold/25 bg-gold/[0.06] px-5 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="text-xs tracking-[0.18em] text-gold/85">
              成熟经营模式：B 端 + C 端双轮
            </span>
          </div>
        </Reveal>

        {/* 双卡片 */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {tracks.map((t, idx) => (
            <Reveal key={t.name} delay={idx * 140}>
              <article className="group relative h-full overflow-hidden rounded-xl border border-white/10 bg-ink-3/60 p-8 transition-all duration-500 hover:border-gold/35 md:p-10">
                {/* 顶部渐层 */}
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${t.accent} to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  aria-hidden="true"
                />

                <div className="relative">
                  <span className="text-[0.6rem] uppercase tracking-[0.34em] text-gold/65">
                    {t.tag}
                  </span>
                  <h3 className="lunai-serif mt-3 text-[clamp(1.75rem,3.4vw,2.5rem)] text-snow">
                    {t.name}
                  </h3>
                  <p className="mt-2 text-sm tracking-wide text-mist/75">{t.sub}</p>

                  {/* 核心心智 */}
                  <div className="mt-7 rounded-lg border-l-2 border-gold/60 bg-gold/[0.05] py-4 pl-5">
                    <p className="lunai-serif text-xl text-gold-light">{t.mind}</p>
                  </div>

                  {/* 市场与人群 */}
                  <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <dt className="text-[0.62rem] uppercase tracking-[0.28em] text-mist/45">
                        市场规模
                      </dt>
                      <dd className="lunai-num mt-1.5 text-base text-snow/90">{t.market}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.62rem] uppercase tracking-[0.28em] text-mist/45">
                        覆盖人群
                      </dt>
                      <dd className="lunai-num mt-1.5 text-base text-snow/90">{t.audience}</dd>
                    </div>
                  </dl>

                  {/* 增长逻辑 */}
                  <ul className="mt-7 space-y-2.5">
                    {t.logic.map((l) => (
                      <li key={l} className="flex gap-3 text-sm leading-relaxed text-mist/80">
                        <span className="mt-[0.55rem] h-px w-3 shrink-0 bg-gold/60" />
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>

                  {/* 5+5 产品承诺 */}
                  <div className="mt-9 border-t border-white/10 pt-7">
                    <div className="text-[0.62rem] uppercase tracking-[0.28em] text-mist/45">
                      产品承诺
                    </div>
                    <ul className="mt-4 space-y-2.5">
                      {t.promise.map((p) => (
                        <li
                          key={p.k}
                          className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-white/[0.06] pb-2.5 last:border-0"
                        >
                          <span className="lunai-serif min-w-[4.5rem] text-base text-gold">
                            {p.k}
                          </span>
                          <span className="text-sm text-snow/85">{p.v}</span>
                          <span className="text-xs text-mist/55">{p.d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
                    <span className="lunai-num text-xs tracking-wide text-gold/80">
                      {t.price}
                    </span>
                    <span className="text-xs text-mist/55">{t.consumer}</span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* 共用底牌 */}
        <Reveal delay={200} className="mt-10">
          <div className="flex flex-col gap-5 rounded-xl border border-gold/20 bg-gradient-to-r from-gold/[0.07] to-transparent p-7 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <div className="text-[0.62rem] uppercase tracking-[0.3em] text-gold/70">
                一次研发，双品类共享
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mist/85 md:text-base">
                面料、工艺、供应链、吊牌、会员与话术两端复用；「耐」字超级符号贯穿两个系列，
                对外统一识别、统一商标、统一话术。
              </p>
            </div>
            <Link
              href="/solution"
              className="shrink-0 rounded-full border border-gold/45 px-7 py-3 text-sm text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              查看运营模式
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
