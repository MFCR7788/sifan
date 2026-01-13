'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminOrdersPage() {
	const { user } = useAuth();
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all');
	const [selectedOrder, setSelectedOrder] = useState<any>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// 获取认证头
	const getAuthHeaders = () => {
		const headers: Record<string, string> = {};
		if (user?.id) {
			headers['x-user-id'] = user.id;
		}
		return headers;
	};

	useEffect(() => {
		fetchOrders();
	}, [filter]);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const response = await fetch(`/api/admin/orders?status=${filter}`, {
				credentials: 'include',
				headers: getAuthHeaders(),
			});
			if (response.ok) {
				const data = await response.json();
				setOrders(data.orders || []);
			}
		} catch (error) {
			console.error('Failed to fetch orders:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleViewOrder = (order: any) => {
		setSelectedOrder(order);
		setIsModalOpen(true);
	};

	const handleUpdateStatus = async (orderId: string, newStatus: string) => {
		try {
			const response = await fetch(`/api/admin/orders/${orderId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...getAuthHeaders(),
				},
				credentials: 'include',
				body: JSON.stringify({ status: newStatus }),
			});

			if (response.ok) {
				setIsModalOpen(false);
				fetchOrders();
			} else {
				const data = await response.json();
				alert(`更新订单状态失败: ${data.error || data.message || '未知错误'}`);
			}
		} catch (error) {
			console.error('Failed to update order:', error);
			alert(`更新订单状态失败: ${error instanceof Error ? error.message : '未知错误'}`);
		}
	};

	return (
		<div>
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-3xl font-bold text-gray-900">定制定单管理</h1>
			</div>

			{/* Filter Tabs */}
			<div className="bg-white rounded-xl p-2 border border-gray-200 mb-6">
				<div className="flex gap-2">
					{(['all', 'pending', 'processing', 'completed', 'cancelled'] as const).map((status) => (
						<button
							key={status}
							onClick={() => setFilter(status)}
							className={`px-4 py-2 rounded-lg font-medium transition-colors ${
								filter === status
									? 'bg-gray-900 text-white'
									: 'text-gray-600 hover:bg-gray-100'
							}`}
						>
							{status === 'all' ? '全部' : status === 'pending' ? '待处理' : status === 'processing' ? '处理中' : status === 'completed' ? '已完成' : '已取消'}
						</button>
					))}
				</div>
			</div>

			{/* Orders Table */}
			{loading ? (
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
				</div>
			) : orders.length === 0 ? (
				<div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
					<p className="text-gray-500">暂无定制定单</p>
				</div>
			) : (
				<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">订单号</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">客户信息</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">平台</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">金额</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">状态</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">创建时间</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">操作</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{orders.map((order) => (
								<tr key={order.id} className="hover:bg-gray-50">
									<td className="px-6 py-4">
										<span className="font-mono text-sm">{order.orderNumber}</span>
									</td>
									<td className="px-6 py-4">
										<div>
											<div className="font-medium text-gray-900">{order.customerName}</div>
											<div className="text-sm text-gray-500">{order.customerPhone}</div>
										</div>
									</td>
									<td className="px-6 py-4 text-sm text-gray-600">{order.platform}</td>
									<td className="px-6 py-4 font-medium text-gray-900">
										¥{(order.totalPrice / 100).toFixed(2)}
									</td>
									<td className="px-6 py-4">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												order.status === 'completed'
													? 'bg-green-100 text-green-800'
													: order.status === 'processing'
													? 'bg-blue-100 text-blue-800'
													: order.status === 'cancelled'
													? 'bg-red-100 text-red-800'
													: 'bg-yellow-100 text-yellow-800'
											}`}
										>
											{order.status === 'completed' ? '已完成' : order.status === 'processing' ? '处理中' : order.status === 'cancelled' ? '已取消' : '待处理'}
										</span>
									</td>
									<td className="px-6 py-4 text-sm text-gray-600">
										{new Date(order.createdAt).toLocaleDateString('zh-CN')}
									</td>
									<td className="px-6 py-4">
										<button
											onClick={() => handleViewOrder(order)}
											className="text-blue-600 hover:text-blue-700 font-medium text-sm"
										>
											查看详情
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Order Detail Modal */}
			{isModalOpen && selectedOrder && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-gray-900">订单详情</h2>
								<button
									onClick={() => setIsModalOpen(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>

						<div className="p-6">
							<div className="space-y-4">
								<div>
									<div className="text-sm text-gray-600">订单号</div>
									<div className="font-mono text-sm">{selectedOrder.orderNumber}</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-sm text-gray-600">客户姓名</div>
										<div className="font-medium">{selectedOrder.customerName}</div>
									</div>
									<div>
										<div className="text-sm text-gray-600">客户电话</div>
										<div className="font-medium">{selectedOrder.customerPhone}</div>
									</div>
									<div>
										<div className="text-sm text-gray-600">客户邮箱</div>
										<div className="font-medium">{selectedOrder.customerEmail}</div>
									</div>
									<div>
										<div className="text-sm text-gray-600">平台</div>
										<div className="font-medium">{selectedOrder.platform}</div>
									</div>
								</div>

								{selectedOrder.serviceLevel && (
									<div>
										<div className="text-sm text-gray-600">服务等级</div>
										<div className="font-medium">{selectedOrder.serviceLevel}</div>
									</div>
								)}

								<div>
									<div className="text-sm text-gray-600 mb-2">已选功能</div>
									<div className="flex flex-wrap gap-2">
										{selectedOrder.selectedFeatures && selectedOrder.selectedFeatures.map((feature: any, idx: number) => (
											<span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
												{typeof feature === 'string' ? feature : feature.name || feature}
											</span>
										))}
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-sm text-gray-600">订单金额</div>
										<div className="font-semibold text-lg">¥{(selectedOrder.totalPrice / 100).toFixed(2)}</div>
									</div>
									{selectedOrder.monthlyFee && selectedOrder.monthlyFee > 0 && (
										<div>
											<div className="text-sm text-gray-600">月费</div>
											<div className="font-semibold">¥{(selectedOrder.monthlyFee / 100).toFixed(2)}</div>
										</div>
									)}
								</div>

								{selectedOrder.notes && (
									<div>
										<div className="text-sm text-gray-600">备注</div>
										<div className="bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</div>
									</div>
								)}
							</div>
						</div>

						<div className="p-6 border-t border-gray-200">
							<div className="flex gap-3">
								{selectedOrder.status !== 'completed' && (
									<>
										<button
											onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
											className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
										>
											开始处理
										</button>
										<button
											onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
											className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
										>
											标记完成
										</button>
									</>
								)}
								{selectedOrder.status !== 'cancelled' && (
									<button
										onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
										className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
									>
										取消订单
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
