'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function MobileAdminPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-gray-900 tracking-tight">
            手机后台
          </h1>
          <p className="text-xl text-gray-600 mt-6">
            随时随地管理您的业务
          </p>
        </div>
      </section>

      {/* QR Code Section */}
      <section className="py-24 md:py-32 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            扫码登录
          </h2>
          <p className="text-xl text-gray-600 mt-6">
            使用手机扫描二维码，快速进入后台管理系统
          </p>
        </div>

        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-white rounded-3xl p-12 shadow-lg">
            <div className="flex flex-col items-center">
              {/* 二维码图片 */}
              <img
                src="/images/qr-code-login.png"
                alt="登录二维码"
                className="w-64 h-64 rounded-2xl"
              />
              <p className="text-lg text-gray-700 mt-6">
                使用微信扫描二维码
              </p>
              <p className="text-sm text-gray-500 mt-2">
                快速进入后台管理系统
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Introduction Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            后台介绍视频
          </h2>
          <p className="text-xl text-gray-600 mt-6">
            了解手机后台的强大功能
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-16">
          <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-lg">
            {/* 视频占位符 - 请替换为实际的视频 */}
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <svg className="w-20 h-20 mx-auto text-gray-700 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <p className="text-lg text-gray-600">后台介绍视频</p>
                <p className="text-sm text-gray-500 mt-2">请替换为实际视频文件</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            核心功能
          </h2>
          <p className="text-xl text-gray-600 mt-6">
            全方位的移动管理能力
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">订单管理</h3>
              <p className="text-gray-600">随时随地查看和管理订单，实时追踪订单状态</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">库存管理</h3>
              <p className="text-gray-600">实时库存监控，智能预警提醒，降低库存风险</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">数据分析</h3>
              <p className="text-gray-600">销售数据可视化展示，智能分析经营状况</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
