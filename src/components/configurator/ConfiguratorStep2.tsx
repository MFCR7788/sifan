'use client';

interface ConfiguratorStep2Props {
  config: any;
  updateConfig: (updates: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

// 基于Excel表格的功能分类
const coreModules = [
  {
    id: 'distribution-system',
    name: '分销裂变体系',
    description: '建立多层级分销网络，快速拓展销售渠道',
    features: [
      { name: '分销员🔥', price: 50 },
      { name: '分账2.0🔥', price: 100 },
      { name: '一键开团🔥', price: 100 },
      { name: '多方分账', price: 150 }
    ],
    icon: '🤝'
  },
  {
    id: 'marketing-activities',
    name: '营销活动中心',
    description: '丰富的营销工具，提升销售转化率',
    features: [
      { name: '秒杀', price: 0 },
      { name: '预售', price: 0 },
      { name: '拼团', price: 0 },
      { name: '红包', price: 0 },
      { name: '幸运抽奖', price: 100 },
      { name: '定时折扣', price: 100 },
      { name: '打折/特价🔥', price: 0 },
      { name: '商品组合套餐', price: 100 },
      { name: '第二件打折', price: 100 },
      { name: '满额立减', price: 100 },
      { name: '购物卡🔥', price: 100 }
    ],
    icon: '🎁'
  },
  {
    id: 'member-operation',
    name: '会员运营体系',
    description: '深度运营客户资产，提升复购率',
    features: [
      { name: '会员专享券', price: 0 },
      { name: '积分商城2.0', price: 0 },
      { name: '积分签到', price: 0 }
    ],
    icon: '👥'
  },
  {
    id: 'order-inventory',
    name: '订单与库存',
    description: '打通线上线下一盘货，实时同步库存数据',
    features: [
      { name: '进销存', price: 0 },
      { name: '多平台抓单', price: 300 }
    ],
    icon: '📦'
  },
  {
    id: 'data-analysis',
    name: '数据分析与监控',
    description: '构建数据驾驶舱，实时掌握经营状况',
    features: [
      { name: '数据大屏', price: 50 }
    ],
    icon: '📊'
  },
  {
    id: 'advanced-functions',
    name: '高级功能',
    description: '智能化功能，提升运营效率',
    features: [
      { name: '开放接口', price: 150 },
      { name: '区域合伙人（新）', price: 200 },
      { name: '电子发票', price: 50 },
      { name: '上门陪跑1-2个月', price: 10000 }
    ],
    icon: '⚡'
  }
];

export default function ConfiguratorStep2({ config, updateConfig, onNext, onPrev }: ConfiguratorStep2Props) {
  const handleModuleToggle = (moduleId: string) => {
    const currentModules = config.modules || [];
    const updatedModules = currentModules.includes(moduleId)
      ? currentModules.filter((id: string) => id !== moduleId)
      : [...currentModules, moduleId];

    // Calculate new price based on monthly prices from Excel
    const basePrice = config.platform === 'brand-chain' ? 2980 : config.platform === 'multi-store' ? 1200 : 300;

    // Calculate total monthly fee from selected modules
    const monthlyFee = updatedModules.reduce((total: number, moduleId: string) => {
      const module = coreModules.find(m => m.id === moduleId);
      if (!module) return total;

      return total + module.features.reduce((sum, feature) => sum + feature.price, 0);
    }, 0);

    // Annual price = base + (monthly fee * 12)
    const annualPrice = basePrice + (monthlyFee * 12);

    updateConfig({
      modules: updatedModules,
      monthlyFee: monthlyFee,
      totalPrice: annualPrice
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
          const moduleMonthlyPrice = module.features.reduce((sum, f) => sum + f.price, 0);

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
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {module.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {module.features.map((feature, index) => (
                      <div
                        key={index}
                        className={`text-xs p-2 rounded-lg ${
                          feature.price > 0
                            ? 'bg-white border border-blue-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="text-gray-900">{feature.name}</div>
                        {feature.price > 0 && (
                          <div className="text-blue-600 font-medium">
                            ¥{feature.price}/月
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-gray-600 mb-1">
                    月费合计
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ¥{moduleMonthlyPrice}
                  </div>
                  <div className="text-xs text-gray-500">
                    ¥{moduleMonthlyPrice * 12}/年
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
