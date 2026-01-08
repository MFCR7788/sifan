'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

interface PricingData {
  '功能名称': string;
  '价格/月': number;
  '基础版3.0系统': string;
  '旗舰版3.0系统': string;
  '至尊版3.0': string;
}

export default function PricingPage() {
  const [data, setData] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'ultimate'>('premium');

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const response = await fetch('/api/pricing');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
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
      version: '3.0',
      price: '2980',
      description: '适合门店、个体户',
      columnKey: '基础版3.0系统' as const
    },
    {
      id: 'premium' as const,
      name: '旗舰版',
      version: '3.0',
      price: '12980',
      description: '适合中大型企业',
      recommended: true,
      columnKey: '旗舰版3.0系统' as const
    },
    {
      id: 'ultimate' as const,
      name: '至尊版',
      version: '3.0',
      price: '29800',
      description: '适合集团企业',
      columnKey: '至尊版3.0' as const
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
                  <th className="text-left p-6 pb-8 min-w-[200px]">
                    <div className="text-2xl font-semibold text-gray-900">功能对比</div>
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`
                        p-6 pb-8 min-w-[200px] relative cursor-pointer transition-all duration-300
                        ${plan.recommended ? 'bg-gray-50' : ''}
                        ${selectedPlan === plan.id ? 'bg-blue-50/50 ring-2 ring-blue-500 ring-offset-2' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-2xl font-semibold transition-colors ${
                          selectedPlan === plan.id
                            ? 'text-blue-900'
                            : plan.recommended
                            ? 'text-gray-900'
                            : 'text-gray-700'
                        }`}>
                          {plan.name}{plan.version}
                        </div>
                        <div className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
                          ${selectedPlan === plan.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 hover:border-gray-400'
                          }
                        `}>
                          {selectedPlan === plan.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      {plan.recommended && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                          <span className={`px-4 py-1 text-xs font-semibold rounded-full ${
                            selectedPlan === plan.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-900 text-white'
                          }`}>
                            推荐
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-gray-500 mb-4">{plan.description}</div>
                      <div className={`text-5xl font-bold transition-colors ${
                        selectedPlan === plan.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        ¥{plan.price}
                      </div>
                      <div className="text-sm text-gray-500">/年</div>
                      <Link
                        href={`/configurator?plan=${plan.id}`}
                        className={`
                          mt-6 inline-block w-full py-3 px-6 text-center font-medium rounded-xl transition-all
                          ${plan.recommended || selectedPlan === plan.id
                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }
                          ${selectedPlan === plan.id ? 'shadow-lg' : ''}
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
                      const isSelected = selectedPlan === plan.id;
                      return (
                        <td
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`
                            p-6 align-top text-center cursor-pointer transition-all duration-300
                            ${plan.recommended ? 'bg-gray-50' : ''}
                            ${isSelected ? 'bg-blue-50/50 ring-2 ring-blue-500 ring-offset-2' : ''}
                          `}
                        >
                          {isSupported(value) ? (
                            <div className={`
                              flex items-center justify-center w-8 h-8 mx-auto rounded-full transition-all duration-300
                              ${isSelected ? 'bg-blue-500 text-white scale-110' : 'bg-gray-900 text-white'}
                            `}>
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
                            <span className={`
                              transition-colors duration-300
                              ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-600'}
                            `}>{value}</span>
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
