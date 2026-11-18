'use client';

import Reveal from './Reveal';
import SectionHeading from './Section';

/**
 * 单店经济模型 —— 全站说服力最强的模块
 * 口径完全依照 PDF P10：50 ㎡ 双品类卖场，2 人编制（主+副）含五险，
 * 店租、水电与物料维护按门店实际分摊计入。
 */
const tiers = [
  {
    name: '保守档',
    sales: 80000,
    rate: 38,
    gross: 30400,
    commission: 7200,
    labor: 13000,
    net: 3200,
    payback: '临界',
    highlight: false,
  },
  {
    name: '常规档',
    sales: 130000,
    rate: 42,
    gross: 54600,
    commission: 11700,
    labor: 15000,
    net: 18900,
    payback: '8 个月回本',
    highlight: true,
  },
  {
    name: '目标档',
    sales: 180000,
    rate: 44,
    gross: 79200,
    commission: 16200,
    labor: 17000,
    net: 35500,
    payback: '6 个月回本',
    highlight: true,
  },
  {
    name: '乐观档',
    sales: 220000,
    rate: 45,
    gross: 99000,
    commission: 19800,
    labor: 19000,
    net: 48200,
    payback: '5 个月回本',
    highlight: false,
  },
];

const seasons = [
  { time: '9 月', title: '开学季', desc: '路耐少年主推，单月为全年最强节点', strong: true },
  { time: '9 月底–12 月', title: '户外秋冬首发', desc: '与校服主推期错开', strong: false },
  { time: '12 月–次年 2 月', title: '寒假窗口', desc: '由户外独占，滑雪与保暖补位', strong: false },
  { time: '3–5 月', title: '春峰', desc: '校服春季补款与山系通勤首发并行', strong: false },
  { time: '6–8 月', title: '夏季承接', desc: '期末换款与速干、防晒品类承接', strong: false },
];

const path = [
  { stage: '样板店', action: '桐庐、沧州等样板门店跑通', verify: '单店模型稳定、月净利为正' },
  { stage: '区域公司', action: '设立区域公司并配 3 人编制', verify: '门店拓展与督导流程可运转' },
  { stage: '省内加密', action: '浙江省内重点县市加密布点', verify: '同区域门店之间互相导流' },
  { stage: '跨省复制', action: '向其他省份的渠道体系输出', verify: '跨区域督导与培训链路成熟' },
];

export default function StoreModel() {
  return (
    <section className="relative bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        <SectionHeading
          index="04"
          eyebrow="Unit Economics"
          title={
            <>
              门店端 · 50 ㎡ 双品类单店模型
            </>
          }
          description="四变量决定单店可复制性：抽佣点位、主副排班效率、主推品类命中率与本地团购核销转化率。以下为完整测算口径。"
        />

        {/* 经济模型表 */}
        <Reveal delay={120} className="mt-14">
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  {['档位', '月销', '综合毛利率', '毛利', '抽佣 9%', '人力（含五险）', '月净利', '评估'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-[0.62rem] font-normal uppercase tracking-[0.2em] text-mist/50"
                      >
                        {h}
                      </th>
                    )
                  )}
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
                      <span
                        className={`lunai-serif text-base ${
                          t.highlight ? 'text-gold' : 'text-snow/85'
                        }`}
                      >
                        {t.name}
                      </span>
                    </td>
                    <td className="lunai-num px-5 py-5 text-sm text-snow/85">
                      ¥{t.sales.toLocaleString()}
                    </td>
                    <td className="lunai-num px-5 py-5 text-sm text-snow/85">{t.rate}%</td>
                    <td className="lunai-num px-5 py-5 text-sm text-mist/70">
                      ¥{t.gross.toLocaleString()}
                    </td>
                    <td className="lunai-num px-5 py-5 text-sm text-mist/70">
                      ¥{t.commission.toLocaleString()}
                    </td>
                    <td className="lunai-num px-5 py-5 text-sm text-mist/70">
                      ¥{t.labor.toLocaleString()}
                    </td>
                    <td className="lunai-num px-5 py-5">
                      <span
                        className={`text-base font-medium ${
                          t.highlight ? 'text-gold' : 'text-snow/85'
                        }`}
                      >
                        ¥{t.net.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <span className="text-xs tracking-wide text-mist/70">{t.payback}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-mist/45">
            测算口径：50 ㎡ 双品类卖场，2 人编制（主 + 副）含五险；店租、水电与物料维护按门店实际分摊计入。
          </p>
        </Reveal>

        {/* 错峰主推 */}
        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="text-[0.62rem] uppercase tracking-[0.32em] text-gold/70">
              错峰主推
            </div>
            <h3 className="lunai-serif mt-4 text-[clamp(1.6rem,3vw,2.25rem)] leading-snug text-snow">
              365 天无淡季
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-mist/75">
              开学季与秋冬两个主推节点排布开店批次，避免同期集中开业。
              每周日门店与区域双视角复盘，输出下周行动表。
            </p>
          </Reveal>

          <div className="lg:col-span-7">
            <ol className="space-y-px overflow-hidden rounded-lg border border-white/10 bg-white/10">
              {seasons.map((s, i) => (
                <Reveal
                  as="li"
                  key={s.time}
                  delay={i * 80}
                  className={`flex flex-col gap-1.5 bg-ink-2 px-6 py-5 transition-colors duration-300 hover:bg-ink-3/70 sm:flex-row sm:items-center sm:gap-6 ${
                    s.strong ? 'border-l-2 border-l-gold' : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <span
                    className={`lunai-num min-w-[7.5rem] text-sm ${
                      s.strong ? 'text-gold' : 'text-mist/55'
                    }`}
                  >
                    {s.time}
                  </span>
                  <span className="lunai-serif text-base text-snow/90 sm:min-w-[7rem]">
                    {s.title}
                  </span>
                  <span className="text-sm text-mist/65">{s.desc}</span>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>

        {/* 复制路径 */}
        <Reveal delay={160} className="mt-16">
          <div className="text-[0.62rem] uppercase tracking-[0.32em] text-gold/70">
            单店复制路径
          </div>
          <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {path.map((p, i) => (
              <div key={p.stage} className="bg-ink-2 p-7 transition-colors duration-500 hover:bg-ink-3/70">
                <div className="flex items-center gap-3">
                  <span className="lunai-num text-xs text-gold/60">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="h-px w-5 bg-gold/35" />
                </div>
                <h4 className="lunai-serif mt-4 text-lg text-snow">{p.stage}</h4>
                <p className="mt-2.5 text-sm leading-relaxed text-mist/75">{p.action}</p>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <div className="text-[0.58rem] uppercase tracking-[0.24em] text-mist/40">
                    验证标准
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-gold/70">{p.verify}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
