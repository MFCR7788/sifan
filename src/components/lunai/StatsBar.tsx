'use client';

import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';

/**
 * 数据概览带：数字滚动 + 统计口径
 * 这是全站说服力最强的部分——用可核验的经营数据代替形容词。
 */
function useCountUp(target: number, duration = 1600, start: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      // easeOutExpo，末尾减速更有质感
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

function Stat({
  value,
  suffix,
  prefix,
  label,
  note,
  decimals = 0,
  active,
  delay,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  note?: string;
  decimals?: number;
  active: boolean;
  delay: number;
}) {
  const v = useCountUp(value, 1600, active);
  return (
    <Reveal
      delay={delay}
      className="group relative border-t border-white/10 px-0 py-8 transition-colors duration-500 hover:border-gold/40 md:px-8"
    >
      <div className="lunai-num lunai-serif flex items-baseline text-[clamp(2rem,4.2vw,3.25rem)] leading-none text-snow">
        {prefix && <span className="mr-1 text-gold/80">{prefix}</span>}
        {v.toFixed(decimals)}
        {suffix && <span className="ml-1 text-gold/80">{suffix}</span>}
      </div>
      <div className="mt-4 text-sm tracking-wide text-snow/85">{label}</div>
      {note && (
        <div className="mt-1.5 text-xs leading-relaxed text-mist/78">{note}</div>
      )}
    </Reveal>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stats = [
    { value: 8, suffix: '年', label: '品牌沉淀', note: '2018 思美杋起家，三个品牌阶段全部收敛于路耐主品牌' },
    { value: 2, suffix: '个', prefix: '¥ 千亿', label: '双赛道市场', note: '校服与户外两个千亿级消费市场' },
    { value: 2, suffix: '亿+', label: '中小学生家庭', note: '路耐少年覆盖人群，采购决策链回到家长手里' },
    { value: 300, suffix: '+', label: '社区联营网点', note: '头部物业体系联营加盟，已成规模' },
    { value: 50, suffix: '㎡', label: '双品类单店模型', note: '2 人编制 · 错峰主推 · 积分闭环' },
    { value: 8, suffix: '个月', label: '常规档回本周期', note: '月销 13 万 · 毛利率 42% · 月净利 1.89 万' },
  ];

  return (
    <section className="relative border-y border-white/10 bg-ink">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {stats.map((s, i) => (
            <Stat
              key={s.label}
              {...s}
              active={active}
              delay={(i % 3) * 110}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
