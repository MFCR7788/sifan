'use client';

import { useState } from 'react';

interface ConfiguratorStep3Props {
  config: any;
  updateConfig: (updates: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const valueServices = [
  {
    id: 'implementation',
    name: '实施服务',
    description: '专业团队上门实施，快速上线',
    price: 0,
    icon: '🚀',
    features: [
      '业务流程诊断',
      '系统配置与测试',
      '数据初始化与迁移',
      '试点运行指导'
    ]
  },
  {
    id: 'training',
    name: '运营培训',
    description: '系统操作与业务运营培训',
    price: 0,
    icon: '📚',
    features: [
      '系统操作培训',
      '业务流程培训',
      '最佳实践分享',
      '团队认证考核'
    ]
  },
  {
    id: 'support-platinum',
    name: '白金技术支持',
    description: '7×24小时专属技术支持',
    price: 0,
    icon: '💎',
    features: [
      '专属技术顾问',
      '7×24小时响应',
      '优先问题处理',
      '定期巡检服务'
    ]
  },
  {
    id: 'consulting',
    name: '业务咨询',
    description: '数字化转型顾问服务',
    price: 0,
    icon: '🎯',
    features: [
      '数字化转型规划',
      '业务流程优化',
      '数据分析咨询',
      '季度业务复盘'
    ]
  },
  {
    id: 'customization',
    name: '定制开发',
    description: '个性化需求定制开发',
    price: 0,
    icon: '⚙️',
    features: [
      '需求分析与设计',
      '定制功能开发',
      '系统集成对接',
      '持续迭代优化'
    ]
  },
  {
    id: 'data-migration',
    name: '数据迁移',
    description: '历史数据清洗与迁移',
    price: 0,
    icon: '🔄',
    features: [
      '数据清洗与标准化',
      '历史数据导入',
      '数据质量校验',
      '迁移报告交付'
    ]
  }
];

export default function ConfiguratorStep3({ config, updateConfig, onNext, onPrev }: ConfiguratorStep3Props) {
  const [localServices, setLocalServices] = useState<string[]>(config.valueServices || []);

  const handleServiceToggle = (serviceId: string) => {
    const updatedServices = localServices.includes(serviceId)
      ? localServices.filter(id => id !== serviceId)
      : [...localServices, serviceId];

    setLocalServices(updatedServices);
    updateConfig({
      valueServices: updatedServices
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          选择增值服务
        </h2>
        <p className="text-gray-600">
          专属服务，助力企业数字化转型（可多选）
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {valueServices.map((service) => {
          const isSelected = localServices.includes(service.id);
          return (
            <button
              key={service.id}
              onClick={() => handleServiceToggle(service.id)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                ${isSelected
                  ? 'border-gold bg-gold/[0.07] shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 flex-shrink-0
                    ${isSelected ? 'bg-gold' : 'bg-gray-100'}
                  `}
                >
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {service.description}
                  </p>
                  <div className="space-y-1">
                    {service.features.slice(0, 2).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-3 h-3 text-gold-dim flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                    {service.features.length > 2 && (
                      <div className="text-sm text-gray-400">
                        +{service.features.length - 2} 更多服务
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
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

      {localServices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          未选择任何增值服务
        </div>
      )}
    </div>
  );
}
