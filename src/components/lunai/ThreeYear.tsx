'use client';

import Link from 'next/link';
import Reveal from './Reveal';
import SectionHeading from './Section';
import BrandMark from './BrandMark';

const years = [
  {
    year: '第 1 年',
    theme: '模型加密',
    tasks: [
      '浙江、河北样板店单店模型稳定',
      '区域公司制跑通',
      '合作机构全量建制化立账',
    ],
  },
  {
    year: '第 2 年',
    theme: '品类延伸',
    tasks: [
      '双品类店中店升级为「学生 + 户外生活方式驿站」',
      '配件与文创等延伸品类占比提升',
    ],
  },
  {
    year: '第 3 年',
    theme: '平台升维',
    tasks: [
      '向面料与加工端反向输出订单与标准',
      '向学校、家庭、户外俱乐部输出会员与服务',
    ],
  },
];

export default function ThreeYear() {
  return (
    <section className="relative overflow-hidden bg-ink-2">
      {/* 三年路径 */}
      <div className="py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
          <SectionHeading
            index="07"
            eyebrow="Roadmap"
            title={
              <>
                三年路径 · 从单店模型到生态平台
              </>
            }
          />

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {years.map((y, i) => (
              <Reveal key={y.year} delay={i * 130}>
                <article className="group relative h-full overflow-hidden rounded-xl border border-white/10 bg-ink p-8 transition-all duration-500 hover:border-gold/30">
                  <div className="flex items-baseline gap-3">
                    <span className="lunai-num text-xs tracking-[0.3em] text-gold/65">
                      {y.year}
                    </span>
                    {i < years.length - 1 && (
                      <span className="hidden flex-1 items-center lg:flex">
                        <span className="h-px flex-1 bg-gradient-to-r from-gold/35 to-transparent" />
                        <span className="px-2 text-gold/40">→</span>
                      </span>
                    )}
                  </div>

                  <h3 className="lunai-serif mt-4 text-[clamp(1.5rem,2.8vw,2rem)] text-snow">
                    {y.theme}
                  </h3>

                  <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
                    {y.tasks.map((t) => (
                      <li key={t} className="flex gap-3 text-sm leading-relaxed text-mist/78">
                        <span className="mt-[0.6rem] h-px w-2.5 shrink-0 bg-gold/55" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* 结语 + CTA */}
      <div className="relative border-t border-white/10">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(90% 120% at 50% 0%, #16233c 0%, #0a1120 55%, #080d18 100%)',
          }}
          aria-hidden="true"
        />
        <div className="lunai-grid absolute inset-0 opacity-60" aria-hidden="true" />

        <div className="relative mx-auto max-w-[1400px] px-6 py-24 sm:px-10 md:px-16 md:py-32">
          <Reveal>
            <div className="mx-auto text-center">
              <span className="text-[0.62rem] uppercase tracking-[0.42em] text-gold/65">
                Conclusion
              </span>
              <h2 className="lunai-serif mx-auto mt-6 max-w-[22ch] text-balance text-[clamp(1.9rem,4.6vw,3.25rem)] leading-[1.25] text-snow">
                一个主品牌，两个品类
                <span className="text-gold/50">，</span>
                一个可复制的模型
              </h2>
              <p className="mx-auto mt-7 max-w-2xl text-sm leading-relaxed text-mist/80 md:text-base md:leading-loose">
                路耐用一个主品牌把两个品类做进有公信力的消费场景，用柔性供应链与数字化系统把单店做成可复制的模型，
                再把模型铺成网络。对合作方而言，这是一套自带品牌力、自带货盘、自带引流能力与自带数据管理的门店单元。
              </p>
            </div>
          </Reveal>

          {/* CTA */}
          <Reveal delay={140} className="mt-14">
            <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-gold/25 bg-ink-3/50">
              <div className="relative px-8 py-12 text-center md:px-14 md:py-16">
                <div className="lunai-sweep pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" />
                <div className="relative">
                  <p className="lunai-serif text-[clamp(1.75rem,4.4vw,2.75rem)] leading-tight text-snow">
                    山高路远
                    <span className="mx-3 text-gold/45">·</span>
                    <span className="lunai-grad">一件路耐</span>
                  </p>

                  <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <Link
                      href="/contact"
                      className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-gold-light to-gold px-9 py-4 text-sm font-semibold tracking-wide text-ink transition-all duration-300 hover:shadow-[0_0_40px_-8px_rgba(200,169,106,0.6)]"
                    >
                      加盟 / 商务洽谈
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                    <Link
                      href="/franchise"
                      className="inline-flex items-center justify-center rounded-full border border-white/18 px-9 py-4 text-sm tracking-wide text-snow/90 transition-colors duration-300 hover:border-gold/60 hover:text-gold"
                    >
                      查看合作政策
                    </Link>
                  </div>

                  {/* 联系方式 */}
                  <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-3">
                    {[
                      { k: '加盟 / 商务热线', v: '400-0678-558' },
                      { k: '官网', v: 'zjsifan.com' },
                      { k: '总部地址', v: '杭州市滨江区滨康路 188 号春风集团 6 幢 1 楼' },
                    ].map((c) => (
                      <div key={c.k} className="bg-ink-2/90 px-6 py-6 text-left">
                        <div className="text-[0.58rem] uppercase tracking-[0.26em] text-mist/62">
                          {c.k}
                        </div>
                        <div className="lunai-num mt-2 text-sm leading-relaxed text-gold/90 md:text-[0.95rem]">
                          {c.v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 主体信息 */}
          <Reveal delay={200} className="mt-12">
            <div className="flex flex-col items-center gap-6 text-center">
              <BrandMark size="lg" />
              <div>
                <p className="lunai-serif text-base text-snow/90">浙江思杋服饰有限公司</p>
                <p className="mt-2 text-xs leading-relaxed text-mist/50">
                  特许经营备案 1330100112500649 · ICP 浙 B2-20250051
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline">　·　</span>
                  杭州滨江区高新技术企业认定 · 抖音企业号官方服务商
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
