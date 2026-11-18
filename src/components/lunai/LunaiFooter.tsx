'use client';

import Link from 'next/link';
import BrandMark from './BrandMark';

const columns = [
  {
    title: '品牌',
    links: [
      { name: '关于路耐', href: '/about' },
      { name: '运营模式', href: '/solution' },
      { name: '资质背书', href: '/qualifications' },
      { name: '企业简介', href: '/general-web' },
    ],
  },
  {
    title: '合作',
    links: [
      { name: '加盟合作', href: '/franchise' },
      { name: '门店模型', href: '/franchise' },
      { name: '渠道合作', href: '/contact' },
      { name: '品牌授权', href: '/contact' },
    ],
  },
  {
    title: '系统',
    links: [
      { name: '智慧零售系统', href: '/login' },
      { name: '注册账号', href: '/register' },
      { name: '方案配置', href: '/configurator' },
      { name: '行业洞察', href: '/business-school' },
    ],
  },
];

export default function LunaiFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        {/* 上部：品牌 + 链接列 */}
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-5">
            <BrandMark size="lg" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-mist/65">
              浙江思杋服饰有限公司旗下「路耐 LUNAI」主品牌，下设路耐少年与路耐户外两条产品系列。
              以自有源头工厂、柔性供应链与数字化系统，支撑一个可复制的门店模型。
            </p>
            <div className="mt-7 space-y-2.5">
              <div className="flex items-baseline gap-3 text-sm">
                <span className="w-20 shrink-0 text-mist/40">加盟热线</span>
                <span className="lunai-num text-gold">400-0678-558</span>
              </div>
              <div className="flex items-baseline gap-3 text-sm">
                <span className="w-20 shrink-0 text-mist/40">官网</span>
                <span className="lunai-num text-snow/80">zjsifan.com</span>
              </div>
              <div className="flex items-baseline gap-3 text-sm">
                <span className="w-20 shrink-0 text-mist/40">总部</span>
                <span className="text-mist/75">
                  杭州市滨江区滨康路 188 号春风集团 6 幢 1 楼
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[0.62rem] uppercase tracking-[0.3em] text-gold/65">
                  {col.title}
                </h3>
                <ul className="mt-6 space-y-3.5">
                  {col.links.map((l) => (
                    <li key={l.name}>
                      <Link
                        href={l.href}
                        className="text-sm text-mist/65 transition-colors duration-300 hover:text-gold"
                      >
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 资质条 */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-4">
          {[
            { k: '特许经营备案', v: '1330100112500649' },
            { k: '增值电信业务许可', v: '浙 B2-20250051' },
            { k: '区域资质', v: '杭州滨江区高新技术企业' },
            { k: '平台资质', v: '抖音企业号官方服务商' },
          ].map((c) => (
            <div key={c.k} className="bg-ink px-5 py-5">
              <div className="text-[0.58rem] uppercase tracking-[0.24em] text-mist/40">
                {c.k}
              </div>
              <div className="lunai-num mt-2 text-xs leading-relaxed text-mist/80">
                {c.v}
              </div>
            </div>
          ))}
        </div>

        {/* 底部版权 */}
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 py-8 text-xs text-mist/40 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} 浙江思杋服饰有限公司　保留所有权利
          </p>
          <p className="lunai-num tracking-wide">
            运营模式及公司简介 V2.1 · 2026 年 11 月
          </p>
        </div>
      </div>
    </footer>
  );
}
