'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import type { User } from '@/storage/database/shared/schema';

export default function ProfilePage() {
	const { user, logout, refreshUser, isAuthenticated, isLoading } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState<Partial<User>>({});
	const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [passwordForm, setPasswordForm] = useState({
		oldPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

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

	if (isLoading) {
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
