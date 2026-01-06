'use client';

import { useState } from 'react';
import Link from 'next/link';

const products = [
  {
    id: 1,
    name: '基础运营版',
    price: '¥300/月',
    features: ['线上小程序商城', '线下收银系统', '数据分析报表', '客服支持'],
    popular: false
  },
  {
    id: 2,
    name: '深度代运营版',
    price: '¥19,800/月',
    features: ['全平台深度运营', '定制化内容策略', '专业团队托管', '效果优化'],
    popular: true
  },
  {
    id: 3,
    name: '定制化方案',
    price: '面议',
    features: ['专属运营方案', '一对一顾问服务', '个性化定制', '专属项目经理'],
    popular: false
  }
];

export default function ProductPreview() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight mb-6">
            选择适合您的方案
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            灵活的定价，满足不同阶段的企业需求
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className={`
                relative p-8 rounded-3xl border-2 transition-all duration-300
                ${product.popular
                  ? 'bg-blue-600 border-blue-600 shadow-2xl scale-105'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl'
                }
                ${hoveredProduct === product.id && !product.popular ? 'scale-105' : ''}
              `}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Popular Badge */}
              {product.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                  热门选择
                </div>
              )}

              {/* Header */}
              <div className={`text-center mb-8 ${product.popular ? 'text-white' : 'text-gray-900'}`}>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">{product.name}</h3>
                <div className="text-3xl md:text-4xl font-bold">{product.price}</div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {product.features.map((feature, index) => (
                  <div key={index} className={`flex items-start gap-3 ${product.popular ? 'text-white' : 'text-gray-600'}`}>
                    <span className={`mt-1 ${product.popular ? 'text-blue-200' : 'text-blue-600'}`}>
                      ✓
                    </span>
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              {product.id === 1 ? (
                <Link
                  href="/pricing?plan=basic"
                  className={`
                    block w-full py-3 px-6 rounded-full font-medium transition-all duration-200 text-center
                    bg-gray-900 text-white hover:bg-gray-800 hover:scale-105
                  `}
                >
                  了解更多
                </Link>
              ) : (
                <button
                  className={`
                    w-full py-3 px-6 rounded-full font-medium transition-all duration-200
                    ${product.popular
                      ? 'bg-white text-blue-600 hover:bg-gray-100 hover:scale-105'
                      : 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105'
                    }
                  `}
                >
                  {product.popular ? '立即选择' : '了解更多'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12 text-gray-600">
          <p className="text-lg">
            所有方案均包含专业技术支持和数据安全保障
          </p>
        </div>
      </div>
    </section>
  );
}
