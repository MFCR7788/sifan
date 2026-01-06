'use client';

interface ConfiguratorStep2Props {
  config: any;
  updateConfig: (updates: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const coreModules = [
  {
    id: 'order-inventory',
    name: '订单与库存中心',
    description: '打通线上线下一盘货，实时同步库存数据',
    features: [
      '多平台订单抓取（企业微信/淘宝/手工导入）',
      '订单审核与智能分配',
      '实时库存同步',
      '库存预警与自动补货建议',
      '多仓库/网点库存管理',
      '库存盘点与调拨'
    ],
    icon: '📦',
    priceMultiplier: 1.5
  },
  {
    id: 'distribution',
    name: '分销裂变体系',
    description: '建立多层级分销网络，快速拓展销售渠道',
    features: [
      '三级分销商等级（推广员/核心代理/VIP合伙人）',
      '专属推广码与裂变工具',
      '佣金自动计算与T+1结算',
      '分销商数据看板',
      '推荐有礼活动',
      '销售竞赛排行榜'
    ],
    icon: '🤝',
    priceMultiplier: 2.0
  },
  {
    id: 'data-driven',
    name: '数据驱动运营',
    description: '构建数据驾驶舱，实时掌握经营状况',
    features: [
      '实时销售战报',
      '商品销售排行',
      '库存周转率分析',
      '分销商业绩龙虎榜',
      '区域销售对比分析',
      '客户画像与购买行为分析'
    ],
    icon: '📊',
    priceMultiplier: 2.5
  },
  {
    id: 'private-traffic',
    name: '私域流量运营',
    description: '深度运营客户资产，提升复购率',
    features: [
      '客户画像与标签管理',
      '自动化营销触达',
      '会员积分与权益体系',
      '优惠券管理',
      '消息推送',
      '客户分层运营'
    ],
    icon: '👥',
    priceMultiplier: 1.8
  },
  {
    id: 'production-supply',
    name: '生产与供应链',
    description: '打通生产端与销售端，实现供需精准匹配',
    features: [
      '智能排产与生产计划',
      '生产进度跟踪',
      '供应商协同管理',
      '采购管理',
      '成本核算与财务对接',
      '生产成本分析'
    ],
    icon: '🏭',
    priceMultiplier: 2.2
  }
];

export default function ConfiguratorStep2({ config, updateConfig, onNext, onPrev }: ConfiguratorStep2Props) {
  const handleModuleToggle = (moduleId: string) => {
    const currentModules = config.modules || [];
    const updatedModules = currentModules.includes(moduleId)
      ? currentModules.filter((id: string) => id !== moduleId)
      : [...currentModules, moduleId];

    // Calculate new price
    const basePrice = config.platform === 'brand-chain' ? 2980 : config.platform === 'multi-store' ? 1200 : 300;
    const moduleMultiplier = updatedModules.length > 0
      ? coreModules
          .filter(m => updatedModules.includes(m.id))
          .reduce((sum, m) => sum + m.priceMultiplier, 0)
      : 0;

    updateConfig({
      modules: updatedModules,
      totalPrice: updatedModules.length > 0 ? Math.floor(basePrice * moduleMultiplier) : basePrice
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          选择核心功能
        </h2>
        <p className="text-gray-600">
          根据业务需求选择功能模块（可多选）
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {coreModules.map((module) => {
          const isSelected = (config.modules || []).includes(module.id);
          return (
            <button
              key={module.id}
              onClick={() => handleModuleToggle(module.id)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                ${isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`
                    w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all duration-300 flex-shrink-0
                    ${isSelected ? 'bg-blue-600' : 'bg-gray-100'}
                  `}
                >
                  {module.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {module.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {module.description}
                  </p>
                  <div className="space-y-1">
                    {module.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                    {module.features.length > 3 && (
                      <div className="text-sm text-gray-400">
                        +{module.features.length - 3} 更多功能
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-gray-600 mb-1">
                    价格倍数
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {module.priceMultiplier}x
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {(config.modules || []).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          未选择任何核心功能
        </div>
      )}
    </div>
  );
}
