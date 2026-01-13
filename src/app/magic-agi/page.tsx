'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function MagicAGIPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Main Content */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-8">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight mb-8">
            魔法AGI
          </h1>

          <div className="space-y-4">
            <p className="text-2xl md:text-3xl text-gray-600">
              正在开发，敬请期待......
            </p>
            <p className="text-lg text-gray-500">
              敬请关注我们的最新动态
            </p>
          </div>

          <div className="mt-12">
            <Link
              href="/"
              className="inline-flex items-center px-8 py-3 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
