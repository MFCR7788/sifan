'use client';

import { useState } from 'react';

export default function FinancialManagement() {
	const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expense' | 'invoice'>('overview');

	const incomeRecords = [
		{ id: 1, date: '2024-01-15', type: '销售收入', category: '产品销售', amount: 125600, status: '已入账' },
		{ id: 2, date: '2024-01-14', type: '销售收入', category: '产品销售', amount: 89200, status: '已入账' },
		{ id: 3, date: '2024-01-13', type: '其他收入', category: '服务费', amount: 5000, status: '已入账' },
		{ id: 4, date: '2024-01-12', type: '销售收入', category: '产品销售', amount: 156800, status: '待确认' },
	];

	const expenseRecords = [
		{ id: 1, date: '2024-01-15', type: '采购支出', category: '商品采购', amount: 85600, status: '已付款' },
		{ id: 2, date: '2024-01-14', type: '运营支出', category: '人员工资', amount: 125000, status: '已付款' },
		{ id: 3, date: '2024-01-13', type: '运营支出', category: '房租水电', amount: 35000, status: '待付款' },
		{ id: 4, date: '2024-01-12', type: '营销支出', category: '广告推广', amount: 28000, status: '已付款' },
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-bold text-gray-900">财务管理</h2>
				<p className="text-gray-600 mt-1">管理财务收支、发票和账目</p>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-gray-200 bg-white rounded-t-xl">
				{[
					{ id: 'overview', label: '财务概览', icon: '📊' },
					{ id: 'income', label: '收入记录', icon: '💰' },
					{ id: 'expense', label: '支出记录', icon: '💸' },
					{ id: 'invoice', label: '发票管理', icon: '📄' },
				].map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id as any)}
						className={`flex-1 px-6 py-4 font-medium transition ${
							activeTab === tab.id
								? 'text-blue-600 border-b-2 border-blue-600'
								: 'text-gray-600 hover:text-gray-900'
						}`}
					>
						<span className="mr-2">{tab.icon}</span>
						{tab.label}
					</button>
				))}
			</div>

			{activeTab === 'overview' && (
				<div className="space-y-6">
					{/* Key Metrics */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="bg-white rounded-xl p-6 border border-gray-200">
							<div className="text-sm text-gray-600 mb-1">总收入</div>
							<div className="text-3xl font-bold text-green-600">¥376,600</div>
							<div className="text-sm text-green-600 mt-2">↑ 12.5% 本月</div>
						</div>
						<div className="bg-white rounded-xl p-6 border border-gray-200">
							<div className="text-sm text-gray-600 mb-1">总支出</div>
							<div className="text-3xl font-bold text-red-600">¥273,600</div>
							<div className="text-sm text-red-600 mt-2">↑ 8.3% 本月</div>
						</div>
						<div className="bg-white rounded-xl p-6 border border-gray-200">
							<div className="text-sm text-gray-600 mb-1">净利润</div>
							<div className="text-3xl font-bold text-blue-600">¥103,000</div>
							<div className="text-sm text-green-600 mt-2">↑ 24.8% 本月</div>
						</div>
						<div className="bg-white rounded-xl p-6 border border-gray-200">
							<div className="text-sm text-gray-600 mb-1">待收款</div>
							<div className="text-3xl font-bold text-yellow-600">¥45,200</div>
							<div className="text-sm text-gray-600 mt-2">3 笔待收款</div>
						</div>
					</div>

					{/* Financial Summary */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="bg-white rounded-xl border border-gray-200 p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">收支对比</h3>
							<div className="space-y-4">
								{[
									{ label: '产品销售收入', income: 325600, expense: 0 },
									{ label: '商品采购支出', income: 0, expense: 85600 },
									{ label: '运营成本', income: 0, expense: 160000 },
									{ label: '营销推广', income: 0, expense: 28000 },
								].map((item, index) => (
									<div key={index} className="space-y-2">
										<div className="flex justify-between text-sm">
											<span className="text-gray-600">{item.label}</span>
											{item.income > 0 && <span className="text-green-600 font-medium">+¥{item.income.toLocaleString()}</span>}
											{item.expense > 0 && <span className="text-red-600 font-medium">-¥{item.expense.toLocaleString()}</span>}
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className={`h-2 rounded-full ${item.income > 0 ? 'bg-green-500' : 'bg-red-500'}`}
												style={{
													width: `${((item.income || item.expense) / 325600) * 100}%`
												}}
											/>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="bg-white rounded-xl border border-gray-200 p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">近期财务动态</h3>
							<div className="space-y-4">
								{[
									{ date: '2024-01-15', desc: '销售收入到账', amount: '+¥125,600', type: 'income' },
									{ date: '2024-01-14', type: 'expense', desc: '支付供应商货款', amount: '-¥85,600' },
									{ date: '2024-01-13', type: 'expense', desc: '员工工资发放', amount: '-¥125,000' },
									{ date: '2024-01-12', type: 'income', desc: '服务费收入', amount: '+¥5,000' },
								].map((item, index) => (
									<div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
										<div
											className={`w-10 h-10 rounded-full flex items-center justify-center ${
												item.type === 'income' ? 'bg-green-100' : 'bg-red-100'
											}`}
										>
											{item.type === 'income' ? '💰' : '💸'}
										</div>
										<div className="flex-1">
											<div className="font-medium text-gray-900">{item.desc}</div>
											<div className="text-sm text-gray-600">{item.date}</div>
										</div>
										<div className={`font-semibold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
											{item.amount}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{activeTab === 'income' && (
				<div className="bg-white rounded-xl border border-gray-200 p-6">
					<div className="mb-6">
						<button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
							+ 新增收入
						</button>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									{['日期', '收入类型', '收入分类', '金额', '状态'].map(header => (
										<th key={header} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{incomeRecords.map((record) => (
									<tr key={record.id} className="border-t border-gray-200 hover:bg-gray-50">
										<td className="px-6 py-4 text-gray-600">{record.date}</td>
										<td className="px-6 py-4">
											<span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
												{record.type}
											</span>
										</td>
										<td className="px-6 py-4 text-gray-600">{record.category}</td>
										<td className="px-6 py-4 text-green-600 font-medium">+¥{record.amount.toLocaleString()}</td>
										<td className="px-6 py-4">
											<span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
												{record.status}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{activeTab === 'expense' && (
				<div className="bg-white rounded-xl border border-gray-200 p-6">
					<div className="mb-6">
						<button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
							+ 新增支出
						</button>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									{['日期', '支出类型', '支出分类', '金额', '状态'].map(header => (
										<th key={header} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{expenseRecords.map((record) => (
									<tr key={record.id} className="border-t border-gray-200 hover:bg-gray-50">
										<td className="px-6 py-4 text-gray-600">{record.date}</td>
										<td className="px-6 py-4">
											<span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
												{record.type}
											</span>
										</td>
										<td className="px-6 py-4 text-gray-600">{record.category}</td>
										<td className="px-6 py-4 text-red-600 font-medium">-¥{record.amount.toLocaleString()}</td>
										<td className="px-6 py-4">
											<span className={`px-3 py-1 rounded-full text-sm ${
												record.status === '已付款'
													? 'bg-green-100 text-green-700'
													: 'bg-yellow-100 text-yellow-700'
											}`}>
												{record.status}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{activeTab === 'invoice' && (
				<div className="bg-white rounded-xl border border-gray-200 p-6">
					<div className="mb-6">
						<button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
							+ 开具发票
						</button>
					</div>
					<div className="text-center py-12">
						<div className="text-gray-400 text-6xl mb-4">📄</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">发票管理</h3>
						<p className="text-gray-600">暂无发票记录</p>
					</div>
				</div>
			)}
		</div>
	);
}
