'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'code' | 'qrcode'>('password');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeStatus, setQrCodeStatus] = useState<'loading' | 'scanned' | 'confirmed' | 'expired'>('loading');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const savedPhone = localStorage.getItem('savedLoginPhone');
    const savedPassword = localStorage.getItem('savedLoginPassword');
    if (savedPhone && savedPassword) {
      setPhone(savedPhone);
      setPassword(savedPassword);
      setRememberMe(true);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const wechatSuccess = urlParams.get('wechat');
    const wechatError = urlParams.get('error');
    const state = urlParams.get('state');

    if (wechatSuccess === 'success' && state) {
      setLoginMethod('qrcode');
      setQrCodeStatus('scanned');
      pollQrCodeStatus(state);
    } else if (wechatError) {
      setError(wechatError);
      setLoginMethod('password');
      window.history.replaceState({}, document.title, '/login');
    }
  }, []);

  useEffect(() => {
    if (loginMethod === 'qrcode') {
      handleQrCodeLogin();
    }
  }, [loginMethod]);

  const handleQrCodeLogin = async () => {
    setQrCodeStatus('loading');
    setQrCodeUrl('');
    setError('');

    try {
      const response = await fetch('/api/auth/wechat/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '生成二维码失败');
      }

      setQrCodeUrl(data.qrCodeUrl);
      pollQrCodeStatus(data.sceneStr);
    } catch (err: any) {
      setError(err.message);
      setLoginMethod('password');
    }
  };

  const pollQrCodeStatus = async (sceneStr: string) => {
    let attempts = 0;
    const maxAttempts = 60;

    const poll = async () => {
      if (attempts >= maxAttempts || loginMethod !== 'qrcode') {
        setQrCodeStatus('expired');
        return;
      }

      try {
        const response = await fetch(`/api/auth/wechat/check?sceneStr=${sceneStr}`, { credentials: 'include' });
        const data = await response.json();

        if (data.success && data.scanned) {
          if (data.confirmed && data.token) {
            setQrCodeStatus('confirmed');
            sessionStorage.setItem('userId', data.userId);
            setTimeout(() => {
              router.push(isAdmin ? '/admin/members' : '/');
            }, 1000);
          } else {
            setQrCodeStatus('scanned');
            setTimeout(poll, 2000);
          }
        } else if (data.expired) {
          setQrCodeStatus('expired');
        } else {
          attempts++;
          setTimeout(poll, 2000);
        }
      } catch (error) {
        attempts++;
        setTimeout(poll, 2000);
      }
    };

    poll();
  };

  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      setError('请输入有效的手机号');
      return;
    }

    setIsSendingCode(true);
    setError('');

    try {
      const response = await fetch('/api/auth/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error || '发送验证码失败');
      }
    } catch (err: any) {
      setError('发送验证码失败，请稍后重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let response;
      
      if (loginMethod === 'password') {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone, password }),
        });
      } else {
        response = await fetch('/api/auth/login/code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone, code }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      if (rememberMe) {
        localStorage.setItem('savedLoginPhone', phone);
        if (loginMethod === 'password') {
          localStorage.setItem('savedLoginPassword', password);
        }
      } else {
        localStorage.removeItem('savedLoginPhone');
        localStorage.removeItem('savedLoginPassword');
      }

      sessionStorage.setItem('userId', data.user.id);

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

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLoginMethod('password')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${loginMethod === 'password' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              密码登录
            </button>
            <button
              onClick={() => setLoginMethod('code')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${loginMethod === 'code' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              验证码登录
            </button>
            <button
              onClick={() => setLoginMethod('qrcode')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${loginMethod === 'qrcode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              微信登录
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loginMethod === 'password' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
                <input
                  id="phone"
                  type="tel"
                  required
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="请输入手机号"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">密码</label>
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
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">记住我</label>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition">
                {isLoading ? '登录中...' : '登录'}
              </button>
            </form>
          ) : loginMethod === 'code' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
                <input
                  id="phone"
                  type="tel"
                  required
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="请输入手机号"
                />
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">验证码</label>
                <div className="flex gap-3">
                  <input
                    id="code"
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="请输入验证码"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSendingCode || countdown > 0}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}秒` : (isSendingCode ? '发送中...' : '获取验证码')}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition">
                {isLoading ? '登录中...' : '登录'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center py-8">
                {qrCodeStatus === 'loading' ? (
                  <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">生成二维码中...</p>
                    </div>
                  </div>
                ) : qrCodeStatus === 'expired' ? (
                  <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">二维码已过期</p>
                      <button onClick={handleQrCodeLogin} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        刷新二维码
                      </button>
                    </div>
                  </div>
                ) : qrCodeStatus === 'scanned' ? (
                  <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-600 font-medium mb-2">扫码成功</p>
                      <p className="text-gray-600 text-sm">请在手机上确认登录</p>
                    </div>
                  </div>
                ) : qrCodeStatus === 'confirmed' ? (
                  <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-600 font-medium mb-2">登录成功</p>
                      <p className="text-gray-600 text-sm">正在跳转...</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-white rounded-xl flex items-center justify-center border-2 border-gray-200">
                    {qrCodeUrl && <img src={qrCodeUrl} alt="扫码登录" className="w-full h-full p-4" />}
                  </div>
                )}

                <p className="text-center text-gray-600 text-sm mt-4">请使用微信扫描二维码登录</p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              还没有账户？{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                立即注册
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center space-y-3">
          <p className="text-gray-500 text-sm">忘记密码？请联系管理员</p>
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← 返回首页</Link>
        </div>
      </div>
    </div>
  );
}