'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { Member } from '@/storage/database/shared/schema';
import type { User } from '@/storage/database/shared/schema';

interface MemberWithUser extends Member {
	user: User | null;
}

// 会员等级映射
const MEMBER_LEVEL_MAP: Record<string, string> = {
	basic: '基础会员',
	silver: '银牌会员',
	gold: '金牌会员',
	platinum: '白金会员',
	diamond: '钻石会员',
};

// 会员状态映射
const MEMBER_STATUS_MAP: Record<string, string> = {
	active: '正常',
	suspended: '已冻结',
	expired: '已过期',
};

export default function AdminMembersPage() {
	const { user, isAdmin, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const [members, setMembers] = useState<MemberWithUser[]>([]);
	const [isLoadingMembers, setIsLoadingMembers] = useState(true);
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [editingMember, setEditingMember] = useState<MemberWithUser | null>(null);
	const [editForm, setEditForm] = useState<Partial<Member>>({});

	// 验证权限
	useEffect(() => {
		if (!isLoading) {
			if (!isAuthenticated || !isAdmin) {
				router.push('/');
			}
		}
	}, [isLoading, isAuthenticated, isAdmin, router]);

	// 获取会员列表
	useEffect(() => {
		if (isAdmin) {
			fetchMembers();
		}
	}, [isAdmin]);

	const fetchMembers = async () => {
		try {
			setIsLoadingMembers(true);
			const response = await fetch('/api/admin/members');
			if (response.ok) {
				const data = await response.json();
				setMembers(data.members);
			} else {
				const data = await response.json();
				setError(data.error || '获取会员列表失败');
			}
		} catch (err: any) {
			setError(err.message || '获取会员列表失败');
		} finally {
			setIsLoadingMembers(false);
		}
	};

	const handleEdit = (member: MemberWithUser) => {
		setEditingMember(member);
		setEditForm({
			memberLevel: member.memberLevel,
			memberStatus: member.memberStatus,
			balance: member.balance,
			points: member.points,
		});
	};

	const handleUpdate = async () => {
		if (!editingMember) return;

		try {
			const response = await fetch('/api/admin/members', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					memberId: editingMember.id,
					...editForm,
				}),
			});

			if (response.ok) {
				setSuccessMessage('会员信息更新成功');
				setEditingMember(null);
				setEditForm({});
				fetchMembers();
				setTimeout(() => setSuccessMessage(''), 3000);
			} else {
				const data = await response.json();
				setError(data.error || '更新失败');
			}
		} catch (err: any) {
			setError(err.message || '更新失败');
		}
	};

	if (isLoading || isLoadingMembers) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-gray-600">加载中...</div>
			</div>
		);
	}

	if (!isAuthenticated || !isAdmin) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-7xl mx-auto">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">会员管理</h1>
						<p className="text-gray-600">管理所有会员信息和账户状态</p>
					</div>

					{successMessage && (
						<div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
							{successMessage}
						</div>
					)}

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
							{error}
						</div>
					)}

					<div className="bg-white rounded-xl shadow-xl overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 border-b border-gray-200">
									<tr>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											会员信息
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											等级
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											余额
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											积分
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											状态
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											累计充值
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											累计消费
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											注册时间
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											操作
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{members.map((member) => (
										<tr key={member.id} className="hover:bg-gray-50 transition">
											<td className="px-6 py-4">
												<div>
													<div className="text-sm font-semibold text-gray-900">
														{member.user?.name || '-'}
													</div>
													<div className="text-sm text-gray-500">
														{member.user?.email || '-'}
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
													{member.memberLevel ? MEMBER_LEVEL_MAP[member.memberLevel] || '未知' : '未知'}
												</span>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm font-medium text-gray-900">
													¥{(member.balance / 100).toFixed(2)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm font-medium text-blue-600">
													{member.points.toLocaleString()}
												</div>
											</td>
											<td className="px-6 py-4">
												<span
													className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
														member.memberStatus === 'active'
															? 'bg-green-100 text-green-700'
															: member.memberStatus === 'suspended'
															? 'bg-yellow-100 text-yellow-700'
															: 'bg-red-100 text-red-700'
													}`}
												>
													{member.memberStatus ? MEMBER_STATUS_MAP[member.memberStatus] || member.memberStatus : member.memberStatus}
												</span>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm text-gray-900">
													¥{(member.totalRecharge / 100).toFixed(2)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm text-gray-900">
													¥{(member.totalConsumption / 100).toFixed(2)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm text-gray-500">
													{new Date(member.createdAt).toLocaleDateString('zh-CN')}
												</div>
											</td>
											<td className="px-6 py-4">
												<button
													onClick={() => handleEdit(member)}
													className="text-blue-600 hover:text-blue-700 text-sm font-medium"
												>
													编辑
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{members.length === 0 && (
							<div className="text-center py-12">
								<div className="text-gray-500">暂无会员数据</div>
							</div>
						)}
					</div>

					{/* 编辑弹窗 */}
					{editingMember && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
							<div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
								<h3 className="text-xl font-bold text-gray-900 mb-6">编辑会员信息</h3>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											会员姓名
										</label>
										<input
											type="text"
											value={editingMember.user?.name || ''}
											disabled
											className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											会员等级
										</label>
										<select
											value={editForm.memberLevel || 'basic'}
											onChange={(e) =>
												setEditForm({ ...editForm, memberLevel: e.target.value })
											}
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
										>
											<option value="basic">基础会员</option>
											<option value="silver">银牌会员</option>
											<option value="gold">金牌会员</option>
											<option value="platinum">白金会员</option>
											<option value="diamond">钻石会员</option>
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											会员状态
										</label>
										<select
											value={editForm.memberStatus || 'active'}
											onChange={(e) =>
												setEditForm({ ...editForm, memberStatus: e.target.value })
											}
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
										>
											<option value="active">正常</option>
											<option value="suspended">已冻结</option>
											<option value="expired">已过期</option>
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											余额（分）
										</label>
										<input
											type="number"
											min="0"
											value={editForm.balance || 0}
											onChange={(e) =>
												setEditForm({ ...editForm, balance: parseInt(e.target.value) || 0 })
											}
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											积分
										</label>
										<input
											type="number"
											min="0"
											value={editForm.points || 0}
											onChange={(e) =>
												setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })
											}
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
										/>
									</div>
								</div>

								<div className="flex space-x-3 mt-6">
									<button
										onClick={handleUpdate}
										className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
									>
										保存
									</button>
									<button
										onClick={() => {
											setEditingMember(null);
											setEditForm({});
										}}
										className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
									>
										取消
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
