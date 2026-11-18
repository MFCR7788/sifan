'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LunaiNav from '@/components/lunai/LunaiNav';

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
	monthlyFee: number;
	status: string;
	paymentMethod: string | null;
	paymentTime: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string | null;
}

function PaymentSuccessContent() {
	const searchParams = useSearchParams();
	const orderNumber = searchParams.get('orderNumber');

	const [order, setOrder] = useState<OrderData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (orderNumber) {
			fetchOrder();
		}
	}, [orderNumber]);

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
					monthlyFee: dbOrder.monthly_fee || 0,
					status: dbOrder.status,
					paymentMethod: dbOrder.payment_method,
					paymentTime: dbOrder.payment_time,
					notes: dbOrder.notes,
					createdAt: dbOrder.created_at,
					updatedAt: dbOrder.updated_at,
				};
				setOrder(transformedOrder);
			} else {
				alert('获取订单失败');
			}
		} catch (error) {
			console.error('Fetch order error:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-ink flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
					<p className="mt-4 text-gray-600">加载中...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-ink text-snow">
			<LunaiNav />

			<div className="max-w-2xl mx-auto px-4 py-16">
				{/* Success Icon */}
				<div className="text-center mb-8">
					<div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
						<svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
				</div>

				{/* Success Message */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-semibold text-gray-900 mb-4">支付成功</h1>
					<p className="text-gray-600">感谢您的订购，我们将在1-2个工作日内与您联系</p>
				</div>

				{/* Order Info */}
				{order && (
					<div className="bg-gray-50 rounded-2xl p-6 mb-8">
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-gray-600">订单号</span>
								<span className="font-medium text-gray-900">{order.orderNumber}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">客户姓名</span>
								<span className="font-medium text-gray-900">{order.customerName}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">支付方式</span>
								<span className="font-medium text-gray-900">
									{order.paymentMethod === 'wechat' ? '微信支付' :
									 order.paymentMethod === 'alipay' ? '支付宝' :
									 order.paymentMethod === 'bank_transfer' ? '银行转账' : '其他'}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">支付金额</span>
								<span className="font-medium text-gray-900">¥{order.totalPrice.toLocaleString()}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">支付时间</span>
								<span className="font-medium text-gray-900">
									{order.paymentTime ? new Date(order.paymentTime).toLocaleString('zh-CN') : '-'}
								</span>
							</div>
						</div>
					</div>
				)}

				{/* Next Steps */}
				<div className="bg-gold/[0.07] rounded-2xl p-6 mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">后续步骤</h2>
					<div className="space-y-3">
						{order?.paymentMethod === 'bank_transfer' && (
							<div className="bg-orange-50 rounded-xl p-4 border border-orange-200 mb-4">
								<div className="text-sm text-orange-600 font-medium mb-1">📋 银行转账特别说明</div>
								<div className="text-sm text-orange-700">
									我们的客服将在1-2个工作内核实您的转账信息，确认到账后会立即联系您。
								</div>
							</div>
						)}
						<div className="flex items-start gap-3">
							<div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
								1
							</div>
							<div>
								<div className="font-medium text-gray-900">确认订单</div>
								<div className="text-sm text-gray-600">我们的客服将尽快与您确认订单详情</div>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
								2
							</div>
							<div>
								<div className="font-medium text-gray-900">系统实施</div>
								<div className="text-sm text-gray-600">专业团队上门实施，快速上线</div>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
								3
							</div>
							<div>
								<div className="font-medium text-gray-900">培训与支持</div>
								<div className="text-sm text-gray-600">提供系统培训和持续技术支持</div>
							</div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="space-y-3">
					<Link
						href="/"
						className="block w-full py-3 px-6 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 text-center transition-all duration-200"
					>
						返回首页
					</Link>
					<Link
						href="/contact"
						className="block w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 text-center transition-all duration-200"
					>
						联系我们
					</Link>
				</div>
			</div>
		</div>
	);
}

export default function PaymentSuccessPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-ink flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
					<p className="mt-4 text-gray-600">加载中...</p>
				</div>
			</div>
		}>
			<PaymentSuccessContent />
		</Suspense>
	);
}
