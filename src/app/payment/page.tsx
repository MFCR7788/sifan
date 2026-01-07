'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface OrderData {
	id: string;
	orderNumber: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	platform: string;
	selectedFeatures: any[];
	valueServices: any[];
	totalPrice: number;
	status: string;
	createdAt: string;
}

const platformNames: Record<string, string> = {
	'single-store': '单店运营',
	'multi-store': '多门店连锁',
	'brand-chain': '品牌连锁'
};

const serviceNames: Record<string, string> = {
	'implementation': '实施服务',
	'training': '运营培训',
	'support-platinum': '白金技术支持',
	'consulting': '业务咨询',
	'customization': '定制开发',
	'data-migration': '数据迁移'
};

export default function PaymentPage() {
	const searchParams = useSearchParams();
	const orderNumber = searchParams.get('orderNumber');

	const [order, setOrder] = useState<OrderData | null>(null);
	const [loading, setLoading] = useState(true);
	const [paymentMethod, setPaymentMethod] = useState<string>('wechat');
	const [countdown, setCountdown] = useState(900); // 15分钟倒计时

	useEffect(() => {
		if (orderNumber) {
			fetchOrder();
		}
	}, [orderNumber]);

	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	const fetchOrder = async () => {
		try {
			const response = await fetch(`/api/orders/${orderNumber}`);
			const result = await response.json();

			if (result.success) {
				// 转换数据库字段名（下划线）为前端字段名（驼峰）
				const dbOrder = result.data;
				const transformedOrder: OrderData = {
					id: dbOrder.id,
					orderNumber: dbOrder.order_number,
					customerName: dbOrder.customer_name,
					customerPhone: dbOrder.customer_phone,
					customerEmail: dbOrder.customer_email,
					platform: dbOrder.platform,
					selectedFeatures: dbOrder.selected_features || [],
					valueServices: dbOrder.value_services || [],
					totalPrice: dbOrder.total_price,
					status: dbOrder.status,
					createdAt: dbOrder.created_at,
				};
				setOrder(transformedOrder);
			} else {
				alert('获取订单失败: ' + (result.error || '未知错误'));
			}
		} catch (error) {
			console.error('Fetch order error:', error);
			alert('获取订单失败: 网络错误');
		} finally {
			setLoading(false);
		}
	};

	const formatCountdown = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const handleConfirmPayment = async () => {
		if (!order) return;

		try {
			const response = await fetch(`/api/orders/${order.orderNumber}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					status: 'paid',
					paymentMethod,
				}),
			});

			const result = await response.json();

			if (result.success) {
				alert('支付成功！');
				window.location.href = `/payment/success?orderNumber=${order.orderNumber}`;
			} else {
				alert('支付失败');
			}
		} catch (error) {
			console.error('Payment error:', error);
			alert('支付失败');
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
					<p className="mt-4 text-gray-600">加载中...</p>
				</div>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">订单不存在</h2>
					<Link href="/configurator" className="text-blue-600 hover:underline">
						返回定制页面
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<Navigation />

			{/* Header */}
			<div className="bg-gray-50 border-b border-gray-200">
				<div className="max-w-4xl mx-auto px-4 py-8">
					<h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
						订单支付
					</h1>
					<p className="text-gray-600 mt-2">
						订单号：{order.orderNumber}
					</p>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Order Info & Payment */}
					<div className="lg:col-span-2 space-y-6">
						{/* Payment Method Selection */}
						<div className="bg-white border border-gray-200 rounded-2xl p-6">
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
												<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
												</svg>
											</div>
										</div>
									)}
								</button>

								<button
									onClick={() => setPaymentMethod('alipay')}
									className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
										paymentMethod === 'alipay'
											? 'border-blue-600 bg-blue-50'
											: 'border-gray-200 hover:border-gray-300'
									}`}
								>
									<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
										<span className="text-white text-xl">💳</span>
									</div>
									<div className="text-left">
										<div className="font-medium text-gray-900">支付宝</div>
										<div className="text-sm text-gray-600">安全快捷支付</div>
									</div>
									{paymentMethod === 'alipay' && (
										<div className="ml-auto">
											<div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
												<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
												</svg>
											</div>
										</div>
									)}
								</button>

								<button
									onClick={() => setPaymentMethod('bank_transfer')}
									className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
										paymentMethod === 'bank_transfer'
											? 'border-orange-600 bg-orange-50'
											: 'border-gray-200 hover:border-gray-300'
									}`}
								>
									<div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
										<span className="text-white text-xl">🏦</span>
									</div>
									<div className="text-left">
										<div className="font-medium text-gray-900">银行转账</div>
										<div className="text-sm text-gray-600">对公转账，请备注订单号</div>
									</div>
									{paymentMethod === 'bank_transfer' && (
										<div className="ml-auto">
											<div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
												<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
												</svg>
											</div>
										</div>
									)}
								</button>
							</div>
						</div>

						{/* QR Code or Bank Info */}
						<div className="bg-white border border-gray-200 rounded-2xl p-6">
							{paymentMethod === 'bank_transfer' ? (
								<>
									<h2 className="text-xl font-semibold text-gray-900 mb-4">银行转账信息</h2>
									<div className="space-y-4">
										<div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
											<div className="text-sm text-orange-600 font-medium mb-2">⚠️ 重要提示</div>
											<div className="text-sm text-orange-700">
												转账时请务必在备注中填写订单号：<span className="font-semibold">{order.orderNumber}</span>
											</div>
										</div>

										<div className="space-y-3">
											<div className="flex justify-between items-start">
												<span className="text-gray-600">开户银行</span>
												<span className="font-medium text-gray-900">招商银行</span>
											</div>
											<div className="flex justify-between items-start">
												<span className="text-gray-600">开户名称</span>
												<span className="font-medium text-gray-900">魔法超人科技有限公司</span>
											</div>
											<div className="flex justify-between items-start">
												<span className="text-gray-600">银行账号</span>
												<span className="font-medium text-gray-900 font-mono">6214 8302 8888 6666</span>
											</div>
											<div className="flex justify-between items-start">
												<span className="text-gray-600">转账金额</span>
												<span className="font-bold text-xl text-gray-900">¥{order.totalPrice.toLocaleString()}</span>
											</div>
										</div>

										<div className="pt-4 border-t border-gray-200">
											<p className="text-sm text-gray-600 mb-3">
												转账完成后，请点击下方按钮确认支付，我们的客服会在1-2个工作日内核实
											</p>
											<button
												onClick={handleConfirmPayment}
												className="w-full py-3 px-6 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 hover:scale-105 transition-all duration-200"
											>
												我已完成银行转账
											</button>
										</div>
									</div>
								</>
							) : (
								<>
									<h2 className="text-xl font-semibold text-gray-900 mb-4">扫码支付</h2>
									<div className="flex flex-col items-center">
										<div className="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
											<div className="text-center">
												<div className="text-6xl mb-2">📱</div>
												<div className="text-gray-600 text-sm">
													{paymentMethod === 'wechat' ? '微信支付二维码' : '支付宝二维码'}
												</div>
											</div>
										</div>
										<p className="text-sm text-gray-600 mb-4">
											请使用{paymentMethod === 'wechat' ? '微信' : '支付宝'}扫描二维码完成支付
										</p>
										<div className="text-lg font-semibold text-gray-900 mb-4">
											待支付金额：<span className="text-2xl">¥{order.totalPrice.toLocaleString()}</span>
										</div>
										<div className="text-sm text-gray-500 mb-6">
											支付剩余时间：<span className="font-mono text-red-600">{formatCountdown(countdown)}</span>
										</div>
										<button
											onClick={handleConfirmPayment}
											className="w-full max-w-xs py-3 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 hover:scale-105 transition-all duration-200"
										>
											我已完成支付
										</button>
									</div>
								</>
							)}
						</div>
					</div>

					{/* Right Column - Order Summary */}
					<div className="lg:col-span-1">
						<div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
							<h2 className="text-xl font-semibold text-gray-900">订单详情</h2>

							<div className="space-y-3 text-sm">
								<div>
									<div className="text-gray-600">客户信息</div>
									<div className="font-medium text-gray-900">{order.customerName}</div>
									<div className="text-gray-600">{order.customerPhone}</div>
								</div>

								<div className="border-t border-gray-200" />

								<div>
									<div className="text-gray-600">业务场景</div>
									<div className="font-medium text-gray-900">
										{platformNames[order.platform] || order.platform}
									</div>
								</div>

								<div>
									<div className="text-gray-600">核心功能</div>
									<div className="space-y-1">
										{order.selectedFeatures?.slice(0, 3).map((feature: any, index: number) => (
											<div key={index} className="text-sm text-gray-900">
												• {feature.name || feature}
											</div>
										))}
										{order.selectedFeatures?.length > 3 && (
											<div className="text-sm text-gray-500">
												+{order.selectedFeatures.length - 3} 更多功能
											</div>
										)}
									</div>
								</div>

								{order.valueServices && order.valueServices.length > 0 && (
									<>
										<div className="border-t border-gray-200" />
										<div>
											<div className="text-gray-600">增值服务</div>
											<div className="space-y-1">
												{order.valueServices.slice(0, 3).map((serviceId: string, index: number) => (
													<div key={index} className="text-sm text-gray-900">
														• {serviceNames[serviceId] || serviceId}
													</div>
												))}
												{order.valueServices.length > 3 && (
													<div className="text-sm text-gray-500">
														+{order.valueServices.length - 3} 更多服务
													</div>
												)}
											</div>
										</div>
									</>
								)}

								<div className="border-t border-gray-200" />

								<div>
									<div className="text-gray-600">订单金额</div>
									<div className="text-2xl font-bold text-gray-900">
										¥{order.totalPrice.toLocaleString()}
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
