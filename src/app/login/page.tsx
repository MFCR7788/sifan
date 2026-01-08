'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { login, isAdmin } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			await login(email, password);
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
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
								邮箱地址
							</label>
							<input
								id="email"
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
								placeholder="your@email.com"
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
