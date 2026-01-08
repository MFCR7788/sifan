'use client';

import { useState, useEffect } from 'react';

type OrderStatus = 'all' | 'pending' | 'paid' | 'cancelled';

interface Order {
	id: string;
	orderNumber: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	platform: string;
	serviceLevel?: string;
	totalPrice: number;
	monthlyFee: number;
	status: string;
	notes?: string;
	createdAt: string;
	updatedAt: string;
	selectedFeatures?: any[];
	valueServices?: string[];
}

const getStatusBadge = (status: string) => {
	const statusConfig: Record<string, { label: string; className: string }> = {
		paid: { label: '已支付', className: 'bg-green-100 text-green-800' },
		pending: { label: '待处理', className: 'bg-yellow-100 text-yellow-800' },
		cancelled: { label: '已取消', className: 'bg-red-100 text-red-800' },
	};

	const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
	return (
		<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
			{config.label}
		</span>
	);
};

export default function OrderManagement() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
	const [searchTerm, setSearchTerm] = useState('');

	// 获取订单数据
	useEffect(() => {
		fetchOrders();
	}, [selectedStatus]);

	const fetchOrders = async () => {
		try {
			setLoading(true);
			setError('');
			
			const params = new URLSearchParams();
			if (selectedStatus !== 'all') {
				params.append('status', selectedStatus);
			}
			params.append('limit', '50'); // 默认获取50条记录

			const response = await fetch(`/api/orders?${params}`);
			const result = await response.json();

			if (result.success) {
				// 转换数据库字段名（下划线）为前端字段名（驼峰）
				const transformedOrders = (result.data as any[]).map((dbOrder: any) => ({
					id: dbOrder.id,
					orderNumber: dbOrder.order_number,
					customerName: dbOrder.customer_name,
					customerPhone: dbOrder.customer_phone,
					customerEmail: dbOrder.customer_email,
					platform: dbOrder.platform,
					serviceLevel: dbOrder.service_level,
					totalPrice: dbOrder.total_price,
					monthlyFee: dbOrder.monthly_fee || 0,
					status: dbOrder.status,
					notes: dbOrder.notes,
					createdAt: dbOrder.created_at,
					updatedAt: dbOrder.updated_at,
					selectedFeatures: dbOrder.selected_features || [],
					valueServices: dbOrder.value_services || [],
				}));
				setOrders(transformedOrders);
			} else {
				setError(result.error || '获取订单列表失败');
			}
		} catch (err) {
			console.error('Fetch orders error:', err);
			setError('网络错误，请稍后重试');
		} finally {
			setLoading(false);
		}
	};

	// 筛选订单
	const filteredOrders = orders.filter((order) => {
		const matchesSearch =
			order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.customerPhone.includes(searchTerm);
		return matchesSearch;
	});

	// 统计数据
	const stats = {
		total: orders.length,
		pending: orders.filter((o) => o.status === 'pending').length,
		paid: orders.filter((o) => o.status === 'paid').length,
		cancelled: orders.filter((o) => o.status === 'cancelled').length,
		totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
	};

	const statusFilters = [
		{ value: 'all', label: '全部', count: stats.total },
		{ value: 'pending', label: '待处理', count: stats.pending },
		{ value: 'paid', label: '已支付', count: stats.paid },
		{ value: 'cancelled', label: '已取消', count: stats.cancelled },
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-gray-900">订单管理</h2>
				<div className="flex gap-2">
					<button
						onClick={fetchOrders}
						className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
					>
						🔄 刷新
					</button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">总订单数</div>
					<div className="text-2xl font-bold text-gray-900">{stats.total}</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">待处理</div>
					<div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">已支付</div>
					<div className="text-2xl font-bold text-green-600">{stats.paid}</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">总收入</div>
					<div className="text-2xl font-bold text-green-600">¥ {stats.totalRevenue.toLocaleString()}</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				{error && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-600 text-sm">{error}</p>
					</div>
				)}
				<div className="flex flex-col md:flex-row gap-4">
					{/* Search */}
					<div className="flex-1">
						<input
							type="text"
							placeholder="搜索订单号/客户姓名/手机号..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							disabled={loading}
						/>
					</div>

					{/* Status Filters */}
					<div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
						{statusFilters.map((filter) => (
							<button
								key={filter.value}
								onClick={() => setSelectedStatus(filter.value as OrderStatus)}
								disabled={loading}
								className={`
									px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
									${
										selectedStatus === filter.value
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}
									disabled:opacity-50 disabled:cursor-not-allowed
								`}
							>
								{filter.label}
								<span
									className={`ml-2 text-xs ${
										selectedStatus === filter.value ? 'text-blue-200' : 'text-gray-500'
									}`}
								>
									{filter.count}
								</span>
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Orders Table */}
			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
				{loading ? (
					<div className="p-12 flex items-center justify-center">
						<div className="text-gray-500">加载中...</div>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										订单号
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										客户信息
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										业务场景
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										订单金额
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										状态
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										创建时间
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{filteredOrders.length === 0 ? (
									<tr>
										<td colSpan={6} className="px-6 py-12 text-center text-gray-500">
											暂无订单数据
										</td>
									</tr>
								) : (
									filteredOrders.map((order) => (
										<tr key={order.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{order.orderNumber}
											</td>
											<td className="px-6 py-4">
												<div className="text-sm font-medium text-gray-900">
													{order.customerName}
												</div>
												<div className="text-sm text-gray-500">
													{order.customerPhone}
												</div>
												<div className="text-xs text-gray-400">
													{order.customerEmail}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
												{order.platform}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
												¥{order.totalPrice.toLocaleString()}
												{order.monthlyFee > 0 && (
													<div className="text-xs text-gray-500">
														月费: ¥{order.monthlyFee.toLocaleString()}
													</div>
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{getStatusBadge(order.status)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{new Date(order.createdAt).toLocaleString('zh-CN', {
													year: 'numeric',
													month: '2-digit',
													day: '2-digit',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}

				{/* Pagination */}
				{!loading && filteredOrders.length > 0 && (
					<div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
						<div className="text-sm text-gray-600">
							显示 1-{filteredOrders.length} 条，共 {filteredOrders.length} 条
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
