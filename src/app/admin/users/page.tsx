'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface User {
	id: string;
	name: string;
	phone: string;
	email: string | null;
	isAdmin: boolean;
	isActive: boolean;
	createdAt: string;
}

export default function AdminUsersPage() {
	const { user } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editForm, setEditForm] = useState({
		name: '',
		email: '',
		isAdmin: false,
		isActive: true,
	});

	// 获取认证头
	const getAuthHeaders = () => {
		const headers: Record<string, string> = {};
		if (user?.id) {
			headers['x-user-id'] = user.id;
		}
		return headers;
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/admin/users', {
				credentials: 'include',
				headers: getAuthHeaders(),
			});
			if (response.ok) {
				const data = await response.json();
				setUsers(data.users || []);
			}
		} catch (error) {
			console.error('Failed to fetch users:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleViewUser = (user: User) => {
		setSelectedUser(user);
		setIsModalOpen(true);
	};

	const handleEditUser = (user: User) => {
		setSelectedUser(user);
		setEditForm({
			name: user.name,
			email: user.email || '',
			isAdmin: user.isAdmin || false,
			isActive: user.isActive !== false,
		});
		setIsEditModalOpen(true);
	};

	const handleUpdateUser = async () => {
		try {
			const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...getAuthHeaders(),
				},
				credentials: 'include',
				body: JSON.stringify(editForm),
			});

			if (response.ok) {
				setIsEditModalOpen(false);
				fetchUsers();
			} else {
				const data = await response.json();
				alert(`更新用户失败: ${data.error || data.message || '未知错误'}`);
			}
		} catch (error) {
			console.error('Failed to update user:', error);
			alert(`更新用户失败: ${error instanceof Error ? error.message : '未知错误'}`);
		}
	};

	const handleToggleActive = async (userId: string, currentStatus: boolean) => {
		try {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...getAuthHeaders(),
				},
				credentials: 'include',
				body: JSON.stringify({ isActive: !currentStatus }),
			});

			if (response.ok) {
				fetchUsers();
			} else {
				alert('更新用户状态失败');
			}
		} catch (error) {
			console.error('Failed to toggle user active:', error);
			alert('更新用户状态失败');
		}
	};

	const filteredUsers = users.filter(user =>
		user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.phone.includes(searchTerm) ||
		(user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	return (
		<div>
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-3xl font-bold text-gray-900">用户信息管理</h1>
			</div>

			{/* Search */}
			<div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
				<input
					type="text"
					placeholder="搜索用户（姓名、手机号、邮箱）"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
				/>
			</div>

			{/* Users Table */}
			{loading ? (
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
				</div>
			) : filteredUsers.length === 0 ? (
				<div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
					<p className="text-gray-500">{searchTerm ? '未找到匹配的用户' : '暂无用户'}</p>
				</div>
			) : (
				<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">用户ID</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">姓名</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">手机号</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">邮箱</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">角色</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">状态</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">注册时间</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">操作</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{filteredUsers.map((user) => (
								<tr key={user.id} className="hover:bg-gray-50">
									<td className="px-6 py-4">
										<span className="font-mono text-sm">{user.id.slice(0, 8)}...</span>
									</td>
									<td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
									<td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
									<td className="px-6 py-4 text-sm text-gray-600">{user.email || '-'}</td>
									<td className="px-6 py-4">
										{user.isAdmin ? (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
												管理员
											</span>
										) : (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
												用户
											</span>
										)}
									</td>
									<td className="px-6 py-4">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												user.isActive
													? 'bg-green-100 text-green-800'
													: 'bg-red-100 text-red-800'
											}`}
										>
											{user.isActive ? '正常' : '禁用'}
										</span>
									</td>
									<td className="px-6 py-4 text-sm text-gray-600">
										{new Date(user.createdAt).toLocaleDateString('zh-CN')}
									</td>
									<td className="px-6 py-4">
										<div className="flex gap-2">
											<button
												onClick={() => handleViewUser(user)}
												className="text-blue-600 hover:text-blue-700 font-medium text-sm"
											>
												查看
											</button>
											{!user.isAdmin && (
												<button
													onClick={() => handleEditUser(user)}
													className="text-green-600 hover:text-green-700 font-medium text-sm"
												>
													编辑
												</button>
											)}
											<button
												onClick={() => handleToggleActive(user.id, user.isActive)}
												className="text-red-600 hover:text-red-700 font-medium text-sm"
											>
												{user.isActive ? '禁用' : '启用'}
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* User Detail Modal */}
			{isModalOpen && selectedUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl max-w-md w-full mx-4">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-gray-900">用户详情</h2>
								<button
									onClick={() => setIsModalOpen(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>

						<div className="p-6">
							<div className="space-y-4">
								<div>
									<div className="text-sm text-gray-600">用户ID</div>
									<div className="font-mono text-sm">{selectedUser.id}</div>
								</div>

								<div>
									<div className="text-sm text-gray-600">姓名</div>
									<div className="font-medium">{selectedUser.name}</div>
								</div>

								<div>
									<div className="text-sm text-gray-600">手机号</div>
									<div className="font-medium">{selectedUser.phone}</div>
								</div>

								{selectedUser.email && (
									<div>
										<div className="text-sm text-gray-600">邮箱</div>
										<div className="font-medium">{selectedUser.email}</div>
									</div>
								)}

								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-sm text-gray-600">角色</div>
										<div>
											{selectedUser.isAdmin ? '管理员' : '用户'}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-600">状态</div>
										<div>
											{selectedUser.isActive ? '正常' : '禁用'}
										</div>
									</div>
								</div>

								<div>
									<div className="text-sm text-gray-600">注册时间</div>
									<div>{new Date(selectedUser.createdAt).toLocaleString('zh-CN')}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Edit User Modal */}
			{isEditModalOpen && selectedUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl max-w-md w-full mx-4">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-gray-900">编辑用户</h2>
								<button
									onClick={() => setIsEditModalOpen(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>

						<div className="p-6">
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										姓名
									</label>
									<input
										type="text"
										value={editForm.name}
										onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										邮箱
									</label>
									<input
										type="email"
										value={editForm.email}
										onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									/>
								</div>

								<div className="flex items-center">
									<input
										type="checkbox"
										id="isAdmin"
										checked={editForm.isAdmin}
										onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
										className="w-4 h-4 text-gray-900 border-gray-300 rounded"
									/>
									<label htmlFor="isAdmin" className="ml-2 text-sm text-gray-700">
										设为管理员
									</label>
								</div>

								<div className="flex items-center">
									<input
										type="checkbox"
										id="isActive"
										checked={editForm.isActive}
										onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
										className="w-4 h-4 text-gray-900 border-gray-300 rounded"
									/>
									<label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
										启用账号
									</label>
								</div>
							</div>
						</div>

						<div className="p-6 border-t border-gray-200">
							<div className="flex gap-3">
								<button
									onClick={() => setIsEditModalOpen(false)}
									className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
								>
									取消
								</button>
								<button
									onClick={handleUpdateUser}
									className="flex-1 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
								>
									保存
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
