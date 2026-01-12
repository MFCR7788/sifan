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

export default function RechargePage() {
	const { user, refreshUser } = useAuth();
	const router = useRouter();
	const [member, setMember] = useState<any>(null);
	const [isLoadingMember, setIsLoadingMember] = useState(true);
	const [selectedAmount, setSelectedAmount] = useState<number>(0);
	const [customAmount, setCustomAmount] = useState('');
	const [paymentMethod, setPaymentMethod] = useState<string>('wechat');

	// 支付相关状态
	const [isCreatingOrder, setIsCreatingOrder] = useState(false);
	const [isPaying, setIsPaying] = useState(false);
	const [orderNo, setOrderNo] = useState<string>('');
	const [qrCodeImage, setQrCodeImage] = useState<string>('');
	const [isPolling, setIsPolling] = useState(false);
	const [paymentSuccess, setPaymentSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [isCheckingPayment, setIsCheckingPayment] = useState(false);
	const [paymentCheckMessage, setPaymentCheckMessage] = useState('');
	const [paymentCheckSuccess, setPaymentCheckSuccess] = useState(false);

	// 倒计时（15分钟）
	const [countdown, setCountdown] = useState(900);

	// 获取会员信息
	useEffect(() => {
		if (user) {
			fetchMemberInfo();
		}
	}, [user]);

	// 倒计时逻辑
	useEffect(() => {
		if (countdown > 0 && isPaying) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		} else if (countdown === 0) {
			setIsPaying(false);
			setErrorMessage('支付超时，请重新发起充值');
		}
	}, [countdown, isPaying]);

	// 轮询支付状态
	useEffect(() => {
		let pollingInterval: NodeJS.Timeout | null = null;

		if (isPolling && orderNo) {
			pollingInterval = setInterval(async () => {
				try {
					const response = await fetch(`/api/payment/query?orderNo=${orderNo}`);
					const data = await response.json();

					if (data.success && data.isPaid) {
						// 支付成功
						setIsPolling(false);
						setPaymentSuccess(true);

						// 刷新用户信息和会员信息
						await Promise.all([
							refreshUser(),
							fetchMemberInfo(),
						]);

						// 3秒后跳转到个人中心
						setTimeout(() => {
							router.push('/profile');
						}, 3000);
					}
				} catch (error) {
					console.error('查询支付状态失败:', error);
				}
			}, 2000); // 每2秒查询一次
		}

		return () => {
			if (pollingInterval) {
				clearInterval(pollingInterval);
			}
		};
	}, [isPolling, orderNo, refreshUser, router]);

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
	};

	// 处理自定义金额
	const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^\d]/g, '');
		setCustomAmount(value);
		if (value) {
			setSelectedAmount(parseInt(value));
		}
		setErrorMessage('');
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

	// 格式化倒计时
	const formatCountdown = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	// 创建支付订单
	const handleCreateOrder = async () => {
		if (selectedAmount < 1) {
			setErrorMessage('请输入或选择充值金额');
			return;
		}

		setIsCreatingOrder(true);
		setErrorMessage('');

		try {
			const response = await fetch('/api/payment/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					paymentMethod,
					amount: getActualAmount(),
					description: `充值 ¥${getActualAmount()}`,
					type: 'recharge',
					metadata: {
						originalAmount: selectedAmount,
						bonusAmount: calculateBonus(selectedAmount),
					},
				}),
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.error || '创建支付订单失败');
			}

			// 保存订单号和二维码
			setOrderNo(data.orderNo);
			setQrCodeImage(data.qrCodeImage);

			// 进入支付状态，开始轮询
			setIsPaying(true);
			setIsPolling(true);
			setCountdown(900); // 重置倒计时
		} catch (err: any) {
			setErrorMessage(err.message);
		} finally {
			setIsCreatingOrder(false);
		}
	};

	// 重新发起支付
	const handleRetryPayment = () => {
		setIsPaying(false);
		setPaymentSuccess(false);
		setOrderNo('');
		setQrCodeImage('');
		setIsPolling(false);
		setCountdown(900);
		setPaymentCheckMessage('');
		setPaymentCheckSuccess(false);
	};

	// 检查支付状态
	const handleCheckPayment = async () => {
		if (!orderNo) {
			setErrorMessage('订单号不存在');
			return;
		}

		setIsCheckingPayment(true);
		setPaymentCheckMessage('');

		try {
			const response = await fetch(`/api/payment/query?orderNo=${orderNo}`);
			const data = await response.json();

			if (data.success && data.isPaid) {
				// 支付成功
				setPaymentCheckSuccess(true);
				setPaymentCheckMessage('支付成功！');

				// 停止轮询
				setIsPolling(false);

				// 刷新用户信息和会员信息
				await Promise.all([
					refreshUser(),
					fetchMemberInfo(),
				]);

				// 设置支付成功状态
				setPaymentSuccess(true);

				// 3秒后跳转到个人中心
				setTimeout(() => {
					router.push('/profile');
				}, 3000);
			} else {
				// 支付未成功
				setPaymentCheckSuccess(false);
				setPaymentCheckMessage('充值失败，请确认支付状态后重试');
			}
		} catch (err: any) {
			setPaymentCheckSuccess(false);
			setPaymentCheckMessage('查询支付状态失败：' + (err.message || '未知错误'));
		} finally {
			setIsCheckingPayment(false);
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

	// 支付成功状态
	if (paymentSuccess) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center max-w-md mx-auto px-4">
					{/* Success Icon */}
					<div className="mb-8">
						<div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
							<svg
								className="w-12 h-12 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
					</div>

					{/* Success Message */}
					<h1 className="text-4xl font-semibold text-gray-900 mb-4">支付成功</h1>
					<p className="text-xl text-gray-600 mb-8">
						充值金额：¥{getActualAmount()}
					</p>

					{/* Order Info */}
					<div className="bg-white rounded-2xl p-6 mb-8 text-left">
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-gray-600">充值金额</span>
								<span className="font-medium text-gray-900">¥{getActualAmount()}</span>
							</div>
							{calculateBonus(selectedAmount) > 0 && (
								<div className="flex justify-between">
									<span className="text-gray-600">赠送金额</span>
									<span className="font-medium text-green-600">
										+¥{calculateBonus(selectedAmount)}
									</span>
								</div>
							)}
							<div className="border-t border-gray-200" />
							<div className="flex justify-between">
								<span className="text-gray-600">当前余额</span>
								<span className="font-medium text-gray-900">
									¥{member ? (member.balance / 100).toFixed(2) : '-'}
								</span>
							</div>
						</div>
					</div>

					<p className="text-sm text-gray-500">3秒后自动跳转到个人中心...</p>
				</div>
			</div>
		);
	}

	// 支付状态
	if (isPaying && !paymentSuccess) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-[980px] mx-auto px-4 py-16">
					{/* Back Link */}
					<div className="mb-12">
						<button
							onClick={handleRetryPayment}
							className="text-xs text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 transition-colors"
						>
							← 返回重新充值
						</button>
					</div>

					{/* Header */}
					<div className="mb-12">
						<h1 className="text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight mb-4">
							账户充值
						</h1>
						<p className="text-xl text-gray-600">
							扫码完成支付
						</p>
					</div>

					{/* Payment Status */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Left Column - QR Code */}
						<div className="lg:col-span-2">
							<div className="bg-white rounded-2xl p-8">
								<div className="flex flex-col items-center">
									{/* QR Code */}
									<div className="w-80 h-80 bg-white rounded-2xl flex items-center justify-center mb-6 border-2 border-gray-200">
										{qrCodeImage ? (
											<img
												src={qrCodeImage}
												alt="支付二维码"
												className="w-full h-full p-4"
											/>
										) : (
											<div className="text-center">
												<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
												<p className="mt-4 text-gray-600">生成二维码中...</p>
											</div>
										)}
									</div>

									{/* Amount Info */}
									<div className="text-center mb-6">
										<div className="text-4xl font-bold text-gray-900 mb-2">
											¥{getActualAmount()}
										</div>
										{calculateBonus(selectedAmount) > 0 && (
											<div className="text-green-600 text-lg mb-4">
												包含赠送 ¥{calculateBonus(selectedAmount)}
											</div>
										)}
										<p className="text-sm text-gray-600 mb-4">
											请使用微信扫描二维码完成支付
										</p>
										<div className="text-sm text-gray-500 mb-4">
											支付剩余时间：<span className="font-mono text-red-600">
												{formatCountdown(countdown)}
											</span>
										</div>
										{/* Polling Status */}
										{isPolling && (
											<div className="flex items-center justify-center gap-2 text-sm text-blue-600">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
												<span>正在等待支付结果...</span>
											</div>
										)}
									</div>

									{/* Payment Check Message */}
									{paymentCheckMessage && (
										<div className={`mt-4 mb-4 p-4 rounded-lg text-center ${
											paymentCheckSuccess
												? 'bg-green-50 text-green-700'
												: 'bg-red-50 text-red-700'
										}`}>
											{paymentCheckMessage}
										</div>
									)}

									{/* Action Buttons */}
									<div className="flex flex-col gap-3 w-full max-w-xs">
										<button
											onClick={handleCheckPayment}
											disabled={isCheckingPayment || paymentCheckSuccess}
											className={`py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
												isCheckingPayment || paymentCheckSuccess
													? 'bg-gray-300 text-gray-500 cursor-not-allowed'
													: 'bg-gray-900 text-white hover:bg-gray-800'
											}`}
										>
											{isCheckingPayment ? (
												<span className="flex items-center justify-center gap-2">
													<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
													检查中...
												</span>
											) : (
												'我已支付'
											)}
										</button>

										<button
											onClick={handleRetryPayment}
											className="py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
										>
											重新发起充值
										</button>
									</div>
								</div>
							</div>
						</div>

						{/* Right Column - Order Summary */}
						<div className="lg:col-span-1">
							<div className="bg-white rounded-2xl p-6 sticky top-24">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">充值详情</h2>
								<div className="space-y-4">
									<div>
										<div className="text-gray-600 mb-1">充值金额</div>
										<div className="text-2xl font-bold text-gray-900">
											¥{selectedAmount}
										</div>
									</div>
									{calculateBonus(selectedAmount) > 0 && (
										<div>
											<div className="text-gray-600 mb-1">赠送金额</div>
											<div className="text-2xl font-bold text-green-600">
												+¥{calculateBonus(selectedAmount)}
											</div>
										</div>
									)}
									<div className="border-t border-gray-200" />
									<div>
										<div className="text-gray-600 mb-1">实际支付</div>
										<div className="text-3xl font-bold text-gray-900">
											¥{getActualAmount()}
										</div>
									</div>
									<div className="border-t border-gray-200" />
									<div>
										<div className="text-gray-600 mb-1">当前余额</div>
										{!isLoadingMember && member && (
											<div className="text-xl font-semibold text-gray-900">
												¥{(member.balance / 100).toFixed(2)}
											</div>
										)}
									</div>
									<div className="border-t border-gray-200" />
									<div>
										<div className="text-gray-600 mb-1">订单号</div>
										<div className="text-sm font-mono text-gray-900 break-all">
											{orderNo}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// 初始状态 - 选择充值金额
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

				{/* Error Message */}
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
					{/* Amount Selection */}
					<div className="mb-8">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">选择充值金额</h2>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
							{PRESET_AMOUNTS.map((preset) => (
								<button
									key={preset.amount}
									onClick={() => handleAmountSelect(preset.amount)}
									className={`p-4 rounded-xl border-2 transition-all duration-200 ${
										selectedAmount === preset.amount
											? 'border-gray-900 bg-gray-900 text-white'
											: 'border-gray-200 hover:border-gray-300'
									}`}
								>
									<div className="text-2xl font-bold mb-1">
										{preset.label}
									</div>
									{preset.bonus > 0 && (
										<div className={`text-sm ${
											selectedAmount === preset.amount
												? 'text-gray-300'
												: 'text-green-600'
										}`}>
											赠送 ¥{preset.bonus}
										</div>
									)}
								</button>
							))}
						</div>

						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								或输入自定义金额
							</label>
							<input
								type="text"
								inputMode="numeric"
								value={customAmount}
								onChange={handleCustomAmountChange}
								placeholder="请输入充值金额"
								className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
							/>
						</div>
					</div>

					{/* Payment Method */}
					<div className="mb-8">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">选择支付方式</h2>
						<div className="space-y-3">
							<button
								onClick={() => setPaymentMethod('wechat')}
								className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
									paymentMethod === 'wechat'
										? 'border-green-600 bg-green-50'
										: 'border-gray-200 hover:border-gray-300'
								}`}
							>
								<div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
									<span className="text-white text-xl">💬</span>
								</div>
								<div className="text-left">
									<div className="font-medium text-gray-900">微信支付</div>
									<div className="text-sm text-gray-600">推荐使用微信支付</div>
								</div>
								{paymentMethod === 'wechat' && (
									<div className="ml-auto">
										<div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
											<svg
												className="w-4 h-4 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
									</div>
								)}
							</button>
						</div>
					</div>

					{/* Summary */}
					{selectedAmount > 0 && (
						<div className="bg-gray-50 rounded-xl p-6 mb-8">
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-600">充值金额</span>
									<span className="font-medium text-gray-900">
										¥{selectedAmount}
									</span>
								</div>
								{calculateBonus(selectedAmount) > 0 && (
									<div className="flex justify-between">
										<span className="text-gray-600">赠送金额</span>
										<span className="font-medium text-green-600">
											+¥{calculateBonus(selectedAmount)}
										</span>
									</div>
								)}
								<div className="border-t border-gray-200 pt-3">
									<div className="flex justify-between">
										<span className="text-lg font-semibold text-gray-900">
											实际支付
										</span>
										<span className="text-2xl font-bold text-gray-900">
											¥{getActualAmount()}
										</span>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Submit Button */}
					<button
						onClick={handleCreateOrder}
						disabled={selectedAmount < 1 || isCreatingOrder}
						className={`w-full py-4 px-8 rounded-xl font-medium text-lg transition-all duration-200 ${
							selectedAmount < 1 || isCreatingOrder
								? 'bg-gray-300 text-gray-500 cursor-not-allowed'
								: 'bg-gray-900 text-white hover:bg-gray-800'
						}`}
					>
						{isCreatingOrder ? (
							<span className="flex items-center justify-center gap-2">
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
								创建订单中...
							</span>
						) : (
							`立即充值 ¥${getActualAmount()}`
						)}
					</button>
				</div>

				{/* Tips */}
				<div className="mt-8 bg-blue-50 rounded-xl p-6">
					<h3 className="font-semibold text-gray-900 mb-2">充值说明</h3>
					<ul className="space-y-2 text-sm text-gray-600">
						<li>• 充值金额实时到账，可立即使用</li>
						<li>• 预设充值金额可享受赠送优惠</li>
						<li>• 支付过程中请勿关闭浏览器窗口</li>
						<li>• 如遇支付问题，请联系客服</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
