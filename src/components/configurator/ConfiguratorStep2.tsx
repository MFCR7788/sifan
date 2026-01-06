'use client';

interface ConfiguratorStep2Props {
  config: any;
  updateConfig: (updates: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const serviceLevels = [
  {
    id: 'basic',
    name: '基础运营',
    description: '内容发布、基础维护',
    features: ['周更3篇内容', '基础数据报表', '客服支持'],
    priceMultiplier: 1
  },
  {
    id: 'advanced',
    name: '深度代运营',
    description: '全托管运营、效果优化',
    features: ['日更内容', '专业团队托管', '效果优化', '数据分析'],
    priceMultiplier: 2
  },
  {
    id: 'custom',
    name: '定制化方案',
    description: '一对一顾问、专属方案',
    features: ['专属顾问', '定制策略', '专属项目经理', '优先响应'],
    priceMultiplier: 3
  }
];

export default function ConfiguratorStep2({ config, updateConfig, onNext, onPrev }: ConfiguratorStep2Props) {
  const handleServiceLevelSelect = (levelId: string) => {
    const basePrice = config.platform === 'multi' ? 19800 : 10800;
    const selectedLevel = serviceLevels.find(l => l.id === levelId);
    const newPrice = basePrice * (selectedLevel?.priceMultiplier || 1);

    updateConfig({
      serviceLevel: levelId,
      totalPrice: newPrice
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          选择服务深度
        </h2>
        <p className="text-gray-600">
          根据您的需求选择适合的服务级别
        </p>
      </div>

      <div className="space-y-4">
        {serviceLevels.map((level) => (
          <button
            key={level.id}
            onClick={() => handleServiceLevelSelect(level.id)}
            className={`
              w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left
              ${config.serviceLevel === level.id
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {level.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {level.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {level.features.map((feature, index) => (
                    <span
                      key={index}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${config.serviceLevel === level.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-700'
                        }
                      `}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">
                  价格倍数
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {level.priceMultiplier}x
                </div>
              </div>

              {config.serviceLevel === level.id && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
