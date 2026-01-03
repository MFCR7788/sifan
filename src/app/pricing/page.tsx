'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PricingData {
  '功能名称': string;
  '单价（元）': string | number;
  '基础版3.0系统': string;
  '旗舰版3.0系统': string;
  '描述'?: string;
}

export default function PricingPage() {
  const [data, setData] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'basic' | 'premium'>('all');

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const response = await fetch('/api/pricing');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError('Failed to load pricing data');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = filter === 'all' ? data : data.filter((item) => {
    if (filter === 'basic') return item['基础版3.0系统'] !== '×';
    if (filter === 'premium') return item['旗舰版3.0系统'] !== '×';
    return true;
  });

  // 获取基础版和旗舰版的年费
  const getBasicAnnualFee = () => {
    const item = data.find((d) => d['功能名称'] === '次年人工售后服务费');
    return item?.['基础版3.0系统'] || '-';
  };

  const getPremiumAnnualFee = () => {
    const item = data.find((d) => d['功能名称'] === '次年人工售后服务费');
    return item?.['旗舰版3.0系统'] || '-';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchPricingData}
            className="px-6 py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                MagicAI
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-300 hover:text-cyan-400 transition-colors">
                首页
              </Link>
              <Link href="/pricing" className="text-cyan-400">
                产品报价
              </Link>
              <Link href="/#features" className="text-gray-300 hover:text-cyan-400 transition-colors">
                功能特性
              </Link>
              <Link href="/#contact" className="text-gray-300 hover:text-cyan-400 transition-colors">
                联系我们
              </Link>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-semibold hover:opacity-90 transition-opacity">
                立即体验
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              产品报价方案
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            选择最适合您需求的解决方案
          </p>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              全部功能
            </button>
            <button
              onClick={() => setFilter('basic')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                filter === 'basic'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              基础版
            </button>
            <button
              onClick={() => setFilter('premium')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                filter === 'premium'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              旗舰版
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Basic Card */}
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-colors">
              <h3 className="text-3xl font-bold mb-2 text-cyan-400">基础版3.0系统</h3>
              <p className="text-gray-400 mb-6">适合小型企业</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">2980</span>
                <span className="text-xl text-gray-400">元/年</span>
              </div>
              <button className="w-full px-6 py-3 bg-white/10 border border-cyan-500 rounded-lg font-semibold hover:bg-cyan-500 hover:text-white transition-colors">
                选择基础版
              </button>
            </div>

            {/* Premium Card */}
            <div className="p-8 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl border-2 border-cyan-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 bg-cyan-500 text-white text-sm rounded-full font-semibold">
                  推荐选择
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-2 text-cyan-400">旗舰版3.0系统</h3>
              <p className="text-gray-400 mb-6">适合中大型企业</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">12980</span>
                <span className="text-xl text-gray-400">元/年</span>
              </div>
              <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                选择旗舰版
              </button>
            </div>
          </div>

          {/* Pricing Table */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-cyan-400 font-semibold">功能名称</th>
                    <th className="px-6 py-4 text-center text-cyan-400 font-semibold">基础版3.0</th>
                    <th className="px-6 py-4 text-center text-cyan-400 font-semibold">旗舰版3.0</th>
                    <th className="px-6 py-4 text-right text-cyan-400 font-semibold">单价</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => {
                    const isPrice = typeof item['单价（元）'] === 'number' && item['单价（元）'] > 0;
                    const basicSupport = item['基础版3.0系统'] === '√' || item['基础版3.0系统'] === '支持';
                    const premiumSupport = item['旗舰版3.0系统'] === '√' || item['旗舰版3.0系统'] === '支持';

                    return (
                      <tr
                        key={index}
                        className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                          index % 2 === 0 ? '' : 'bg-white/[0.02]'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{item['功能名称']}</div>
                          {item['描述'] && (
                            <div className="text-sm text-gray-500 mt-1">{item['描述']}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {basicSupport ? (
                            <span className="text-cyan-400 font-bold text-lg">✓</span>
                          ) : item['基础版3.0系统'] === '×' ? (
                            <span className="text-gray-600">-</span>
                          ) : (
                            <span className="text-gray-300">{item['基础版3.0系统']}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {premiumSupport ? (
                            <span className="text-cyan-400 font-bold text-lg">✓</span>
                          ) : item['旗舰版3.0系统'] === '×' ? (
                            <span className="text-gray-600">-</span>
                          ) : (
                            <span className="text-gray-300">{item['旗舰版3.0系统']}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isPrice ? (
                            <span className="text-cyan-400 font-bold">
                              ¥{item['单价（元）']}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{filteredData.length}</div>
              <div className="text-gray-400">功能数量</div>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                {data.filter(d => d['基础版3.0系统'] !== '×').length}
              </div>
              <div className="text-gray-400">基础版功能</div>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                {data.filter(d => d['旗舰版3.0系统'] !== '×').length}
              </div>
              <div className="text-gray-400">旗舰版功能</div>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                {data.filter(d => typeof d['单价（元）'] === 'number' && d['单价（元）'] > 0).length}
              </div>
              <div className="text-gray-400">付费功能</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl border border-cyan-500/30 text-center">
            <h2 className="text-3xl font-bold mb-4">
              需要定制方案？
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              联系我们的专业团队，为您量身定制最合适的解决方案
            </p>
            <button className="px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors">
              联系我们
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 MagicAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
