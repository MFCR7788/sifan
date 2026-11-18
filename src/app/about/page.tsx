'use client';

import Link from 'next/link';
import LunaiShell, { LunaiPageHeader } from '@/components/lunai/LunaiShell';
import { LunaiHero, LunaiSection, LunaiFeatureCard } from '@/components/lunai/Blocks';
import Reveal from '@/components/lunai/Reveal';

/**
 * 关于路耐
 * 依据：《浙江思杋服饰有限公司 · 运营模式及公司简介 V2.1》P5 主体概览 + P6 核心团队
 */

const overview = [
  { k: '公司全称', v: '浙江思杋服饰有限公司' },
  { k: '成立与沿革', v: '2018 思美杋 → 2020 魔法超人 → 2024 品牌升级 → 2026 路耐 LUNAI' },
  { k: '品牌结构', v: '路耐 LUNAI 主品牌，下设路耐户外、路耐少年两条产品系列' },
  { k: '总部地址', v: '杭州市滨江区滨康路 188 号春风集团 6 幢 1 楼' },
  { k: '联系电话', v: '400-0678-558（加盟热线 / 商务咨询）' },
  { k: '官网', v: 'zjsifan.com' },
  { k: '备案与许可', v: '特许经营备案 1330100112500649 · ICP 浙 B2-20250051' },
  { k: '区域资质', v: '杭州滨江区高新技术企业认定' },
  { k: '平台资质', v: '抖音企业号官方服务商（本地推加白）· 特权认证' },
];

const team = [
  {
    name: '余卫君',
    role: '创始人 · 董事长',
    bio: '2000–2018 年任浙江农村商业银行支行行长（18 年银行体系）；2018–2021 年任浙江蓝途户外用品股份有限公司校服拓展部总经理；2018 年至今主持公司经营。',
    duty: '风控与资金管理 · 校服 B 端渠道打法',
  },
  {
    name: '苏东生',
    role: '合伙人 · 招投标与自研',
    bio: '曾任华平信息技术股份有限公司（海康威视系）华东区总经理，现任浙江辰威智能科技有限公司董事长，为公司自研数字化系统的技术主体。',
    duty: '政企与招投标准入通道 · 技术自研',
  },
  {
    name: '缪巍巍',
    role: '合伙人 · 金融与法务',
    bio: '具备深交所与上交所董事会秘书资格，新浪财经评选「金牌董秘」，曾操盘多家行业龙头企业登陆资本市场。',
    duty: '资本市场路径 · 尽调与合规',
  },
  {
    name: '王文博',
    role: '合伙人 · 战略与品牌',
    bio: '20 年营销与品牌服务经验，曾任上海韩秉华设计公司总经理、上海工业设计协会副秘书长、鲜易控股集团市场总监，现任上海包协设计委秘书长。',
    duty: '品牌方法论与 VI 体系 ·「耐」字超级符号资产化',
  },
];

const capabilities = [
  {
    index: '01',
    title: '生产制造',
    description: '浙江三门自有源头工厂，柔性外协补充产能',
    points: ['十件冲锋衣六件三门造', '户外装备自有产能 + 柔性外协', '通用面料库一次研发双品类共享'],
  },
  {
    index: '02',
    title: '渠道落地',
    description: '浙江、河北新华书店体系均已落地',
    points: ['桐庐样板店已跑通单店模型', '县域拓展与品牌露出授权同步推进', '店中店与联营双形态并行'],
  },
  {
    index: '03',
    title: '组织能力',
    description: '银行风控 · 招投标准入 · 资本合规 · 品牌方法论',
    points: ['四条专业线合成一家公司', '技术与系统全部自研，无外部依赖'],
  },
];

export default function AboutPage() {
  return (
    <LunaiShell>
      <LunaiHero
        eyebrow="About LUNAI"
        title={
          <>
            关于路耐
            <span className="text-mist/72"> · 一家自有源头工厂的实体服装企业</span>
          </>
        }
        description="主体概览 · 一家自有源头工厂 + 线上线下双轮驱动的实体服装企业。技术与系统全部自研，无外部依赖。"
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/qualifications"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-light to-gold px-8 py-3.5 text-sm font-semibold tracking-wide text-ink transition-shadow duration-300 hover:shadow-[0_0_36px_-8px_rgba(200,169,106,0.6)]"
          >
            查看资质背书
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-white/18 px-8 py-3.5 text-sm tracking-wide text-snow/90 transition-colors duration-300 hover:border-gold/60 hover:text-gold"
          >
            商务洽谈
          </Link>
        </div>
      </LunaiHero>

      {/* 主体概览 */}
      <LunaiSection tone="ink2">
        <LunaiPageHeader
          eyebrow="Company Profile"
          title="公司简介 · 主体概览"
          description="备案齐全、编号可查。经营资质、区域资质与平台资质均已落地。"
        />

        <Reveal delay={120} className="mt-14">
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-2">
            {overview.map((o) => (
              <div key={o.k} className="bg-ink-2 px-6 py-6 transition-colors duration-300 hover:bg-ink-3/60 md:px-8">
                <dt className="text-[0.6rem] uppercase tracking-[0.26em] text-mist/62">
                  {o.k}
                </dt>
                <dd className="mt-2.5 text-sm leading-relaxed text-snow/90 md:text-[0.95rem]">
                  {o.v}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </LunaiSection>

      {/* 核心团队 */}
      <LunaiSection>
        <LunaiPageHeader
          eyebrow="Leadership"
          title={
            <>
              核心团队
              <span className="text-mist/72"> · 四条专业线合成一家公司</span>
            </>
          }
          description="银行风控 + 招投标准入 + 资本合规 + 品牌方法论。"
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={(i % 2) * 110}>
              <article className="group relative h-full overflow-hidden rounded-xl border border-white/10 bg-ink-3/40 p-8 transition-all duration-500 hover:border-gold/30 md:p-9">
                <div className="flex items-start gap-5">
                  <span className="lunai-serif flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-gold/[0.07] text-xl text-gold">
                    {m.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="lunai-serif text-xl text-snow">{m.name}</h3>
                    <p className="mt-1.5 text-xs tracking-[0.2em] text-gold/70">
                      {m.role}
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-sm leading-relaxed text-mist/80">{m.bio}</p>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="text-[0.58rem] uppercase tracking-[0.24em] text-mist/62">
                    职责
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gold/80">
                    {m.duty}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </LunaiSection>

      {/* 组织与落地能力 */}
      <LunaiSection tone="ink2">
        <LunaiPageHeader
          eyebrow="Capability"
          title="生产 · 渠道 · 组织"
          description="三条能力线支撑品牌从产品到门店到系统的完整闭环。"
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {capabilities.map((c) => (
            <LunaiFeatureCard
              key={c.index}
              index={c.index}
              title={c.title}
              description={c.description}
              points={c.points}
              className="h-full"
            />
          ))}
        </div>

        <Reveal delay={200} className="mt-12">
          <div className="flex flex-col gap-5 rounded-xl border border-gold/20 bg-gradient-to-r from-gold/[0.07] to-transparent p-7 md:flex-row md:items-center md:justify-between md:p-8">
            <p className="lunai-serif max-w-2xl text-lg text-snow md:text-xl">
              主体概览 · 一家自有源头工厂 + 线上线下双轮驱动的实体服装企业
            </p>
            <Link
              href="/solution"
              className="shrink-0 rounded-full border border-gold/45 px-7 py-3 text-sm text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              查看运营模式
            </Link>
          </div>
        </Reveal>
      </LunaiSection>
    </LunaiShell>
  );
}
