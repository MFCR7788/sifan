'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface RechargeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// 预设充值金额
const PRESET_AMOUNTS = [
  { amount: 100, bonus: 0, label: '¥100' },
  { amount: 500, bonus: 20, label: '¥500' },
  { amount: 1000, bonus: 50, label: '¥1000' },
  { amount: 2000, bonus: 120, label: '¥2000' },
  { amount: 5000, bonus: 350, label: '¥5000' },
  { amount: 10000, bonus: 800, label: '¥10000' },
];

// 会员套餐
const MEMBERSHIP_PLANS = [
  {
    id: 'silver',
    name: '银牌会员',
    price: 500,
    period: '月',
    features: ['基础会员权限', '专属客服', '会员折扣'],
  },
  {
    id: 'gold',
    name: '金牌会员',
    price: 2000,
    period: '月',
    features: ['银牌会员权限', '高级功能', '专属顾问', '快速通道'],
  },
  {
    id: 'platinum',
    name: '白金会员',
    price: 5000,
    period: '年',
    features: ['金牌会员权限', '定制服务', '优先支持', '专属活动'],
  },
];

// 积分充值选项
const POINTS_PACKAGES = [
  { points: 1000, price: 100, bonus: 0 },
  { points: 5000, price: 500, bonus: 500 },
  { points: 10000, price: 1000, bonus: 1500 },
  { points: 20000, price: 2000, bonus: 4000 },
];

export default function RechargeDialog({ isOpen, onClose }: RechargeDialogProps) {
  const [activeTab, setActiveTab] = useState<'member' | 'balance' | 'points'>('member');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('alipay');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedPoints, setSelectedPoints] = useState<number>(0);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setActiveTab('member');
      setSelectedAmount(0);
      setCustomAmount('');
      setPaymentMethod('alipay');
      setSelectedPlan('');
      setSelectedPoints(0);
    }
  }, [isOpen]);

  const calculateBonus = (amount: number): number => {
    const preset = PRESET_AMOUNTS.find((p) => p.amount === amount);
    return preset ? preset.bonus : 0;
  };

  const getActualAmount = (): number => {
    return selectedAmount + calculateBonus(selectedAmount);
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(parseInt(value));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[1200px] max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900">账户充值</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧 3/4：选项卡内容 */}
          <div className="w-3/4 border-r border-gray-100 flex flex-col overflow-hidden">
            {/* 选项卡按钮 */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('member')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'member'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                购买会员
              </button>
              <button
                onClick={() => setActiveTab('balance')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'balance'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                会员充值
              </button>
              <button
                onClick={() => setActiveTab('points')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'points'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                积分充值
              </button>
            </div>

            {/* 选项卡内容区域 */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* 购买会员 */}
              {activeTab === 'member' && (
                <div className="space-y-4">
                  {MEMBERSHIP_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {plan.name}
                        </h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            ¥{plan.price}
                          </div>
                          <div className="text-xs text-gray-500">
                            /{plan.period}
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <span className="w-2 h-2 bg-gray-900 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* 会员充值 */}
              {activeTab === 'balance' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-4">
                      选择充值金额
                    </label>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {PRESET_AMOUNTS.map((preset) => (
                        <button
                          key={preset.amount}
                          type="button"
                          onClick={() => handleAmountSelect(preset.amount)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedAmount === preset.amount
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xl font-semibold text-gray-900 mb-1">
                            {preset.label}
                          </div>
                          {preset.bonus > 0 && (
                            <div className="text-xs text-red-600 font-medium">
                              赠送 ¥{preset.bonus}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      或输入自定义金额
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 text-lg">
                        ¥
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        placeholder="请输入金额"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {selectedAmount > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">充值金额</span>
                        <span className="text-lg font-semibold text-gray-900">
                          ¥{selectedAmount}
                        </span>
                      </div>
                      {calculateBonus(selectedAmount) > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">赠送金额</span>
                          <span className="text-lg font-semibold text-red-600">
                            +¥{calculateBonus(selectedAmount)}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-medium text-gray-900">
                            实际到账
                          </span>
                          <span className="text-xl font-semibold text-gray-900">
                            ¥{getActualAmount()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 积分充值 */}
              {activeTab === 'points' && (
                <div className="space-y-4">
                  {POINTS_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.points}
                      onClick={() => setSelectedPoints(pkg.points)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPoints === pkg.points
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-900 mb-1">
                            {pkg.points.toLocaleString()} 积分
                          </div>
                          {pkg.bonus > 0 && (
                            <div className="text-sm text-red-600 font-medium">
                              赠送 {pkg.bonus.toLocaleString()} 积分
                            </div>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          ¥{pkg.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧 1/4：支付方式 */}
          <div className="w-1/4 flex flex-col">
            {/* 支付方式选择 */}
            <div className="p-6 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-900 mb-4">
                支付方式
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('wechat')}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-center ${
                    paymentMethod === 'wechat'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl">💚</div>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    微信支付
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod('alipay')}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-center ${
                    paymentMethod === 'alipay'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl">💳</div>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    支付宝
                  </span>
                </button>
              </div>
            </div>

            {/* 收款二维码 */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="text-sm font-medium text-gray-900 mb-4">
                收款二维码
              </div>
              <div className="flex-1 flex items-center justify-center">
                {selectedAmount > 0 || selectedPlan || selectedPoints > 0 ? (
                  <div className="text-center">
                    <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                      <div className="text-gray-400 text-sm">
                        {paymentMethod === 'wechat' ? '微信' : '支付宝'}
                        <br />
                        二维码
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {activeTab === 'balance' && `¥${selectedAmount}`}
                      {activeTab === 'member' && selectedPlan && `¥${MEMBERSHIP_PLANS.find(p => p.id === selectedPlan)?.price}`}
                      {activeTab === 'points' && `¥${POINTS_PACKAGES.find(p => p.points === selectedPoints)?.price}`}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-sm">
                    请先选择充值金额<br />或会员套餐
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
          <button
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all"
          >
            确认支付
          </button>
        </div>
      </div>
    </div>
  );
}
