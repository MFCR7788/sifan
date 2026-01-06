'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import AppleFeature from '@/components/AppleFeature';

export default function SolutionPage() {
  const coreValues = [
    {
      title: '订单与库存一体化',
      description: '打通线上线下一盘货，实时同步库存数据，避免超卖与积压。多平台订单自动抓取与统一处理，智能仓储分配，就近发货，库存预警与自动补货建议。',
      icon: '📦',
      image: <Image src="/images/1.png" alt="订单与库存一体化" width={600} height={450} className="w-full h-full object-cover" />
    },
    {
      title: '分销裂变体系激活',
      description: '建立多层级分销网络，快速拓展销售渠道。三级分销商等级体系（推广员、核心代理、VIP合伙人），专属推广码与裂变工具，佣金自动结算，T+1到账。',
      icon: '🤝',
      image: <Image src="/images/2.png" alt="分销裂变体系激活" width={600} height={450} className="w-full h-full object-cover" />
    },
    {
      title: '数据驱动运营',
      description: '构建数据驾驶舱，实时掌握经营状况。实时销售战报，商品销售排行与库存周转分析，分销商业绩龙虎榜，区域销售对比分析。',
      icon: '📊',
      image: <Image src="/assets/image.png" alt="数据驱动运营" width={600} height={450} className="w-full h-full object-cover" />
    },
    {
      title: '私域流量运营',
      description: '深度运营客户资产，提升复购率。客户画像与标签管理，自动化营销触达，会员积分与权益体系。',
      icon: '👥',
      image: <Image src="/images/5.png" alt="私域流量运营" width={600} height={450} className="w-full h-full object-cover" />
    },
    {
      title: '生产与供应链协同',
      description: '打通生产端与销售端，实现供需精准匹配。智能排产与生产计划，供应商协同管理，成本核算与财务对接。',
      icon: '🏭',
      image: <Image src="/images/6.png" alt="生产与供应链协同" width={600} height={450} className="w-full h-full object-cover" />
    }
  ];

  const implementationSteps = [
    {
      title: '诊断与规划',
      duration: '1-2周',
      description: '明确现状、对齐目标、制定可执行的详细上线计划',
      items: [
        '项目启动会：明确组织架构与考核目标',
        '业务深度诊断：访谈各业务部门，梳理痛点',
        '流程可视化：绘制当前业务流程图，标记效率瓶颈',
        '目标对齐：制定SMART量化目标（3个月/1年）',
        '数据初始化：制定主数据标准，准备初始化数据'
      ]
    },
    {
      title: '核心模块实施',
      duration: '1-4个月',
      description: '采用"敏捷实施、小步快跑"策略，优先解决最痛的点',
      items: [
        '订单与库存中心搭建：多平台订单抓取、实时库存同步',
        '分销裂变体系激活：三级分销体系、佣金自动结算',
        '数据驱动运营深化：数据看板、客户数据沉淀',
        '系统全面上线：全网点培训、订单线上化'
      ]
    },
    {
      title: '持续优化',
      duration: '长期',
      description: '持续优化与技术支持',
      items: [
        '季度业务复盘与优化建议',
        '新功能优先体验权',
        '行业最佳实践分享',
        '7×24小时技术保障'
      ]
    }
  ];

  const expectedReturns = [
    {
      category: '效率提升',
      items: [
        { label: '订单处理时间', value: '从3.5小时降至50分钟', highlight: '提升76%' },
        { label: '订单差错率', value: '降低90%' },
        { label: '人工成本', value: '降低40%' }
      ]
    },
    {
      category: '销售增长',
      items: [
        { label: '分销商数量', value: '增长300%' },
        { label: '订单来源', value: '从单一渠道扩展到多渠道' },
        { label: '客户复购率', value: '提升30%' }
      ]
    },
    {
      category: '库存优化',
      items: [
        { label: '库存周转率', value: '提升50%' },
        { label: '库存准确率', value: '达到99%以上' },
        { label: '呆滞库存', value: '降低60%' }
      ]
    },
    {
      category: '数据驱动',
      items: [
        { label: '实时掌握', value: '经营数据' },
        { label: '决策精准', value: '数据支撑' },
        { label: '快速响应', value: '市场变化' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight mb-8">
            定制化方案
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            基于魔法超人平台五大核心优势，系统化解决校服企业核心痛点，<br />
            实现效率提升、渠道拓宽、库存优化、数据驱动
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/configurator"
              className="px-10 py-4 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 hover:scale-105 hover:shadow-lg transition-all duration-200"
            >
              开始定制您的方案
            </Link>
            <Link
              href="/contact"
              className="px-10 py-4 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              联系咨询
            </Link>
          </div>
        </div>
      </section>

      {/* Core Value Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              五大核心价值
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              全面覆盖企业数字化转型需求
            </p>
          </div>

          <div className="space-y-32">
            {coreValues.map((item, index) => (
              <AppleFeature
                key={index}
                title={item.title}
                description={item.description}
                reverse={index % 2 === 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Path Section */}
      <section className="py-24 md:py-32 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              实施路径
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              分阶段实施，确保项目成功落地
            </p>
          </div>

          <div className="space-y-12">
            {implementationSteps.map((step, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 md:p-12">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-2xl md:text-3xl font-semibold">{step.title}</h3>
                      <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {step.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expected Returns Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              预期收益
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              量化目标，清晰可见
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {expectedReturns.map((category, index) => (
              <div key={index} className="bg-gray-50 rounded-3xl p-8">
                <h3 className="text-2xl font-semibold mb-6">{category.category}</h3>
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start justify-between">
                      <span className="text-gray-600">{item.label}</span>
                      <span className={item.highlight ? 'font-semibold text-blue-600' : 'font-semibold text-gray-900'}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
            开始您的数字化转型
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            基于您的具体需求，量身定制专属方案
          </p>
          <Link
            href="/configurator"
            className="inline-block px-12 py-4 bg-white text-gray-900 rounded-full text-sm font-medium hover:bg-gray-100 hover:scale-105 transition-all duration-200"
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
            <Link href="/" className="hover:underline">首页</Link>
            <Link href="/pricing" className="hover:underline">产品</Link>
            <Link href="/configurator" className="hover:underline">定制</Link>
            <Link href="/franchise" className="hover:underline">加盟</Link>
            <Link href="/about" className="hover:underline">关于</Link>
            <Link href="/contact" className="hover:underline">联系</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
