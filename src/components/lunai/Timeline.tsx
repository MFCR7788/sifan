'use client';

import Reveal from './Reveal';
import SectionHeading from './Section';

const milestones = [
  {
    year: '2018',
    brand: '思美杋',
    theme: '校服标准化起家',
    detail:
      '以标准化校服与招投标服务切入校园市场，通过 ISO9001 质量管理体系认证，长期对接全国公办与民办院校，沉淀下院校准入与招投标准入能力。',
  },
  {
    year: '2020',
    brand: '魔法超人',
    theme: '切入户外亲子赛道',
    detail:
      '把「耐」字品牌资产延伸到儿童冲锋衣、防晒衣与亲子户外套装，以线下实体体验店解决家长校服试穿、尺码调换与售后退换三大难题。',
  },
  {
    year: '2024',
    brand: '品牌升级',
    theme: '「路耐」主品牌确立',
    detail:
      '完成「路耐」商标布局与主品牌升级，把校服与户外两段积累合并到同一品牌资产之下，对外统一识别。',
  },
  {
    year: '2026',
    brand: '路耐 LUNAI',
    theme: '一个主品牌，两条产品系列',
    detail:
      '统一为「路耐 LUNAI」主品牌，下设路耐少年与路耐户外两条产品系列。三个历史品牌是同一支团队在不同阶段打下的资产，现已全部收敛于路耐主品牌。',
  },
];

export default function Timeline() {
  return (
    <section className="relative bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        <SectionHeading
          index="02"
          eyebrow="Heritage"
          title={
            <>
              从思美杋、魔法超人到路耐
              <span className="text-mist/72"> · 八年一条主品牌路</span>
            </>
          }
          description="每一次升级都不是另起炉灶，而是把上一阶段跑通的能力沉淀进同一个主品牌。"
        />

        <div className="mt-16">
          <ol className="space-y-12 md:space-y-0">
            {milestones.map((m, i) => (
              <Reveal
                as="li"
                key={m.year}
                delay={i * 130}
                className="relative pl-9 md:pl-0"
              >
                <div className="md:grid md:grid-cols-12 md:gap-8">
                  {/* 年份 */}
                  <div className="md:col-span-3 md:pr-8 md:text-right">
                    <div className="lunai-num lunai-serif text-[clamp(1.75rem,3.4vw,2.5rem)] leading-none text-gold">
                      {m.year}
                    </div>
                    <div className="mt-2.5 text-sm tracking-[0.18em] text-snow/80">
                      {m.brand}
                    </div>
                    <div className="mt-1 text-xs text-mist/78">{m.theme}</div>
                  </div>

                  {/* 节点轴线：竖向贯穿全部节点 */}
                  <div className="hidden md:col-span-1 md:block">
                    <div className="relative h-full w-full">
                      {/* 轴线 */}
                      <span
                        className="absolute left-1/2 top-2 bottom-[-3rem] w-px -translate-x-1/2 bg-gradient-to-b from-gold/55 via-gold/25 to-transparent"
                        aria-hidden="true"
                      />
                      {/* 节点 */}
                      <span className="absolute left-1/2 top-1 flex h-[15px] w-[15px] -translate-x-1/2 items-center justify-center">
                        <span className="absolute h-[15px] w-[15px] rounded-full border border-gold/50" />
                        <span className="h-[5px] w-[5px] rounded-full bg-gold" />
                      </span>
                    </div>
                  </div>

                  {/* 内容 */}
                  <div className="md:col-span-8 md:pl-8">
                    <p className="max-w-2xl text-sm leading-relaxed text-mist/80 md:text-base md:leading-loose">
                      {m.detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={200} className="mt-16">
          <div className="flex flex-col gap-4 border-l-2 border-gold/50 bg-gold/[0.04] py-5 pl-6 md:flex-row md:items-center md:justify-between">
            <p className="lunai-serif text-lg text-snow md:text-xl">
              沿革 · 每一次升级都是能力的沉淀，不是另起炉灶
            </p>
            <span className="text-xs tracking-[0.22em] text-gold/70">
              2018 → 2026
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
