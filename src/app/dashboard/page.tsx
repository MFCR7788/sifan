'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import OrderManagement from '@/components/dashboard/OrderManagement';
import CustomerManagement from '@/components/dashboard/CustomerManagement';
import SystemSettings from '@/components/dashboard/SystemSettings';
import StoreManagement from '@/components/dashboard/StoreManagement';
import ProductManagement from '@/components/dashboard/ProductManagement';
import InventoryManagement from '@/components/dashboard/InventoryManagement';
import DataStatistics from '@/components/dashboard/DataStatistics';
import FinancialManagement from '@/components/dashboard/FinancialManagement';

type TabType = 'overview' | 'orders' | 'customers' | 'settings' | 'stores' | 'products' | 'inventory' | 'statistics' | 'finance';

const tabs = [
	{ id: 'overview', label: '仪表盘', icon: '📊' },
	{ id: 'orders', label: '订单管理', icon: '📦' },
	{ id: 'customers', label: '客户管理', icon: '👥' },
	{ id: 'stores', label: '门店管理', icon: '🏪' },
	{ id: 'products', label: '商品管理', icon: '🛍️' },
	{ id: 'inventory', label: '进销存', icon: '📦' },
	{ id: 'statistics', label: '数据统计', icon: '📈' },
	{ id: 'finance', label: '财务管理', icon: '💰' },
	{ id: 'settings', label: '系统设置', icon: '⚙️' },
];

export default function DashboardPage() {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<TabType>('overview');
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-gray-600">加载中...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	const renderContent = () => {
		switch (activeTab) {
			case 'overview':
				return <DashboardOverview />;
			case 'orders':
				return <OrderManagement />;
			case 'customers':
				return <CustomerManagement />;
			case 'settings':
				return <SystemSettings />;
			case 'stores':
				return <StoreManagement />;
			case 'products':
				return <ProductManagement />;
			case 'inventory':
				return <InventoryManagement />;
			case 'statistics':
				return <DataStatistics />;
			case 'finance':
				return <FinancialManagement />;
			default:
				return <DashboardOverview />;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			<div className="flex min-h-screen">
				{/* Sidebar */}
				<aside
					className={`
						fixed lg:relative z-40 bg-white border-r border-gray-200
						transition-all duration-300 ease-in-out
						${isSidebarOpen ? 'w-64' : 'w-20'}
						${!isSidebarOpen ? '-translate-x-full lg:translate-x-0' : ''}
					`}
				>
					<div className="flex flex-col h-full">
						{/* Logo */}
						<div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
							{isSidebarOpen && (
								<div className="flex items-center gap-2">
									<img
										src="/小超人.png"
										alt="Logo"
										className="w-6 h-6"
									/>
									<span className="font-semibold text-gray-900">业务管理</span>
								</div>
							)}
							<button
								onClick={() => setIsSidebarOpen(!isSidebarOpen)}
								className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
							>
								✕
							</button>
						</div>

						{/* Navigation */}
						<nav className="flex-1 p-4 space-y-2 overflow-y-auto">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id as TabType)}
									className={`
										w-full flex items-center gap-3 px-4 py-3 rounded-lg
										transition-all duration-200
										${
											activeTab === tab.id
												? 'bg-blue-600 text-white'
												: 'text-gray-600 hover:bg-gray-100'
										}
									`}
								>
									<span className="text-xl">{tab.icon}</span>
									{isSidebarOpen && (
										<span className="font-medium">{tab.label}</span>
									)}
								</button>
							))}
						</nav>

						{/* User Info */}
						{isSidebarOpen && (
							<div className="p-4 border-t border-gray-200">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
										{useAuth().user?.name?.charAt(0) || 'U'}
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-gray-900 truncate">
											{useAuth().user?.name || '用户'}
										</div>
										<div className="text-sm text-gray-500 truncate">
											{useAuth().user?.email || ''}
										</div>
									</div>
								</div>
								<a
									href="/profile"
									className="mt-3 block text-center text-sm text-gray-600 hover:text-blue-600"
								>
									个人中心
								</a>
							</div>
						)}
					</div>
				</aside>

				{/* Overlay for mobile */}
				{isSidebarOpen && (
					<div
						className="fixed inset-0 bg-black/50 z-30 lg:hidden"
						onClick={() => setIsSidebarOpen(false)}
					/>
				)}

				{/* Main Content */}
				<main className="flex-1 flex flex-col min-w-0">
					{/* Header */}
					<header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
						<div className="flex items-center gap-4">
							<button
								onClick={() => setIsSidebarOpen(!isSidebarOpen)}
								className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
							>
								☰
							</button>
							<h1 className="text-xl font-semibold text-gray-900">
								{tabs.find((t) => t.id === activeTab)?.label}
							</h1>
						</div>
						<div className="flex items-center gap-3">
							<a
								href="/"
								className="text-sm text-gray-600 hover:text-gray-900"
							>
								返回首页
							</a>
						</div>
					</header>

					{/* Content */}
					<div className="flex-1 p-6 overflow-auto">
						{renderContent()}
					</div>
				</main>
			</div>
		</div>
	);
}
