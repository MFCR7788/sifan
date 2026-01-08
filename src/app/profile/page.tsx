'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import type { User, Member } from '@/storage/database/shared/schema';

// 会员等级映射
const MEMBER_LEVEL_MAP: Record<string, string> = {
	basic: '基础会员',
	silver: '银牌会员',
	gold: '金牌会员',
	platinum: '白金会员',
	diamond: '钻石会员',
};

// 会员等级颜色
const MEMBER_LEVEL_COLOR: Record<string, string> = {
	basic: 'bg-gray-100 text-gray-700',
	silver: 'bg-gray-200 text-gray-800',
	gold: 'bg-yellow-100 text-yellow-700',
	platinum: 'bg-blue-100 text-blue-700',
	diamond: 'bg-purple-100 text-purple-700',
};

export default function ProfilePage() {
	const { user, logout, refreshUser, isAuthenticated, isLoading } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState<Partial<User>>({});
	const [activeTab, setActiveTab] = useState<'info' | 'member' | 'password'>('member');
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [passwordForm, setPasswordForm] = useState({
		oldPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [member, setMember] = useState<Member | null>(null);
	const [isLoadingMember, setIsLoadingMember] = useState(true);

	// 获取会员信息
	useEffect(() => {
		if (isAuthenticated && user) {
			fetchMemberInfo();
		}
	}, [isAuthenticated, user]);

	const fetchMemberInfo = async () => {
		try {
			console.log('开始获取会员信息...');
			const response = await fetch('/api/user/me/member');
			console.log('会员API响应状态:', response.status);

			if (response.ok) {
				const data = await response.json();
				console.log('会员API返回数据:', data);
				setMember(data.member);
			} else {
				const errorText = await response.text();
				console.error('会员API返回错误:', response.status, errorText);
			}
		} catch (error) {
			console.error('Failed to fetch member:', error);
		} finally {
			setIsLoadingMember(false);
		}
	};

	useEffect(() => {
		if (user) {
			setEditForm({ name: user.name, phone: user.phone });
		}
	}, [user]);

	const handleUpdateProfile = async () => {
		setSuccessMessage('');
		setErrorMessage('');

		try {
			const response = await fetch('/api/user/me/update', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editForm),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || '更新失败');
			}

			await refreshUser();
			setSuccessMessage('个人信息更新成功');
			setIsEditing(false);
		} catch (err: any) {
			setErrorMessage(err.message);
		}
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setSuccessMessage('');
		setErrorMessage('');

		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			setErrorMessage('两次输入的密码不一致');
			return;
		}

		if (passwordForm.newPassword.length < 6) {
			setErrorMessage('新密码至少6位');
			return;
		}

		try {
			const response = await fetch('/api/user/me/password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					oldPassword: passwordForm.oldPassword,
					newPassword: passwordForm.newPassword,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || '修改失败');
			}

			setSuccessMessage('密码修改成功');
			setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
		} catch (err: any) {
			setErrorMessage(err.message);
		}
	};

	if (isLoading || isLoadingMember) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-gray-600">加载中...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h1>
					<Link
						href="/login"
						className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
					>
						前往登录
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<Link
							href="/"
							className="text-gray-500 hover:text-gray-700 text-sm inline-flex items-center"
						>
							← 返回首页
						</Link>
					</div>

					<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
						<div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
							<h1 className="text-3xl font-bold mb-2">个人中心</h1>
							<p className="opacity-90">管理您的账户信息和设置</p>
						</div>

						{successMessage && (
							<div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 mx-8 mt-6 rounded-lg">
								{successMessage}
							</div>
						)}

						{errorMessage && (
							<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mx-8 mt-6 rounded-lg">
								{errorMessage}
							</div>
						)}

						<div className="p-8">
							<div className="flex space-x-4 border-b border-gray-200 mb-6">
								<button
									onClick={() => setActiveTab('info')}
									className={`pb-4 px-2 font-medium transition ${
										activeTab === 'info'
											? 'text-blue-600 border-b-2 border-blue-600'
											: 'text-gray-600 hover:text-gray-900'
									}`}
								>
									个人信息
								</button>
								<button
									onClick={() => setActiveTab('member')}
									className={`pb-4 px-2 font-medium transition ${
										activeTab === 'member'
											? 'text-blue-600 border-b-2 border-blue-600'
											: 'text-gray-600 hover:text-gray-900'
									}`}
								>
									会员信息
								</button>
								<button
									onClick={() => setActiveTab('password')}
									className={`pb-4 px-2 font-medium transition ${
										activeTab === 'password'
											? 'text-blue-600 border-b-2 border-blue-600'
											: 'text-gray-600 hover:text-gray-900'
									}`}
								>
									修改密码
								</button>
							</div>

							{activeTab === 'info' && (
								<div className="space-y-6">
									{isEditing ? (
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													姓名
												</label>
												<input
													type="text"
													value={editForm.name || ''}
													onChange={(e) =>
														setEditForm({ ...editForm, name: e.target.value })
													}
													className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													邮箱（不可修改）
												</label>
												<input
													type="email"
													value={user?.email || ''}
													disabled
													className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													手机号码
												</label>
												<input
													type="tel"
													value={editForm.phone || ''}
													onChange={(e) =>
														setEditForm({ ...editForm, phone: e.target.value })
													}
													className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
												/>
											</div>
											<div className="flex space-x-3">
												<button
													onClick={handleUpdateProfile}
													className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
												>
													保存更改
												</button>
												<button
													onClick={() => {
														setIsEditing(false);
														if (user) {
															setEditForm({ name: user.name, phone: user.phone });
														}
													}}
													className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
												>
													取消
												</button>
											</div>
										</div>
									) : (
										<div className="space-y-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<div className="bg-gray-50 p-6 rounded-lg">
													<div className="text-sm text-gray-600 mb-1">姓名</div>
													<div className="text-lg font-semibold text-gray-900">
														{user?.name}
													</div>
												</div>
												<div className="bg-gray-50 p-6 rounded-lg">
													<div className="text-sm text-gray-600 mb-1">邮箱</div>
													<div className="text-lg font-semibold text-gray-900">
														{user?.email}
													</div>
												</div>
												<div className="bg-gray-50 p-6 rounded-lg">
													<div className="text-sm text-gray-600 mb-1">手机号码</div>
													<div className="text-lg font-semibold text-gray-900">
														{user?.phone || '未设置'}
													</div>
												</div>
												<div className="bg-gray-50 p-6 rounded-lg">
													<div className="text-sm text-gray-600 mb-1">注册时间</div>
													<div className="text-lg font-semibold text-gray-900">
														{user?.createdAt
															? new Date(user.createdAt).toLocaleDateString('zh-CN')
															: '-'}
													</div>
												</div>
											</div>
											<button
												onClick={() => setIsEditing(true)}
												className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
											>
												编辑资料
											</button>
										</div>
									)}
								</div>
							)}

							{activeTab === 'member' && (
								<div className="space-y-6">
									{member ? (
										<>
											{/* 会员等级 */}
											<div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
												<div className="flex items-center justify-between">
													<div>
														<div className="text-sm opacity-90 mb-1">会员等级</div>
														<div className="text-2xl font-bold">
															{member.memberLevel ? MEMBER_LEVEL_MAP[member.memberLevel] || '未知等级' : '未知等级'}
														</div>
													</div>
													<div className={`px-4 py-2 rounded-full text-sm font-medium ${member.memberLevel ? MEMBER_LEVEL_COLOR[member.memberLevel] || 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'}`}>
														{member.memberLevel ? member.memberLevel.toUpperCase() : 'UNKNOWN'}
													</div>
												</div>
											</div>

											{/* 会员详情 */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<div className="bg-gray-50 p-6 rounded-lg">
													<div className="text-sm text-gray-600 mb-1">会员余额</div>
													<div className="text-2xl font-bold text-gray-900">
														¥{(member.balance / 100).toFixed(2)}
													</div>
												</div>
												<div className="bg-gray-50 p-6 rounded-lg">
													<div className="text-sm text-gray-600 mb-1">会员积分</div>
													<div className="text-2xl font-bold text-blue-600">
														{member.points.toLocaleString()}
													</div>
												</div>
												<div className="bg-gray-50 p-6 rounded-lg">
													<div className="text-sm text-gray-600 mb-1">累计充值</div>
													<div className="text-lg font-semibold text-gray-900">
														¥{(member.totalRecharge / 100).toFixed(2)}
													</div>
												</div>
												<div className="bg-gray-50 p-6 rounded-lg">
													<div className="text-sm text-gray-600 mb-1">累计消费</div>
													<div className="text-lg font-semibold text-gray-900">
														¥{(member.totalConsumption / 100).toFixed(2)}
													</div>
												</div>
												<div className="bg-gray-50 p-6 rounded-lg">
													<div className="text-sm text-gray-600 mb-1">会员状态</div>
													<div className="text-lg font-semibold text-green-600">
														{member.memberStatus === 'active' ? '正常' : member.memberStatus}
													</div>
												</div>
												<div className="bg-gray-50 p-6 rounded-lg">
													<div className="text-sm text-gray-600 mb-1">成为会员时间</div>
													<div className="text-lg font-semibold text-gray-900">
														{new Date(member.createdAt).toLocaleDateString('zh-CN')}
													</div>
												</div>
											</div>

											{/* 会员过期时间 */}
											{member.expiresAt && (
												<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
													<div className="flex items-center gap-2">
														<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
														</svg>
														<div>
															<div className="text-sm text-gray-600">会员过期时间</div>
															<div className="font-semibold text-blue-700">
																{new Date(member.expiresAt).toLocaleDateString('zh-CN')}
															</div>
														</div>
													</div>
												</div>
											)}
										</>
									) : (
										<div className="text-center py-12 bg-gray-50 rounded-lg">
											<div className="text-gray-500 mb-4">暂无会员信息</div>
											<p className="text-sm text-gray-400">请联系管理员开通会员</p>
										</div>
									)}
								</div>
							)}

							{activeTab === 'password' && (
								<form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											当前密码
										</label>
										<input
											type="password"
											required
											value={passwordForm.oldPassword}
											onChange={(e) =>
												setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
											}
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											新密码
										</label>
										<input
											type="password"
											required
											minLength={6}
											value={passwordForm.newPassword}
											onChange={(e) =>
												setPasswordForm({ ...passwordForm, newPassword: e.target.value })
											}
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											确认新密码
										</label>
										<input
											type="password"
											required
											minLength={6}
											value={passwordForm.confirmPassword}
											onChange={(e) =>
												setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
											}
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
										/>
									</div>
									<button
										type="submit"
										className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
									>
										修改密码
									</button>
								</form>
							)}
						</div>

						<div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
							<button
								onClick={logout}
								className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition"
							>
								退出登录
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
