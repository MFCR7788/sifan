'use client';

import Reveal from './Reveal';
import SectionHeading from './Section';

const lines = [
  {
    tag: '浙江 · 桐庐试点',
    partner: '浙江省桐庐县新华书店',
    form: '路耐户外装备桐庐店（桐庐县银泰新华书店门店内）',
    status: '框架协议已签署',
    done: true,
  },
  {
    tag: '河北 · 店中店',
    partner: '河北新华书店体系门店',
    form: '路耐户外 / 路耐少年 双品类店中店',
    status: '模式已跑通',
    done: true,
  },
  {
    tag: '县域拓展',
    partner: '开化等县域新华书店',
    form: '店中店合作洽谈中',
    status: '以桐庐样板为模板',
    done: false,
  },
  {
    tag: '品牌露出授权',
    partner: '浙江新华集团 · 中国新华书店协会',
    form: '联名与媒体露出授权申请',
    status: '书面授权取得后再启动联名对外投放',
    done: false,
  },
];

const channels = [
  { type: '头部书店', partner: '浙江新华书店体系', model: '店中店（抽佣 8–10%）', status: '桐庐试点已落地' },
  { type: '头部书店', partner: '河北新华书店体系', model: '店中店（抽佣 8–10%）', status: '模式已跑通' },
  { type: '头部物业', partner: '社区联营网点', model: '联营加盟', status: '300+ 社区联营网点' },
  { type: '校园机构', partner: 'K12 学校 / 教育机构', model: '机构直供 · 长期订单', status: '常态化合作' },
  { type: '线上自营', partner: '6 总号 + 4 系列号', model: '全域电商 + 直播 + 本地生活', status: '常态化运营' },
];

export default function Partnership() {
  return (
    <section className="relative bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        <SectionHeading
          index="06"
          eyebrow="Partnership"
          title={
            <>
              合作落地进展
              <span className="text-mist/72"> · 已有实体，不是规划稿</span>
            </>
          }
          description="浙江、河北两条线均有实体落地，县域拓展与品牌露出授权同步推进。"
        />

        {/* 四条合作线 */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {lines.map((l, i) => (
            <Reveal key={l.tag} delay={(i % 2) * 110}>
              <article className="group h-full rounded-xl border border-white/10 bg-ink-3/40 p-7 transition-all duration-500 hover:border-gold/30 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full border border-gold/25 px-3.5 py-1.5 text-[0.62rem] tracking-[0.2em] text-gold/80">
                    {l.tag}
                  </span>
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      l.done ? 'bg-gold' : 'bg-white/20'
                    }`}
                    aria-label={l.done ? '已落地' : '推进中'}
                  />
                </div>

                <div className="mt-6 text-[0.6rem] uppercase tracking-[0.26em] text-mist/62">
                  合作对象
                </div>
                <h3 className="lunai-serif mt-2 text-lg leading-snug text-snow">
                  {l.partner}
                </h3>

                <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
                  <div>
                    <div className="text-[0.58rem] uppercase tracking-[0.24em] text-mist/62">
                      落地形态
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-mist/80">{l.form}</p>
                  </div>
                  <div>
                    <div className="text-[0.58rem] uppercase tracking-[0.24em] text-mist/62">
                      状态
                    </div>
                    <p
                      className={`mt-1.5 text-sm leading-relaxed ${
                        l.done ? 'text-gold/85' : 'text-mist/88'
                      }`}
                    >
                      {l.status}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* 渠道矩阵 */}
        <Reveal delay={160} className="mt-16">
          <div className="text-[0.62rem] uppercase tracking-[0.32em] text-gold/70">
            渠道矩阵
          </div>
          <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  {['渠道类型', '合作方', '模式', '状态'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-[0.62rem] font-normal uppercase tracking-[0.2em] text-mist/50"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {channels.map((c) => (
                  <tr
                    key={`${c.type}-${c.partner}`}
                    className="border-b border-white/[0.07] transition-colors duration-300 last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4 text-sm text-snow/85">{c.type}</td>
                    <td className="px-5 py-4 text-sm text-mist/80">{c.partner}</td>
                    <td className="px-5 py-4 text-sm text-mist/92">{c.model}</td>
                    <td className="px-5 py-4 text-sm text-gold/80">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* 统一口径 */}
        <Reveal delay={200} className="mt-10">
          <div className="rounded-xl border border-gold/25 bg-gradient-to-r from-gold/[0.07] to-transparent p-7 md:p-9">
            <div className="text-[0.62rem] uppercase tracking-[0.3em] text-gold/70">
              品牌露出统一口径
            </div>
            <h3 className="lunai-serif mt-3 text-xl text-snow md:text-2xl">
              先授权、后投放
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mist/80">
              涉及合作方品牌标识的使用，公司统一坚持先授权、后投放：在取得书面授权前，
              不启动任何涉及双方品牌联名的对外投放。各区域依其既有约定独立处理对外露出口径，不相互套用。
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
