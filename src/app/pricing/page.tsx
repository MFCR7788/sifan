'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

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

    // 从URL参数获取选中的方案
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam === 'basic' || planParam === 'premium' || planParam === 'ultimate') {
      setSelectedPlan(planParam);
    }
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
      price: '2580',
      description: '适合门店、个体户',
      color: 'text-gray-900',
      badge: ''
    },
    {
      id: 'premium' as const,
      name: '旗舰版',
      version: '3.0',
      price: '12980',
      description: '适合中大型企业',
      color: 'text-gray-900',
      badge: '推荐'
    },
    {
      id: 'ultimate' as const,
      name: '至尊版',
      version: '3.0',
      price: '29800',
      description: '适合集团企业',
      color: 'text-gray-900',
      badge: '尊享'
    }
  ];

  const getPlanValue = (item: PricingData, planId: 'basic' | 'premium' | 'ultimate') => {
    if (planId === 'basic') return item['基础版3.0系统'];
    if (planId === 'premium') return item['旗舰版3.0系统'];
    if (planId === 'ultimate') return item['至尊版3.0'];
    return '';
  };

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

  const currentPlan = plans.find(p => p.id === selectedPlan);
  const filteredFeatures = data.filter(item => {
    const value = getPlanValue(item, selectedPlan);
    return !isNotSupported(value);
  });

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

      {/* Plan Selection */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`
                  relative p-8 rounded-3xl transition-all
                  ${selectedPlan === plan.id
                    ? 'bg-gray-900 text-white shadow-2xl'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  }
                `}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className={`px-4 py-1 text-xs font-semibold rounded-full ${
                      selectedPlan === plan.id ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-semibold mb-2">{plan.name}{plan.version}</h3>
                <p className={`text-sm ${selectedPlan === plan.id ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-5xl font-bold">¥{plan.price}</span>
                  <span className={`text-sm ${selectedPlan === plan.id ? 'text-gray-400' : 'text-gray-600'}`}>/年</span>
                </div>
              </button>
            ))}
          </div>

          {/* Features List */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
              {currentPlan?.name}功能列表
            </h2>
            <div className="space-y-4">
              {filteredFeatures.map((item, index) => {
                const value = getPlanValue(item, selectedPlan);
                const monthlyPrice = item['价格/月'] as number;
                return (
                  <div
                    key={index}
                    className="flex items-start justify-between py-4 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex-1">
                      <div className="text-lg font-medium text-gray-900">{item['功能名称']}</div>
                      {monthlyPrice > 0 && (
                        <div className="text-sm text-gray-500 mt-1">¥{monthlyPrice}/月</div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {isSupported(value) ? (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm">
                          {isNotSupported(value) ? '—' : value}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
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
            <a href="/about" className="hover:underline">关于我们</a>
            <a href="/franchise" className="hover:underline">招商加盟</a>
            <a href="/contact" className="hover:underline">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
