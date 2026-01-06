'use client';

import { useState } from 'react';

type OrderStatus = 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';

const orders = [
	{
		id: 'ORD-001',
		customer: '张三',
		email: 'zhangsan@example.com',
		amount: '¥1,200',
		status: 'completed',
		date: '2024-01-05',
		items: 3,
	},
	{
		id: 'ORD-002',
		customer: '李四',
		email: 'lisi@example.com',
		amount: '¥3,500',
		status: 'processing',
		date: '2024-01-05',
		items: 5,
	},
	{
		id: 'ORD-003',
		customer: '王五',
		email: 'wangwu@example.com',
		amount: '¥800',
		status: 'pending',
		date: '2024-01-04',
		items: 1,
	},
	{
		id: 'ORD-004',
		customer: '赵六',
		email: 'zhaoliu@example.com',
		amount: '¥2,100',
		status: 'completed',
		date: '2024-01-04',
		items: 2,
	},
	{
		id: 'ORD-005',
		customer: '钱七',
		email: 'qianqi@example.com',
		amount: '¥4,500',
		status: 'processing',
		date: '2024-01-03',
		items: 4,
	},
	{
		id: 'ORD-006',
		customer: '孙八',
		email: 'sunba@example.com',
		amount: '¥680',
		status: 'cancelled',
		date: '2024-01-03',
		items: 2,
	},
	{
		id: 'ORD-007',
		customer: '周九',
		email: 'zhoujiu@example.com',
		amount: '¥2,300',
		status: 'pending',
		date: '2024-01-02',
		items: 3,
	},
];

const statusFilters = [
	{ value: 'all', label: '全部', count: orders.length },
	{ value: 'pending', label: '待处理', count: 2 },
	{ value: 'processing', label: '处理中', count: 2 },
	{ value: 'completed', label: '已完成', count: 2 },
	{ value: 'cancelled', label: '已取消', count: 1 },
];

const getStatusBadge = (status: string) => {
	const statusConfig: Record<string, { label: string; className: string }> = {
		completed: { label: '已完成', className: 'bg-green-100 text-green-800' },
		processing: { label: '处理中', className: 'bg-blue-100 text-blue-800' },
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
	const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
	const [searchTerm, setSearchTerm] = useState('');

	const filteredOrders = orders.filter((order) => {
		const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
		const matchesSearch =
			order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.id.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesStatus && matchesSearch;
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-gray-900">订单管理</h2>
				<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
					➕ 新建订单
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">总订单数</div>
					<div className="text-2xl font-bold text-gray-900">{orders.length}</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">待处理</div>
					<div className="text-2xl font-bold text-yellow-600">
						{orders.filter((o) => o.status === 'pending').length}
					</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">处理中</div>
					<div className="text-2xl font-bold text-blue-600">
						{orders.filter((o) => o.status === 'processing').length}
					</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">本月收入</div>
					<div className="text-2xl font-bold text-green-600">¥ 15,080</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Search */}
					<div className="flex-1">
						<input
							type="text"
							placeholder="搜索订单号或客户姓名..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
						/>
					</div>

					{/* Status Filters */}
					<div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
						{statusFilters.map((filter) => (
							<button
								key={filter.value}
								onClick={() => setSelectedStatus(filter.value as OrderStatus)}
								className={`
									px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
									${
										selectedStatus === filter.value
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}
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
									商品数
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									金额
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									状态
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									日期
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									操作
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{filteredOrders.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-6 py-12 text-center text-gray-500">
										没有找到相关订单
									</td>
								</tr>
							) : (
								filteredOrders.map((order) => (
									<tr key={order.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{order.id}
										</td>
										<td className="px-6 py-4">
											<div className="text-sm font-medium text-gray-900">{order.customer}</div>
											<div className="text-sm text-gray-500">{order.email}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
											{order.items} 件
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
											{order.amount}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{getStatusBadge(order.status)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{order.date}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<button className="text-blue-600 hover:text-blue-800 font-medium mr-3">
												查看
											</button>
											<button className="text-gray-600 hover:text-gray-800 font-medium">
												编辑
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
					<div className="text-sm text-gray-600">
						显示 1-{filteredOrders.length} 条，共 {filteredOrders.length} 条
					</div>
					<div className="flex gap-2">
						<button
							disabled
							className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 disabled:opacity-50"
						>
							上一页
						</button>
						<button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">1</button>
						<button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600">
							下一页
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
