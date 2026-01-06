'use client';

import Navigation from '@/components/Navigation';
import CompanyProfile from '@/components/CompanyProfile';
import StoreShowcase from '@/components/StoreShowcase';
import AppleFeature from '@/components/AppleFeature';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Hero Section - Minimal */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-gray-900 tracking-tight">
            关于我们
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mt-8">
            浙江思杋服饰有限公司
          </p>
          <p className="text-lg text-gray-500 mt-4">
            校服新零售开创者
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            我们的故事
          </h2>
        </div>

        <div className="max-w-5xl mx-auto mt-16 space-y-24">
          <AppleFeature
            title="创立初心"
            description="我们深信，一身好校服，是陪伴孩子安心成长、自信向上的 &quot;第二层皮肤&quot;。"
            reverse={false}
          />

          <AppleFeature
            title="使命与愿景"
            description="赋能门店赢在数字时代，成为产业首选赋能平台"
            reverse={true}
          />

          <AppleFeature
            title="核心价值观"
            description="专业可靠、伙伴共赢、极致简单"
            reverse={false}
          />
        </div>
      </section>

      {/* Company Profile Section */}
      <section className="py-24 md:py-32 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            企业介绍
          </h2>
        </div>
        <CompanyProfile />
      </section>

      {/* Store Showcase Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            门店展示
          </h2>
          <p className="text-xl text-gray-600 mt-6">
            全方位覆盖您的业务场景
          </p>
        </div>
        <StoreShowcase />
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-500 mb-4">
            Copyright © 2025 浙江思杋服饰有限公司 魔法超人团队. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <a href="/" className="hover:underline">首页</a>
            <a href="/pricing" className="hover:underline">产品报价</a>
            <a href="/franchise" className="hover:underline">招商加盟</a>
            <a href="/contact" className="hover:underline">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
