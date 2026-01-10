'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

interface PricingData {
  '功能名称': string;
  '价格/月': number;
  '基础版4.0系统': string;
  '旗舰版4.0系统': string;
  '至尊版4.0': string;
}

export default function PricingPage() {
  const [data, setData] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'ultimate' | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<'basic' | 'premium' | 'ultimate' | null>(null);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const response = await fetch('/api/pricing');
      const result = await response.json();

      if (result.success) {
        // 过滤掉不需要显示的行
        const filteredData = result.data.filter((item: any) => {
          const name = item['功能名称'];
          return !name.includes('分销点') && !name.includes('门头形象');
        });
        setData(filteredData);
      }
    } catch (err) {
      console.error('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'basic' as const,
      name: '基础版',
      version: '4.0',
      price: '2980',
      description: '适合门店、个体户',
      columnKey: '基础版4.0系统' as const
    },
    {
      id: 'premium' as const,
      name: '旗舰版',
      version: '4.0',
      price: '12980',
      description: '适合中大型企业',
      recommended: true,
      columnKey: '旗舰版4.0系统' as const
    },
    {
      id: 'ultimate' as const,
      name: '至尊版',
      version: '4.0',
      price: '29800',
      description: '适合集团企业',
      columnKey: '至尊版4.0' as const
    }
  ];

  const isSupported = (value: string) => {
    return value === '√' || value === '支持';
  };

  const isNotSupported = (value: string) => {
    return value === '×';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-gray-900 tracking-tight">
            产品报价
          </h1>
          <p className="text-xl text-gray-600 mt-6">
            选择最适合您的方案
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr>
                  <th className="text-center p-8 pb-12 min-w-[200px] align-middle">
                    <div className="text-2xl font-semibold text-gray-900">功能对比</div>
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      onMouseEnter={() => setHoveredPlan(plan.id)}
                      onMouseLeave={() => setHoveredPlan(null)}
                      className={`
                        p-8 pb-12 min-w-[200px] cursor-pointer transition-all duration-300 align-bottom relative
                        ${selectedPlan === plan.id
                          ? 'border-2 border-blue-600 bg-blue-50 shadow-xl scale-105'
                          : hoveredPlan === plan.id
                          ? 'border-2 border-blue-300 bg-blue-50 shadow-2xl scale-[1.02]'
                          : 'border-2 border-gray-200 hover:border-gray-300'
                        }
                        ${plan.recommended && selectedPlan !== plan.id && hoveredPlan !== plan.id ? 'bg-gray-50' : ''}
                      `}
                    >
                      {selectedPlan === plan.id && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center z-10">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div
                        className={`
                          absolute top-4 right-4 w-2 h-2 rounded-full transition-all duration-300
                          ${hoveredPlan === plan.id && selectedPlan !== plan.id ? 'bg-blue-600 scale-150' : 'bg-gray-300'}
                        `}
                      />
                      {plan.recommended && (
                        <div className="mb-3">
                          <span className={`px-4 py-1 text-xs font-semibold rounded-full ${
                            selectedPlan === plan.id || hoveredPlan === plan.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-900 text-white'
                          }`}>
                            推荐
                          </span>
                        </div>
                      )}
                      <div className={`text-2xl font-semibold transition-colors ${
                        selectedPlan === plan.id || hoveredPlan === plan.id
                          ? 'text-blue-900'
                          : plan.recommended
                          ? 'text-gray-900'
                          : 'text-gray-700'
                      }`}>
                        {plan.name}{plan.version}
                      </div>
                      <div className="text-sm text-gray-500 mb-6">{plan.description}</div>
                      <div className={`text-5xl font-bold transition-colors ${
                        selectedPlan === plan.id || hoveredPlan === plan.id ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        ¥{plan.price}
                      </div>
                      <div className="text-sm text-gray-500 mb-6">/年</div>
                      <Link
                        href={`/configurator?plan=${plan.id}`}
                        className={`
                          inline-block w-full py-3 px-6 text-center font-medium rounded-xl transition-all
                          ${selectedPlan === plan.id
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : hoveredPlan === plan.id
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }
                        `}
                      >
                        立即购买
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="p-6 align-top">
                      <div className="text-base font-medium text-gray-900 mb-1">{item['功能名称']}</div>
                      {item['价格/月'] > 0 && (
                        <div className="text-sm text-gray-500">¥{item['价格/月'] * 12}/年</div>
                      )}
                    </td>
                    {plans.map((plan) => {
                      const value = item[plan.columnKey];
                      return (
                        <td
                          key={plan.id}
                          className="p-6 align-top text-center"
                        >
                          {isSupported(value) ? (
                            <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-full bg-gray-900 text-white">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : isNotSupported(value) ? (
                            <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-full bg-gray-200 text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                          ) : (
                            <span className="text-gray-600">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>      {/* Stats */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl md:text-6xl font-semibold text-gray-900 mb-2">
                {data.length}
              </div>
              <div className="text-gray-600">功能数量</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-semibold text-gray-900 mb-2">
                {data.filter(d => d['基础版3.0系统'] !== '×').length}
              </div>
              <div className="text-gray-600">基础版功能</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-semibold text-gray-900 mb-2">
                {data.filter(d => d['旗舰版3.0系统'] !== '×').length}
              </div>
              <div className="text-gray-600">旗舰版功能</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-500 mb-4">
            Copyright © 2025 浙江思杋服饰有限公司 魔法超人团队. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <a href="/" className="hover:underline">首页</a>
            <a href="/pricing" className="hover:underline">产品</a>
            <a href="/configurator" className="hover:underline">定制</a>
            <a href="/franchise" className="hover:underline">加盟</a>
            <a href="/about" className="hover:underline">关于</a>
            <a href="/contact" className="hover:underline">联系</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
