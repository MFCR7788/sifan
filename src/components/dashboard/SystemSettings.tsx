'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SystemSettings() {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState('general');
	const [settings, setSettings] = useState({
		companyName: '魔法小超人科技有限公司',
		companyEmail: 'contact@magic-superman.com',
		companyPhone: '400-123-4567',
		companyAddress: '北京市朝阳区科技园区',
		notificationEmail: true,
		notificationSMS: false,
		notificationPush: true,
		theme: 'light',
		language: 'zh-CN',
		timezone: 'Asia/Shanghai',
	});

	const handleSave = () => {
		// TODO: Implement save functionality
		alert('设置已保存');
	};

	const settingsTabs = [
		{ id: 'general', label: '通用设置', icon: '⚙️' },
		{ id: 'notifications', label: '通知设置', icon: '🔔' },
		{ id: 'security', label: '安全设置', icon: '🔒' },
		{ id: 'about', label: '关于', icon: 'ℹ️' },
	];

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-gray-900">系统设置</h2>

			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
				<div className="flex flex-col md:flex-row">
					{/* Settings Tabs */}
					<div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200">
						<nav className="p-4 space-y-1">
							{settingsTabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`
										w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
										${
											activeTab === tab.id
												? 'bg-blue-50 text-blue-700 font-medium'
												: 'text-gray-600 hover:bg-gray-50'
										}
									`}
								>
									<span className="text-xl">{tab.icon}</span>
									<span>{tab.label}</span>
								</button>
							))}
						</nav>
					</div>

					{/* Settings Content */}
					<div className="flex-1 p-6">
						{activeTab === 'general' && (
							<div className="space-y-6">
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4">公司信息</h3>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												公司名称
											</label>
											<input
												type="text"
												value={settings.companyName}
												onChange={(e) =>
													setSettings({ ...settings, companyName: e.target.value })
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												公司邮箱
											</label>
											<input
												type="email"
												value={settings.companyEmail}
												onChange={(e) =>
													setSettings({ ...settings, companyEmail: e.target.value })
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												联系电话
											</label>
											<input
												type="tel"
												value={settings.companyPhone}
												onChange={(e) =>
													setSettings({ ...settings, companyPhone: e.target.value })
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												公司地址
											</label>
											<textarea
												value={settings.companyAddress}
												onChange={(e) =>
													setSettings({ ...settings, companyAddress: e.target.value })
												}
												rows={3}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
											/>
										</div>
									</div>
								</div>

								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4">偏好设置</h3>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												主题
											</label>
											<select
												value={settings.theme}
												onChange={(e) =>
													setSettings({ ...settings, theme: e.target.value })
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											>
												<option value="light">浅色</option>
												<option value="dark">深色</option>
												<option value="auto">跟随系统</option>
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												语言
											</label>
											<select
												value={settings.language}
												onChange={(e) =>
													setSettings({ ...settings, language: e.target.value })
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											>
												<option value="zh-CN">简体中文</option>
												<option value="zh-TW">繁體中文</option>
												<option value="en">English</option>
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												时区
											</label>
											<select
												value={settings.timezone}
												onChange={(e) =>
													setSettings({ ...settings, timezone: e.target.value })
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											>
												<option value="Asia/Shanghai">上海 (UTC+8)</option>
												<option value="America/New_York">纽约 (UTC-5)</option>
												<option value="Europe/London">伦敦 (UTC+0)</option>
											</select>
										</div>
									</div>
								</div>

								<div className="pt-4">
									<button
										onClick={handleSave}
										className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
									>
										保存设置
									</button>
								</div>
							</div>
						)}

						{activeTab === 'notifications' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">通知偏好</h3>
								<div className="space-y-4">
									<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
										<div>
											<div className="font-medium text-gray-900">邮件通知</div>
											<div className="text-sm text-gray-600">
												接收重要更新和订单提醒
											</div>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={settings.notificationEmail}
												onChange={(e) =>
													setSettings({
														...settings,
														notificationEmail: e.target.checked,
													})
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
										</label>
									</div>
									<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
										<div>
											<div className="font-medium text-gray-900">短信通知</div>
											<div className="text-sm text-gray-600">
												接收重要紧急消息通知
											</div>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={settings.notificationSMS}
												onChange={(e) =>
													setSettings({
														...settings,
														notificationSMS: e.target.checked,
													})
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
										</label>
									</div>
									<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
										<div>
											<div className="font-medium text-gray-900">推送通知</div>
											<div className="text-sm text-gray-600">
												在浏览器中接收推送通知
											</div>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={settings.notificationPush}
												onChange={(e) =>
													setSettings({
														...settings,
														notificationPush: e.target.checked,
													})
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
										</label>
									</div>
								</div>

								<div className="pt-4">
									<button
										onClick={handleSave}
										className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
									>
										保存设置
									</button>
								</div>
							</div>
						)}

						{activeTab === 'security' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">安全设置</h3>

								<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
									<div className="flex items-start gap-3">
										<span className="text-2xl">🔐</span>
										<div>
											<div className="font-medium text-blue-900">
												两步验证（推荐）
											</div>
											<div className="text-sm text-blue-700 mt-1">
												为您的账户添加额外的安全保护层
											</div>
											<button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
												启用两步验证
											</button>
										</div>
									</div>
								</div>

								<div className="space-y-4">
									<div>
										<h4 className="font-medium text-gray-900 mb-2">登录信息</h4>
										<div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-600">当前用户</span>
												<span className="text-gray-900">{user?.email}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">上次登录</span>
												<span className="text-gray-900">刚刚</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">登录IP</span>
												<span className="text-gray-900">127.0.0.1</span>
											</div>
										</div>
									</div>

									<div>
										<h4 className="font-medium text-gray-900 mb-2">密码管理</h4>
										<a
											href="/profile"
											className="inline-block px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
										>
											修改密码
										</a>
									</div>
								</div>
							</div>
						)}

						{activeTab === 'about' && (
							<div className="space-y-6">
								<div className="text-center py-8">
									<img
										src="/小超人.png"
										alt="Logo"
										className="w-20 h-20 mx-auto mb-4"
									/>
									<h3 className="text-2xl font-bold text-gray-900">魔法小超人业务管理系统</h3>
									<p className="text-gray-600 mt-2">版本 1.0.0</p>
								</div>

								<div className="space-y-4">
									<div>
										<h4 className="font-medium text-gray-900 mb-2">系统信息</h4>
										<div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-600">前端框架</span>
												<span className="text-gray-900">Next.js 16</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">UI库</span>
												<span className="text-gray-900">Tailwind CSS 4</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">数据库</span>
												<span className="text-gray-900">PostgreSQL</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">构建时间</span>
												<span className="text-gray-900">2024-01-06</span>
											</div>
										</div>
									</div>

									<div>
										<h4 className="font-medium text-gray-900 mb-2">支持</h4>
										<div className="space-y-2">
											<a
												href="/contact"
												className="block px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
											>
												📧 联系我们
											</a>
											<a
												href="#"
												className="block px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
											>
												📚 使用文档
											</a>
											<a
												href="#"
												className="block px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
											>
												💬 在线支持
											</a>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
