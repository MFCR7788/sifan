'use client';

import Link from 'next/link';

export default function CompanyProfile() {
  const highlights = [
    {
      title: '千亿级市场',
      description: '深耕校服行业，把握消费升级机遇'
    },
    {
      title: '300+门店',
      description: '覆盖江西中高端社区，密集服务网络'
    },
    {
      title: '18个月回本',
      description: '单店盈利模型已验证，可快速复制'
    },
    {
      title: '自研系统',
      description: '投入超100万，人效提升40%'
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text Content */}
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight mb-6">
              中国首个全域数字化<br />校服连锁品牌
            </h2>

            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              浙江思杋服饰有限公司成立于2018年，致力于打造校服新零售标杆品牌。
              以"魔法超人"为品牌名，通过线上线下融合的体验式零售模式，
              解决家长"试穿难、退换烦、质量没保障"三大痛点。
            </p>

            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">体验式零售</h4>
                  <p className="text-gray-600">线下实体店 + 线上商城，现场试穿、现场取货</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">四大升级</h4>
                  <p className="text-gray-600">面料升级、里料升级、工艺升级、服务升级</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">数字化驱动</h4>
                  <p className="text-gray-600">AI分析需求，库存周转90天，人效提升40%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Highlights Grid */}
          <div className="grid grid-cols-2 gap-6">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-300"
              >
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-20 p-10 bg-gray-50 rounded-3xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="text-center">
              <div className="text-5xl font-semibold text-gray-900 mb-3">2018</div>
              <div className="text-gray-600">创立时间</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-semibold text-gray-900 mb-3">180万</div>
              <div className="text-gray-600">单店年收入</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-semibold text-gray-900 mb-3">45万</div>
              <div className="text-gray-600">单店净利润</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-semibold text-gray-900 mb-3">90天</div>
              <div className="text-gray-600">库存周转</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
