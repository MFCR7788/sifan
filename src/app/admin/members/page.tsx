'use client';

import { useEffect, useState } from 'react';

export default function AdminMembersPage() {
	const [members, setMembers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedMember, setSelectedMember] = useState<any>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editForm, setEditForm] = useState({
		memberLevel: 'basic',
		balance: 0,
		points: 0,
		memberStatus: 'active',
		expiresAt: '',
	});

	useEffect(() => {
		fetchMembers();
	}, []);

	const fetchMembers = async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/admin/members', {
				credentials: 'include',
			});
			if (response.ok) {
				const data = await response.json();
				setMembers(data.members || []);
			}
		} catch (error) {
			console.error('Failed to fetch members:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleViewMember = (member: any) => {
		setSelectedMember(member);
		setIsModalOpen(true);
	};

	const handleEditMember = (member: any) => {
		setSelectedMember(member);
		setEditForm({
			memberLevel: member.memberLevel || 'basic',
			balance: member.balance || 0,
			points: member.points || 0,
			memberStatus: member.memberStatus || 'active',
			expiresAt: member.expiresAt ? member.expiresAt.split('T')[0] : '',
		});
		setIsEditModalOpen(true);
	};

	const handleUpdateMember = async () => {
		try {
			const response = await fetch(`/api/admin/members/${selectedMember.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					...editForm,
					balance: editForm.balance * 100, // 转换为分
					points: editForm.points,
				}),
			});

			if (response.ok) {
				setIsEditModalOpen(false);
				fetchMembers();
			} else {
				alert('更新会员信息失败');
			}
		} catch (error) {
			console.error('Failed to update member:', error);
			alert('更新会员信息失败');
		}
	};

	const filteredMembers = members.filter(member =>
		member.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		member.userPhone?.includes(searchTerm)
	);

	return (
		<div>
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-3xl font-bold text-gray-900">会员信息管理</h1>
			</div>

			{/* Search */}
			<div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
				<input
					type="text"
					placeholder="搜索会员（姓名、手机号）"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
				/>
			</div>

			{/* Members Table */}
			{loading ? (
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
				</div>
			) : filteredMembers.length === 0 ? (
				<div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
					<p className="text-gray-500">{searchTerm ? '未找到匹配的会员' : '暂无会员'}</p>
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

			{/* Member Detail Modal */}
			{isModalOpen && selectedMember && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl max-w-md w-full mx-4">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-gray-900">会员详情</h2>
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
			{isEditModalOpen && selectedMember && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl max-w-md w-full mx-4">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-gray-900">编辑会员信息</h2>
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
										会员等级
									</label>
									<select
										value={editForm.memberLevel}
										onChange={(e) => setEditForm({ ...editForm, memberLevel: e.target.value })}
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
										value={editForm.balance}
										onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) || 0 })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										积分
									</label>
									<input
										type="number"
										value={editForm.points}
										onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										状态
									</label>
									<select
										value={editForm.memberStatus}
										onChange={(e) => setEditForm({ ...editForm, memberStatus: e.target.value })}
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
										value={editForm.expiresAt}
										onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
									/>
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
