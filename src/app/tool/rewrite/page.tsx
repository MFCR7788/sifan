'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// 平台图标组件
const PlatformIcon = ({ name, selected, onClick }: { name: string; selected: boolean; onClick: () => void }) => {
  const getIconColor = () => {
    switch (name) {
      case '小红书':
        return '#ff2442';
      case '公众号':
        return '#07c160';
      case '抖音':
        return '#000000';
      case '微博':
        return '#e6162d';
      case '知乎':
        return '#0084ff';
      default:
        return '#6b7280';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative px-4 py-2.5 rounded-lg border transition-all duration-200
        flex items-center gap-2 group
        ${selected
          ? 'border-blue-600 bg-blue-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: getIconColor() }}
      >
        <span className="text-white text-xs font-bold">
          {name.charAt(0)}
        </span>
      </div>
      <span className={`text-sm font-medium ${selected ? 'text-blue-700' : 'text-gray-700'}`}>
        {name}
      </span>
      {selected && (
        <div className="absolute top-1 right-1">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
};

export default function RewriteToolPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState('小红书');
  const [inputText, setInputText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [history, setHistory] = useState<Array<{ original: string; converted: string; platform: string; timestamp: Date }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const platforms = ['小红书', '公众号', '抖音', '微博', '知乎'];
  const maxChars = 800;

  // 检查是否登录
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // 更新字数统计
  useEffect(() => {
    setCharCount(inputText.length);
  }, [inputText]);

  // 处理文案转换
  const handleConvert = async () => {
    if (!inputText.trim()) {
      alert('请输入需要改写的文案内容');
      return;
    }

    setIsConverting(true);

    try {
      // 调用API进行文案改写
      const response = await fetch('/api/tool/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: inputText,
          platform: selectedPlatform,
        }),
      });

      if (!response.ok) {
        throw new Error('改写失败');
      }

      const data = await response.json();

      // 添加到历史记录
      const newRecord = {
        original: inputText,
        converted: data.result || data.content || inputText,
        platform: selectedPlatform,
        timestamp: new Date(),
      };

      setHistory([newRecord, ...history]);
      setInputText('');
      setCharCount(0);
    } catch (error) {
      console.error('改写失败:', error);
      alert('改写失败，请重试');
    } finally {
      setIsConverting(false);
    }
  };

  // 复制文案
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 品牌栏 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image
                  src="/小超人.png"
                  alt="魔法超人"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">新媒体，找魔法超人</h1>
                <p className="text-xs text-gray-500">AI文案改写工具</p>
              </div>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 功能操作区 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* 平台选择 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">选择目标平台风格</h2>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <PlatformIcon
                  key={platform}
                  name={platform}
                  selected={selectedPlatform === platform}
                  onClick={() => setSelectedPlatform(platform)}
                />
              ))}
            </div>
          </div>

          {/* 文本输入框 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">输入原始文案</h2>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="请输入需要改写的文案内容..."
                maxLength={maxChars}
                className={`
                  w-full min-h-[200px] px-4 py-3 rounded-xl border-2
                  focus:outline-none focus:border-blue-500 transition-all duration-200
                  resize-none text-gray-900 placeholder-gray-400
                  ${inputText.length > 0 ? 'border-gray-300' : 'border-gray-200'}
                `}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {charCount}/{maxChars}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              今日剩余
              <span className="ml-1 text-blue-600 font-medium">未登录用户0次</span>
            </div>
            <button
              onClick={handleConvert}
              disabled={isConverting || !inputText.trim()}
              className={`
                px-8 py-3 rounded-xl font-medium text-white transition-all duration-200
                ${isConverting || !inputText.trim()
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }
              `}
            >
              {isConverting ? '转换中...' : '开始转换'}
            </button>
          </div>
        </div>

        {/* 生成文案历史记录 */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">生成文案历史记录</h2>
          {history.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">暂无结果，等待转换</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  {/* 头部信息 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                        {record.platform}
                      </span>
                      <span className="text-xs text-gray-400">
                        {record.timestamp.toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(record.converted)}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      复制
                    </button>
                  </div>

                  {/* 原始文案 */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">原始文案：</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                      {record.original}
                    </p>
                  </div>

                  {/* 改写结果 */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">改写结果：</p>
                    <p className="text-sm text-gray-900 bg-blue-50 rounded-lg p-3">
                      {record.converted}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
