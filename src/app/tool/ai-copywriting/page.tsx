'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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
      case '视频号':
        return '#000000';
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

export default function AICopywritingPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState('小红书');
  const [contentType, setContentType] = useState('电商');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedWordCount, setSelectedWordCount] = useState('');
  const [generateCount, setGenerateCount] = useState(1);
  const [inputText, setInputText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Array<{ original: string; content: string; platform: string; type: string; timestamp: Date }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const platforms = ['抖音', '小红书', '视频号', '公众号'];
  const contentTypes = ['校服', '电商', '大健康', '工具软件', '金融', '教育', '汽车', '内容信息'];
  const aiModels = [
    { id: 'model-1', name: '豆包-1.5-32k' },
    { id: 'model-2', name: '豆包-1.5-128k' },
    { id: 'model-3', name: 'DeepSeek-V3' },
  ];
  const wordCountOptions = [
    { id: '100-200', name: '100-200字' },
    { id: '200-500', name: '200-500字' },
    { id: '500-1000', name: '500-1000字' },
    { id: '1000+', name: '1000字以上' },
  ];
  const maxChars = 5000;

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

  // 处理生成
  const handleGenerate = async () => {
    if (!inputText.trim()) {
      alert('请输入产品介绍或创作主题');
      return;
    }

    if (!selectedModel) {
      alert('请选择AI模型');
      return;
    }

    if (!selectedWordCount) {
      alert('请选择字数要求');
      return;
    }

    setIsGenerating(true);

    try {
      // 调用API进行文案生成
      const response = await fetch('/api/tool/ai-copywriting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: inputText,
          platform: selectedPlatform,
          type: contentType,
          model: selectedModel,
          wordCount: selectedWordCount,
          count: generateCount,
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      const data = await response.json();

      // 添加到历史记录
      const newRecord = {
        original: inputText,
        content: data.content || data.result || inputText,
        platform: selectedPlatform,
        type: contentType,
        timestamp: new Date(),
      };

      setHistory([newRecord, ...history]);
      setInputText('');
      setCharCount(0);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
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
      <Navigation />

      {/* 主体内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 功能标签 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded"></div>
            <h1 className="text-2xl font-semibold text-gray-900">AI文案创作</h1>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
            一键体验AI文案创作
          </span>
        </div>

        {/* 功能操作区 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* 平台选择 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">支持平台</h2>
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

          {/* 内容类型选择 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">选择类型</h2>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`
                    px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium
                    ${contentType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* AI参数设置 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h2 className="text-sm font-medium text-gray-900 mb-4">AI参数设置</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* AI模型选择 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">AI模型</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择AI模型</option>
                  {aiModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 字数要求 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">字数要求</label>
                <select
                  value={selectedWordCount}
                  onChange={(e) => setSelectedWordCount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择字数要求</option>
                  {wordCountOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 生成数量 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">生成数量</label>
                <select
                  value={generateCount}
                  onChange={(e) => setGenerateCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="1">1篇</option>
                  <option value="2">2篇</option>
                  <option value="3">3篇</option>
                </select>
              </div>
            </div>
          </div>

          {/* 文本输入框 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">产品介绍 / 创作主题</h2>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="请输入产品介绍或创作主题，AI将为您生成专业文案..."
                maxLength={maxChars}
                className={`
                  w-full min-h-[180px] px-4 py-3 rounded-xl border-2
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

          {/* 操作按钮区 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {isAuthenticated ? '今日剩余会员次' : '今日剩余未登录次'}
              </span>
            </div>
          </div>

          <button
            onClick={isAuthenticated ? handleGenerate : () => router.push('/pricing')}
            disabled={isGenerating}
            className={`
              w-full font-medium py-3.5 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
              ${isGenerating
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
              }
            `}
          >
            {isGenerating ? '生成中...' : (isAuthenticated ? '开始生成' : '开通会员')}
          </button>
        </div>

        {/* 生成结果历史记录 */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">生成结果历史记录</h2>
          {history.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">暂无生成文案，等待生成</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-600">
                        {record.platform} · {record.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {record.timestamp.toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(record.content)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      复制
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
