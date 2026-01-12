'use client';

import { useState, useEffect } from 'react';

export default function CookieDebugPage() {
  const [cookieData, setCookieData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testCookie = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('=== 测试 Cookie 读写 ===');
      console.log('当前浏览器 Cookie:', document.cookie);
      console.log('当前 sessionStorage userId:', sessionStorage.getItem('userId'));

      // 1. 测试读取 cookie/header
      const headers: Record<string, string> = {};
      const sessionUserId = sessionStorage.getItem('userId');
      if (sessionUserId) {
        headers['x-user-id'] = sessionUserId;
        console.log('从 sessionStorage 读取 userId:', sessionUserId);
      }

      const testResponse = await fetch('/api/test/cookies', { credentials: 'include', headers });
      const testData = await testResponse.json();
      console.log('测试接口返回:', testData);
      setCookieData(testData);

      // 2. 检查登录状态
      const meResponse = await fetch('/api/user/me', { credentials: 'include', headers });
      console.log('用户接口状态:', meResponse.status);
      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('用户信息:', meData);
      }

    } catch (err: any) {
      setError(err.message);
      console.error('测试失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const setTestCookie = async () => {
    try {
      // 尝试通过前端设置 cookie
      document.cookie = 'test-cookie=123456; path=/; SameSite=Lax';
      console.log('前端设置 cookie:', document.cookie);
      await testCookie();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    testCookie();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Cookie 调试工具</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">浏览器 Cookie</h2>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm break-all">
            {document.cookie || '(无 Cookie)'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">后端接收的认证信息</h2>
          {loading ? (
            <p>加载中...</p>
          ) : error ? (
            <p className="text-red-600">错误: {error}</p>
          ) : cookieData ? (
            <div className="space-y-4">
              <div>
                <strong>Cookie 数量:</strong> {cookieData.cookieCount}
              </div>
              <div>
                <strong>Cookie userId:</strong> {cookieData.cookieUserId || '(未找到)'}
              </div>
              <div>
                <strong>Header userId (x-user-id):</strong> {cookieData.headerUserId || '(未找到)'}
              </div>
              <div>
                <strong>最终 userId:</strong> {cookieData.finalUserId || '(未找到)'}
                {cookieData.finalUserId && (
                  <span className="ml-2 text-green-600">✅</span>
                )}
              </div>
              <div>
                <strong>所有 Cookie:</strong>
                <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
                  {JSON.stringify(cookieData.cookies, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Cookie 字符串:</strong>
                <div className="bg-gray-100 p-4 rounded font-mono text-sm break-all mt-2">
                  {cookieData.allCookieString || '(无)'}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">操作</h2>
          <div className="space-x-4">
            <button
              onClick={testCookie}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              重新测试
            </button>
            <button
              onClick={setTestCookie}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              设置测试 Cookie
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">常见问题</h2>
          <ul className="space-y-2 text-blue-800">
            <li>1. 如果浏览器有 cookie 但后端收不到，可能是浏览器的隐私设置阻止了第三方 cookie</li>
            <li>2. localhost 开发环境可能存在 cookie 安全策略问题</li>
            <li>3. 尝试清除浏览器缓存和 cookie 后重新登录</li>
            <li>4. 尝试使用无痕模式（隐私模式）测试</li>
            <li>5. 检查浏览器控制台的 Network 面板，查看请求头中是否有 Cookie 字段</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
