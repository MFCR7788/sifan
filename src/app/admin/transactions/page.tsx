'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Transaction {
	id: string;
	memberId: string;
	memberName?: string;
	memberPhone?: string;
	transactionType: string;
	amount: number;
	balanceBefore: number;
	balanceAfter: number;
	pointsBefore: number;
	pointsAfter: number;
	description: string;
	status: string;
	paymentMethod: string;
	paymentTransactionId: string;
	createdAt: string;
	completedAt: string;
}

export default function TransactionsPage() {
	const { user } = useAuth();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
	const [typeFilter, setTypeFilter] = useState<'all' | 'recharge' | 'membership_purchase' | 'points_purchase' | 'service_use'>('all');
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// 获取认证头
	const getAuthHeaders = () => {
		const headers: Record<string, string> = {};
		if (user?.id) {
			headers['x-user-id'] = user.id;
		}
		return headers;
	};

	useEffect(() => {
		fetchTransactions();
	}, [statusFilter, typeFilter]);

	const fetchTransactions = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (statusFilter !== 'all') params.append('status', statusFilter);
			if (typeFilter !== 'all') params.append('transactionType', typeFilter);

			const url = `/api/admin/transactions?${params.toString()}`;
			const response = await fetch(url, {
				credentials: 'include',
				headers: getAuthHeaders(),
			});
			if (response.ok) {
				const data = await response.json();
				setTransactions(data.transactions || []);
			}
		} catch (error) {
			console.error('Failed to fetch transactions:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleViewDetail = (transaction: Transaction) => {
		setSelectedTransaction(transaction);
		setIsModalOpen(true);
	};

	const filteredTransactions = transactions.filter(t =>
		(t.memberName && t.memberName.toLowerCase().includes(searchTerm.toLowerCase())) ||
		(t.memberPhone && t.memberPhone.includes(searchTerm)) ||
		t.paymentTransactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		t.description?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const formatAmount = (amount: number) => {
		return (amount / 100).toFixed(2);
	};

	const getTransactionTypeText = (type: string) => {
		const typeMap: Record<string, string> = {
			'recharge': '余额充值',
			'membership_purchase': '购买会员',
			'points_purchase': '购买积分',
			'service_use': '服务消费',
		};
		return typeMap[type] || type;
	};

	const getTransactionTypeColor = (type: string) => {
		const colorMap: Record<string, string> = {
			'recharge': 'bg-blue-100 text-blue-800',
			'membership_purchase': 'bg-purple-100 text-purple-800',
			'points_purchase': 'bg-green-100 text-green-800',
			'service_use': 'bg-orange-100 text-orange-800',
		};
		return colorMap[type] || 'bg-gray-100 text-gray-800';
	};

	const isRecharge = (type: string) => {
		return type === 'recharge';
	};

	return (
		<div>
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">交易明细</h1>
					<p className="text-sm text-gray-600 mt-1">查看所有会员交易记录（充值与消费）</p>
				</div>
			</div>

			{/* Status Filter Tabs */}
			<div className="bg-white rounded-xl p-2 border border-gray-200 mb-4">
				<div className="flex gap-2">
					{(['all', 'pending', 'completed', 'failed'] as const).map((status) => (
						<button
							key={status}
							onClick={() => setStatusFilter(status)}
							className={`px-4 py-2 rounded-lg font-medium transition-colors ${
								statusFilter === status
									? 'bg-gray-900 text-white'
									: 'text-gray-600 hover:bg-gray-100'
							}`}
						>
							{status === 'all' ? '全部' : status === 'pending' ? '待处理' : status === 'completed' ? '已完成' : '失败'}
						</button>
					))}
				</div>
			</div>

			{/* Type Filter Tabs */}
			<div className="bg-white rounded-xl p-2 border border-gray-200 mb-6">
				<div className="flex gap-2 flex-wrap">
					{(['all', 'recharge', 'membership_purchase', 'points_purchase', 'service_use'] as const).map((type) => (
						<button
							key={type}
							onClick={() => setTypeFilter(type)}
							className={`px-4 py-2 rounded-lg font-medium transition-colors ${
								typeFilter === type
									? 'bg-gray-900 text-white'
									: 'text-gray-600 hover:bg-gray-100'
							}`}
						>
							{type === 'all' ? '全部类型' : type === 'recharge' ? '余额充值' : type === 'membership_purchase' ? '购买会员' : type === 'points_purchase' ? '购买积分' : '服务消费'}
						</button>
					))}
				</div>
			</div>

			{/* Search */}
			<div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
				<input
					type="text"
					placeholder="搜索（会员姓名、手机号、交易ID、描述）"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
				/>
			</div>

			{/* Transactions Table */}
			{loading ? (
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
				</div>
			) : filteredTransactions.length === 0 ? (
				<div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
					<p className="text-gray-500">{searchTerm ? '未找到匹配的交易记录' : '暂无交易记录'}</p>
				</div>
			) : (
				<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">交易ID</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">会员信息</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">交易类型</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">金额</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">余额变动</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">支付方式</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">状态</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">创建时间</th>
								<th className="text-left px-6 py-4 text-sm font-medium text-gray-600">操作</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{filteredTransactions.map((transaction) => (
								<tr key={transaction.id} className="hover:bg-gray-50">
									<td className="px-6 py-4">
										<span className="font-mono text-sm">{transaction.id.slice(0, 8)}...</span>
									</td>
									<td className="px-6 py-4">
										<div>
											<div className="font-medium text-gray-900">{transaction.memberName || '-'}</div>
											<div className="text-sm text-gray-500">{transaction.memberPhone || '-'}</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.transactionType)}`}
										>
											{getTransactionTypeText(transaction.transactionType)}
										</span>
									</td>
									<td className="px-6 py-4 font-medium">
										<span className="text-green-600">
											+¥{formatAmount(transaction.amount)}
										</span>
									</td>
									<td className="px-6 py-4 text-sm text-gray-600">
										¥{formatAmount(transaction.balanceBefore)} → ¥{formatAmount(transaction.balanceAfter)}
									</td>
									<td className="px-6 py-4 text-sm text-gray-600">
										{transaction.paymentMethod || '-'}
									</td>
									<td className="px-6 py-4">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												transaction.status === 'completed'
													? 'bg-green-100 text-green-800'
													: transaction.status === 'failed'
													? 'bg-red-100 text-red-800'
													: 'bg-yellow-100 text-yellow-800'
											}`}
										>
											{transaction.status === 'completed' ? '已完成' : transaction.status === 'failed' ? '失败' : '待处理'}
										</span>
									</td>
									<td className="px-6 py-4 text-sm text-gray-600">
										{new Date(transaction.createdAt).toLocaleString('zh-CN')}
									</td>
									<td className="px-6 py-4">
										<button
											onClick={() => handleViewDetail(transaction)}
											className="text-blue-600 hover:text-blue-700 font-medium text-sm"
										>
											查看详情
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Transaction Detail Modal */}
			{isModalOpen && selectedTransaction && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-gray-900">
									{isRecharge(selectedTransaction.transactionType) ? '充值详情' : '消费详情'}
								</h2>
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
									<div className="text-sm text-gray-600">交易ID</div>
									<div className="font-mono text-sm">{selectedTransaction.id}</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-sm text-gray-600">会员姓名</div>
										<div className="font-medium">{selectedTransaction.memberName || '-'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-600">手机号</div>
										<div className="font-medium">{selectedTransaction.memberPhone || '-'}</div>
									</div>
								</div>

								<div>
									<div className="text-sm text-gray-600">交易类型</div>
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											isRecharge(selectedTransaction.transactionType)
												? 'bg-green-100 text-green-800'
												: 'bg-gray-100 text-gray-800'
										}`}
									>
										{getTransactionTypeText(selectedTransaction.transactionType)}
									</span>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-sm text-gray-600">交易金额</div>
										<div
											className={`font-bold text-xl ${
												isRecharge(selectedTransaction.transactionType)
													? 'text-green-600'
													: 'text-red-600'
											}`}
										>
											{isRecharge(selectedTransaction.transactionType) ? '+' : '-'}¥{formatAmount(selectedTransaction.amount)}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-600">交易状态</div>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												selectedTransaction.status === 'completed'
													? 'bg-green-100 text-green-800'
													: selectedTransaction.status === 'failed'
													? 'bg-red-100 text-red-800'
													: 'bg-yellow-100 text-yellow-800'
											}`}
										>
											{selectedTransaction.status === 'completed' ? '已完成' : selectedTransaction.status === 'failed' ? '失败' : '待处理'}
										</span>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-sm text-gray-600">交易前余额</div>
										<div className="font-medium">¥{formatAmount(selectedTransaction.balanceBefore)}</div>
									</div>
									<div>
										<div className="text-sm text-gray-600">交易后余额</div>
										<div className="font-medium">¥{formatAmount(selectedTransaction.balanceAfter)}</div>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-sm text-gray-600">交易前积分</div>
										<div className="font-medium">{selectedTransaction.pointsBefore}</div>
									</div>
									<div>
										<div className="text-sm text-gray-600">交易后积分</div>
										<div className="font-medium">{selectedTransaction.pointsAfter}</div>
									</div>
								</div>

								{selectedTransaction.paymentMethod && (
									<div>
										<div className="text-sm text-gray-600">支付方式</div>
										<div className="font-medium">{selectedTransaction.paymentMethod}</div>
									</div>
								)}

								{selectedTransaction.paymentTransactionId && (
									<div>
										<div className="text-sm text-gray-600">支付交易ID</div>
										<div className="font-mono text-sm">{selectedTransaction.paymentTransactionId}</div>
									</div>
								)}

								{selectedTransaction.description && (
									<div>
										<div className="text-sm text-gray-600">交易描述</div>
										<div className="font-medium">{selectedTransaction.description}</div>
									</div>
								)}

								<div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
									<div>
										<div className="text-sm text-gray-600">创建时间</div>
										<div className="text-sm">{new Date(selectedTransaction.createdAt).toLocaleString('zh-CN')}</div>
									</div>
									{selectedTransaction.completedAt && (
										<div>
											<div className="text-sm text-gray-600">完成时间</div>
											<div className="text-sm">{new Date(selectedTransaction.completedAt).toLocaleString('zh-CN')}</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
