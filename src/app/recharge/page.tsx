'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 预设充值金额
const PRESET_AMOUNTS = [
	{ amount: 100, bonus: 0, label: '¥100' },
	{ amount: 500, bonus: 20, label: '¥500' },
	{ amount: 1000, bonus: 50, label: '¥1000' },
	{ amount: 2000, bonus: 120, label: '¥2000' },
	{ amount: 5000, bonus: 350, label: '¥5000' },
	{ amount: 10000, bonus: 800, label: '¥10000' },
];

// 充值方式
const PAYMENT_METHODS = [
	{ id: 'alipay', name: '支付宝', icon: '💳' },
	{ id: 'wechat', name: '微信支付', icon: '💚' },
	{ id: 'bank', name: '银行卡', icon: '🏦' },
];

export default function RechargePage() {
	const { user, refreshUser } = useAuth();
	const router = useRouter();
	const [member, setMember] = useState<any>(null);
	const [isLoadingMember, setIsLoadingMember] = useState(true);
	const [selectedAmount, setSelectedAmount] = useState<number>(0);
	const [customAmount, setCustomAmount] = useState('');
	const [selectedPayment, setSelectedPayment] = useState<string>('alipay');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	// 获取会员信息
	useEffect(() => {
		if (user) {
			fetchMemberInfo();
		}
	}, [user]);

	const fetchMemberInfo = async () => {
		try {
			const response = await fetch('/api/user/me/member', {
				credentials: 'include',
			});

			if (response.ok) {
				const data = await response.json();
				setMember(data.member);
			}
		} catch (error) {
			console.error('Failed to fetch member:', error);
		} finally {
			setIsLoadingMember(false);
		}
	};

	// 处理金额选择
	const handleAmountSelect = (amount: number) => {
		setSelectedAmount(amount);
		setCustomAmount('');
		setErrorMessage('');
		setSuccessMessage('');
	};

	// 处理自定义金额
	const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^\d]/g, '');
		setCustomAmount(value);
		if (value) {
			setSelectedAmount(parseInt(value));
		}
		setErrorMessage('');
		setSuccessMessage('');
	};

	// 计算赠送金额
	const calculateBonus = (amount: number): number => {
		const preset = PRESET_AMOUNTS.find((p) => p.amount === amount);
		return preset ? preset.bonus : 0;
	};

	// 获取实际充值金额（包含赠送）
	const getActualAmount = (): number => {
		return selectedAmount + calculateBonus(selectedAmount);
	};

	// 处理充值提交
	const handleRecharge = async (e: React.FormEvent) => {
		e.preventDefault();

		if (selectedAmount < 1) {
			setErrorMessage('请输入或选择充值金额');
			return;
		}

		setIsSubmitting(true);
		setErrorMessage('');
		setSuccessMessage('');

		try {
			const response = await fetch('/api/user/me/member/recharge', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					amount: selectedAmount * 100, // 转换为分
					paymentMethod: selectedPayment,
					description: `充值 ¥${selectedAmount}`,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || '充值失败');
			}

			const data = await response.json();
			setSuccessMessage('充值成功！');

			// 刷新会员信息
			await fetchMemberInfo();
			await refreshUser();

			// 3秒后跳转到个人中心
			setTimeout(() => {
				router.push('/profile');
			}, 3000);
		} catch (err: any) {
			setErrorMessage(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-4xl font-semibold text-gray-900 mb-4">请先登录</h1>
					<Link
						href="/login"
						className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-all duration-200"
					>
						前往登录
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-[980px] mx-auto px-4 py-16">
				{/* Back Link */}
				<div className="mb-12">
					<Link
						href="/"
						className="text-xs text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 transition-colors"
					>
						← 返回首页
					</Link>
				</div>

				{/* Header */}
				<div className="mb-12">
					<h1 className="text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight mb-4">
						账户充值
					</h1>
					<p className="text-xl text-gray-600">
						为您的账户充值，享受更多服务
					</p>
				</div>

				{/* Messages */}
				{successMessage && (
					<div className="bg-green-50 text-green-700 px-6 py-4 rounded-lg mb-6">
						{successMessage}
					</div>
				)}

				{errorMessage && (
					<div className="bg-red-50 text-red-700 px-6 py-4 rounded-lg mb-6">
						{errorMessage}
					</div>
				)}

				{/* Current Balance */}
				{!isLoadingMember && member && (
					<div className="bg-white rounded-2xl p-8 mb-8">
						<div className="text-sm text-gray-600 mb-2">当前余额</div>
						<div className="text-4xl font-semibold text-gray-900">
							¥{(member.balance / 100).toFixed(2)}
						</div>
					</div>
				)}

				{/* Recharge Form */}
				<div className="bg-white rounded-2xl p-8">
					<form onSubmit={handleRecharge}>
						{/* Amount Selection */}
						<div className="mb-8">
							<label className="block text-sm font-medium text-gray-900 mb-4">
								选择充值金额
							</label>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
								{PRESET_AMOUNTS.map((preset) => (
									<button
										key={preset.amount}
										type="button"
										onClick={() => handleAmountSelect(preset.amount)}
										className={`p-6 rounded-xl border-2 transition-all ${
											selectedAmount === preset.amount
												? 'border-gray-900 bg-gray-50'
												: 'border-gray-200 hover:border-gray-300'
										}`}
									>
										<div className="text-2xl font-semibold text-gray-900 mb-2">
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

							{/* Custom Amount */}
							<div>
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
						</div>

						{/* Payment Method */}
						<div className="mb-8">
							<label className="block text-sm font-medium text-gray-900 mb-4">
								选择支付方式
							</label>
							<div className="grid grid-cols-3 gap-4">
								{PAYMENT_METHODS.map((method) => (
									<button
										key={method.id}
										type="button"
										onClick={() => setSelectedPayment(method.id)}
										className={`p-4 rounded-xl border-2 transition-all ${
											selectedPayment === method.id
												? 'border-gray-900 bg-gray-50'
												: 'border-gray-200 hover:border-gray-300'
										}`}
									>
										<div className="text-2xl mb-1">{method.icon}</div>
										<div className="text-sm font-medium text-gray-900">
											{method.name}
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Summary */}
						{selectedAmount > 0 && (
							<div className="bg-gray-50 rounded-xl p-6 mb-8">
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

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isSubmitting || selectedAmount < 1}
							className="w-full bg-gray-900 text-white py-4 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						>
							{isSubmitting ? '处理中...' : '立即充值'}
						</button>

						{/* Notice */}
						<div className="mt-6 text-xs text-gray-600">
							<p className="mb-2">
								<strong>温馨提示：</strong>
							</p>
							<ul className="list-disc list-inside space-y-1">
								<li>充值金额将实时到账</li>
								<li>充值成功后可立即使用余额消费</li>
								<li>如有疑问，请联系客服</li>
							</ul>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
