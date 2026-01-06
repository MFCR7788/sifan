'use client';

import { useState, useEffect } from 'react';

interface SummaryPanelProps {
  config: any;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

const platformNames: Record<string, string> = {
  douyin: '抖音',
  xiaohongshu: '小红书',
  wechat: '微信',
  multi: '多平台'
};

const serviceLevelNames: Record<string, string> = {
  basic: '基础运营',
  advanced: '深度代运营',
  custom: '定制化方案'
};

const addonNames: Record<string, string> = {
  'ai-design': 'AI智能设计',
  'data-analysis': '深度数据分析',
  crm: 'CRM客户管理',
  training: '运营培训'
};

export default function SummaryPanel({ config, onStepChange, onNext, onPrev }: SummaryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setIsExpanded(true);
  }, [config]);

  const getPlatformName = () => platformNames[config.platform] || '未选择';

  const getServiceLevelName = () => serviceLevelNames[config.serviceLevel] || '未选择';

  const getAddonNames = () => config.addons.map((id: string) => addonNames[id]).filter(Boolean);

  const isComplete = config.step === 3;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden sticky top-24">
      {/* Header */}
      <div
        className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="font-semibold text-lg">方案概览</h3>
          <p className="text-sm text-gray-300">实时配置与报价</p>
        </div>
        <button className="p-2 hover:bg-gray-800 rounded-lg transition">
          {isExpanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Current Selections */}
          <div className="space-y-4">
            {/* Platform */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">目标平台</div>
                <div className="font-medium text-gray-900">{getPlatformName()}</div>
                {config.step >= 1 && config.platform && (
                  <button
                    onClick={() => onStepChange(1)}
                    className="text-sm text-blue-600 hover:underline mt-1"
                  >
                    修改
                  </button>
                )}
              </div>
            </div>

            {/* Service Level */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">服务深度</div>
                <div className="font-medium text-gray-900">{getServiceLevelName()}</div>
                {config.step >= 2 && config.serviceLevel && (
                  <button
                    onClick={() => onStepChange(2)}
                    className="text-sm text-blue-600 hover:underline mt-1"
                  >
                    修改
                  </button>
                )}
              </div>
            </div>

            {/* Addons */}
            {config.step >= 3 && config.addons.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">增值工具</div>
                  <div className="space-y-1">
                    {getAddonNames().map((name, index) => (
                      <div key={index} className="text-sm text-gray-900">
                        • {name}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => onStepChange(3)}
                    className="text-sm text-blue-600 hover:underline mt-1"
                  >
                    修改
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Price */}
          <div>
            <div className="text-sm text-gray-600 mb-1">月度总价</div>
            <div className="text-4xl font-bold text-gray-900">
              ¥{config.totalPrice.toLocaleString()}
              <span className="text-lg font-normal text-gray-600 ml-1">/月</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {config.step > 1 && (
              <button
                onClick={onPrev}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                上一步
              </button>
            )}

            <button
              onClick={isComplete ? () => alert('提交订单！') : onNext}
              disabled={!isComplete && config.step === 1 && !config.platform}
              className={`
                w-full py-3 px-4 rounded-xl font-medium transition-all duration-200
                ${isComplete
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-lg'
                  : 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105'
                }
                ${config.step === 1 && !config.platform ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isComplete ? '提交订单' : '下一步'}
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500">
            如需帮助，请联系客服
          </div>
        </div>
      )}
    </div>
  );
}
