'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// 用户信息接口
interface User {
	id: string;
	name: string;
	phone: string;
	email: string | null;
	isAdmin: boolean;
	isActive: boolean;
	createdAt: string;
}

// 会员信息接口
interface Member {
	id: string;
	userId: string;
	memberLevel: string;
	balance: number;
	points: number;
	totalRecharge: number;
	totalConsumption: number;
	memberStatus: string;
	expiresAt: string | null;
	createdAt: string;
	updatedAt: string;
	userName: string;
	userPhone: string;
}

export default function AdminUsersPage() {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<'users' | 'members'>('users');
	
	// 用户数据
	const [users, setUsers] = useState<User[]>([]);
	const [usersLoading, setUsersLoading] = useState(true);
	const [usersSearchTerm, setUsersSearchTerm] = useState('');
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isUserModalOpen, setIsUserModalOpen] = useState(false);
	const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
	const [userEditForm, setUserEditForm] = useState({
		name: '',
		email: '',
		isAdmin: false,
		isActive: true,
	});
	
	// 会员数据
	const [members, setMembers] = useState<Member[]>([]);
	const [membersLoading, setMembersLoading] = useState(true);
	const [membersSearchTerm, setMembersSearchTerm] = useState('');
	const [selectedMember, setSelectedMember] = useState<Member | null>(null);
	const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
	const [isMemberEditModalOpen, setIsMemberEditModalOpen] = useState(false);
	const [memberEditForm, setMemberEditForm] = useState({
		memberLevel: 'basic',
		balance: 0,
		points: 0,
		memberStatus: 'active',
		expiresAt: '',
	});

	// 获取认证头
	const getAuthHeaders = () => {
		const headers: Record<string, string> = {};
		if (user?.id) {
			headers['x-user-id'] = user.id;
		}
		return headers;
	};

	// 获取用户数据
	const fetchUsers = async () => {
		setUsersLoading(true);
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
			setUsersLoading(false);
		}
	};

	// 获取会员数据
	const fetchMembers = async () => {
		setMembersLoading(true);
		try {
			const response = await fetch('/api/admin/members', {
				credentials: 'include',
				headers: getAuthHeaders(),
			});
			if (response.ok) {
				const data = await response.json();
				setMembers(data.members || []);
			}
		} catch (error) {
			console.error('Failed to fetch members:', error);
		} finally {
			setMembersLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
		fetchMembers();
	}, []);

	// 用户相关操作
	const handleViewUser = (user: User) => {
		setSelectedUser(user);
		setIsUserModalOpen(true);
	};

	const handleEditUser = (user: User) => {
		setSelectedUser(user);
		setUserEditForm({
			name: user.name,
			email: user.email || '',
			isAdmin: user.isAdmin || false,
			isActive: user.isActive !== false,
		});
		setIsUserEditModalOpen(true);
	};

	const handleUpdateUser = async () => {
		if (!selectedUser) return;

		try {
			const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...getAuthHeaders(),
				},
				credentials: 'include',
				body: JSON.stringify(userEditForm),
			});

			if (response.ok) {
				setIsUserEditModalOpen(false);
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

	const handleToggleUserActive = async (userId: string, currentStatus: boolean) => {
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

	// 会员相关操作
	const handleViewMember = (member: Member) => {
		setSelectedMember(member);
		setIsMemberModalOpen(true);
	};

	const handleEditMember = (member: Member) => {
		setSelectedMember(member);
		setMemberEditForm({
			memberLevel: member.memberLevel || 'basic',
			balance: member.balance || 0,
			points: member.points || 0,
			memberStatus: member.memberStatus || 'active',
			expiresAt: member.expiresAt ? member.expiresAt.split('T')[0] : '',
		});
		setIsMemberEditModalOpen(true);
	};

	const handleUpdateMember = async () => {
		if (!selectedMember) return;

		try {
			const response = await fetch(`/api/admin/members/${selectedMember.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...getAuthHeaders(),
				},
				credentials: 'include',
				body: JSON.stringify({
					...memberEditForm,
					balance: memberEditForm.balance * 100, // 转换为分
					points: memberEditForm.points,
				}),
			});

			if (response.ok) {
				setIsMemberEditModalOpen(false);
				fetchMembers();
			} else {
				const data = await response.json();
				alert(`更新会员信息失败: ${data.error || data.message || '未知错误'}`);
			}
		} catch (error) {
			console.error('Failed to update member:', error);
			alert(`更新会员信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
		}
	};

	// 过滤数据
	const filteredUsers = users.filter(user =>
		user.name.toLowerCase().includes(usersSearchTerm.toLowerCase()) ||
		user.phone.includes(usersSearchTerm) ||
		(user.email && user.email.toLowerCase().includes(usersSearchTerm.toLowerCase()))
	);

	const filteredMembers = members.filter(member =>
		member.userName?.toLowerCase().includes(membersSearchTerm.toLowerCase()) ||
		member.userPhone?.includes(membersSearchTerm)
	);

	return (
		<div>
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
			</div>

			{/* 选项卡 */}
			<div className="border-b border-gray-200 mb-6">
				<div className="flex space-x-8">
					<button
						onClick={() => setActiveTab('users')}
						className={`px-1 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
					>
						用户信息
					</button>
					<button
						onClick={() => setActiveTab('members')}
						className={`px-1 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'members' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
					>
						会员管理
					</button>
				</div>
			</div>

			{/* 用户信息选项卡 */}
			{activeTab === 'users' && (
				<div>
					{/* Search */}
					<div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
						<input
							type="text"
							placeholder="搜索用户（姓名、手机号、邮箱）"
							value={usersSearchTerm}
							onChange={(e) => setUsersSearchTerm(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
						/>
					</div>

					{/* Users Table */}
					{usersLoading ? (
						<div className="flex items-center justify-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
						</div>
					) : filteredUsers.length === 0 ? (
						<div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
							<p className="text-gray-500">{usersSearchTerm ? '未找到匹配的用户' : '暂无用户'}</p>
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
														onClick={() => handleToggleUserActive(user.id, user.isActive)}
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
				</div>
			)}

			{/* 会员管理选项卡 */}
			{activeTab === 'members' && (
				<div>
					{/* Search */}
					<div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
						<input
							type="text"
							placeholder="搜索会员（姓名、手机号）"
							value={membersSearchTerm}
							onChange={(e) => setMembersSearchTerm(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
						/>
					</div>

					{/* Members Table */}
					{membersLoading ? (
						<div className="flex items-center justify-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
						</div>
					) : filteredMembers.length === 0 ? (
						<div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
							<p className="text-gray-500">{membersSearchTerm ? '未找到匹配的会员' : '暂无会员'}</p>
						</div>
					) : (
						<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
							<table className="w-full">
								<thead className="bg-gray-50 border-b border-gray-200">
									<tr>
										<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">会员ID</th>
										<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">用户信息</th>
										<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">会员等级</th>
										<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">余额</th>
										<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">积分</th>
										<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">状态</th>
										<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">过期时间</th>
										<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">操作</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{filteredMembers.map((member) => (
										<tr key={member.id} className="hover:bg-gray-50">
											<td className="px-6 py-4">
												<span className="font-mono text-sm">{member.id.slice(0, 8)}...</span>
											</td>
											<td className="px-6 py-4">
												<div>
													<div className="font-medium text-gray-900">{member.userName || '-'}</div>
													<div className="text-sm text-gray-500">{member.userPhone || '-'}</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														member.memberLevel === 'premium'
															? 'bg-yellow-100 text-yellow-800'
															: member.memberLevel === 'vip'
															? 'bg-purple-100 text-purple-800'
															: 'bg-gray-100 text-gray-800'
													}`}
												>
													{member.memberLevel === 'premium' ? '高级会员' : member.memberLevel === 'vip' ? 'VIP会员' : '基础会员'}
												</span>
											</td>
											<td className="px-6 py-4 font-medium text-gray-900">
												¥{(member.balance / 100).toFixed(2)}
											</td>
											<td className="px-6 py-4 font-medium text-gray-900">
												{member.points}
											</td>
											<td className="px-6 py-4">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														member.memberStatus === 'active'
															? 'bg-green-100 text-green-800'
															: 'bg-red-100 text-red-800'
													}`}
												>
													{member.memberStatus === 'active' ? '正常' : '禁用'}
												</span>
											</td>
											<td className="px-6 py-4 text-sm text-gray-600">
												{member.expiresAt ? new Date(member.expiresAt).toLocaleDateString('zh-CN') : '永久'}
											</td>
											<td className="px-6 py-4">
												<div className="flex gap-2">
													<button
														onClick={() => handleViewMember(member)}
														className="text-blue-600 hover:text-blue-700 font-medium text-sm"
													>
														查看
													</button>
													<button
														onClick={() => handleEditMember(member)}
														className="text-green-600 hover:text-green-700 font-medium text-sm"
													>
														编辑
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}

			{/* User Detail Modal */}
			{isUserModalOpen && selectedUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl max-w-md w-full mx-4">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-gray-900">用户详情</h2>
								<button
									onClick={() => setIsUserModalOpen(false)}
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
			{isUserEditModalOpen && selectedUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl max-w-md w-full mx-4">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-gray-900">编辑用户</h2>
								<button
									onClick={() => setIsUserEditModalOpen(false)}
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
										value={userEditForm.name}
										onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										邮箱
									</label>
									<input
										type="email"
										value={userEditForm.email}
										onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									/>
								</div>

								<div className="flex items-center">
									<input
										type="checkbox"
										id="isAdmin"
										checked={userEditForm.isAdmin}
										onChange={(e) => setUserEditForm({ ...userEditForm, isAdmin: e.target.checked })}
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
										checked={userEditForm.isActive}
										onChange={(e) => setUserEditForm({ ...userEditForm, isActive: e.target.checked })}
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
									onClick={() => setIsUserEditModalOpen(false)}
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

			{/* Member Detail Modal */}
			{isMemberModalOpen && selectedMember && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl max-w-md w-full mx-4">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-gray-900">会员详情</h2>
								<button
									onClick={() => setIsMemberModalOpen(false)}
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
									<div className="text-sm text-gray-600">会员ID</div>
									<div className="font-mono text-sm">{selectedMember.id}</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-sm text-gray-600">用户姓名</div>
										<div className="font-medium">{selectedMember.userName || '-'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-600">用户手机</div>
										<div className="font-medium">{selectedMember.userPhone || '-'}</div>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-sm text-gray-600">会员等级</div>
										<div>
											{selectedMember.memberLevel === 'premium' ? '高级会员' : selectedMember.memberLevel === 'vip' ? 'VIP会员' : '基础会员'}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-600">状态</div>
										<div>
											{selectedMember.memberStatus === 'active' ? '正常' : '禁用'}
										</div>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-sm text-gray-600">余额</div>
										<div className="font-semibold text-lg">¥{(selectedMember.balance / 100).toFixed(2)}</div>
									</div>
									<div>
										<div className="text-sm text-gray-600">积分</div>
										<div className="font-semibold text-lg">{selectedMember.points}</div>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-sm text-gray-600">累计充值</div>
										<div>¥{(selectedMember.totalRecharge / 100).toFixed(2)}</div>
									</div>
									<div>
										<div className="text-sm text-gray-600">累计消费</div>
										<div>¥{(selectedMember.totalConsumption / 100).toFixed(2)}</div>
									</div>
								</div>

								<div>
									<div className="text-sm text-gray-600">过期时间</div>
									<div>{selectedMember.expiresAt ? new Date(selectedMember.expiresAt).toLocaleString('zh-CN') : '永久'}</div>
								</div>

								<div>
									<div className="text-sm text-gray-600">创建时间</div>
									<div>{new Date(selectedMember.createdAt).toLocaleString('zh-CN')}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Edit Member Modal */}
			{isMemberEditModalOpen && selectedMember && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl max-w-md w-full mx-4">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-gray-900">编辑会员信息</h2>
								<button
									onClick={() => setIsMemberEditModalOpen(false)}
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
										会员等级
									</label>
									<select
										value={memberEditForm.memberLevel}
										onChange={(e) => setMemberEditForm({ ...memberEditForm, memberLevel: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									>
										<option value="basic">基础会员</option>
										<option value="premium">高级会员</option>
										<option value="vip">VIP会员</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										余额（元）
									</label>
									<input
										type="number"
										value={memberEditForm.balance}
										onChange={(e) => setMemberEditForm({ ...memberEditForm, balance: parseFloat(e.target.value) || 0 })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										积分
									</label>
									<input
										type="number"
										value={memberEditForm.points}
										onChange={(e) => setMemberEditForm({ ...memberEditForm, points: parseInt(e.target.value) || 0 })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										状态
									</label>
									<select
										value={memberEditForm.memberStatus}
										onChange={(e) => setMemberEditForm({ ...memberEditForm, memberStatus: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									>
										<option value="active">正常</option>
										<option value="inactive">禁用</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										过期时间（留空表示永久）
									</label>
									<input
										type="date"
										value={memberEditForm.expiresAt}
										onChange={(e) => setMemberEditForm({ ...memberEditForm, expiresAt: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									/>
								</div>
							</div>
						</div>

						<div className="p-6 border-t border-gray-200">
							<div className="flex gap-3">
								<button
									onClick={() => setIsMemberEditModalOpen(false)}
									className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
								>
									取消
								</button>
								<button
									onClick={handleUpdateMember}
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
