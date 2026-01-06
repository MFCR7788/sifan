'use client';

interface ConfiguratorStep1Props {
  config: any;
  updateConfig: (updates: any) => void;
  onNext: () => void;
}

const platforms = [
  {
    id: 'douyin',
    name: '抖音',
    icon: '📱',
    description: '短视频平台，流量巨大',
    price: 9800
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📝',
    description: '种草社区，精准营销',
    price: 8800
  },
  {
    id: 'wechat',
    name: '微信',
    icon: '💬',
    description: '私域流量，深度运营',
    price: 10800
  },
  {
    id: 'multi',
    name: '多平台',
    icon: '🌐',
    description: '全平台覆盖，矩阵运营',
    price: 19800
  }
];

export default function ConfiguratorStep1({ config, updateConfig, onNext }: ConfiguratorStep1Props) {
  const handlePlatformSelect = (platformId: string) => {
    const selectedPlatform = platforms.find(p => p.id === platformId);
    updateConfig({
      platform: platformId,
      totalPrice: selectedPlatform?.price || 0
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          选择目标平台
        </h2>
        <p className="text-gray-600">
          选择您主要运营的平台，我们将为您量身定制运营策略
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handlePlatformSelect(platform.id)}
            className={`
              relative p-8 rounded-2xl border-2 transition-all duration-300 text-left
              ${config.platform === platform.id
                ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div
                className={`
                  w-16 h-16 rounded-xl flex items-center justify-center text-3xl transition-all duration-300
                  ${config.platform === platform.id ? 'bg-blue-600' : 'bg-gray-100'}
                `}
              >
                {platform.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {platform.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {platform.description}
                </p>
                <div className="text-xl font-bold text-blue-600">
                  ¥{platform.price.toLocaleString()}/月
                </div>
              </div>
            </div>

            {config.platform === platform.id && (
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
