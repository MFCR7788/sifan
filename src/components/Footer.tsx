'use client';

import Link from 'next/link';

const footerSections = [
  {
    title: '产品',
    links: [
      { name: '产品方案', href: '/pricing' },
      { name: '定制方案', href: '/configurator' },
      { name: '功能介绍', href: 'https://www.yuque.com/qingfeng-kbbz1/xvvm82', external: true },
    ],
  },
  {
    title: '资源',
    links: [
      { name: '更新日志', href: '#changelog' },
      { name: '文档', href: '#docs' },
      { name: '学习', href: '#learn' },
      { name: '论坛', href: '#forum' },
    ],
  },
  {
    title: '公司',
    links: [
      { name: '关于我们', href: '/about' },
      { name: '联系我们', href: '/contact' },
      { name: '招商加盟', href: '/franchise' },
    ],
  },
  {
    title: '支持',
    links: [
      { name: '帮助中心', href: '#help' },
      { name: '隐私政策', href: '#privacy' },
      { name: '服务条款', href: '#terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Menu Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-16">
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col space-y-6">
              <h3 className="text-sm font-semibold text-gray-900">
                {section.title}
              </h3>
              <div className="flex flex-col space-y-4">
                {section.links.map((link) => {
                  const isExternal = 'external' in link && link.external;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors py-2 min-h-[44px] flex items-center"
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500">
            Copyright © 2025 浙江思杋服饰有限公司 魔法超人团队. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
