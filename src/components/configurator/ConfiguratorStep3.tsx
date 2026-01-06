'use client';

import { useState } from 'react';

interface ConfiguratorStep3Props {
  config: any;
  updateConfig: (updates: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const addons = [
  {
    id: 'ai-design',
    name: 'AI智能设计',
    description: 'AI生成图片、设计素材',
    price: 2800,
    icon: '🎨'
  },
  {
    id: 'data-analysis',
    name: '深度数据分析',
    description: '专业数据分析报告',
    price: 3800,
    icon: '📊'
  },
  {
    id: 'crm',
    name: 'CRM客户管理',
    description: '客户关系管理系统',
    price: 4800,
    icon: '👥'
  },
  {
    id: 'training',
    name: '运营培训',
    description: '团队培训赋能',
    price: 5800,
    icon: '📚'
  }
];

export default function ConfiguratorStep3({ config, updateConfig, onNext, onPrev }: ConfiguratorStep3Props) {
  const [localAddons, setLocalAddons] = useState<string[]>(config.addons);

  const handleAddonToggle = (addonId: string) => {
    const updatedAddons = localAddons.includes(addonId)
      ? localAddons.filter(id => id !== addonId)
      : [...localAddons, addonId];

    setLocalAddons(updatedAddons);

    // Calculate new price
    const addonPrice = addons
      .filter(a => updatedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);

    const basePrice = config.platform === 'multi' ? 19800 : 10800;
    const serviceMultiplier = config.serviceLevel === 'advanced' ? 2 : config.serviceLevel === 'custom' ? 3 : 1;

    updateConfig({
      addons: updatedAddons,
      totalPrice: (basePrice * serviceMultiplier) + addonPrice
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          选择增值工具
        </h2>
        <p className="text-gray-600">
          可选的增值服务，提升运营效果（可多选）
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addons.map((addon) => {
          const isSelected = localAddons.includes(addon.id);
          return (
            <button
              key={addon.id}
              onClick={() => handleAddonToggle(addon.id)}
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
                    w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-300
                    ${isSelected ? 'bg-blue-600' : 'bg-gray-100'}
                  `}
                >
                  {addon.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {addon.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {addon.description}
                  </p>
                  <div className="text-lg font-bold text-blue-600">
                    ¥{addon.price.toLocaleString()}/月
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
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

      {localAddons.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          未选择任何增值工具
        </div>
      )}
    </div>
  );
}
