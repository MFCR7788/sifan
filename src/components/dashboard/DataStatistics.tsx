'use client';

import { useState } from 'react';

export default function DataStatistics() {
	const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">数据统计</h2>
					<p className="text-gray-600 mt-1">查看销售数据、趋势分析和业务报表</p>
				</div>
				<select
					value={timeRange}
					onChange={(e) => setTimeRange(e.target.value as any)}
					className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
				>
					<option value="week">本周</option>
					<option value="month">本月</option>
					<option value="quarter">本季度</option>
					<option value="year">本年度</option>
				</select>
			</div>

			{/* Key Metrics */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="flex items-center justify-between mb-3">
						<div className="text-sm text-gray-600">总销售额</div>
						<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
							💰
						</div>
					</div>
					<div className="text-3xl font-bold text-gray-900">¥1,285,600</div>
					<div className="text-sm text-green-600 mt-2">↑ 15.3% 较上月</div>
				</div>

				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="flex items-center justify-between mb-3">
						<div className="text-sm text-gray-600">订单总数</div>
						<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
							📦
						</div>
					</div>
					<div className="text-3xl font-bold text-gray-900">3,842</div>
					<div className="text-sm text-green-600 mt-2">↑ 8.7% 较上月</div>
				</div>

				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="flex items-center justify-between mb-3">
						<div className="text-sm text-gray-600">客户数量</div>
						<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
							👥
						</div>
					</div>
					<div className="text-3xl font-bold text-gray-900">12,563</div>
					<div className="text-sm text-green-600 mt-2">↑ 12.1% 较上月</div>
				</div>

				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="flex items-center justify-between mb-3">
						<div className="text-sm text-gray-600">平均订单值</div>
						<div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
							📊
						</div>
					</div>
					<div className="text-3xl font-bold text-gray-900">¥334.50</div>
					<div className="text-sm text-green-600 mt-2">↑ 5.9% 较上月</div>
				</div>
			</div>

			{/* Sales Trend */}
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">销售趋势</h3>
				<div className="h-64 flex items-end gap-2">
					{[
						{ label: '1月', value: 65 },
						{ label: '2月', value: 78 },
						{ label: '3月', value: 90 },
						{ label: '4月', value: 85 },
						{ label: '5月', value: 95 },
						{ label: '6月', value: 110 },
						{ label: '7月', value: 100 },
					].map((item, index) => (
						<div key={index} className="flex-1 flex flex-col items-center gap-2">
							<div
								className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
								style={{ height: `${item.value}%` }}
							/>
							<div className="text-xs text-gray-600">{item.label}</div>
						</div>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Top Products */}
				<div className="bg-white rounded-xl border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">热销商品 Top 5</h3>
					<div className="space-y-4">
						{[
							{ name: '智能手机 Pro', sales: 1250, revenue: '¥7,493,000' },
							{ name: '智能手表', sales: 890, revenue: '¥1,779,110' },
							{ name: '无线耳机 Pro', sales: 1560, revenue: '¥1,402,440' },
							{ name: '平板电脑 Air', sales: 670, revenue: '¥2,879,330' },
							{ name: '智能家居中心', sales: 450, revenue: '¥584,550' },
						].map((product, index) => (
							<div key={index} className="flex items-center gap-4">
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
										index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-400'
									}`}
								>
									{index + 1}
								</div>
								<div className="flex-1">
									<div className="font-medium text-gray-900">{product.name}</div>
									<div className="text-sm text-gray-600">销量: {product.sales}</div>
								</div>
								<div className="text-right">
									<div className="font-semibold text-gray-900">{product.revenue}</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Category Distribution */}
				<div className="bg-white rounded-xl border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">销售分类占比</h3>
					<div className="space-y-4">
						{[
							{ category: '电子产品', percentage: 45, color: 'bg-blue-500' },
							{ category: '智能穿戴', percentage: 25, color: 'bg-green-500' },
							{ category: '音频设备', percentage: 18, color: 'bg-purple-500' },
							{ category: '智能家居', percentage: 12, color: 'bg-orange-500' },
						].map((item, index) => (
							<div key={index}>
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm font-medium text-gray-900">{item.category}</span>
									<span className="text-sm text-gray-600">{item.percentage}%</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className={`${item.color} h-2 rounded-full transition-all`}
										style={{ width: `${item.percentage}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Regional Sales */}
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">区域销售排行</h3>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								{['区域', '销售额', '订单数', '增长率'].map(header => (
									<th key={header} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{[
								{ region: '华东地区', sales: '¥585,200', orders: 1745, growth: '+18.5%' },
								{ region: '华南地区', sales: '¥428,600', orders: 1287, growth: '+12.3%' },
								{ region: '华北地区', sales: '¥314,800', orders: 944, growth: '+9.8%' },
								{ region: '西南地区', sales: '¥257,400', orders: 770, growth: '+15.2%' },
								{ region: '华中地区', sales: '¥199,600', orders: 596, growth: '+8.7%' },
							].map((item, index) => (
								<tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
									<td className="px-6 py-4 font-medium text-gray-900">{item.region}</td>
									<td className="px-6 py-4 text-gray-900">{item.sales}</td>
									<td className="px-6 py-4 text-gray-600">{item.orders}</td>
									<td className="px-6 py-4 text-green-600 font-medium">{item.growth}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
