'use client';

import { useEffect, useState } from 'react';

export default function WeChatPrompt() {
  const [isWeChat, setIsWeChat] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isWeixin = ua.indexOf('micromessenger') !== -1;
    setIsWeChat(isWeixin);

    // 只在微信中显示提示，且用户还没有关闭过
    if (isWeixin && !localStorage.getItem('wechatPromptClosed')) {
      // 延迟 1 秒显示，避免阻塞首屏渲染
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('wechatPromptClosed', 'true');
  };

  if (!isWeChat || !showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full text-center">
          {/* 图标 */}
          <div className="text-5xl mb-4">📱</div>

          {/* 标题 */}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
            使用浏览器访问
          </h2>

          {/* 说明 */}
          <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
            为获得最佳体验，请点击右上角 <strong>"..."</strong>，<br className="hidden md:block" />
            选择 <strong>"在浏览器打开"</strong>
          </p>

          {/* 示意图（简化的箭头指示） */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-gray-300 rounded-full flex items-center justify-center">
                <span className="text-3xl">➜</span>
              </div>
              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                ...
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <div className="space-y-3">
            <a
              href="https://zjsifan.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              直接访问网站
            </a>
            <button
              onClick={handleClose}
              className="block w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              关闭提示
            </button>
          </div>

          {/* 底部说明 */}
          <p className="mt-4 text-xs text-gray-500">
            此提示不会再次显示
          </p>
        </div>
      </div>
    </div>
  );
}
