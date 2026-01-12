'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentDebugPage() {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);

  const addResult = (test: string, success: boolean, message: string, details?: any) => {
    setTestResults(prev => [...prev, { test, success, message, details, time: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setTestResults([]);

    // 测试 1: 检查用户认证状态
    addResult('用户认证状态', isAuthenticated, isAuthenticated ? '已登录' : '未登录', {
      userId: user?.id,
      email: user?.email
    });

    // 测试 2: 检查 Cookie
    const cookies = document.cookie;
    const hasUserIdCookie = cookies.includes('userId');
    const userIdMatch = cookies.match(/userId=([^;]+)/);
    addResult('Cookie 检查', hasUserIdCookie, hasUserIdCookie ? 'Cookie 中包含 userId' : 'Cookie 中无 userId', {
      allCookies: cookies,
      userIdValue: userIdMatch ? userIdMatch[1] : '未找到'
    });

    // 测试 3: 检查 sessionStorage
    const sessionUserId = sessionStorage.getItem('userId');
    addResult('SessionStorage 检查', !!sessionUserId, sessionUserId ? 'SessionStorage 中包含 userId' : 'SessionStorage 中无 userId', {
      userId: sessionUserId
    });

    // 测试 4: 测试 /api/test/cookies 接口
    try {
      const headers: Record<string, string> = {};
      if (sessionUserId) {
        headers['x-user-id'] = sessionUserId;
      }

      const response = await fetch('/api/test/cookies', {
        credentials: 'include',
        headers
      });
      const data = await response.json();

      addResult('/api/test/cookies 接口', response.ok, response.ok ? '接口调用成功' : '接口调用失败', {
        status: response.status,
        data
      });
    } catch (error: any) {
      addResult('/api/test/cookies 接口', false, error.message, { error });
    }

    // 测试 5: 测试 /api/user/me 接口
    try {
      const headers: Record<string, string> = {};
      if (sessionUserId) {
        headers['x-user-id'] = sessionUserId;
      }

      const response = await fetch('/api/user/me', {
        credentials: 'include',
        headers
      });
      const data = await response.json();

      addResult('/api/user/me 接口', response.ok, response.ok ? '获取用户信息成功' : '获取用户信息失败', {
        status: response.status,
        data
      });
    } catch (error: any) {
      addResult('/api/user/me 接口', false, error.message, { error });
    }

    // 测试 6: 测试支付接口（使用最小金额）
    if (isAuthenticated) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (sessionUserId) {
          headers['x-user-id'] = sessionUserId;
        }

        const response = await fetch('/api/payment/create', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            paymentMethod: 'wechat',
            amount: 0.01,
            description: '测试支付',
            type: 'recharge',
            metadata: {}
          })
        });
        const data = await response.json();

        addResult('/api/payment/create 接口', data.success, data.success ? '支付接口调用成功' : '支付接口调用失败', {
          status: response.status,
          data,
          hasQrCode: !!data.qrCodeImage,
          hasOrderNo: !!data.orderNo
        });
      } catch (error: any) {
        addResult('/api/payment/create 接口', false, error.message, { error });
      }
    } else {
      addResult('/api/payment/create 接口', false, '跳过测试（用户未登录）');
    }
  };

  useEffect(() => {
    // 页面加载时自动运行测试
    setTimeout(runTests, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">支付功能调试页面</h1>
            <button
              onClick={runTests}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重新测试
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">当前用户状态</h3>
              <div className="text-sm text-gray-600">
                <p>认证状态: {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}</p>
                {user && (
                  <>
                    <p>用户 ID: {user.id}</p>
                    <p>邮箱: {user.email}</p>
                    <p>是否管理员: {user.isAdmin ? '是' : '否'}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">测试结果</h2>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  result.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{result.test}</h3>
                  <span className="text-xs text-gray-500">{result.time}</span>
                </div>
                <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">查看详情</summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">故障排查建议</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>1. 如果 "用户认证状态" 显示未登录，请先登录</li>
            <li>2. 如果 "Cookie 检查" 失败，检查浏览器是否阻止了 Cookie</li>
            <li>3. 如果 "SessionStorage 检查" 失败，尝试刷新页面重新登录</li>
            <li>4. 如果 "/api/test/cookies 接口" 失败，检查后端服务是否正常运行</li>
            <li>5. 如果 "/api/payment/create 接口" 失败，查看详细错误信息定位问题</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
