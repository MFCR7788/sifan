'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SummaryPanelProps {
  config: any;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

const platformNames: Record<string, string> = {
  'single-store': '单店运营',
  'multi-store': '多门店连锁',
  'brand-chain': '品牌连锁'
};

const moduleNames: Record<string, string> = {
  'distribution-system': '分销裂变体系',
  'marketing-activities': '营销活动中心',
  'member-operation': '会员运营体系',
  'order-inventory': '订单与库存',
  'data-analysis': '数据分析与监控',
  'advanced-functions': '高级功能'
};

const serviceNames: Record<string, string> = {
  'implementation': '实施服务',
  'training': '运营培训',
  'support-platinum': '白金技术支持',
  'consulting': '业务咨询',
  'customization': '定制开发',
  'data-migration': '数据迁移'
};

const addonNames: Record<string, string> = {
  'ai-design': 'AI智能设计',
  'data-analysis': '深度数据分析',
  crm: 'CRM客户管理',
  training: '运营培训'
};

const serviceLevelNames: Record<string, string> = {
  basic: '基础运营',
  advanced: '深度代运营',
  custom: '定制化方案'
};

export default function SummaryPanel({ config, onStepChange, onNext, onPrev }: SummaryPanelProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    setIsExpanded(true);
  }, [config]);

  const getPlatformName = () => platformNames[config.platform] || '未选择';

  const getModuleNames = () => {
    if (!config.selectedFeatures) return [];
    return config.selectedFeatures;
  };

  const getServiceNames = () => {
    if (!config.valueServices) return [];
    return config.valueServices.map((id: string) => serviceNames[id]).filter(Boolean);
  };

  const isComplete = config.step === 3;

  const handleSubmitOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.email) {
      alert('请填写完整的客户信息');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email,
          platform: config.platform,
          serviceLevel: config.serviceLevel || '',
          selectedFeatures: config.selectedFeatures || [],
          valueServices: config.valueServices || [],
          totalPrice: config.totalPrice,
          monthlyFee: config.monthlyFee || 0,
          notes: customerInfo.notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 跳转到支付页面
        router.push(`/payment?orderNumber=${result.data.orderNumber}`);
      } else {
        alert(result.error || '创建订单失败');
      }
    } catch (error) {
      console.error('Submit order error:', error);
      alert('提交订单失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <div className="text-sm text-gray-600 mb-1">业务场景</div>
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

            {/* Core Modules */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">核心功能</div>
                {config.step >= 2 && (config.selectedFeatures || []).length > 0 ? (
                  <>
                    <div className="space-y-1">
                      {getModuleNames().slice(0, 3).map((name: string, index: number) => (
                        <div key={index} className="text-sm text-gray-900">
                          • {name}
                        </div>
                      ))}
                      {(config.selectedFeatures || []).length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{(config.selectedFeatures || []).length - 3} 更多功能
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onStepChange(2)}
                      className="text-sm text-blue-600 hover:underline mt-1"
                    >
                      修改
                    </button>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">未选择</div>
                )}
              </div>
            </div>

            {/* Value Services */}
            {config.step >= 3 && (config.valueServices || []).length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">增值服务</div>
                  <div className="space-y-1">
                    {getServiceNames().slice(0, 3).map((name: string, index: number) => (
                      <div key={index} className="text-sm text-gray-900">
                        • {name}
                      </div>
                    ))}
                    {(config.valueServices || []).length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{(config.valueServices || []).length - 3} 更多服务
                      </div>
                    )}
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
            {config.monthlyFee > 0 && (
              <div className="text-sm text-gray-500 mt-1">
                功能费: ¥{config.monthlyFee}/月
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {showCustomerForm && isComplete && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
              <h4 className="font-medium text-gray-900">请填写您的联系信息</h4>
              <div>
                <label className="block text-sm text-gray-600 mb-1">姓名 *</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">手机号 *</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="请输入手机号"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">邮箱 *</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="请输入邮箱"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">备注说明</label>
                <textarea
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  rows={2}
                  placeholder="请输入备注说明（可选）"
                />
              </div>
            </div>
          )}

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
              onClick={isComplete ? (showCustomerForm ? handleSubmitOrder : () => setShowCustomerForm(true)) : onNext}
              disabled={!isComplete && config.step === 1 && !config.platform}
              className={`
                w-full py-3 px-4 rounded-xl font-medium transition-all duration-200
                ${isComplete
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-lg'
                  : 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105'
                }
                ${config.step === 1 && !config.platform ? 'opacity-50 cursor-not-allowed' : ''}
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? '提交中...' : (showCustomerForm ? '确认提交' : (isComplete ? '提交订单' : '下一步'))}
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
