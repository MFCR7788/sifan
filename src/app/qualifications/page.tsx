'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function QualificationsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-gray-900 tracking-tight">
            公司资质
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mt-8">
            浙江思杋服饰有限公司
          </p>
          <p className="text-lg text-gray-500 mt-4">
            专业可靠，品质保证
          </p>
        </div>
      </section>

      {/* Qualifications Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            资质证书
          </h2>
          <p className="text-xl text-gray-600 mt-6">
            我们拥有完善的资质认证，为您提供可靠的服务保障
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 资质卡片 1 */}
            <div className="group bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="aspect-[4/3] bg-white flex items-center justify-center p-4">
                <img
                  src="/images/business-license.jpg"
                  alt="营业执照"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">营业执照</h3>
                <p className="text-sm text-gray-600 mt-2">合法经营资质</p>
              </div>
            </div>

            {/* 资质卡片 2 */}
            <div className="group bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="aspect-[4/3] bg-white flex items-center justify-center p-4">
                <img
                  src="/images/franchise-license.jpg"
                  alt="特许经营许可证"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">特许经营许可证</h3>
                <p className="text-sm text-gray-600 mt-2">特许经营资质</p>
              </div>
            </div>

            {/* 资质卡片 3 */}
            <div className="group bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-sm">ISO质量体系认证</div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">ISO质量体系认证</h3>
                <p className="text-sm text-gray-600 mt-2">国际质量标准</p>
              </div>
            </div>

            {/* 资质卡片 4 */}
            <div className="group bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-sm">组织机构代码证</div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">组织机构代码证</h3>
                <p className="text-sm text-gray-600 mt-2">机构身份证明</p>
              </div>
            </div>

            {/* 资质卡片 5 */}
            <div className="group bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-sm">产品合格证</div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">产品合格证</h3>
                <p className="text-sm text-gray-600 mt-2">质量检测合格</p>
              </div>
            </div>

            {/* 资质卡片 6 */}
            <div className="group bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-sm">商标注册证</div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">商标注册证</h3>
                <p className="text-sm text-gray-600 mt-2">品牌知识产权</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Introduction Section */}
      <section className="py-24 md:py-32 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            视频介绍
          </h2>
          <p className="text-xl text-gray-600 mt-6">
            了解我们的产品与服务
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 视频卡片 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-gray-400 text-sm">公司介绍视频</div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">公司介绍</h3>
                <p className="text-sm text-gray-600 mt-2">了解浙江思杋服饰有限公司的发展历程与核心业务</p>
              </div>
            </div>

            {/* 视频卡片 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-gray-400 text-sm">产品展示视频</div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">产品展示</h3>
                <p className="text-sm text-gray-600 mt-2">全面展示我们的校服产品线与设计理念</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
