'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ValueProposition from '@/components/ValueProposition';
import ProductPreview from '@/components/ProductPreview';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex flex-col items-center px-4 pt-20">
        {/* Background Image Container - 70% size with rounded corners */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
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
        <div className={`relative z-10 text-center mt-[135px] md:mt-[171px] transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2
            className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight"
            style={{
              textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2)'
            }}
          >
            3.0
          </h2>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight mt-2"
            style={{
              textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2)'
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
              className="group px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 hover:scale-105 hover:shadow-lg transition-all duration-200"
            >
              了解产品
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-gray-200 hover:underline text-sm transition-all duration-200"
            >
              了解更多 &gt;
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <ValueProposition />

      {/* Product Preview Section */}
      <ProductPreview />

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
            className="inline-block px-10 py-4 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            定制您的方案
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
