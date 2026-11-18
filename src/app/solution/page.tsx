'use client';

import Link from 'next/link';
import LunaiShell, { LunaiPageHeader } from '@/components/lunai/LunaiShell';
import { LunaiHero, LunaiSection, LunaiFeatureCard } from '@/components/lunai/Blocks';
import Reveal from '@/components/lunai/Reveal';

/**
 * 运营模式
 * 依据：《运营模式及公司简介 V2.1》P4 六大模块 + P9 渠道端 + P12 流量与系统端
 */

const modules = [
  {
    index: '01',
    title: '品牌端',
    headline: '一个主品牌，两条产品系列',
    points: ['「耐」字超级符号', '5+5 系列命名', '一次研发双品类共享'],
    carrier: '母品牌 VI / 商标 / 统一话术',
  },
  {
    index: '02',
    title: '渠道端',
    headline: '双轮驱动：品牌自营 + 店中店',
    points: ['新华书店体系', '头部物业联营', '校园机构客户'],
    carrier: '桐庐试点店 / 区域公司',
  },
  {
    index: '03',
    title: '门店端',
    headline: '50 ㎡ 双品类单店模型',
    points: ['2 人编制', '错峰主推', '积分闭环 · 单店可复制'],
    carrier: '样板店 → 区域公司 → 省内加密 → 跨省复制',
  },
  {
    index: '04',
    title: '供应链端',
    headline: '源头自持 + 柔性协作',
    points: ['三门源头工厂', '通用面料库', '校服由当地企业承接生产'],
    carrier: '面料库 / 按需生产',
  },
  {
    index: '05',
    title: '流量端',
    headline: '1+N 全域新媒体矩阵',
    points: ['6 个总号 + 4 个系列号', '直播', '本地生活团购'],
    carrier: '抖音 / 视频号 / 公众号 / 小红书 / 小程序',
  },
  {
    index: '06',
    title: '系统与合规',
    headline: '可穿透的数字化经营',
    points: ['智慧零售 3.0 建制化管理', '四流合一', '商标与授权合规'],
    carrier: '机构建账 / 收银结算',
  },
];

const channels = [
  { type: '头部书店', partner: '浙江新华书店体系', model: '店中店（抽佣 8–10%）', status: '桐庐试点已落地' },
  { type: '头部书店', partner: '河北新华书店体系', model: '店中店（抽佣 8–10%）', status: '模式已跑通' },
  { type: '头部物业', partner: '社区联营网点', model: '联营加盟', status: '300+ 社区联营网点' },
  { type: '校园机构', partner: 'K12 学校 / 教育机构', model: '机构直供 · 长期订单', status: '常态化合作' },
  { type: '线上自营', partner: '6 总号 + 4 系列号', model: '全域电商 + 直播 + 本地生活', status: '常态化运营' },
];

const storeElements = [
  { k: '合作模式', v: '店中店（抽佣分销）' },
  { k: '抽佣点位', v: '8–10%' },
  { k: '营业员', v: '品牌方自配 2 人' },
  { k: '固定租金', v: '免' },
  { k: '库存', v: '共用卖场库存' },
  { k: '收银结算', v: '渠道方收银系统' },
  { k: '会员', v: '100 元 = 100 积分' },
];

const media = [
  { level: '总号', platform: '抖音', account: '路耐', form: '短视频', theme: '全系列品牌内容 + 统一话术' },
  { level: '总号', platform: '视频号', account: '路耐', form: '短视频 + 直播', theme: '公众号同步 + 直播带货' },
  { level: '总号', platform: '公众号', account: '路耐', form: '图文长内容', theme: '品牌深度 + 产品故事' },
  { level: '总号', platform: '服务号', account: '路耐', form: '模板消息', theme: '订单 / 会员 / 积分 / 售后' },
  { level: '总号', platform: '小红书', account: '路耐', form: '图文 / 视频种草', theme: '全系列种草 + 户外测评' },
  { level: '总号', platform: '小程序', account: '路耐', form: '商城 + 门店服务', theme: '下单 + 门店导流 + 积分' },
  { level: '系列号', platform: '抖音', account: '路耐少年', form: '9 月开学季', theme: '校服系列 · 家长决策人群' },
  { level: '系列号', platform: '抖音', account: '路耐户外', form: '10 月户外系列', theme: '户外爱好者' },
  { level: '系列号', platform: '小红书', account: '路耐少年', form: '9 月开学季', theme: '校服种草 · 家长画像' },
  { level: '系列号', platform: '小红书', account: '路耐户外', form: '10 月户外种草', theme: '爱好者画像' },
];

const systemAbilities = [
  { k: '机构建制化管理', v: '编码 / 区域 / 类型 / 性质四维建账，所有合作机构统一立账，总部实时可见' },
  { k: '总部商城 + 多门店分销', v: '总部统一货源与价格体系，门店按需下单，总部掌握库存与价格' },
  { k: '团购核销收银', v: '抖音本地生活券在店核销，线上交易与线下履约在同一收银台完成' },
  { k: '四流合一', v: '订单 / 资金 / 发票 / 物流四流一致，通过汇付账号完成收银与对账' },
  { k: '经营数据看板', v: 'GMV / 净额 / 客单价 / 退款实时指标，口径可穿透到单店、单笔订单' },
];

export default function SolutionPage() {
  return (
    <LunaiShell>
      <LunaiHero
        eyebrow="Operating Model"
        title={
          <>
            运营模式
            <span className="text-mist/72"> · 六大模块</span>
          </>
        }
        description="品牌定内容 · 渠道定场景 · 供应链定交付 · 系统定可复制。六大模块各自有明确的落地载体，不是概念罗列。"
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/franchise"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-light to-gold px-8 py-3.5 text-sm font-semibold tracking-wide text-ink transition-shadow duration-300 hover:shadow-[0_0_36px_-8px_rgba(200,169,106,0.6)]"
          >
            查看单店模型
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-full border border-white/18 px-8 py-3.5 text-sm tracking-wide text-snow/90 transition-colors duration-300 hover:border-gold/60 hover:text-gold"
          >
            关于路耐
          </Link>
        </div>
      </LunaiHero>

      {/* 六大模块 */}
      <LunaiSection tone="ink2">
        <LunaiPageHeader
          eyebrow="Six Modules"
          title="品牌 · 渠道 · 门店 · 供应链 · 流量 · 系统"
          description="每个模块都有明确载体与可验证标准，构成一个可复制的经营单元。"
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <Reveal key={m.index} delay={(i % 3) * 100}>
              <article className="group relative h-full rounded-xl border border-white/10 bg-ink-2 p-7 transition-all duration-500 hover:border-gold/30 md:p-8">
                <span className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gold/70 transition-transform duration-500 group-hover:scale-x-100" />
                <div className="flex items-start justify-between gap-4">
                  <span className="lunai-num text-2xl font-light text-gold/45 transition-colors duration-500 group-hover:text-gold">
                    {m.index}
                  </span>
                  <span className="rounded-full border border-white/12 px-3 py-1 text-[0.62rem] tracking-[0.2em] text-mist/78">
                    {m.title}
                  </span>
                </div>

                <h3 className="lunai-serif mt-5 text-lg leading-snug text-snow">
                  {m.headline}
                </h3>

                <ul className="mt-4 space-y-2">
                  {m.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-mist/95">
                      <span className="mt-[0.6rem] h-px w-2.5 shrink-0 bg-gold/55" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="text-[0.58rem] uppercase tracking-[0.24em] text-mist/62">
                    载体
                  </div>
                  <div className="mt-1.5 text-xs leading-relaxed text-gold/70">
                    {m.carrier}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </LunaiSection>

      {/* 渠道端 */}
      <LunaiSection>
        <LunaiPageHeader
          eyebrow="Channel"
          title={
            <>
              渠道端 · 双轮驱动
              <span className="text-mist/72"> 品牌自营 + 店中店</span>
            </>
          }
          description="书店体系 / 物业联营 / 校园机构 / 线上自营，四类渠道并行。"
        />

        <Reveal delay={120} className="mt-14">
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  {['渠道类型', '合作方', '模式', '状态'].map((h) => (
                    <th key={h} className="px-5 py-4 text-[0.62rem] font-normal uppercase tracking-[0.2em] text-mist/50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {channels.map((c) => (
                  <tr key={`${c.type}-${c.partner}`} className="border-b border-white/[0.07] transition-colors duration-300 last:border-0 hover:bg-white/[0.03]">
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

        {/* 店中店合作要素 */}
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <div className="text-[0.62rem] uppercase tracking-[0.32em] text-gold/70">
              店中店合作要素
            </div>
            <h3 className="lunai-serif mt-4 text-[clamp(1.5rem,2.8vw,2rem)] leading-snug text-snow">
              低固定成本 · 高复购模型
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-mist/95">
              区域公司制 3 人编制：区域负责人拓展与渠道关系，门店督导负责人员与陈列督导，内容运营负责本地内容与团购投放。
            </p>
          </Reveal>

          <div className="lg:col-span-8">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-4">
              {storeElements.map((e) => (
                <div key={e.k} className="bg-ink-2 px-5 py-5">
                  <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-mist/62">
                    {e.k}
                  </dt>
                  <dd className="mt-2 text-sm text-gold/90">{e.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </LunaiSection>

      {/* 流量与系统端 */}
      <LunaiSection tone="ink2">
        <LunaiPageHeader
          eyebrow="Media & System"
          title="流量端与系统合规端"
          description="流量能落地，数据能穿透。总号承载品牌、系列号分触达，再由本地生活团购与门店体验完成闭环。"
        />

        {/* 媒体矩阵 */}
        <Reveal delay={120} className="mt-14">
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  {['层级', '平台', '账号名', '形态', '内容主题'].map((h) => (
                    <th key={h} className="px-5 py-4 text-[0.62rem] font-normal uppercase tracking-[0.2em] text-mist/50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {media.map((m, i) => (
                  <tr key={`${m.platform}-${m.account}-${i}`} className="border-b border-white/[0.07] transition-colors duration-300 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-5 py-3.5 text-sm">
                      <span className={`rounded-full px-3 py-1 text-[0.68rem] ${m.level === '总号' ? 'bg-gold/12 text-gold/85' : 'bg-white/8 text-mist/92'}`}>
                        {m.level}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-snow/85">{m.platform}</td>
                    <td className="px-5 py-3.5 text-sm text-gold/85">{m.account}</td>
                    <td className="px-5 py-3.5 text-sm text-mist/92">{m.form}</td>
                    <td className="px-5 py-3.5 text-sm text-mist/92">{m.theme}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* 智慧零售 3.0 */}
        <Reveal delay={180} className="mt-14">
          <div className="rounded-xl border border-white/10 bg-ink p-8 md:p-10">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h3 className="lunai-serif text-xl text-snow md:text-2xl">智慧零售 3.0</h3>
              <span className="text-[0.62rem] uppercase tracking-[0.28em] text-gold/60">
                System Capabilities
              </span>
            </div>

            <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-2">
              {systemAbilities.map((s) => (
                <div key={s.k} className="bg-ink-2 p-6">
                  <dt className="lunai-serif text-base text-snow">{s.k}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-mist/92">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal delay={220} className="mt-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <LunaiFeatureCard
              index="A"
              title="经营资质"
              description="特许经营备案 · ICP · 抖音企业号资质"
            />
            <LunaiFeatureCard
              index="B"
              title="收款合规"
              description="汇付账号 · 订单资金发票物流四流合一"
            />
            <LunaiFeatureCard
              index="C"
              title="品牌合规"
              description="先授权、后投放；各区域独立处理对外口径"
            />
          </div>
        </Reveal>
      </LunaiSection>
    </LunaiShell>
  );
}
