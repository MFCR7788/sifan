'use client';

import { useState } from 'react';

const stats = [
	{
		title: '总订单数',
		value: '1,234',
		change: '+12.5%',
		trend: 'up',
		icon: '📦',
		color: 'bg-blue-50 text-blue-600',
	},
	{
		title: '总收入',
		value: '¥ 45,678',
		change: '+8.2%',
		trend: 'up',
		icon: '💰',
		color: 'bg-green-50 text-green-600',
	},
	{
		title: '客户数量',
		value: '567',
		change: '+5.3%',
		trend: 'up',
		icon: '👥',
		color: 'bg-purple-50 text-purple-600',
	},
	{
		title: '待处理订单',
		value: '23',
		change: '-2.1%',
		trend: 'down',
		icon: '⏳',
		color: 'bg-orange-50 text-orange-600',
	},
];

const recentOrders = [
	{ id: 'ORD-001', customer: '张三', amount: '¥1,200', status: 'completed', date: '2024-01-05' },
	{ id: 'ORD-002', customer: '李四', amount: '¥3,500', status: 'processing', date: '2024-01-05' },
	{ id: 'ORD-003', customer: '王五', amount: '¥800', status: 'pending', date: '2024-01-04' },
	{ id: 'ORD-004', customer: '赵六', amount: '¥2,100', status: 'completed', date: '2024-01-04' },
	{ id: 'ORD-005', customer: '钱七', amount: '¥4,500', status: 'processing', date: '2024-01-03' },
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

export default function DashboardOverview() {
	const [timeRange, setTimeRange] = useState('week');

	return (
		<div className="space-y-6">
			{/* Time Range Selector */}
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-gray-900">数据概览</h2>
				<div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
					{[
						{ value: 'week', label: '本周' },
						{ value: 'month', label: '本月' },
						{ value: 'year', label: '今年' },
					].map((item) => (
						<button
							key={item.value}
							onClick={() => setTimeRange(item.value)}
							className={`
								px-4 py-2 rounded-md text-sm font-medium transition-colors
								${timeRange === item.value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}
							`}
						>
							{item.label}
						</button>
					))}
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat) => (
					<div
						key={stat.title}
						className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
					>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="text-sm text-gray-600 mb-1">{stat.title}</div>
								<div className="text-2xl font-bold text-gray-900">{stat.value}</div>
								<div
									className={`text-sm mt-2 ${
										stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
									}`}
								>
									{stat.change}
								</div>
							</div>
							<div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
								{stat.icon}
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Recent Orders */}
				<div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
					<div className="p-6 border-b border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900">最近订单</h3>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										订单号
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										客户
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
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{recentOrders.map((order) => (
									<tr key={order.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{order.id}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
											{order.customer}
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
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="p-4 border-t border-gray-200">
						<a
							href="/dashboard?tab=orders"
							className="text-blue-600 hover:text-blue-700 text-sm font-medium"
						>
							查看全部订单 →
						</a>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="bg-white rounded-xl border border-gray-200">
					<div className="p-6 border-b border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900">快捷操作</h3>
					</div>
					<div className="p-6 space-y-3">
						<button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
							<span className="text-2xl">➕</span>
							<span className="font-medium text-gray-900">创建新订单</span>
						</button>
						<button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
							<span className="text-2xl">👤</span>
							<span className="font-medium text-gray-900">添加客户</span>
						</button>
						<button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
							<span className="text-2xl">📊</span>
							<span className="font-medium text-gray-900">导出报表</span>
						</button>
						<button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
							<span className="text-2xl">💬</span>
							<span className="font-medium text-gray-900">发送消息</span>
						</button>
					</div>
				</div>
			</div>

			{/* Chart Placeholder */}
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">收入趋势</h3>
				<div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
					<div className="text-center text-gray-500">
						<div className="text-4xl mb-2">📈</div>
						<div className="text-sm">图表数据加载中...</div>
					</div>
				</div>
			</div>
		</div>
	);
}
