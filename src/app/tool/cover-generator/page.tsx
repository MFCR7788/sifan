'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// 平台卡片组件
const PlatformCard = ({ icon, title, description, selected, onClick }: {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-5 rounded-2xl border-2 transition-all duration-200 text-left
        ${selected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className={`font-semibold mb-1 ${selected ? 'text-blue-700' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className="text-sm text-gray-600">{description}</p>
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
};

export default function CoverGeneratorPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState('抖音');
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; input: string; platform: string; style?: string; timestamp: Date }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 详细选项
  const [selectedStyle, setSelectedStyle] = useState('简约');
  const [selectedRatio, setSelectedRatio] = useState('16:9');

  const platforms = [
    { id: '抖音', icon: '🎵', title: '抖音封面', description: '输入文案内容帮你生成抖音封面图' },
    { id: '小红书', icon: '📱', title: '小红书封面', description: '输入小红书的内容帮你生成小红书的封面图' },
    { id: '公众号', icon: '📰', title: '公众号封面', description: '输入公众号的内容帮你生成公众号封面头图' },
  ];

  const styles = ['简约', '清新', '商务', '科技', '艺术', '复古'];
  const ratios = ['16:9', '9:16', '1:1', '4:3'];

  // 检查是否登录
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // 处理生成
  const handleGenerate = async () => {
    if (!inputText.trim()) {
      alert('请输入文案内容或关键词');
      return;
    }

    setIsGenerating(true);

    try {
      // 调用API进行封面图生成
      const response = await fetch('/api/tool/cover-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: inputText,
          platform: selectedPlatform,
          style: selectedStyle,
          ratio: selectedRatio,
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      const data = await response.json();

      // 添加到历史记录
      const newRecord = {
        id: Date.now().toString(),
        input: inputText,
        platform: selectedPlatform,
        style: selectedStyle,
        timestamp: new Date(),
      };

      setHistory([newRecord, ...history]);
      setInputText('');
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 新会话
  const handleNewChat = () => {
    setInputText('');
    setSelectedPlatform('抖音');
    setSelectedStyle('简约');
    setSelectedRatio('16:9');
    setShowAdvanced(false);
    textareaRef.current?.focus();
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
      <Navigation />

      {/* 主体内容 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 功能标签 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded"></div>
            <h1 className="text-2xl font-semibold text-gray-900">封面图制作</h1>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
            AI 智能生成
          </span>
        </div>

        {/* 核心对话与引导区 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          {/* 助手对话气泡 */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🎨</span>
            </div>
            <div className="flex-1 bg-blue-50 rounded-2xl rounded-tl-none p-5">
              <p className="text-gray-900 font-medium mb-2">你好，我是封面图小工具魔法超人</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                你可以直接向我输入一篇文案内容或者一些关键词，选择你想要制作的封面图平台和尺寸，我就自动会自动帮你生成，免费的哦！
              </p>
            </div>
          </div>

          {/* 使用场景说明 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">选择使用场景</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <PlatformCard
                  key={platform.id}
                  icon={platform.icon}
                  title={platform.title}
                  description={platform.description}
                  selected={selectedPlatform === platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                />
              ))}
            </div>
          </div>

          {/* 详细条件控件 */}
          <div className="mb-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>添加详细条件</span>
              <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
                {/* 选择风格 */}
                <div>
                  <h3 className="text-xs font-medium text-gray-700 mb-2">选择风格</h3>
                  <div className="flex flex-wrap gap-2">
                    {styles.map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm transition-all
                          ${selectedStyle === style
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 选择比例 */}
                <div>
                  <h3 className="text-xs font-medium text-gray-700 mb-2">选择比例</h3>
                  <div className="flex flex-wrap gap-2">
                    {ratios.map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setSelectedRatio(ratio)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm transition-all
                          ${selectedRatio === ratio
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 文本输入框 */}
          <div>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedPlatform === '抖音'
                ? '请输入文案内容，例如：今天分享一个超好用的美白产品...'
                : '请输入文案内容，例如：今天分享一个超好用的美白产品...'
              }
              className={`
                w-full min-h-[150px] px-4 py-3 rounded-xl border-2
                focus:outline-none focus:border-blue-500 transition-all duration-200
                resize-none text-gray-900 placeholder-gray-400
                ${inputText.length > 0 ? 'border-gray-300' : 'border-gray-200'}
              `}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">按下 Shift + Enter 换行</span>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className={`
                  px-8 py-2.5 rounded-xl font-medium text-white transition-all duration-200
                  ${isGenerating || !inputText.trim()
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                  }
                `}
              >
                {isGenerating ? '生成中...' : '开始生成'}
              </button>
            </div>
          </div>
        </div>

        {/* 操作按钮栏 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium text-gray-700">新会话</span>
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">历史记录</span>
          </button>
        </div>

        {/* 历史记录区域 */}
        {showHistory && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">历史记录</h2>
            {history.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">暂无历史记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                          {record.platform}
                        </span>
                        {record.style && (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded">
                            {record.style}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {record.timestamp.toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{record.input}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
