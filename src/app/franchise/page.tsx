'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function FranchisePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-gray-900 tracking-tight">
            招商加盟
          </h1>
          <p className="text-xl text-gray-600 mt-6">
            加入魔法小超人，共创校服新零售未来
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              咨询加盟
            </Link>
          </div>
        </div>
      </section>

      {/* Policy Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-8">
                加盟政策
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-8 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-3">区域保护</h3>
                  <p className="text-gray-600">保证每个加盟商的独家经营权，避免恶性竞争</p>
                </div>
                <div className="bg-gray-50 p-8 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-3">零加盟费</h3>
                  <p className="text-gray-600">免除传统加盟费，降低创业门槛</p>
                </div>
                <div className="bg-gray-50 p-8 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-3">灵活合作</h3>
                  <p className="text-gray-600">多种合作模式，满足不同创业需求</p>
                </div>
                <div className="bg-gray-50 p-8 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-3">长期支持</h3>
                  <p className="text-gray-600">从开业到运营，全程专业指导</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-8">
                加盟费用
              </h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="text-lg">加 盟 费</span>
                  <span className="text-lg font-semibold">免</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="text-lg">保 证 金</span>
                  <span className="text-lg font-semibold">¥20000</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="text-lg">首批商品</span>
                  <span className="text-lg font-semibold">¥20000</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="text-lg">收银设备</span>
                  <span className="text-lg font-semibold">¥2500 / 套</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="text-lg">系统费用</span>
                  <span className="text-lg font-semibold">按产品选择</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="text-lg">分 销 点（包含开抖店费用，形象招牌）</span>
                  <span className="text-lg font-semibold">¥600 / 个</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="text-lg">门头形象</span>
                  <span className="text-lg font-semibold">¥5000 / 店（实体店）</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-8">
                加盟流程
              </h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                  <h3 className="font-semibold mb-2">咨询了解</h3>
                  <p className="text-sm text-gray-600">联系客服，了解加盟详情</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                  <h3 className="font-semibold mb-2">实地考察</h3>
                  <p className="text-sm text-gray-600">参观总部，考察市场</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                  <h3 className="font-semibold mb-2">签订合同</h3>
                  <p className="text-sm text-gray-600">签署合作协议</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
                  <h3 className="font-semibold mb-2">开业运营</h3>
                  <p className="text-sm text-gray-600">系统培训，正式营业</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-8">
                品牌支持
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">品牌授权</h3>
                    <p className="text-gray-600 mt-1">官方授权，使用魔法小超人品牌标识</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">培训支持</h3>
                    <p className="text-gray-600 mt-1">系统化培训课程，快速上手运营</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">运营支持</h3>
                    <p className="text-gray-600 mt-1">专业团队指导，提升运营效率</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">营销支持</h3>
                    <p className="text-gray-600 mt-1">提供营销方案和推广素材</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Guide */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-8 text-center">
            全平台运营落地方案
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4">核心逻辑</h3>
              <p className="text-gray-600 leading-relaxed">
                以"线上+线下"融合为核心，通过多平台布局实现全渠道获客，建立私域流量池，提升客户留存率和复购率。系统化管理订单、库存、会员，实现数据驱动决策。
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4">平台开通指南</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>微信小程序商城 - 主要线上销售渠道</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>支付宝小程序 - 扩展支付场景</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>抖音/快手小店 - 社交电商引流</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>美团/饿了么 - 本地生活服务</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4">三阶段实施方案</h3>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl">
                  <h4 className="font-semibold text-lg mb-2">第一阶段：基础搭建（1-2周）</h4>
                  <p className="text-gray-600">开通小程序，完成商品上架，配置支付和物流，培训员工操作</p>
                </div>
                <div className="bg-white p-6 rounded-xl">
                  <h4 className="font-semibold text-lg mb-2">第二阶段：流量获取（2-4周）</h4>
                  <p className="text-gray-600">开展线上营销活动，利用社交媒体推广，积累首批客户，建立会员体系</p>
                </div>
                <div className="bg-white p-6 rounded-xl">
                  <h4 className="font-semibold text-lg mb-2">第三阶段：运营优化（持续）</h4>
                  <p className="text-gray-600">数据分析优化，精准营销推送，提升客户体验，扩大市场份额</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-6">
            立即开始
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            准备好加入我们了吗？立即联系我们
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            联系我们：400-0678-558
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-500 mb-4">
            Copyright © 2025 浙江思杋服饰有限公司 魔法小超人团队. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <a href="/" className="hover:underline">首页</a>
            <a href="/pricing" className="hover:underline">产品</a>
            <a href="/configurator" className="hover:underline">定制</a>
            <a href="/franchise" className="hover:underline">加盟</a>
            <a href="/about" className="hover:underline">关于</a>
            <a href="/contact" className="hover:underline">联系</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
