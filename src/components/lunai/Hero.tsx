'use client';

import Link from 'next/link';

/**
 * Hero：山高路远 · 一件路耐
 * 视觉策略：深墨蓝渐层 + 细网格纹理 + 金色扫描光，不依赖位图，
 * 既保证「高端克制」的质感，也不增加任何图片传输成本。
 */
export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-ink">
      {/* 底层渐层 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, #16233c 0%, #0d1526 45%, #080d18 100%)',
        }}
        aria-hidden="true"
      />
      {/* 网格纹理 */}
      <div className="absolute inset-0 lunai-grid opacity-70" aria-hidden="true" />

      {/* 顶部与底部压暗，让上下区块衔接自然 */}
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{ background: 'linear-gradient(to bottom, #080d18, transparent)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-56"
        style={{ background: 'linear-gradient(to top, #080d18, transparent)' }}
        aria-hidden="true"
      />

      {/* 右侧微光 */}
      <div
        className="lunai-pulse absolute -right-40 top-1/3 h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(200,169,106,0.14) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col justify-between px-6 pb-14 pt-28 sm:px-10 md:px-16 md:pt-32">
        {/* 主文案 */}
        <div className="py-8 md:py-10">
          <p
            className="lunai-fade text-[0.7rem] uppercase tracking-[0.5em] text-gold/75 md:text-xs"
            style={{ animationDelay: '120ms' }}
          >
            浙江思杋服饰有限公司 · 运营模式及公司简介 V2.1
          </p>

          <h1
            className="lunai-fade mt-7 max-w-5xl text-[clamp(2.75rem,8.5vw,7rem)] font-semibold leading-[1.08] tracking-tight text-snow"
            style={{ animationDelay: '260ms' }}
          >
            <span className="lunai-serif">山高路远</span>
            <span className="mx-3 text-gold/40 md:mx-5">·</span>
            <span className="lunai-grad">一件路耐</span>
          </h1>

          <p
            className="lunai-fade mt-9 max-w-3xl text-base leading-relaxed text-mist/85 md:text-xl md:leading-loose"
            style={{ animationDelay: '420ms' }}
          >
            一个主品牌，两条产品系列，六大运营模块，一个可复制的单店模型。
            <br className="hidden md:block" />
            路耐把校服与户外两段积累合并到同一品牌资产之下，
            对外统一识别、统一商标、统一话术。
          </p>

          <div
            className="lunai-fade mt-12 flex flex-col gap-4 sm:flex-row sm:items-center"
            style={{ animationDelay: '560ms' }}
          >
            <Link
              href="/franchise"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-gold-light to-gold px-9 py-4 text-sm font-semibold tracking-wide text-ink transition-all duration-300 hover:shadow-[0_0_40px_-8px_rgba(200,169,106,0.6)]"
            >
              查看单店模型
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-9 py-4 text-sm tracking-wide text-snow/90 transition-colors duration-300 hover:border-gold/60 hover:text-gold"
            >
              了解路耐
            </Link>
          </div>
        </div>

        {/* 底部双赛道标签 */}
        <div
          className="lunai-fade grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2"
          style={{ animationDelay: '700ms' }}
        >
          {[
            { tag: 'LUNAI JUNIOR', cn: '路耐少年', desc: '校服里外，一身讲究', link: '/solution' },
            { tag: 'LUNAI OUTDOOR', cn: '路耐户外', desc: '山系通勤，专业户外国货', link: '/solution' },
          ].map((item) => (
            <Link
              key={item.tag}
              href={item.link}
              className="group bg-ink-2/80 px-7 py-6 transition-colors duration-300 hover:bg-ink-3/80"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[0.6rem] uppercase tracking-[0.34em] text-gold/60">
                  {item.tag}
                </span>
                <span className="text-gold/0 transition-colors duration-300 group-hover:text-gold/70">
                  →
                </span>
              </div>
              <p className="lunai-serif mt-2.5 text-2xl text-snow">{item.cn}</p>
              <p className="mt-1.5 text-sm text-mist/92">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
