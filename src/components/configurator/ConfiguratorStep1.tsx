'use client';

interface ConfiguratorStep1Props {
  config: any;
  updateConfig: (updates: any) => void;
  onNext: () => void;
}

// 版本功能映射（基于Excel表格）
const versionFeatures = {
  'single-store': [ // 基础版3.0系统
    '软件授权', '技术支持', '免费更新', '人工售后服务', '系统品牌自定义', '一键更新', '在线打包',
    'pc系统后台', '微信/支付宝小程序商城', '微信小程序小助手', 'windows/安卓收银包APP',
    '会员专享券', '门店广告', '消息通知', '标签打印🔥', '积分签到', '秒杀', '预售', '拼团', '红包',
    '积分商城2.0', 'ai商品识别', '新版商城DIY', '进销存', '店铺助手2.0', '独立收款', '抖音团购核销',
    '打折/特价🔥', '汇付天下🔥'
  ],
  'multi-store': [ // 旗舰版3.0系统
    '软件授权', '技术支持', '免费更新', '人工售后服务', '可创建门店数量', '系统品牌自定义', '一键更新', '在线打包',
    'pc系统后台', '微信/支付宝小程序商城', '微信小程序小助手', 'windows/安卓收银包APP',
    '会员专享券', '门店广告', '消息通知', '标签打印🔥', '积分签到', '秒杀', '预售', '拼团', '红包',
    '积分商城2.0', 'ai商品识别', '新版商城DIY', '进销存', '店铺助手2.0', '独立收款', '抖音团购核销',
    '打折/特价🔥', '分销员🔥', '幸运抽奖', '定时折扣', '分账2.0🔥', '商品组合套餐',
    '第二件打折', '满额立减', '购物卡🔥', '数据大屏', '电子发票', '一键开团🔥', '汇付天下🔥', '多方分账', '开放接口'
  ],
  'brand-chain': [ // 至尊版3.0
    '软件授权', '技术支持', '免费更新', '人工售后服务', '可创建门店数量', '系统品牌自定义', '一键更新', '在线打包',
    'pc系统后台', '微信/支付宝小程序商城', '微信小程序小助手', 'windows/安卓收银包APP',
    '会员专享券', '门店广告', '消息通知', '标签打印🔥', '积分签到', '秒杀', '预售', '拼团', '红包',
    '积分商城2.0', 'ai商品识别', '新版商城DIY', '进销存', '店铺助手2.0', '独立收款', '抖音团购核销',
    '打折/特价🔥', '分销员🔥', '幸运抽奖', '定时折扣', '分账2.0🔥', '商品组合套餐',
    '第二件打折', '满额立减', '购物卡🔥', '数据大屏', '电子发票', '一键开团🔥', '汇付天下🔥', '多方分账', '开放接口',
    '区域合伙人（新）', '多平台抓单'
  ]
};

const businessScenarios = [
  {
    id: 'single-store',
    name: '单店运营',
    icon: '🏪',
    description: '适合门店、个体户',
    features: ['线上小程序商城', '线下收银系统', '基础库存管理'],
    price: 2980,
    priceUnit: '/年'
  },
  {
    id: 'multi-store',
    name: '多门店连锁',
    icon: '🏬',
    description: '适合连锁企业',
    features: ['多门店统一管理', '线上线下一盘货', '智能库存调拨'],
    price: 12980,
    priceUnit: '/年'
  },
  {
    id: 'brand-chain',
    name: '品牌连锁',
    icon: '🏢',
    description: '适合集团企业',
    features: ['全渠道分销体系', '数据驱动运营', '供应链协同'],
    price: 29800,
    priceUnit: '/年'
  }
];

export default function ConfiguratorStep1({ config, updateConfig, onNext }: ConfiguratorStep1Props) {
  const handleScenarioSelect = (scenarioId: string) => {
    const selectedScenario = businessScenarios.find(s => s.id === scenarioId);

    // 自动选择对应版本的所有功能
    const features = versionFeatures[scenarioId as keyof typeof versionFeatures] || [];

    updateConfig({
      platform: scenarioId,
      selectedFeatures: features,
      monthlyFee: 0, // 切换业务场景时，重置功能费为0（多门店和品牌连锁的付费功能已包含在基础价格中）
      totalPrice: selectedScenario?.price || 0
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          选择业务场景
        </h2>
        <p className="text-gray-600">
          根据您的企业规模，选择最合适的数字化方案
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {businessScenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => handleScenarioSelect(scenario.id)}
            className={`
              relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
              ${config.platform === scenario.id
                ? 'border-gold bg-gold/[0.07] shadow-xl scale-105'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <div className="flex flex-col">
              <div
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 transition-all duration-300
                  ${config.platform === scenario.id ? 'bg-gold' : 'bg-gray-100'}
                `}
              >
                {scenario.icon}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {scenario.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {scenario.description}
              </p>
              <div className="space-y-2 mb-4 flex-1">
                {scenario.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gold-dim flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
              <div className="text-2xl font-bold text-gold-dim pt-4 border-t border-gray-200">
                ¥{scenario.price.toLocaleString()}{scenario.priceUnit}
              </div>
            </div>

            {config.platform === scenario.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
