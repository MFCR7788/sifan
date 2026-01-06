'use client';

import { useState } from 'react';

export default function InventoryManagement() {
	const [activeTab, setActiveTab] = useState<'inbound' | 'outbound' | 'inventory'>('inventory');

	const [inboundRecords, setInboundRecords] = useState([
		{ id: 1, date: '2024-01-15', type: '采购入库', product: '智能手机 Pro', quantity: 200, supplier: '供应商A' },
		{ id: 2, date: '2024-01-14', type: '采购入库', product: '智能手表', quantity: 100, supplier: '供应商B' },
		{ id: 3, date: '2024-01-13', type: '退货入库', product: '无线耳机 Pro', quantity: 50, supplier: '退货' },
	]);

	const [outboundRecords, setOutboundRecords] = useState([
		{ id: 1, date: '2024-01-15', type: '销售出库', product: '智能手机 Pro', quantity: 50, customer: '客户A' },
		{ id: 2, date: '2024-01-14', type: '销售出库', product: '智能手表', quantity: 30, customer: '客户B' },
		{ id: 3, date: '2024-01-13', type: '退货出库', product: '平板电脑 Air', quantity: 10, customer: '退货' },
	]);

	const [inventoryList, setInventoryList] = useState([
		{ id: 1, product: '智能手机 Pro', sku: 'SP001', inbound: 300, outbound: 150, current: 150, status: '正常' },
		{ id: 2, product: '智能手表', sku: 'SP002', inbound: 100, outbound: 11, current: 89, status: '正常' },
		{ id: 3, product: '无线耳机 Pro', sku: 'SP003', inbound: 250, outbound: 20, current: 230, status: '正常' },
		{ id: 4, product: '平板电脑 Air', sku: 'SP004', inbound: 70, outbound: 3, current: 67, status: '预警' },
		{ id: 5, product: '智能家居中心', sku: 'SP005', inbound: 50, outbound: 5, current: 45, status: '预警' },
	]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-bold text-gray-900">进销存管理</h2>
				<p className="text-gray-600 mt-1">管理入库、出库及库存情况</p>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-gray-200 bg-white rounded-t-xl">
				{[
					{ id: 'inventory', label: '库存查询', icon: '📦' },
					{ id: 'inbound', label: '入库记录', icon: '📥' },
					{ id: 'outbound', label: '出库记录', icon: '📤' },
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

			{activeTab === 'inventory' && (
				<div className="bg-white rounded-xl border border-gray-200 p-6">
					{/* Stats */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						<div className="bg-gray-50 rounded-lg p-4">
							<div className="text-sm text-gray-600 mb-1">商品种类</div>
							<div className="text-2xl font-bold text-gray-900">{inventoryList.length}</div>
						</div>
						<div className="bg-gray-50 rounded-lg p-4">
							<div className="text-sm text-gray-600 mb-1">总库存量</div>
							<div className="text-2xl font-bold text-blue-600">
								{inventoryList.reduce((sum, p) => sum + p.current, 0).toLocaleString()}
							</div>
						</div>
						<div className="bg-gray-50 rounded-lg p-4">
							<div className="text-sm text-gray-600 mb-1">库存预警</div>
							<div className="text-2xl font-bold text-red-600">
								{inventoryList.filter(p => p.status === '预警').length}
							</div>
						</div>
						<div className="bg-gray-50 rounded-lg p-4">
							<div className="text-sm text-gray-600 mb-1">库存周转</div>
							<div className="text-2xl font-bold text-green-600">85%</div>
						</div>
					</div>

					{/* Table */}
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									{['商品名称', 'SKU', '入库总量', '出库总量', '当前库存', '状态'].map(header => (
										<th key={header} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{inventoryList.map((item) => (
									<tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
										<td className="px-6 py-4 font-medium text-gray-900">{item.product}</td>
										<td className="px-6 py-4 text-gray-600 font-mono text-sm">{item.sku}</td>
										<td className="px-6 py-4 text-gray-600">{item.inbound.toLocaleString()}</td>
										<td className="px-6 py-4 text-gray-600">{item.outbound.toLocaleString()}</td>
										<td className="px-6 py-4 font-medium text-gray-900">{item.current.toLocaleString()}</td>
										<td className="px-6 py-4">
											<span className={`px-3 py-1 rounded-full text-sm font-medium ${
												item.status === '正常'
													? 'bg-green-100 text-green-700'
													: 'bg-red-100 text-red-700'
											}`}>
												{item.status}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{activeTab === 'inbound' && (
				<div className="bg-white rounded-xl border border-gray-200 p-6">
					<div className="mb-6">
						<button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
							+ 入库登记
						</button>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									{['日期', '入库类型', '商品名称', '入库数量', '供应商'].map(header => (
										<th key={header} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{inboundRecords.map((record) => (
									<tr key={record.id} className="border-t border-gray-200 hover:bg-gray-50">
										<td className="px-6 py-4 text-gray-600">{record.date}</td>
										<td className="px-6 py-4">
											<span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
												{record.type}
											</span>
										</td>
										<td className="px-6 py-4 font-medium text-gray-900">{record.product}</td>
										<td className="px-6 py-4 text-green-600 font-medium">+{record.quantity.toLocaleString()}</td>
										<td className="px-6 py-4 text-gray-600">{record.supplier}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{activeTab === 'outbound' && (
				<div className="bg-white rounded-xl border border-gray-200 p-6">
					<div className="mb-6">
						<button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
							+ 出库登记
						</button>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									{['日期', '出库类型', '商品名称', '出库数量', '客户'].map(header => (
										<th key={header} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{outboundRecords.map((record) => (
									<tr key={record.id} className="border-t border-gray-200 hover:bg-gray-50">
										<td className="px-6 py-4 text-gray-600">{record.date}</td>
										<td className="px-6 py-4">
											<span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
												{record.type}
											</span>
										</td>
										<td className="px-6 py-4 font-medium text-gray-900">{record.product}</td>
										<td className="px-6 py-4 text-red-600 font-medium">-{record.quantity.toLocaleString()}</td>
										<td className="px-6 py-4 text-gray-600">{record.customer}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
