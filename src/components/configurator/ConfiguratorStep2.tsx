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

const COMPANION_FEATURE_NAME = '上门陪跑1-2个月';

export default function ConfiguratorStep2({ config, updateConfig, onNext, onPrev }: ConfiguratorStep2Props) {
  // 判断当前是否为多门店或品牌连锁（功能已包含，不计额外费用）
  const isPremiumOrUltimate = config.platform === 'multi-store' || config.platform === 'brand-chain';

  // 获取或初始化上门陪跑的月份数
  const companionMonths = config.companionMonths || 0;

  // 获取所有核心功能名称
  const getAllFeatureNames = () => {
    const allFeatures: string[] = [];
    coreModules.forEach(module => {
      module.features.forEach(feature => {
        allFeatures.push(feature.name);
      });
    });
    return allFeatures;
  };

  const handleFeatureToggle = (featureName: string, price: number) => {
    // 多门店或品牌连锁模式下，核心功能已包含，不可取消
    if (isPremiumOrUltimate) {
      return;
    }

    const currentFeatures = config.selectedFeatures || [];
    const updatedFeatures = currentFeatures.includes(featureName)
      ? currentFeatures.filter((name: string) => name !== featureName)
      : [...currentFeatures, featureName];

    // 如果是上门陪跑功能，默认选择1个月
    let updatedCompanionMonths = companionMonths;
    if (featureName === COMPANION_FEATURE_NAME) {
      if (!currentFeatures.includes(featureName)) {
        // 选中上门陪跑，默认1个月
        updatedCompanionMonths = 1;
      } else {
        // 取消上门陪跑，重置月份数
        updatedCompanionMonths = 0;
      }
    }

    // 单店模式下，计算年度费用（不包括上门陪跑，因为它是按月单独计费的）
    const basePrice = 2980; // 单店基础价格（年度）
    const yearlyFee = updatedFeatures.reduce((total: number, featureName: string) => {
      // 跳过上门陪跑，单独计算
      if (featureName === COMPANION_FEATURE_NAME) return total;

      for (const module of coreModules) {
        const feature = module.features.find(f => f.name === featureName);
        if (feature) return total + feature.price * 12; // 乘以12转为年度费用
      }
      return total;
    }, 0);

    // 上门陪跑费用 = 月份数 × 单价
    const companionFee = updatedCompanionMonths * 10000;

    // 总价 = 基础价格 + 年度功能费 + 上门陪跑费
    const totalPrice = basePrice + yearlyFee + companionFee;

    updateConfig({
      selectedFeatures: updatedFeatures,
      companionMonths: updatedCompanionMonths,
      monthlyFee: yearlyFee, // 字段名保持monthlyFee，但实际存储年度费用（已乘12，不包括上门陪跑）
      totalPrice: totalPrice
    });
  };

  const handleCompanionMonthsChange = (months: number) => {
    const currentFeatures = config.selectedFeatures || [];

    // 如果上门陪跑未选中，先选中它
    const updatedFeatures = currentFeatures.includes(COMPANION_FEATURE_NAME)
      ? currentFeatures
      : [...currentFeatures, COMPANION_FEATURE_NAME];

    // 单店模式下，计算年度费用（不包括上门陪跑）
    const basePrice = 2980; // 单店基础价格（年度）
    const yearlyFee = updatedFeatures.reduce((total: number, featureName: string) => {
      // 跳过上门陪跑，单独计算
      if (featureName === COMPANION_FEATURE_NAME) return total;

      for (const module of coreModules) {
        const feature = module.features.find(f => f.name === featureName);
        if (feature) return total + feature.price * 12;
      }
      return total;
    }, 0);

    // 上门陪跑费用 = 月份数 × 单价
    const companionFee = months * 10000;

    // 总价 = 基础价格 + 年度功能费 + 上门陪跑费
    const totalPrice = basePrice + yearlyFee + companionFee;

    updateConfig({
      selectedFeatures: updatedFeatures,
      companionMonths: months,
      monthlyFee: yearlyFee,
      totalPrice: totalPrice
    });
  };

  const isFeatureSelected = (featureName: string) => {
    return (config.selectedFeatures || []).includes(featureName);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          选择核心功能
        </h2>
        <p className="text-gray-600">
          {isPremiumOrUltimate
            ? `${config.platform === 'multi-store' ? '多门店连锁' : '品牌连锁'}套餐已包含以下所有功能，无需额外选择`
            : '根据业务需求选择功能模块（可多选）'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {coreModules.map((module) => {
          const selectedCount = module.features.filter(f => isFeatureSelected(f.name)).length;
          const moduleMonthlyPrice = module.features.reduce((sum, f) =>
            isFeatureSelected(f.name) ? sum + f.price : sum, 0);

          return (
            <div
              key={module.id}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                ${selectedCount > 0
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`
                    w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all duration-300 flex-shrink-0
                    ${selectedCount > 0 ? 'bg-blue-600' : 'bg-gray-100'}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {module.features.map((feature, index) => {
                      const isSelected = isFeatureSelected(feature.name);
                      const isCompanionFeature = feature.name === COMPANION_FEATURE_NAME;

                      return (
                        <div
                          key={index}
                          onClick={() => handleFeatureToggle(feature.name, feature.price)}
                          className={`
                            text-xs p-3 rounded-lg border-2 transition-all duration-200 text-left relative
                            ${isSelected
                              ? 'border-blue-600 bg-blue-100'
                              : feature.price > 0
                                ? 'border-gray-200 bg-white hover:border-blue-300'
                                : 'border-gray-100 bg-gray-50 hover:border-blue-200'
                            }
                            ${isPremiumOrUltimate ? 'cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-900">{feature.name}</div>
                              {feature.price > 0 && !isCompanionFeature && (
                                <div className={`font-medium mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                                  ¥{feature.price * 12}/年
                                  {isPremiumOrUltimate && isSelected && (
                                    <span className="text-green-600 ml-1">(已包含)</span>
                                  )}
                                </div>
                              )}
                              {isCompanionFeature && isSelected && !isPremiumOrUltimate && (
                                <div className="mt-2">
                                  <div className={`font-medium ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                                    ¥10000/月
                                  </div>
                                  <select
                                    value={companionMonths}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleCompanionMonthsChange(Number(e.target.value));
                                    }}
                                    className="mt-2 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                      <option key={m} value={m}>{m}个月</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              {isCompanionFeature && !isSelected && (
                                <div className={`font-medium mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                                  ¥10000/月
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedCount > 0 && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm text-gray-600 mb-1">
                      已选{selectedCount}项
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {isPremiumOrUltimate ? '已包含' : `¥${moduleMonthlyPrice * 12}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isPremiumOrUltimate ? '' : '/年'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(config.selectedFeatures || []).length === 0 && !isPremiumOrUltimate && (
        <div className="text-center py-8 text-gray-500">
          未选择任何核心功能
        </div>
      )}
    </div>
  );
}
