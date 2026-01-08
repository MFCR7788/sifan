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

// 试用版模态框组件
function TrialModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <h3 className="text-2xl font-bold text-white">立即体验试用版</h3>
          <p className="text-blue-100 mt-1">填写信息，免费开启试用之旅</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-6">
            {/* 试用说明 */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-3">试用版包含功能：</h4>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>基础营销工具（秒杀、拼团、优惠券等）</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>会员管理系统</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>基础数据分析报表</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>7天免费试用期</span>
                </li>
              </ul>
            </div>

            {/* 联系表单 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  公司名称
                </label>
                <input
                  type="text"
                  placeholder="请输入公司名称"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系人
                </label>
                <input
                  type="text"
                  placeholder="请输入联系人姓名"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  手机号码
                </label>
                <input
                  type="tel"
                  placeholder="请输入手机号码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <a
              href="https://mfcr.zjsifan.com/index.php/Retail/Login/register.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-center font-medium"
            >
              提交申请
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ValueProposition() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showTrialModal, setShowTrialModal] = useState(false);

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
          <button
            onClick={() => setShowTrialModal(true)}
            className="inline-block px-10 py-4 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            立即体验试用版
          </button>
        </div>

        {/* Trial Modal */}
        <TrialModal
          isOpen={showTrialModal}
          onClose={() => setShowTrialModal(false)}
        />
      </div>
    </section>
  );
}
