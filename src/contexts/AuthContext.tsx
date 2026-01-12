'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User } from '@/storage/database/shared/schema';

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	isAdmin: boolean;
	login: (phone: string, password: string) => Promise<void>;
	register: (data: {
		phone: string;
		name: string;
		password: string;
		email?: string;
		avatar?: string;
	}) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const isAuthenticated = !!user;
	const isAdmin = user?.isAdmin || false;

	// 获取请求头配置（包含自定义 userId header）
	const getAuthHeaders = () => {
		const headers: Record<string, string> = {};
		// 备选方案：从 sessionStorage 读取 userId，添加到 header
		const sessionUserId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
		if (sessionUserId) {
			headers['x-user-id'] = sessionUserId;
		}
		return headers;
	};

	// 获取当前用户信息
	const refreshUser = useCallback(async () => {
		try {
			const headers = getAuthHeaders();
			const response = await fetch('/api/user/me', {
				credentials: 'include',
				headers,
			});

			if (response.ok) {
				const data = await response.json();
				setUser(data.user);
				// 同步 userId 到 sessionStorage（备选方案）
				if (typeof window !== 'undefined' && data.user?.id) {
					sessionStorage.setItem('userId', data.user.id);
				}
			} else {
				// 401表示未登录，这是正常状态，不需要打印错误日志
				if (response.status === 401) {
					console.log('用户未登录');
				} else {
					const errorText = await response.text();
					console.error('用户API错误:', response.status, errorText);
				}
				setUser(null);
			}
		} catch (error) {
			console.error('Failed to fetch user:', error);
			// 数据库连接失败时，设置为未登录状态，不影响应用运行
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		refreshUser();
	}, []);

	// 登录
	const login = async (phone: string, password: string) => {
		const response = await fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ phone, password }),
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || '登录失败');
		}

		const data = await response.json();
		setUser(data.user);
		setIsLoading(false);
		// 备选方案：将 userId 存到 sessionStorage
		if (typeof window !== 'undefined' && data.user?.id) {
			sessionStorage.setItem('userId', data.user.id);
			console.log('✅ userId 已保存到 sessionStorage:', data.user.id);
		}
	};

	// 注册
	const register = async (data: {
		phone: string;
		name: string;
		password: string;
		email?: string;
		avatar?: string;
	}) => {
		const response = await fetch('/api/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || '注册失败');
		}

		const result = await response.json();
		setUser(result.user);
		setIsLoading(false);
	};

	// 登出
	const logout = async () => {
		try {
			await fetch('/api/auth/logout', {
				method: 'POST',
				credentials: 'include',
			});
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setUser(null);
			// 清除 sessionStorage 中的 userId
			if (typeof window !== 'undefined') {
				sessionStorage.removeItem('userId');
			}
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				isAuthenticated,
				isAdmin,
				login,
				register,
				logout,
				refreshUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
