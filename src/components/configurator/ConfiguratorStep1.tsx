'use client';

interface ConfiguratorStep1Props {
  config: any;
  updateConfig: (updates: any) => void;
  onNext: () => void;
}

const businessScenarios = [
  {
    id: 'single-store',
    name: '单店运营',
    icon: '🏪',
    description: '适合门店、个体户',
    features: ['线上小程序商城', '线下收银系统', '基础库存管理'],
    price: 300
  },
  {
    id: 'multi-store',
    name: '多门店连锁',
    icon: '🏬',
    description: '适合连锁企业',
    features: ['多门店统一管理', '线上线下一盘货', '智能库存调拨'],
    price: 1200
  },
  {
    id: 'brand-chain',
    name: '品牌连锁',
    icon: '🏢',
    description: '适合集团企业',
    features: ['全渠道分销体系', '数据驱动运营', '供应链协同'],
    price: 2980
  }
];

export default function ConfiguratorStep1({ config, updateConfig, onNext }: ConfiguratorStep1Props) {
  const handleScenarioSelect = (scenarioId: string) => {
    const selectedScenario = businessScenarios.find(s => s.id === scenarioId);
    updateConfig({
      platform: scenarioId,
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
                ? 'border-blue-600 bg-blue-50 shadow-xl scale-105'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <div className="flex flex-col">
              <div
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 transition-all duration-300
                  ${config.platform === scenario.id ? 'bg-blue-600' : 'bg-gray-100'}
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
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
              <div className="text-2xl font-bold text-blue-600 pt-4 border-t border-gray-200">
                ¥{scenario.price.toLocaleString()}/年
              </div>
            </div>

            {config.platform === scenario.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
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
