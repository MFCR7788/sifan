'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, isAdmin, isLoading } = useAuth();
	const router = useRouter();
	const [sidebarOpen, setSidebarOpen] = useState(true);

	useEffect(() => {
		if (!isLoading) {
			if (!user || !isAdmin) {
				router.push('/login');
			}
		}
	}, [user, isAdmin, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (!user || !isAdmin) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Sidebar */}
			<aside
				className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-50 ${
					sidebarOpen ? 'w-64' : 'w-0'
				}`}
			>
				<div className="p-6">
					<h1 className="text-xl font-bold mb-8">管理后台</h1>
					<nav className="space-y-2">
						<Link
							href="/admin"
							className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
							</svg>
							<span>首页</span>
						</Link>
						<Link
							href="/admin/orders"
							className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
							<span>定制定单</span>
						</Link>
						<Link
							href="/admin/users"
							className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
							<span>用户管理</span>
						</Link>
						<div className="pt-4 pb-2">
							<p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">交易明细</p>
						</div>
						<Link
							href="/admin/transactions"
							className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 3.666v-3m0 0l-3 3m3-3l-3-3M3 21h18a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
							</svg>
							<span>交易明细</span>
						</Link>
						<div className="pt-4 pb-2">
							<p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">系统管理</p>
						</div>
						<Link
							href="/admin/knowledge-base"
							className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
							</svg>
							<span>知识库管理</span>
						</Link>
					</nav>
				</div>

				<div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
					<Link
						href="/"
						className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
						</svg>
						<span>返回前台</span>
					</Link>
				</div>
			</aside>

			{/* Main Content */}
			<main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
				{/* Header */}
				<header className="bg-white border-b border-gray-200 sticky top-0 z-40">
					<div className="flex items-center justify-between px-6 py-4">
						<div className="flex items-center gap-4">
							<button
								onClick={() => setSidebarOpen(!sidebarOpen)}
								className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								</svg>
							</button>
							<h2 className="text-xl font-semibold text-gray-900">管理后台</h2>
						</div>

						<div className="flex items-center gap-4">
							<div className="text-right">
								<div className="text-sm font-medium text-gray-900">{user?.name}</div>
								<div className="text-xs text-gray-500">管理员</div>
							</div>
						</div>
					</div>
				</header>

				{/* Content */}
				<div className="p-6">{children}</div>
			</main>
		</div>
	);
}
