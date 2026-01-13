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
							<span>用户信息</span>
						</Link>
						<Link
							href="/admin/members"
							className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							<span>会员管理</span>
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
