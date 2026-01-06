'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import StoreShowcase from '@/components/StoreShowcase';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex flex-col items-center px-4 pt-20">
        {/* Background Image Container - 70% size with rounded corners */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative w-[70%] h-[70vh] md:h-[70%] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src="/assets/image.png"
              alt="魔法超人"
              className="w-full h-full object-cover"
              style={{ opacity: 1 }}
            />
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center mt-[192px] md:mt-[228px]">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight"
            style={{
              textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)'
            }}
          >
            魔法超人
          </h1>
          <p className="mt-4 text-white font-semibold text-xl md:text-2xl max-w-2xl mx-auto">
            智能驱动，未来已来
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/pricing"
              className="px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              了解产品
            </Link>
            <Link
              href="/about"
              className="text-white hover:underline text-sm"
            >
              了解更多 &gt;
            </Link>
          </div>
        </div>
      </section>

      {/* Product Features Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight">
            强大功能
          </h2>
          <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
            每一项功能，都为您精心设计
          </p>
        </div>

        <div className="max-w-5xl mx-auto mt-16 grid gap-16">
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900">
                极速响应
              </h3>
              <p className="text-xl text-gray-600 mt-4">
                毫秒级响应速度，提供流畅的用户体验
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                <span className="text-6xl">⚡</span>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                <span className="text-6xl">🔒</span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900">
                安全可靠
              </h3>
              <p className="text-xl text-gray-600 mt-4">
                企业级安全架构，全方位保护您的数据
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900">
                灵活定制
              </h3>
              <p className="text-xl text-gray-600 mt-4">
                多种方案配置，满足您的个性化需求
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                <span className="text-6xl">⚙️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Showcase Section */}
      <section className="py-24 md:py-32 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight">
            门店展示
          </h2>
          <p className="text-xl text-gray-600 mt-6">
            全方位覆盖您的业务场景
          </p>
        </div>
        <StoreShowcase />
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight">
            立即开始
          </h2>
          <p className="text-xl text-gray-600 mt-6 mb-8">
            选择最适合您的方案，开启智能之旅
          </p>
          <Link
            href="/pricing"
            className="inline-block px-10 py-4 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            查看产品报价
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-500 mb-4">
            Copyright © 2025 浙江思杋服饰有限公司 魔法超人团队. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <Link href="/about" className="hover:underline">关于我们</Link>
            <Link href="/pricing" className="hover:underline">产品报价</Link>
            <Link href="/franchise" className="hover:underline">招商加盟</Link>
            <Link href="/contact" className="hover:underline">联系我们</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
