'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PricingData {
  [key: string]: any;
}

export default function PricingPage() {
  const [data, setData] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

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

  // 获取所有列名作为过滤器选项
  const allKeys = data.length > 0 ? Object.keys(data[0]) : [];
  const priceKey = allKeys.find(key => key.includes('价') || key.includes('price') || key.includes('Price'));

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
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              产品报价方案
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            选择最适合您需求的解决方案
          </p>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 p-4 overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left">
                    {allKeys.map((key) => (
                      <th key={key} className="px-4 py-3 text-cyan-400 font-semibold">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <tbody>
                  {data.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                        index % 2 === 0 ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      {allKeys.map((key) => {
                        const value = row[key];
                        const isPrice = key === priceKey && typeof value === 'string' && value.includes('¥');

                        return (
                          <td
                            key={key}
                            className={`px-4 py-4 ${
                              isPrice ? 'text-cyan-400 font-bold text-lg' : 'text-gray-300'
                            }`}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Comparison */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {data.slice(0, 3).map((row, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border ${
                  index === 1
                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {index === 1 && (
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-cyan-500 text-white text-sm rounded-full">
                      推荐
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">
                  {row[allKeys[0]] || `方案 ${index + 1}`}
                </h3>
                <div className="text-3xl font-bold text-cyan-400 mb-4">
                  {priceKey && row[priceKey] ? row[priceKey] : '自定义'}
                </div>
                <ul className="space-y-2 text-gray-300">
                  {allKeys.slice(1, 4).map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        <span className="text-gray-500">{key}:</span> {row[key]}
                      </span>
                    </li>
                  ))}
                </ul>
                <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  选择此方案
                </button>
              </div>
            ))}
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
