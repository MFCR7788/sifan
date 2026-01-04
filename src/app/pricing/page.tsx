'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface PricingData {
  '功能名称': string;
  '单价（元）': string | number;
  '基础版3.0系统': string;
  '旗舰版3.0系统': string;
  '至尊版3.0系统'?: string;
  '描述'?: string;
}

export default function PricingPage() {
  const [data, setData] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'basic' | 'premium' | 'ultimate'>('all');

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
    const basicValue = String(item['基础版3.0系统'] || '');
    const premiumValue = String(item['旗舰版3.0系统'] || '');

    if (filter === 'basic') return basicValue !== '×' && basicValue.trim() !== '×';
    if (filter === 'premium') return premiumValue !== '×' && premiumValue.trim() !== '×';
    if (filter === 'ultimate') return true; // 至尊版显示所有功能
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
      <Navigation />

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
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
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
            <button
              onClick={() => setFilter('ultimate')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                filter === 'ultimate'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              至尊版
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
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

            {/* Ultimate Card */}
            <div className="p-8 bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm rounded-2xl border-2 border-purple-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-full font-semibold">
                  旗舰尊享
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-2 text-purple-400">至尊版3.0系统</h3>
              <p className="text-gray-400 mb-6">适合集团企业</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">29800</span>
                <span className="text-xl text-gray-400">元/年</span>
              </div>
              <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                选择至尊版
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
                    <th className="px-6 py-4 text-center text-cyan-400 font-semibold">至尊版3.0</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => {
                    const basicSupport = item['基础版3.0系统'] === '√' || item['基础版3.0系统'] === '支持';
                    const premiumSupport = item['旗舰版3.0系统'] === '√' || item['旗舰版3.0系统'] === '支持';
                    // 至尊版所有功能都支持
                    const ultimateSupport = true;

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
                        <td className="px-6 py-4 text-center">
                          {ultimateSupport ? (
                            <span className="text-cyan-400 font-bold text-lg">✓</span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {/* 上门指导1个月 - 仅至尊版支持，只在筛选至尊版或全部时显示 */}
                  {(filter === 'ultimate' || filter === 'all') && (
                    <tr className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-transparent">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">上门指导1个月</div>
                        <div className="text-sm text-cyan-400 mt-1">专属顾问上门服务</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-600">-</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-600">-</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-cyan-400 font-bold text-lg">✓</span>
                      </td>
                    </tr>
                  )}
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
              <div className="text-3xl font-bold text-cyan-400 mb-2">{filteredData.length + 1}</div>
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
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {filteredData.length + 1}
              </div>
              <div className="text-gray-400">至尊版功能</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl border border-cyan-500/30 text-center mb-8">
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

          {/* Contact Info */}
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Company */}
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">公司名称</h3>
                <p className="text-gray-300">浙江思杋服饰有限公司</p>
              </div>

              {/* Team */}
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">团队名称</h3>
                <p className="text-gray-300">魔法超人团队</p>
              </div>

              {/* Phone */}
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">联系电话</h3>
                <p className="text-cyan-400 font-semibold text-lg">400-0678-558</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 浙江思杋服饰有限公司 魔法超人团队. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
