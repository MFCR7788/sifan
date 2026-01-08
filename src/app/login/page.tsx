'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { login, isAdmin } = useAuth();
	const router = useRouter();

	// 页面加载时检查是否有保存的登录信息
	useEffect(() => {
		const savedPhone = localStorage.getItem('savedLoginPhone');
		const savedPassword = localStorage.getItem('savedLoginPassword');
		if (savedPhone && savedPassword) {
			setPhone(savedPhone);
			setPassword(savedPassword);
			setRememberMe(true);
		}
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			await login(phone, password);

			// 如果勾选了记住我，保存手机号和密码
			if (rememberMe) {
				localStorage.setItem('savedLoginPhone', phone);
				localStorage.setItem('savedLoginPassword', password);
			} else {
				localStorage.removeItem('savedLoginPhone');
				localStorage.removeItem('savedLoginPassword');
			}

			// 如果是admin，跳转到会员管理页面，否则跳转到首页
			if (isAdmin) {
				router.push('/admin/members');
			} else {
				router.push('/');
			}
		} catch (err: any) {
			setError(err.message || '登录失败');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-2xl shadow-xl p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来</h1>
						<p className="text-gray-600">登录您的账户</p>
					</div>

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
								手机号码
							</label>
							<input
								id="phone"
								type="tel"
								required
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
								placeholder="请输入手机号"
							/>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
								密码
							</label>
							<input
								id="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
								placeholder="••••••••"
							/>
						</div>

						<div className="flex items-center">
							<input
								id="rememberMe"
								type="checkbox"
								checked={rememberMe}
								onChange={(e) => setRememberMe(e.target.checked)}
								className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
							/>
							<label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
								记住我
							</label>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
						>
							{isLoading ? '登录中...' : '登录'}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-gray-600">
							还没有账户？{' '}
							<Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
								立即注册
							</Link>
						</p>
					</div>
				</div>

				<div className="mt-6 text-center">
					<Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
						← 返回首页
					</Link>
				</div>
			</div>
		</div>
	);
}
