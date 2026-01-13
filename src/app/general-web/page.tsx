'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AppleFeature from '@/components/AppleFeature';

export default function GeneralWebPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-gray-900 tracking-tight">
            数字转型
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mt-8">
            校服行业数字化解决方案
          </p>
          <p className="text-lg text-gray-500 mt-4">
            赋能门店赢在数字时代
          </p>
        </div>
      </section>

      {/* Digital Transformation Features */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            核心能力
          </h2>
        </div>

        <div className="max-w-5xl mx-auto mt-16 space-y-24">
          <AppleFeature
            title="智能选品"
            description="基于大数据分析的智能选品系统，精准匹配市场需求，提升库存周转率，降低经营风险。"
            image={
              <img
                src="/images/洞察瞬间-创立场景.png"
                alt="智能选品"
                className="w-full h-full object-cover"
              />
            }
            reverse={false}
          />

          <AppleFeature
            title="在线订货"
            description="全流程在线订货平台，7×24小时随时下单，实时追踪订单状态，让订货更便捷高效。"
            image={
              <img
                src="/images/全域作战室-团队协作.png"
                alt="在线订货"
                className="w-full h-full object-cover"
              />
            }
            reverse={true}
          />

          <AppleFeature
            title="数据分析"
            description="可视化数据分析看板，深度洞察销售趋势、客户偏好、库存状况，为经营决策提供数据支撑。"
            image={
              <img
                src="/images/知识共享-企业文化.png"
                alt="数据分析"
                className="w-full h-full object-cover"
              />
            }
            reverse={false}
          />
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 md:py-32 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
              为您带来什么
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="text-5xl font-semibold text-gray-900 mb-4">50%</div>
              <div className="text-lg text-gray-600">降低库存成本</div>
            </div>
            <div className="text-center p-8">
              <div className="text-5xl font-semibold text-gray-900 mb-4">3倍</div>
              <div className="text-lg text-gray-600">提升订货效率</div>
            </div>
            <div className="text-center p-8">
              <div className="text-5xl font-semibold text-gray-900 mb-4">24/7</div>
              <div className="text-lg text-gray-600">全时在线服务</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
