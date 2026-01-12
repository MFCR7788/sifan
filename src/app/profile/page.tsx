'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User, Member } from '@/storage/database/shared/schema';

// 会员等级映射
const MEMBER_LEVEL_MAP: Record<string, string> = {
	basic: '基础会员',
	silver: '银牌会员',
	gold: '金牌会员',
	platinum: '白金会员',
	diamond: '钻石会员',
};

export default function ProfilePage() {
	const { user, logout, refreshUser, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
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

	// 交易记录弹窗状态
	const [showTransactionsModal, setShowTransactionsModal] = useState(false);
	const [transactionType, setTransactionType] = useState<'recharge' | 'consumption'>('recharge');
	const [transactions, setTransactions] = useState<any[]>([]);
	const [transactionsPage, setTransactionsPage] = useState(1);
	const [transactionsTotal, setTransactionsTotal] = useState(0);
	const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

	// 获取会员信息
	useEffect(() => {
		if (isAuthenticated && user) {
			fetchMemberInfo();
		}
	}, [isAuthenticated, user]);

	const fetchMemberInfo = async () => {
		try {
			console.log('=== 个人中心：获取会员信息 ===');
			console.log('当前用户:', user);
			console.log('浏览器Cookie:', document.cookie);

			const response = await fetch('/api/user/me/member', {
				credentials: 'include',
			});

			console.log('会员API响应状态:', response.status);

			if (response.ok) {
				const data = await response.json();
				console.log('会员数据:', data);
				if (data.member) {
					setMember(data.member);
				}
			} else {
				const errorData = await response.json();
				console.log('会员API错误:', errorData);
			}
		} catch (error) {
			console.error('Failed to fetch member:', error);
		} finally {
			setIsLoadingMember(false);
		}
	};

	// 获取交易记录
	const fetchTransactions = async (type: 'recharge' | 'consumption', page: number = 1) => {
		setIsLoadingTransactions(true);
		setTransactionType(type);
		setTransactionsPage(page);

		try {
			console.log('=== 获取交易记录 ===');
			console.log('交易类型:', type);
			console.log('页码:', page);

			const response = await fetch(
				`/api/user/me/member/transactions?type=${type}&page=${page}&limit=10`,
				{
					credentials: 'include',
				}
			);

			if (response.ok) {
				const data = await response.json();
				console.log('交易记录数据:', data);
				setTransactions(data.transactions);
				setTransactionsTotal(data.pagination?.total || 0);
			} else {
				console.error('获取交易记录失败:', response.status);
			}
		} catch (error) {
			console.error('Failed to fetch transactions:', error);
		} finally {
			setIsLoadingTransactions(false);
		}
	};

	// 处理点击累计充值
	const handleRechargeClick = () => {
		setShowTransactionsModal(true);
		fetchTransactions('recharge');
	};

	// 处理点击累计消费
	const handleConsumptionClick = () => {
		setShowTransactionsModal(true);
		fetchTransactions('consumption');
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
				credentials: 'include',
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
				credentials: 'include',
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

	const handleLogout = async () => {
		try {
			await logout();
			router.push('/');
		} catch (error) {
			console.error('Logout error:', error);
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
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-4xl font-semibold text-gray-900 mb-4">请先登录</h1>
					<Link
						href="/login"
						className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-all duration-200"
					>
						前往登录
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-[980px] mx-auto px-4 py-16">
				{/* Back Link */}
				<div className="mb-12">
					<Link
						href="/"
						className="text-xs text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 transition-colors"
					>
						← 首页
					</Link>
				</div>

				{/* Header */}
				<div className="mb-16">
					<h1 className="text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight mb-4">
						个人中心
					</h1>
					<p className="text-xl text-gray-600">
						管理您的账户信息
					</p>
				</div>

				{/* Messages */}
				{successMessage && (
					<div className="bg-green-50 text-green-700 px-6 py-4 rounded-lg mb-6">
						{successMessage}
					</div>
				)}

				{errorMessage && (
					<div className="bg-red-50 text-red-700 px-6 py-4 rounded-lg mb-6">
						{errorMessage}
					</div>
				)}

				{/* Tabs */}
				<div className="border-b border-gray-200 mb-12">
					<div className="flex gap-8">
						<button
							onClick={() => setActiveTab('info')}
							className={`pb-4 text-sm font-medium transition-all duration-200 ${
								activeTab === 'info'
									? 'text-gray-900 border-b-2 border-gray-900'
									: 'text-gray-600 hover:text-gray-900'
							}`}
						>
							个人信息
						</button>
						<button
							onClick={() => setActiveTab('member')}
							className={`pb-4 text-sm font-medium transition-all duration-200 ${
								activeTab === 'member'
									? 'text-gray-900 border-b-2 border-gray-900'
									: 'text-gray-600 hover:text-gray-900'
							}`}
						>
							会员信息
						</button>
						<button
							onClick={() => setActiveTab('password')}
							className={`pb-4 text-sm font-medium transition-all duration-200 ${
								activeTab === 'password'
									? 'text-gray-900 border-b-2 border-gray-900'
									: 'text-gray-600 hover:text-gray-900'
							}`}
						>
							修改密码
						</button>
					</div>
				</div>

				{/* Tab Content */}
				{activeTab === 'info' && (
					<div className="space-y-8">
						{isEditing ? (
							<div className="space-y-6">
								<div>
									<label className="block text-xs text-gray-600 mb-2">
										姓名
									</label>
									<input
										type="text"
										value={editForm.name || ''}
										onChange={(e) =>
											setEditForm({ ...editForm, name: e.target.value })
										}
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
									/>
								</div>
								<div>
									<label className="block text-xs text-gray-600 mb-2">
										邮箱
									</label>
									<input
										type="email"
										value={user?.email || ''}
										disabled
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
									/>
								</div>
								<div>
									<label className="block text-xs text-gray-600 mb-2">
										手机号码
									</label>
									<input
										type="tel"
										value={editForm.phone || ''}
										onChange={(e) =>
											setEditForm({ ...editForm, phone: e.target.value })
										}
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
									/>
								</div>
								<div className="flex gap-3">
									<button
										onClick={handleUpdateProfile}
										className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-all duration-200"
									>
										保存
									</button>
									<button
										onClick={() => {
											setIsEditing(false);
											if (user) {
												setEditForm({ name: user.name, phone: user.phone });
											}
										}}
										className="px-6 py-3 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-all duration-200"
									>
										取消
									</button>
								</div>
							</div>
						) : (
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="p-6 bg-gray-50 rounded-xl">
										<div className="text-xs text-gray-600 mb-2">姓名</div>
										<div className="text-2xl font-semibold text-gray-900">
											{user?.name}
										</div>
									</div>
									<div className="p-6 bg-gray-50 rounded-xl">
										<div className="text-xs text-gray-600 mb-2">邮箱</div>
										<div className="text-2xl font-semibold text-gray-900">
											{user?.email}
										</div>
									</div>
									<div className="p-6 bg-gray-50 rounded-xl">
										<div className="text-xs text-gray-600 mb-2">手机号码</div>
										<div className="text-2xl font-semibold text-gray-900">
											{user?.phone || '未设置'}
										</div>
									</div>
									<div className="p-6 bg-gray-50 rounded-xl">
										<div className="text-xs text-gray-600 mb-2">注册时间</div>
										<div className="text-2xl font-semibold text-gray-900">
											{user?.createdAt
												? new Date(user.createdAt).toLocaleDateString('zh-CN')
												: '-'}
										</div>
									</div>
								</div>
								<button
									onClick={() => setIsEditing(true)}
									className="bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 hover:scale-105 hover:shadow-lg transition-all duration-200"
								>
									编辑资料
								</button>
							</div>
						)}
					</div>
				)}

				{activeTab === 'member' && (
					<div className="space-y-8">
						{/* 会员等级 */}
						<div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl text-white">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-xs opacity-70 mb-2">会员等级</div>
									<div className="text-4xl font-semibold">
										{member?.memberLevel ? MEMBER_LEVEL_MAP[member.memberLevel] || '未知等级' : '未知等级'}
									</div>
								</div>
								<div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
									{member?.memberLevel ? member.memberLevel.toUpperCase() : 'UNKNOWN'}
								</div>
							</div>
						</div>

						{/* 会员详情 */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="p-6 bg-gray-50 rounded-xl">
								<div className="text-xs text-gray-600 mb-2">会员余额</div>
								<div className="text-3xl font-semibold text-gray-900">
									¥{member ? (member.balance / 100).toFixed(2) : '0.00'}
								</div>
							</div>
							<div className="p-6 bg-gray-50 rounded-xl">
								<div className="text-xs text-gray-600 mb-2">会员积分</div>
								<div className="text-3xl font-semibold text-gray-900">
									{member?.points.toLocaleString() || '0'}
								</div>
							</div>
							<button
								onClick={handleRechargeClick}
								className="p-6 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors text-left"
							>
								<div className="text-xs text-gray-600 mb-2">累计充值</div>
								<div className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
									¥{member ? (member.totalRecharge / 100).toFixed(2) : '0.00'}
									<span className="text-xs text-gray-500">点击查看</span>
								</div>
							</button>
							<button
								onClick={handleConsumptionClick}
								className="p-6 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors text-left"
							>
								<div className="text-xs text-gray-600 mb-2">累计消费</div>
								<div className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
									¥{member ? (member.totalConsumption / 100).toFixed(2) : '0.00'}
									<span className="text-xs text-gray-500">点击查看</span>
								</div>
							</button>
						</div>

						{/* 会员时间信息 */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
								<div className="text-xs text-gray-600 mb-1">会员创建时间</div>
								<div className="text-xl font-semibold text-gray-900">
									{member?.createdAt
										? new Date(member.createdAt).toLocaleDateString('zh-CN')
										: '-'}
								</div>
							</div>
							<div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
								<div className="text-xs text-gray-600 mb-1">会员过期时间</div>
								<div className="text-xl font-semibold text-gray-900">
									{member?.expiresAt
										? new Date(member.expiresAt).toLocaleDateString('zh-CN')
										: '永久'}
								</div>
							</div>
						</div>
					</div>
				)}

				{activeTab === 'password' && (
					<form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
						<div>
							<label className="block text-xs text-gray-600 mb-2">
								当前密码
							</label>
							<input
								type="password"
								required
								value={passwordForm.oldPassword}
								onChange={(e) =>
									setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
								}
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
							/>
						</div>
						<div>
							<label className="block text-xs text-gray-600 mb-2">
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
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
							/>
						</div>
						<div>
							<label className="block text-xs text-gray-600 mb-2">
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
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
							/>
						</div>
						<button
							type="submit"
							className="bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 hover:scale-105 hover:shadow-lg transition-all duration-200"
						>
							修改密码
						</button>
					</form>
				)}

				{/* Logout */}
				<div className="mt-16 pt-8 border-t border-gray-200">
					<button
						onClick={handleLogout}
						className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
					>
						退出登录
					</button>
				</div>

				{/* 交易记录弹窗 */}
				{showTransactionsModal && (
					<div
						className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
						onClick={() => setShowTransactionsModal(false)}
					>
						<div
							className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
							onClick={(e) => e.stopPropagation()}
						>
							{/* 弹窗标题 */}
							<div className="p-6 border-b border-gray-200">
								<div className="flex items-center justify-between">
									<h2 className="text-2xl font-semibold text-gray-900">
										{transactionType === 'recharge' ? '充值记录' : '消费记录'}
									</h2>
									<button
										onClick={() => setShowTransactionsModal(false)}
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							</div>

							{/* 交易记录列表 */}
							<div className="flex-1 overflow-y-auto p-6">
								{isLoadingTransactions ? (
									<div className="flex items-center justify-center h-64">
										<div className="text-gray-600">加载中...</div>
									</div>
								) : transactions.length === 0 ? (
									<div className="flex items-center justify-center h-64">
										<div className="text-gray-600">暂无记录</div>
									</div>
								) : (
									<div className="space-y-4">
										{transactions.map((transaction) => (
											<div
												key={transaction.id}
												className="p-4 bg-gray-50 rounded-xl border border-gray-200"
											>
												<div className="flex items-center justify-between mb-2">
													<div className="text-sm font-medium text-gray-900">
														{transaction.description || '无描述'}
													</div>
													<div className="text-sm font-semibold text-gray-900">
														¥{(transaction.amount / 100).toFixed(2)}
													</div>
												</div>
												<div className="flex items-center justify-between text-xs text-gray-600">
													<div>
														交易时间：{' '}
														{new Date(transaction.createdAt).toLocaleString('zh-CN')}
													</div>
													<div>
														余额：¥{(transaction.balanceAfter / 100).toFixed(2)}
													</div>
												</div>
												{transaction.status === 'completed' && (
													<div className="mt-2 text-xs text-green-600">
														交易成功
													</div>
												)}
											</div>
										))}
									</div>
								)}
							</div>

							{/* 分页 */}
							{transactionsTotal > 0 && (
								<div className="p-4 border-t border-gray-200 flex items-center justify-center gap-2">
									<button
										onClick={() =>
											fetchTransactions(transactionType, transactionsPage - 1)
										}
										disabled={transactionsPage === 1}
										className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										上一页
									</button>
									<span className="text-sm text-gray-600">
										第 {transactionsPage} 页
									</span>
									<button
										onClick={() =>
											fetchTransactions(transactionType, transactionsPage + 1)
										}
										disabled={transactionsPage * 10 >= transactionsTotal}
										className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										下一页
									</button>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
