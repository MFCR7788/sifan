'use client';

import Reveal from './Reveal';
import SectionHeading from './Section';

const modules = [
  {
    no: '01',
    name: '品牌端',
    title: '一个主品牌，两条产品系列',
    points: ['「耐」字超级符号', '5+5 系列命名', '一次研发双品类共享'],
    carrier: '母品牌 VI / 商标 / 统一话术',
  },
  {
    no: '02',
    name: '渠道端',
    title: '双轮驱动：品牌自营 + 店中店',
    points: ['新华书店体系', '头部物业联营', '校园机构客户'],
    carrier: '桐庐试点店 / 区域公司',
  },
  {
    no: '03',
    name: '门店端',
    title: '50 ㎡ 双品类单店模型',
    points: ['2 人编制', '错峰主推', '积分闭环 · 单店可复制'],
    carrier: '样板店 → 区域公司 → 省内加密 → 跨省复制',
  },
  {
    no: '04',
    name: '供应链端',
    title: '源头自持 + 柔性协作',
    points: ['三门源头工厂', '通用面料库', '校服由当地企业承接生产'],
    carrier: '面料库 / 按需生产',
  },
  {
    no: '05',
    name: '流量端',
    title: '1+N 全域新媒体矩阵',
    points: ['6 个总号 + 4 个系列号', '直播', '本地生活团购'],
    carrier: '抖音 / 视频号 / 公众号 / 小红书 / 小程序',
  },
  {
    no: '06',
    name: '系统与合规',
    title: '可穿透的数字化经营',
    points: ['智慧零售 3.0 建制化管理', '四流合一', '商标与授权合规'],
    carrier: '机构建账 / 收银结算',
  },
];

export default function SixModules() {
  return (
    <section className="relative overflow-hidden bg-ink-2 py-24 md:py-32">
      <div
        className="absolute -left-32 top-1/4 h-96 w-96 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(200,169,106,0.09) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        <SectionHeading
          index="03"
          eyebrow="Operating Model"
          title={
            <>
              运营模式 · 六大模块
            </>
          }
          description="品牌定内容 · 渠道定场景 · 供应链定交付 · 系统定可复制。六大模块各自有明确的落地载体，不是概念罗列。"
        />

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <Reveal key={m.no} delay={(i % 3) * 100}>
              <article className="group relative h-full bg-ink-2 p-8 transition-colors duration-500 hover:bg-ink-3/70 md:p-9">
                {/* 悬停金线 */}
                <span className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gold/70 transition-transform duration-500 group-hover:scale-x-100" />

                <div className="flex items-start justify-between gap-4">
                  <span className="lunai-num text-2xl font-light text-gold/45 transition-colors duration-500 group-hover:text-gold">
                    {m.no}
                  </span>
                  <span className="rounded-full border border-white/12 px-3 py-1 text-[0.62rem] tracking-[0.2em] text-mist/55">
                    {m.name}
                  </span>
                </div>

                <h3 className="lunai-serif mt-6 text-xl leading-snug text-snow">
                  {m.title}
                </h3>

                <ul className="mt-5 space-y-2">
                  {m.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-mist/75">
                      <span className="mt-[0.6rem] h-px w-2.5 shrink-0 bg-gold/55" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 border-t border-white/10 pt-4">
                  <div className="text-[0.6rem] uppercase tracking-[0.26em] text-mist/40">
                    载体
                  </div>
                  <div className="mt-1.5 text-xs leading-relaxed text-gold/75">
                    {m.carrier}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
