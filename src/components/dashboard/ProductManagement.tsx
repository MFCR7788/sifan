'use client';

import { useState } from 'react';

export default function ProductManagement() {
	const [products, setProducts] = useState([
		{ id: 1, name: '智能手机 Pro', category: '电子产品', price: 5999, stock: 150, sku: 'SP001' },
		{ id: 2, name: '智能手表', category: '智能穿戴', price: 1999, stock: 89, sku: 'SP002' },
		{ id: 3, name: '无线耳机 Pro', category: '音频设备', price: 899, stock: 230, sku: 'SP003' },
		{ id: 4, name: '平板电脑 Air', category: '电子产品', price: 4299, stock: 67, sku: 'SP004' },
		{ id: 5, name: '智能家居中心', category: '智能家居', price: 1299, stock: 45, sku: 'SP005' },
	]);

	const [searchQuery, setSearchQuery] = useState('');
	const [showModal, setShowModal] = useState(false);

	const filteredProducts = products.filter(product =>
		product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		product.sku.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">商品管理</h2>
					<p className="text-gray-600 mt-1">管理商品信息、价格和库存状态</p>
				</div>
				<button
					onClick={() => setShowModal(true)}
					className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
				>
					<span>+</span> 新增商品
				</button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">商品总数</div>
					<div className="text-3xl font-bold text-gray-900">{products.length}</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">库存总数</div>
					<div className="text-3xl font-bold text-blue-600">
						{products.reduce((sum, p) => sum + p.stock, 0).toLocaleString()}
					</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">库存预警</div>
					<div className="text-3xl font-bold text-red-600">3</div>
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<div className="text-sm text-gray-600 mb-1">商品总价值</div>
					<div className="text-3xl font-bold text-green-600">
						¥{products.reduce((sum, p) => sum + p.price * p.stock, 0).toLocaleString()}
					</div>
				</div>
			</div>

			{/* Search */}
			<div className="bg-white rounded-xl p-4 border border-gray-200">
				<input
					type="text"
					placeholder="搜索商品名称或SKU..."
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
								{['商品名称', '分类', 'SKU', '价格', '库存', '操作'].map(header => (
									<th key={header} className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{filteredProducts.map((product) => (
								<tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
									<td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
									<td className="px-6 py-4">
										<span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
											{product.category}
										</span>
									</td>
									<td className="px-6 py-4 text-gray-600 font-mono text-sm">{product.sku}</td>
									<td className="px-6 py-4 text-gray-900 font-medium">¥{product.price.toLocaleString()}</td>
									<td className="px-6 py-4">
										<span className={`px-3 py-1 rounded-full text-sm font-medium ${
											product.stock > 100
												? 'bg-green-100 text-green-700'
												: product.stock > 50
												? 'bg-yellow-100 text-yellow-700'
												: 'bg-red-100 text-red-700'
										}`}>
											{product.stock}
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
						<h3 className="text-xl font-bold text-gray-900 mb-6">新增商品</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">商品名称</label>
								<input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">商品分类</label>
								<select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
									<option>电子产品</option>
									<option>智能穿戴</option>
									<option>音频设备</option>
									<option>智能家居</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">SKU编码</label>
								<input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">销售价格</label>
								<input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">初始库存</label>
								<input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
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
