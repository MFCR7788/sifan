'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
    price: 299,
    originalPrice: 600,
    period: '年',
    badge: '超值',
    features: [
      { icon: '✓', text: '基础会员全部权益' },
      { icon: '✓', text: '专属客服一对一服务' },
      { icon: '✓', text: '全站商品9.5折优惠' },
      { icon: '✓', text: '免费方案咨询' },
      { icon: '✓', text: '优先技术支持' },
    ],
    color: 'from-gray-500 to-gray-600',
  },
  {
    id: 'gold',
    name: '金牌会员',
    price: 50,
    originalPrice: 100,
    period: '月',
    badge: '热门',
    features: [
      { icon: '✓', text: '银牌会员全部权益' },
      { icon: '✓', text: '全站商品8.8折优惠' },
      { icon: '✓', text: '专属客户经理' },
      { icon: '✓', text: '高级功能使用权' },
      { icon: '✓', text: '快速绿色通道' },
      { icon: '✓', text: '月度运营报告' },
    ],
    color: 'from-yellow-400 to-yellow-500',
  },
  {
    id: 'platinum',
    name: '白金会员',
    price: 499,
    originalPrice: 1000,
    period: '年',
    badge: '尊享',
    features: [
      { icon: '✓', text: '金牌会员全部权益' },
      { icon: '✓', text: '全站商品7.5折优惠' },
      { icon: '✓', text: '专属定制服务' },
      { icon: '✓', text: '24小时专属客服' },
      { icon: '✓', text: '优先体验新功能' },
      { icon: '✓', text: '专属活动邀请' },
      { icon: '✓', text: '专属顾问团队' },
    ],
    color: 'from-purple-500 to-purple-600',
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
  const { user, isAuthenticated, login, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'member' | 'balance' | 'points'>('member');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedPoints, setSelectedPoints] = useState<number>(0);
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [orderNo, setOrderNo] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0); // 存储当前支付金额
  const [paymentDescription, setPaymentDescription] = useState<string>(''); // 存储支付描述
  const [paymentError, setPaymentError] = useState<string>(''); // 存储支付错误信息

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      console.log('=== 充值对话框打开 ===');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('user:', user);
      console.log('浏览器 Cookie:', document.cookie);
      console.log('sessionStorage userId:', sessionStorage.getItem('userId'));

      // 测试 cookie/header 读取接口
      const headers: Record<string, string> = {};
      const sessionUserId = sessionStorage.getItem('userId');
      if (sessionUserId) {
        headers['x-user-id'] = sessionUserId;
      }

      fetch('/api/test/cookies', { credentials: 'include', headers })
        .then(res => res.json())
        .then(data => {
          console.log('测试接口返回的数据:', data);
          if (!data.finalUserId) {
            console.error('❌ Cookie 和 Header 都未正确发送到后端！');
            console.error('前端显示已登录（', isAuthenticated, '），但后端收到的 userId 为空');
            console.error('建议：刷新页面或重新登录');
          } else {
            console.log('✅ 认证信息已正确发送到后端，来源:', data.cookieUserId ? 'Cookie' : 'Header');
          }
        })
        .catch(err => {
          console.error('测试接口调用失败:', err);
        });

      setActiveTab('member');
      setSelectedAmount(0);
      setCustomAmount('');
      setSelectedPlan('');
      setSelectedPoints(0);
      setQrCodeImage('');
      setOrderNo('');
      setPaymentStatus('pending');
      setIsPolling(false);
      setShowLoginPrompt(false);
      setPaymentAmount(0);
      setPaymentDescription('');
      setPaymentError(''); // 清空错误信息
    }
  }, [isOpen, isAuthenticated, user]);

  // 生成支付二维码
  useEffect(() => {
    const generatePaymentQr = async () => {
      // 检查是否登录
      if (!isAuthenticated) {
        setShowLoginPrompt(true);
        setQrCodeImage('');
        setOrderNo('');
        return;
      }

      if ((activeTab === 'balance' && selectedAmount > 0) ||
          (activeTab === 'member' && selectedPlan) ||
          (activeTab === 'points' && selectedPoints > 0)) {

        let amount = 0;
        let description = '';
        let metadata = {};

        if (activeTab === 'balance') {
          amount = selectedAmount;
          description = `充值 ¥${selectedAmount}`;
        } else if (activeTab === 'member') {
          const plan = MEMBERSHIP_PLANS.find(p => p.id === selectedPlan);
          amount = plan?.price || 0;
          description = `${plan?.name} - ${plan?.period}`;
          metadata = { planId: plan?.id };
        } else if (activeTab === 'points') {
          const pkg = POINTS_PACKAGES.find(p => p.points === selectedPoints);
          amount = pkg?.price || 0;
          description = `${pkg?.points.toLocaleString()} 积分`;
          metadata = { points: pkg?.points };
        }

        // 存储支付信息用于显示
        setPaymentAmount(amount);
        setPaymentDescription(description);

        setIsGeneratingQr(true);
        setQrCodeImage('');
        setPaymentStatus('pending');
        setPaymentError(''); // 清空之前的错误

        try {
          // 构建请求头（包含自定义 userId header 作为备选方案）
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          const sessionUserId = sessionStorage.getItem('userId');
          if (sessionUserId) {
            headers['x-user-id'] = sessionUserId;
            console.log('✅ 从 sessionStorage 读取 userId:', sessionUserId);
          }

          const response = await fetch('/api/payment/create', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({
              paymentMethod: 'wechat', // 固定使用微信支付
              amount,
              description,
              type: activeTab === 'balance' ? 'recharge' : activeTab === 'member' ? 'membership' : activeTab,
              metadata,
            }),
          });

          console.log('=== 支付接口响应 ===');
          console.log('Response status:', response.status);
          console.log('Response Content-Type:', response.headers.get('content-type'));

          let data;
          try {
            data = await response.json();
            console.log('Response data:', data);
          } catch (parseError) {
            // 如果解析 JSON 失败，获取原始文本
            console.error('❌ JSON 解析失败:', parseError);
            const text = await response.text();
            console.error('原始响应内容 (前 500 字符):', text.substring(0, 500));

            // 设置错误信息
            setPaymentError(
              `服务器返回错误 (${response.status}): ${text.substring(0, 200)}...`
            );
            setIsGeneratingQr(false);
            return;
          }
          console.log('====================');

          if (data.success) {
            setQrCodeImage(data.qrCodeImage);
            setOrderNo(data.orderNo);
          } else {
            console.error('❌ 生成支付二维码失败');
            console.error('错误信息:', data.error);
            console.error('HTTP 状态码:', response.status);

            // 设置错误信息供显示
            setPaymentError(data.error || '未知错误');

            // 如果是未登录错误，显示登录提示
            if (response.status === 401 || data.error?.includes('未登录')) {
              console.error('检测到未登录错误，显示登录提示');
              setShowLoginPrompt(true);
            }
          }
        } catch (error: any) {
          console.error('生成支付二维码错误:', error);
          console.error('错误堆栈:', error.stack);
          setPaymentError(error.message || '网络错误，请稍后重试');
        } finally {
          setIsGeneratingQr(false);
        }
      } else {
        setQrCodeImage('');
        setOrderNo('');
        setPaymentStatus('pending');
        setPaymentAmount(0);
        setPaymentDescription('');
        setPaymentError(''); // 清空错误信息
      }
    };

    generatePaymentQr();
  }, [selectedAmount, selectedPlan, selectedPoints, activeTab]);

  // 轮询支付状态
  useEffect(() => {
    if (!qrCodeImage || isPolling || paymentStatus !== 'pending') return;

    const pollPaymentStatus = async () => {
      setIsPolling(true);
      let attempts = 0;
      const maxAttempts = 60; // 最多轮询60次（5分钟）

      const interval = setInterval(async () => {
        attempts++;

        try {
          const response = await fetch(
            `/api/payment/query?orderNo=${orderNo}`,
            { credentials: 'include' }
          );

          const data = await response.json();

          if (data.success && data.isPaid) {
            setPaymentStatus('success');
            clearInterval(interval);
            setIsPolling(false);
            // 支付成功后不自动关闭，等待用户点击完成按钮
          } else if (attempts >= maxAttempts) {
            setPaymentStatus('failed');
            clearInterval(interval);
            setIsPolling(false);
          }
        } catch (error) {
          console.error('查询支付状态错误:', error);
        }
      }, 5000); // 每5秒查询一次

      return () => clearInterval(interval);
    };

    pollPaymentStatus();
  }, [qrCodeImage, orderNo, paymentStatus, onClose, isPolling]);

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
      onClick={(e) => {
        console.log('RechargeDialog: 点击背景，调用 onClose');
        onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[1200px] h-[800px] overflow-hidden flex flex-col"
        onClick={(e) => {
          console.log('RechargeDialog: 点击对话框内容，阻止冒泡');
          e.stopPropagation();
        }}
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
              {/* 登录提示 */}
              {showLoginPrompt && (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">请先登录</h3>
                      <p className="text-gray-500">登录后即可享受充值和会员服务</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowLoginPrompt(false);
                        onClose();
                      }}
                      className="px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      前往登录
                    </button>
                  </div>
                </div>
              )}

              {/* 购买会员 */}
              {!showLoginPrompt && activeTab === 'member' && (
                <div className="grid grid-cols-3 gap-6">
                  {MEMBERSHIP_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative rounded-2xl border-2 cursor-pointer transition-all overflow-hidden ${
                        selectedPlan === plan.id
                          ? 'border-gray-900 shadow-xl scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                      }`}
                    >
                      {/* 顶部标签 */}
                      {plan.badge && (
                        <div
                          className={`absolute top-0 left-0 right-0 bg-gradient-to-r ${plan.color} text-white text-xs font-medium py-1.5 text-center`}
                        >
                          {plan.badge}
                        </div>
                      )}

                      {/* 会员标题 */}
                      <div className={`bg-gradient-to-r ${plan.color} px-6 pt-10 pb-6 text-white`}>
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">¥{plan.price}</span>
                          <span className="text-sm opacity-80">/{plan.period}</span>
                        </div>
                        {plan.originalPrice > plan.price && (
                          <div className="text-xs opacity-70 line-through mt-1">
                            原价 ¥{plan.originalPrice}
                          </div>
                        )}
                      </div>

                      {/* 特权列表 */}
                      <div className="bg-white p-6">
                        <div className="text-xs font-medium text-gray-500 mb-4">
                          会员特权
                        </div>
                        <ul className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-700 flex items-start"
                            >
                              <span className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white text-xs mr-2 mt-0.5`}>
                                {feature.icon}
                              </span>
                              <span>{feature.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 会员充值 */}
              {!showLoginPrompt && activeTab === 'balance' && (
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
              {!showLoginPrompt && activeTab === 'points' && (
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
              <div className="p-4 rounded-xl border-2 border-gray-900 bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M8.5 4.5c-4.1 0-7.5 3.4-7.5 7.5s3.4 7.5 7.5 7.5h7c4.1 0 7.5-3.4 7.5-7.5s-3.4-7.5-7.5-7.5h-7zm0 2h7c3 0 5.5 2.5 5.5 5.5s-2.5 5.5-5.5 5.5h-7c-3 0-5.5-2.5-5.5-5.5s2.5-5.5 5.5-5.5z"/>
                    <circle cx="7" cy="12" r="2"/>
                    <circle cx="17" cy="12" r="2"/>
                  </svg>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  微信支付
                </span>
              </div>
            </div>

            {/* 收款二维码 */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="text-sm font-medium text-gray-900 mb-4">
                收款二维码
              </div>
              <div className="flex-1 flex items-center justify-center">
                {isGeneratingQr ? (
                  <div className="text-center text-gray-400 text-sm">
                    生成中...
                  </div>
                ) : paymentError ? (
                  <div className="text-center w-full space-y-4">
                    <div className="w-48 h-48 bg-red-50 rounded-xl flex items-center justify-center mx-auto border-2 border-red-200">
                      <div className="text-red-500">
                        <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-red-600">
                        生成二维码失败
                      </div>
                      <div className="text-sm text-gray-600">
                        {paymentError}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPaymentError('');
                        setShowLoginPrompt(true);
                      }}
                      className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      查看调试信息
                    </button>
                  </div>
                ) : qrCodeImage ? (
                  <div className="text-center w-full">
                    {paymentStatus === 'success' ? (
                      <div className="space-y-4">
                        <div className="w-48 h-48 bg-green-50 rounded-xl flex items-center justify-center mx-auto border-2 border-green-200">
                          <div className="text-green-500">
                            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          支付成功
                        </div>
                        <button
                          onClick={() => {
                            onClose();
                            window.location.reload();
                          }}
                          className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          完成
                        </button>
                      </div>
                    ) : paymentStatus === 'failed' ? (
                      <div className="space-y-4">
                        <div className="w-48 h-48 bg-red-50 rounded-xl flex items-center justify-center mx-auto border-2 border-red-200">
                          <div className="text-red-500">
                            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-red-600">
                          支付超时
                        </div>
                        <div className="text-xs text-gray-500">
                          请重新生成订单
                        </div>
                      </div>
                    ) : (
                      <div>
                        <img
                          src={qrCodeImage}
                          alt="支付二维码"
                          className="w-48 h-48 rounded-xl mx-auto mb-4"
                        />
                        <div className="text-xs text-gray-500 mb-2">
                          请使用微信扫码支付
                        </div>
                        <div className="space-y-2">
                          <div className="text-lg font-semibold text-gray-900">
                            ¥{paymentAmount}
                          </div>
                          {paymentDescription && (
                            <div className="text-xs text-gray-500">
                              {paymentDescription}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            虚拟商品出售后不能退款，请按需购买！
                          </div>
                        </div>
                        {isPolling && (
                          <div className="text-xs text-gray-400 mt-3">
                            正在查询支付状态...
                          </div>
                        )}

                        {/* 开发环境：模拟支付完成按钮 */}
                        {process.env.NODE_ENV === 'development' && (
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/payment/mock-complete', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  credentials: 'include',
                                  body: JSON.stringify({ orderNo }),
                                });

                                const data = await response.json();

                                if (data.success) {
                                  setPaymentStatus('success');
                                } else {
                                  console.error('模拟支付失败:', data.error);
                                }
                              } catch (error) {
                                console.error('模拟支付错误:', error);
                              }
                            }}
                            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600 transition-colors"
                          >
                            ⚡ 模拟支付完成（开发环境）
                          </button>
                        )}
                      </div>
                    )}
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
      </div>
    </div>
  );
}
