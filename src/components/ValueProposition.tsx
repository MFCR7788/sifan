'use client';

import { useState } from 'react';
import Link from 'next/link';

const valueProps = [
  {
    icon: '🎯',
    title: '精准引流',
    description: '全渠道精准获客，提升品牌曝光度',
    benefit: '获客成本降低50%'
  },
  {
    icon: '📊',
    title: '私域沉淀',
    description: '打造私域流量池，持续转化',
    benefit: '客户复购率提升3倍'
  },
  {
    icon: '🚀',
    title: '智能获客',
    description: 'AI驱动自动化营销，高效转化',
    benefit: '运营效率提升200%'
  },
  {
    icon: '🔒',
    title: '数据安全',
    description: '企业级安全保障，数据加密存储',
    benefit: '100% 数据安全'
  }
];

export default function ValueProposition() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight mb-6">
            为什么选择魔法超人
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            每一项功能，都为您的业务增长精心设计
          </p>
        </div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {valueProps.map((prop, index) => (
            <div
              key={index}
              className={`
                group relative p-8 rounded-3xl border transition-all duration-300
                ${hoveredIndex === index
                  ? 'bg-blue-50 border-blue-300 shadow-2xl scale-[1.02]'
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg'
                }
              `}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Icon */}
              <div
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-all duration-300
                  ${hoveredIndex === index
                    ? 'bg-blue-600 scale-110'
                    : 'bg-gray-100 group-hover:bg-gray-200'
                  }
                `}
              >
                {prop.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                {prop.title}
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                {prop.description}
              </p>
              <div
                className={`
                  inline-block px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${hoveredIndex === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700'
                  }
                `}
              >
                {prop.benefit}
              </div>

              {/* Hover Effect Indicator */}
              <div
                className={`
                  absolute top-4 right-4 w-2 h-2 rounded-full transition-all duration-300
                  ${hoveredIndex === index ? 'bg-blue-600 scale-150' : 'bg-gray-300'}
                `}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <a
            href="https://mfcr.zjsifan.com/index.php/Retail/Login/register.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            立即体验试用版
          </a>
        </div>
      </div>
    </section>
  );
}
