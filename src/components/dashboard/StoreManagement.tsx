'use client';

import { useState } from 'react';

export default function StoreManagement() {
	const [stores, setStores] = useState([
		{ id: 1, name: '北京朝阳店', address: '北京市朝阳区朝阳路88号', manager: '张三', phone: '138****1234', status: '正常' },
		{ id: 2, name: '上海浦东店', address: '上海市浦东新区陆家嘴金融中心', manager: '李四', phone: '139****5678', status: '正常' },
		{ id: 3, name: '广州天河店', address: '广州市天河区天河路123号', manager: '王五', phone: '137****9012', status: '装修中' },
		{ id: 4, name: '深圳南山店', address: '深圳市南山区科技园南区', manager: '赵六', phone: '136****3456', status: '正常' },
	]);

	const [searchQuery, setSearchQuery] = useState('');
	const [showModal, setShowModal] = useState(false);

	const filteredStores = stores.filter(store =>
		store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		store.address.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">门店管理</h2>
					<p className="text-gray-600 mt-1">管理所有门店信息、状态和运营情况</p>
				</div>
				<button
					onClick={() => setShowModal(true)}
					className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
				>
					<span>+</span> 新增门店
				</button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">总门店数</div>
					<div className="text-3xl font-bold text-gray-900">{stores.length}</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">正常营业</div>
					<div className="text-3xl font-bold text-green-600">
						{stores.filter(s => s.status === '正常').length}
					</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">装修/维护中</div>
					<div className="text-3xl font-bold text-yellow-600">
						{stores.filter(s => s.status === '装修中').length}
					</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">本月新增</div>
					<div className="text-3xl font-bold text-blue-600">2</div>
				</div>
			</div>

			{/* Search */}
			<div className="bg-white rounded-xl p-4 border border-gray-200">
				<input
					type="text"
					placeholder="搜索门店名称或地址..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
				/>
			</div>

			{/* Table */}
			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								{['门店名称', '地址', '店长', '联系电话', '状态', '操作'].map(header => (
									<th key={header} className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{filteredStores.map((store) => (
								<tr key={store.id} className="border-b border-gray-200 hover:bg-gray-50">
									<td className="px-6 py-4 font-medium text-gray-900">{store.name}</td>
									<td className="px-6 py-4 text-gray-600">{store.address}</td>
									<td className="px-6 py-4 text-gray-600">{store.manager}</td>
									<td className="px-6 py-4 text-gray-600">{store.phone}</td>
									<td className="px-6 py-4">
										<span className={`px-3 py-1 rounded-full text-sm font-medium ${
											store.status === '正常'
												? 'bg-green-100 text-green-700'
												: 'bg-yellow-100 text-yellow-700'
										}`}>
											{store.status}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex gap-2">
											<button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition">
												编辑
											</button>
											<button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
												删除
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4">
						<h3 className="text-xl font-bold text-gray-900 mb-6">新增门店</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">门店名称</label>
								<input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">门店地址</label>
								<input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">店长姓名</label>
								<input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
								<input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
							</div>
						</div>
						<div className="flex gap-3 mt-6">
							<button
								onClick={() => setShowModal(false)}
								className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
							>
								取消
							</button>
							<button
								onClick={() => setShowModal(false)}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
							>
								确认添加
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
