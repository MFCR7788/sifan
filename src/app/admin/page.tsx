'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
	const { user } = useAuth();
	const [stats, setStats] = useState({
		totalOrders: 0,
		totalUsers: 0,
		totalMembers: 0,
		totalRecharge: 0,
		totalConsumption: 0,
		totalRevenue: 0,
	});
	const [loading, setLoading] = useState(true);

	// 获取认证头（用于解决嵌入式页面 Cookie 不传递的问题）
	const getAuthHeaders = () => {
		const headers: Record<string, string> = {};
		if (user?.id) {
			headers['x-user-id'] = user.id;
		}
		return headers;
	};

	useEffect(() => {
		fetchDashboardStats();
	}, []);

	const fetchDashboardStats = async () => {
		try {
			const response = await fetch('/api/admin/stats', {
				credentials: 'include',
				headers: getAuthHeaders(),
			});
			if (response.ok) {
				const data = await response.json();
				setStats(data);
			}
		} catch (error) {
			console.error('Failed to fetch stats:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h1 className="text-3xl font-bold text-gray-900 mb-8">数据概览</h1>

			{loading ? (
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
					{/* Total Orders */}
					<Link href="/admin/orders" className="block">
						<div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">定制定单</p>
									<p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
								</div>
								<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
								</div>
							</div>
						</div>
					</Link>

					{/* Total Users */}
					<Link href="/admin/users" className="block">
						<div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">用户总数</p>
									<p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
								</div>
								<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
									</svg>
								</div>
							</div>
						</div>
					</Link>

					{/* Total Members */}
					<Link href="/admin/members" className="block">
						<div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">会员总数</p>
									<p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
								</div>
								<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
							</div>
						</div>
					</Link>

					{/* Total Recharge */}
					<Link href="/admin/transactions" className="block">
						<div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">总充值</p>
									<p className="text-3xl font-bold text-gray-900">¥{stats.totalRecharge}</p>
								</div>
								<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
									</svg>
								</div>
							</div>
						</div>
					</Link>

					{/* Total Consumption */}
					<Link href="/admin/transactions" className="block">
						<div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">总消费</p>
									<p className="text-3xl font-bold text-gray-900">¥{stats.totalConsumption}</p>
								</div>
								<div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
									</svg>
								</div>
							</div>
						</div>
					</Link>

					{/* Total Revenue */}
					<div className="bg-white rounded-xl p-6 border border-gray-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">总收入</p>
								<p className="text-3xl font-bold text-gray-900">¥{stats.totalRevenue}</p>
							</div>
							<div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Quick Actions */}
			<div className="bg-white rounded-xl p-6 border border-gray-200">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">快捷操作</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Link
						href="/admin/orders"
						className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						<span>新建定制定单</span>
					</Link>
					<Link
						href="/admin/users"
						className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
						<span>管理用户</span>
					</Link>
					<Link
						href="/admin/members"
						className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						<span>管理会员</span>
					</Link>
				</div>
			</div>
		</div>
	);
}
