'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

	// 获取当前用户信息
	const refreshUser = async () => {
		try {
			console.log('AuthContext: 开始刷新用户信息...');
			const response = await fetch('/api/user/me', {
				credentials: 'include',
			});
			console.log('AuthContext: 用户API响应状态:', response.status);
			
			if (response.ok) {
				const data = await response.json();
				console.log('AuthContext: 用户信息:', data.user);
				setUser(data.user);
			} else {
				const errorText = await response.text();
				console.error('AuthContext: 用户API错误:', response.status, errorText);
				setUser(null);
			}
		} catch (error) {
			console.error('AuthContext: Failed to fetch user:', error);
			// 数据库连接失败时，设置为未登录状态，不影响应用运行
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

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
			body: JSON.stringify({ phone, password }),
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || '登录失败');
		}

		const data = await response.json();
		setUser(data.user);
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
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || '注册失败');
		}

		const result = await response.json();
		setUser(result.user);
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
