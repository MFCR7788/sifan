'use client';

import { useState } from 'react';

const customers = [
	{
		id: 'CUST-001',
		name: '张三',
		email: 'zhangsan@example.com',
		phone: '13800138000',
		status: 'active',
		totalOrders: 12,
		totalSpent: '¥15,600',
		joinDate: '2024-01-01',
	},
	{
		id: 'CUST-002',
		name: '李四',
		email: 'lisi@example.com',
		phone: '13800138001',
		status: 'active',
		totalOrders: 8,
		totalSpent: '¥8,900',
		joinDate: '2024-01-02',
	},
	{
		id: 'CUST-003',
		name: '王五',
		email: 'wangwu@example.com',
		phone: '13800138002',
		status: 'inactive',
		totalOrders: 3,
		totalSpent: '¥2,400',
		joinDate: '2024-01-03',
	},
	{
		id: 'CUST-004',
		name: '赵六',
		email: 'zhaoliu@example.com',
		phone: '13800138003',
		status: 'active',
		totalOrders: 15,
		totalSpent: '¥23,400',
		joinDate: '2024-01-04',
	},
	{
		id: 'CUST-005',
		name: '钱七',
		email: 'qianqi@example.com',
		phone: '13800138004',
		status: 'active',
		totalOrders: 6,
		totalSpent: '¥7,800',
		joinDate: '2024-01-05',
	},
];

const getStatusBadge = (status: string) => {
	const statusConfig: Record<string, { label: string; className: string }> = {
		active: { label: '活跃', className: 'bg-green-100 text-green-800' },
		inactive: { label: '未激活', className: 'bg-gray-100 text-gray-800' },
		blocked: { label: '已禁用', className: 'bg-red-100 text-red-800' },
	};

	const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
	return (
		<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
			{config.label}
		</span>
	);
};

export default function CustomerManagement() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.phone.includes(searchTerm)
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-gray-900">客户管理</h2>
				<button
					onClick={() => setIsAddModalOpen(true)}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
				>
					➕ 添加客户
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">总客户数</div>
					<div className="text-2xl font-bold text-gray-900">{customers.length}</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">活跃客户</div>
					<div className="text-2xl font-bold text-green-600">
						{customers.filter((c) => c.status === 'active').length}
					</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">本月新增</div>
					<div className="text-2xl font-bold text-blue-600">+3</div>
				</div>
			</div>

			{/* Search */}
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<input
					type="text"
					placeholder="搜索客户姓名、邮箱或电话..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
				/>
			</div>

			{/* Customers Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredCustomers.map((customer) => (
					<div
						key={customer.id}
						className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
						onClick={() => setSelectedCustomer(customer)}
					>
						<div className="flex items-start justify-between mb-4">
							<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
								{customer.name.charAt(0)}
							</div>
							{getStatusBadge(customer.status)}
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">{customer.name}</h3>
						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2 text-gray-600">
								<span>📧</span>
								<span className="truncate">{customer.email}</span>
							</div>
							<div className="flex items-center gap-2 text-gray-600">
								<span>📱</span>
								<span>{customer.phone}</span>
							</div>
							<div className="flex items-center gap-2 text-gray-600">
								<span>📦</span>
								<span>{customer.totalOrders} 个订单</span>
							</div>
							<div className="flex items-center gap-2 text-gray-600">
								<span>💰</span>
								<span>累计消费：{customer.totalSpent}</span>
							</div>
						</div>
						<div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
							加入时间：{customer.joinDate}
						</div>
					</div>
				))}
			</div>

			{/* Customer Detail Modal */}
			{selectedCustomer && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
					onClick={() => setSelectedCustomer(null)}
				>
					<div
						className="bg-white rounded-xl max-w-lg w-full p-6"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-semibold text-gray-900">客户详情</h3>
							<button
								onClick={() => setSelectedCustomer(null)}
								className="text-gray-400 hover:text-gray-600"
							>
								✕
							</button>
						</div>

						<div className="flex items-center gap-4 mb-6">
							<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
								{selectedCustomer.name.charAt(0)}
							</div>
							<div>
								<div className="text-lg font-semibold text-gray-900">
									{selectedCustomer.name}
								</div>
								<div className="text-sm text-gray-500">{selectedCustomer.id}</div>
							</div>
							{getStatusBadge(selectedCustomer.status)}
						</div>

						<div className="space-y-4">
							<div>
								<label className="text-sm font-medium text-gray-700">邮箱</label>
								<div className="text-gray-900">{selectedCustomer.email}</div>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">电话</label>
								<div className="text-gray-900">{selectedCustomer.phone}</div>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">订单数</label>
								<div className="text-gray-900">{selectedCustomer.totalOrders}</div>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">累计消费</label>
								<div className="text-gray-900 font-semibold">{selectedCustomer.totalSpent}</div>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">加入时间</label>
								<div className="text-gray-900">{selectedCustomer.joinDate}</div>
							</div>
						</div>

						<div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
							<button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
								编辑信息
							</button>
							<button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
								查看订单
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Add Customer Modal */}
			{isAddModalOpen && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
					onClick={() => setIsAddModalOpen(false)}
				>
					<div
						className="bg-white rounded-xl max-w-lg w-full p-6"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-semibold text-gray-900">添加新客户</h3>
							<button
								onClick={() => setIsAddModalOpen(false)}
								className="text-gray-400 hover:text-gray-600"
							>
								✕
							</button>
						</div>

						<form className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
								<input
									type="text"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									placeholder="输入客户姓名"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
								<input
									type="email"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									placeholder="输入邮箱地址"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">电话</label>
								<input
									type="tel"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									placeholder="输入电话号码"
								/>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setIsAddModalOpen(false)}
									className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
								>
									取消
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
								>
									添加
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
