'use client';

import Link from 'next/link';
import LunaiShell from '@/components/lunai/LunaiShell';
import { LunaiHero, LunaiSection } from '@/components/lunai/Blocks';
import Reveal from '@/components/lunai/Reveal';
import { SITE } from '@/lib/site';

/**
 * 加盟合作
 *
 * 全部商业口径统一自《浙江思杋服饰有限公司 · 运营模式及公司简介 V2.1》
 * （2026 年 11 月，P08–P10、P13），与首页 /solution 保持同一数据源。
 */

/* ── 渠道矩阵（PDF P09） ───────────────────────────── */
const channelMatrix = [
  { type: '头部书店', partner: '浙江新华书店体系', model: '店中店（抽佣 8–10%）', status: '桐庐试点已落地' },
  { type: '头部书店', partner: '河北新华书店体系', model: '店中店（抽佣 8–10%）', status: '模式已跑通' },
  { type: '头部物业', partner: '社区联营网点', model: '联营加盟', status: '300+ 社区联营网点' },
  { type: '校园机构', partner: 'K12 学校 / 教育机构', model: '机构直供 · 长期订单', status: '常态化合作' },
  { type: '线上自营', partner: '6 总号 + 4 系列号', model: '全域电商 + 直播 + 本地生活', status: '常态化运营' },
];

/* ── 店中店合作要素（PDF P09） ─────────────────────── */
const storeElements = [
  { k: '合作模式', v: '店中店（抽佣分销）' },
  { k: '抽佣点位', v: '8–10%' },
  { k: '营业员', v: '品牌方自配 2 人' },
  { k: '固定租金', v: '免' },
  { k: '库存', v: '共用卖场库存' },
  { k: '收银结算', v: '渠道方收银系统' },
  { k: '会员', v: '100 元 = 100 积分' },
];

/* ── 单店经济模型（PDF P10） ───────────────────────── */
const tiers = [
  { name: '保守档', sales: 80000, rate: '38%', gross: 30400, comm: 7200, labor: 13000, net: 3200, verdict: '临界', highlight: false },
  { name: '常规档', sales: 130000, rate: '42%', gross: 54600, comm: 11700, labor: 15000, net: 18900, verdict: '8 个月回本', highlight: true },
  { name: '目标档', sales: 180000, rate: '44%', gross: 79200, comm: 16200, labor: 17000, net: 35500, verdict: '6 个月回本', highlight: false },
  { name: '乐观档', sales: 220000, rate: '45%', gross: 99000, comm: 19800, labor: 19000, net: 48200, verdict: '5 个月回本', highlight: false },
];

/* ── 区域公司制 · 3 人编制（PDF P09） ───────────────── */
const regionTeam = [
  { role: '区域负责人', duty: '拓展与渠道关系' },
  { role: '门店督导', duty: '人员与陈列督导' },
  { role: '内容运营', duty: '本地内容与团购投放' },
];

/* ── 单店复制路径（PDF P10） ───────────────────────── */
const expandPath = [
  { stage: '样板店', action: '桐庐、沧州等样板门店跑通', check: '单店模型稳定、月净利为正', way: '直营或店中店两种形态并行验证' },
  { stage: '区域公司', action: '设立区域公司并配 3 人编制', check: '门店拓展与督导流程可运转', way: '按主推节点分批开店' },
  { stage: '省内加密', action: '浙江省内重点县市加密布点', check: '同区域门店之间互相导流', way: '依托区域公众号与本地生活投放' },
  { stage: '跨省复制', action: '向其他省份的渠道体系输出', check: '跨区域督导与培训链路成熟', way: '区域公司模式整体输出' },
];

/* ── 加盟政策 ─────────────────────────────────────── */
const policies = [
  { title: '区域保护', desc: '同一区域由区域公司统一拓展与督导，门店之间互相导流而非互相竞争' },
  { title: '零加盟费', desc: '店中店为抽佣分销模式，不收加盟费，也不收取首批货款' },
  { title: '免固定租金', desc: '门店嵌入渠道方卖场，固定租金全免；库存与卖场共用' },
  { title: '长期支持', desc: '区域公司 3 人编制全程护航，从开业筹备到日常督导' },
];

/* ── 品牌支持 ─────────────────────────────────────── */
const supports = [
  { title: '品牌与标准输出', desc: '路耐输出版型、面料、工艺与质量标准，一次研发双品类共享' },
  { title: '督导体系', desc: '区域公司 3 人编制，人员与陈列督导常态化运作' },
  { title: '内容运营支持', desc: '本地内容与团购投放由区域内容运营承接' },
  { title: '系统与数据', desc: '智慧零售 3.0 建制化管理 + 四流合一，门店与区域双视角复盘' },
];

/* ── 加盟流程 ─────────────────────────────────────── */
const flow = [
  { no: '1', title: '咨询了解', desc: `加盟与商务洽谈，拨打加盟热线 ${SITE.hotline}` },
  { no: '2', title: '书面授权', desc: '先授权、后投放，签署渠道授权协议后启动对外投放' },
  { no: '3', title: '落地筹备', desc: '按开学季与秋冬主推节点排布开店批次，区域公司对接' },
  { no: '4', title: '开业运营', desc: '人员与陈列督导到位，开学季与秋冬双节点接力主推' },
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
        description="50 ㎡ 双品类单店模型，2 人编制，错峰主推，积分闭环。店中店模式由渠道方出场地与收银，品牌方出品牌、标准与人员，双方按 8–10% 抽佣分销。"
      >
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-light to-gold px-8 py-3.5 text-sm font-semibold tracking-wide text-ink transition-shadow duration-300 hover:shadow-[0_0_36px_-8px_rgba(200,169,106,0.6)]"
        >
          联系我们：{SITE.hotline}
        </Link>
      </LunaiHero>

      {/* 渠道矩阵 */}
      <LunaiSection tone="ink2">
        <Reveal>
          <h2 className="lunai-serif text-balance text-[clamp(1.75rem,4vw,2.75rem)] text-snow">
            渠道矩阵
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-mist/92 md:text-base">
            书店体系、物业联营、校园机构、线上自营，四类渠道并行推进。每种合作形态都有已落地的样板，不是纸面规划。
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-12">
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-ink-2/70">
                  {['渠道类型', '合作方', '合作模式', '当前状态'].map((h) => (
                    <th key={h} className="px-5 py-4 text-[0.62rem] font-normal uppercase tracking-[0.2em] text-mist/72">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {channelMatrix.map((c) => (
                  <tr
                    key={c.partner}
                    className="border-b border-white/[0.07] transition-colors duration-300 last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-5">
                      <span className="lunai-serif text-base text-snow/85">{c.type}</span>
                    </td>
                    <td className="px-5 py-5 text-sm text-mist/92">{c.partner}</td>
                    <td className="px-5 py-5 text-sm text-gold/85">{c.model}</td>
                    <td className="px-5 py-5">
                      <span className="rounded-full border border-gold/25 bg-gold/[0.07] px-3 py-1 text-xs text-gold/80">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </LunaiSection>

      {/* 店中店合作要素 + 加盟政策 */}
      <LunaiSection>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
          <Reveal>
            <h2 className="lunai-serif text-[clamp(1.6rem,3.4vw,2.25rem)] text-snow">
              店中店合作要素
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-mist/92">
              渠道方出场地、卖场与收银系统；品牌方出品牌、标准、人员与货盘。库存与卖场共用，无需首批压货。
            </p>
            <dl className="mt-9 overflow-hidden rounded-xl border border-white/10">
              {storeElements.map((f) => (
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

          <Reveal delay={120}>
            <h2 className="lunai-serif text-[clamp(1.6rem,3.4vw,2.25rem)] text-snow">
              加盟政策
            </h2>
            <div className="mt-9 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
              {policies.map((p) => (
                <div key={p.title} className="bg-ink-2 p-6">
                  <h3 className="lunai-serif text-base text-snow">{p.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-mist/92">{p.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </LunaiSection>

      {/* 单店经济模型 */}
      <LunaiSection tone="ink2">
        <Reveal>
          <h2 className="lunai-serif text-balance text-[clamp(1.75rem,4vw,2.75rem)] text-snow">
            单店经济模型
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-mist/92 md:text-base">
            测算口径：50 ㎡ 双品类卖场，2 人编制（主 + 副）含五险；店租、水电与物料维护按门店实际分摊计入。关键变量为抽佣点位、主副排班效率、主推品类命中率与本地团购核销转化率。
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-12">
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-ink-2/70">
                  {['档位', '月销', '综合毛利率', '毛利', '抽佣 9%', '人力（含五险）', '月净利', '评估'].map((h) => (
                    <th key={h} className="px-5 py-4 text-[0.62rem] font-normal uppercase tracking-[0.2em] text-mist/72">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tiers.map((t) => (
                  <tr
                    key={t.name}
                    className={`border-b border-white/[0.07] transition-colors duration-300 last:border-0 hover:bg-white/[0.03] ${
                      t.highlight ? 'bg-gold/[0.05]' : ''
                    }`}
                  >
                    <td className="px-5 py-5">
                      <span className={`lunai-serif text-base ${t.highlight ? 'text-gold' : 'text-snow/85'}`}>
                        {t.name}
                      </span>
                    </td>
                    <td className="lunai-num px-5 py-5 text-sm text-snow/85">¥{t.sales.toLocaleString()}</td>
                    <td className="lunai-num px-5 py-5 text-sm text-mist/92">{t.rate}</td>
                    <td className="lunai-num px-5 py-5 text-sm text-mist/92">¥{t.gross.toLocaleString()}</td>
                    <td className="lunai-num px-5 py-5 text-sm text-mist/92">¥{t.comm.toLocaleString()}</td>
                    <td className="lunai-num px-5 py-5 text-sm text-mist/92">¥{t.labor.toLocaleString()}</td>
                    <td className="lunai-num px-5 py-5 text-sm font-semibold text-gold">¥{t.net.toLocaleString()}</td>
                    <td className="px-5 py-5 text-sm text-snow/85">{t.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-mist/85">
            9 月开学季为路耐少年主推节点，单月为全年最强；9 月底至 12 月由路耐户外秋冬首发错峰承接，365 天无淡季。
            <Link href="/solution" className="ml-2 text-gold underline-offset-4 hover:underline">
              查看完整错峰排布与复制路径
            </Link>
          </p>
        </Reveal>
      </LunaiSection>

      {/* 区域公司制 + 复制路径 */}
      <LunaiSection>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <h2 className="lunai-serif text-[clamp(1.6rem,3.4vw,2.25rem)] text-snow">
              区域公司制
              <span className="mt-2.5 block text-[0.42em] font-normal tracking-[0.05em] text-mist/72">
                3 人编制
              </span>
            </h2>
            <ul className="mt-9 space-y-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
              {regionTeam.map((r) => (
                <li key={r.role} className="bg-ink-2 p-6">
                  <h3 className="lunai-serif text-base text-gold">{r.role}</h3>
                  <p className="mt-1.5 text-sm text-mist/92">{r.duty}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-mist/85">
              开店批次按开学季与秋冬两个主推节点排布，避免同期集中开业；每周日门店与区域双视角复盘，输出下周行动表。
            </p>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-7">
            <h2 className="lunai-serif text-[clamp(1.6rem,3.4vw,2.25rem)] text-snow">
              单店复制路径
            </h2>
            <div className="mt-9 space-y-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
              {expandPath.map((p, i) => (
                <div key={p.stage} className="bg-ink-2 p-6">
                  <div className="flex items-baseline gap-4">
                    <span className="lunai-num text-xs text-gold/55">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="lunai-serif text-base text-snow">{p.stage}</h3>
                  </div>
                  <dl className="mt-3 space-y-1.5 pl-8 text-sm">
                    <div className="flex gap-3">
                      <dt className="shrink-0 text-mist/55">关键动作</dt>
                      <dd className="text-snow/85">{p.action}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="shrink-0 text-mist/55">验证标准</dt>
                      <dd className="text-snow/85">{p.check}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="shrink-0 text-mist/55">推进方式</dt>
                      <dd className="text-mist/92">{p.way}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* 授权合规 */}
        <Reveal delay={160} className="mt-16">
          <div className="rounded-xl border border-gold/25 bg-gradient-to-br from-gold/[0.07] to-transparent px-8 py-10 md:px-12">
            <p className="text-xs uppercase tracking-[0.32em] text-gold/75">渠道授权口径</p>
            <h3 className="lunai-serif mt-4 text-[clamp(1.35rem,2.6vw,1.85rem)] text-snow">
              先授权、后投放
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mist/92">
              在取得书面授权前，不启动任何涉及双品牌联名的对外投放；各区域依其既有约定独立处理对外露出口径，不相互套用。
            </p>
          </div>
        </Reveal>
      </LunaiSection>

      {/* 流程 + 支持 */}
      <LunaiSection tone="ink2">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
          <Reveal>
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
                    <p className="mt-1 text-sm text-mist/92">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={120}>
            <h2 className="lunai-serif text-[clamp(1.6rem,3.4vw,2.25rem)] text-snow">
              品牌支持
            </h2>
            <ul className="mt-9 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
              {supports.map((s) => (
                <li key={s.title} className="flex items-start gap-4 bg-ink-2 p-6">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15">
                    <svg className="h-3.5 w-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-base text-snow">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-mist/92">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
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
              桐庐样板店已跑通单店模型，县域拓展与品牌露出授权同步推进。加盟与商务洽谈请直接联系我们。
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-light to-gold px-9 py-4 text-sm font-semibold tracking-wide text-ink transition-shadow duration-300 hover:shadow-[0_0_36px_-8px_rgba(200,169,106,0.6)]"
              >
                联系我们：{SITE.hotline}
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
