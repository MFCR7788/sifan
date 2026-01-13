'use client';

import { useEffect, useState } from 'react';

interface KnowledgeItem {
	id: string;
	category: string;
	question: string;
	answer: string;
	keywords: string;
	priority: number;
	isActive: boolean;
	viewCount: number;
	createdAt: string;
	updatedAt: string;
}

export default function KnowledgeBasePage() {
	const [items, setItems] = useState<KnowledgeItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
	const [formData, setFormData] = useState({
		category: '',
		question: '',
		answer: '',
		keywords: '',
		priority: 0,
		isActive: true,
	});

	// 上传相关状态
	const [uploadFile, setUploadFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [parsing, setParsing] = useState(false);
	const [uploadResult, setUploadResult] = useState<{ total: number; items: any[] } | null>(null);

	const categories = [
		'all',
		'产品',
		'服务',
		'技术',
		'价格',
		'售后',
		'公司',
		'其他',
	];

	useEffect(() => {
		fetchItems();
	}, [selectedCategory]);

	const fetchItems = async () => {
		setLoading(true);
		try {
			const url = selectedCategory === 'all'
				? '/api/admin/knowledge-base'
				: `/api/admin/knowledge-base?category=${selectedCategory}`;
			const response = await fetch(url, {
				credentials: 'include',
			});
			if (response.ok) {
				const data = await response.json();
				setItems(data.items || []);
			}
		} catch (error) {
			console.error('Failed to fetch knowledge base:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleAdd = () => {
		setFormData({
			category: '产品',
			question: '',
			answer: '',
			keywords: '',
			priority: 0,
			isActive: true,
		});
		setIsModalOpen(true);
	};

	const handleEdit = (item: KnowledgeItem) => {
		setSelectedItem(item);
		setFormData({
			category: item.category,
			question: item.question,
			answer: item.answer,
			keywords: item.keywords || '',
			priority: item.priority,
			isActive: item.isActive,
		});
		setIsEditModalOpen(true);
	};

	const handleSave = async () => {
		try {
			const response = await fetch('/api/admin/knowledge-base', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setIsModalOpen(false);
				fetchItems();
			} else {
				alert('保存失败');
			}
		} catch (error) {
			console.error('Failed to save item:', error);
			alert('保存失败');
		}
	};

	const handleUpdate = async () => {
		if (!selectedItem) return;

		try {
			const response = await fetch(`/api/admin/knowledge-base/${selectedItem.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setIsEditModalOpen(false);
				setSelectedItem(null);
				fetchItems();
			} else {
				alert('更新失败');
			}
		} catch (error) {
			console.error('Failed to update item:', error);
			alert('更新失败');
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm('确定要删除这条知识库条目吗？')) return;

		try {
			const response = await fetch(`/api/admin/knowledge-base/${id}`, {
				method: 'DELETE',
				credentials: 'include',
			});

			if (response.ok) {
				fetchItems();
			} else {
				alert('删除失败');
			}
		} catch (error) {
			console.error('Failed to delete item:', error);
			alert('删除失败');
		}
	};

	const handleSearch = async () => {
		setLoading(true);
		try {
			const url = searchTerm
				? `/api/admin/knowledge-base?search=${encodeURIComponent(searchTerm)}`
				: '/api/admin/knowledge-base';
			const response = await fetch(url, {
				credentials: 'include',
			});
			if (response.ok) {
				const data = await response.json();
				setItems(data.items || []);
			}
		} catch (error) {
			console.error('Failed to search knowledge base:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (searchTerm) {
			const debounceTimer = setTimeout(() => {
				handleSearch();
			}, 500);
			return () => clearTimeout(debounceTimer);
		} else {
			fetchItems();
		}
	}, [searchTerm]);

	// 处理文件上传
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setUploadFile(file);
		}
	};

	// 上传并解析文档
	const handleUploadAndParse = async () => {
		if (!uploadFile) return;

		setUploading(true);
		try {
			// 步骤1：上传文件
			const formData = new FormData();
			formData.append('file', uploadFile);

			const uploadResponse = await fetch('/api/admin/knowledge-base/upload', {
				method: 'POST',
				credentials: 'include',
				body: formData,
			});

			if (!uploadResponse.ok) {
				const error = await uploadResponse.json();
				throw new Error(error.error || '上传失败');
			}

			const uploadData = await uploadResponse.json();

			// 步骤2：解析文档并生成问答
			setParsing(true);
			const parseResponse = await fetch('/api/admin/knowledge-base/parse', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					fileKey: uploadData.data.fileKey,
					fileName: uploadData.data.fileName,
					fileType: uploadData.data.fileType,
					category: '文档',
				}),
			});

			if (!parseResponse.ok) {
				const error = await parseResponse.json();
				throw new Error(error.error || '解析失败');
			}

			const parseData = await parseResponse.json();
			setUploadResult(parseData.data);
			fetchItems();
		} catch (error) {
			alert(error instanceof Error ? error.message : '处理失败');
		} finally {
			setUploading(false);
			setParsing(false);
		}
	};

	// 重置上传状态
	const handleResetUpload = () => {
		setUploadFile(null);
		setUploadResult(null);
		setIsUploadModalOpen(false);
	};

	return (
		<div>
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-3xl font-bold text-gray-900">知识库管理</h1>
				<div className="flex gap-3">
					<button
						onClick={() => setIsUploadModalOpen(true)}
						className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
					>
						上传文档
					</button>
					<button
						onClick={handleAdd}
						className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
					>
						新增条目
					</button>
				</div>
			</div>

			{/* Search and Filter */}
			<div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
				<div className="flex gap-4">
					<input
						type="text"
						placeholder="搜索问题、答案或关键词..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
					/>
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
					>
						{categories.map(cat => (
							<option key={cat} value={cat}>
								{cat === 'all' ? '所有分类' : cat}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Items List */}
			{loading ? (
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
				</div>
			) : items.length === 0 ? (
				<div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
					<p className="text-gray-500">{searchTerm ? '未找到匹配的条目' : '暂无知识库条目'}</p>
				</div>
			) : (
				<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">分类</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">问题</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">优先级</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">状态</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">查看次数</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">创建时间</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">操作</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{items.map((item) => (
								<tr key={item.id} className="hover:bg-gray-50">
									<td className="px-6 py-4">
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
											{item.category}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="max-w-md">
											<p className="text-sm text-gray-900 truncate">{item.question}</p>
											<p className="text-xs text-gray-500 mt-1 truncate">{item.answer}</p>
										</div>
									</td>
									<td className="px-6 py-4 text-sm text-gray-600">{item.priority}</td>
									<td className="px-6 py-4">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												item.isActive
													? 'bg-green-100 text-green-800'
													: 'bg-red-100 text-red-800'
											}`}
										>
											{item.isActive ? '启用' : '禁用'}
										</span>
									</td>
									<td className="px-6 py-4 text-sm text-gray-600">{item.viewCount}</td>
									<td className="px-6 py-4 text-sm text-gray-600">
										{new Date(item.createdAt).toLocaleDateString('zh-CN')}
									</td>
									<td className="px-6 py-4">
										<div className="flex gap-2">
											<button
												onClick={() => handleEdit(item)}
												className="text-blue-600 hover:text-blue-700 font-medium text-sm"
											>
												编辑
											</button>
											<button
												onClick={() => handleDelete(item.id)}
												className="text-red-600 hover:text-red-700 font-medium text-sm"
											>
												删除
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Add Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<h2 className="text-xl font-bold text-gray-900 mb-6">新增知识库条目</h2>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
								<select
									value={formData.category}
									onChange={(e) => setFormData({ ...formData, category: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
								>
									{categories.filter(cat => cat !== 'all').map(cat => (
										<option key={cat} value={cat}>{cat}</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">问题</label>
								<textarea
									value={formData.question}
									onChange={(e) => setFormData({ ...formData, question: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									rows={3}
									placeholder="输入问题"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">答案</label>
								<textarea
									value={formData.answer}
									onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									rows={5}
									placeholder="输入答案"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">关键词</label>
								<input
									type="text"
									value={formData.keywords}
									onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									placeholder="输入关键词，用空格分隔"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
								<input
									type="number"
									value={formData.priority}
									onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
								/>
								<p className="text-xs text-gray-500 mt-1">数字越大越优先匹配</p>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									checked={formData.isActive}
									onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
									className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
								/>
								<label className="ml-2 text-sm font-medium text-gray-700">启用</label>
							</div>
						</div>
						<div className="flex justify-end gap-3 mt-6">
							<button
								onClick={() => setIsModalOpen(false)}
								className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								取消
							</button>
							<button
								onClick={handleSave}
								className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
							>
								保存
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			{isEditModalOpen && selectedItem && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<h2 className="text-xl font-bold text-gray-900 mb-6">编辑知识库条目</h2>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
								<select
									value={formData.category}
									onChange={(e) => setFormData({ ...formData, category: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
								>
									{categories.filter(cat => cat !== 'all').map(cat => (
										<option key={cat} value={cat}>{cat}</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">问题</label>
								<textarea
									value={formData.question}
									onChange={(e) => setFormData({ ...formData, question: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									rows={3}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">答案</label>
								<textarea
									value={formData.answer}
									onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									rows={5}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">关键词</label>
								<input
									type="text"
									value={formData.keywords}
									onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
								<input
									type="number"
									value={formData.priority}
									onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
								/>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									checked={formData.isActive}
									onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
									className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
								/>
								<label className="ml-2 text-sm font-medium text-gray-700">启用</label>
							</div>
						</div>
						<div className="flex justify-end gap-3 mt-6">
							<button
								onClick={() => {
									setIsEditModalOpen(false);
									setSelectedItem(null);
								}}
								className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								取消
							</button>
							<button
								onClick={handleUpdate}
								className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
							>
								保存
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Upload Modal */}
			{isUploadModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<h2 className="text-xl font-bold text-gray-900 mb-6">上传文档并生成问答</h2>

						{!uploadResult ? (
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">选择文件</label>
									<input
										type="file"
										onChange={handleFileSelect}
										accept=".pdf,.docx,.txt"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									/>
									<p className="text-xs text-gray-500 mt-1">支持 PDF、DOCX、TXT 格式，最大 10MB</p>
								</div>

								{uploadFile && (
									<div className="bg-gray-50 rounded-lg p-4">
										<p className="text-sm text-gray-700">
											<span className="font-medium">已选择：</span>
											{uploadFile.name}
										</p>
										<p className="text-xs text-gray-500 mt-1">
											大小：{(uploadFile.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
								)}

								<div className="flex justify-end gap-3 mt-6">
									<button
										onClick={() => setIsUploadModalOpen(false)}
										className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
									>
										取消
									</button>
									<button
										onClick={handleUploadAndParse}
										disabled={!uploadFile || uploading || parsing}
										className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{uploading ? '上传中...' : parsing ? '解析中...' : '开始解析'}
									</button>
								</div>
							</div>
						) : (
							<div>
								<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
									<p className="text-sm text-green-800">
										✅ 成功生成 {uploadResult.total} 个问答对！
									</p>
								</div>

								<div className="space-y-3 max-h-96 overflow-y-auto">
									{uploadResult.items.map((item, index) => (
										<div key={index} className="bg-gray-50 rounded-lg p-4">
											<div className="text-sm font-medium text-gray-900 mb-2">
												Q{index + 1}: {item.question}
											</div>
											<div className="text-sm text-gray-600">
												A: {item.answer.substring(0, 100)}...
											</div>
										</div>
									))}
								</div>

								<div className="flex justify-end gap-3 mt-6">
									<button
										onClick={handleResetUpload}
										className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
									>
										完成
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
