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

// 违禁词分类数据
const forbiddenWordsData = {
  '与"最"有关': ['最', '最佳', '最具', '最爱', '最赚', '最优', '最优秀', '最低', '最高', '最便宜', '最多', '最先进', '最后'],
  '与"一"有关': ['第一', '中国第一', '全网第一', '销量第一', '排名第一', '之一', '首选', '独家', '独家首发', '全国第一'],
  '与"级/极"有关': ['国家级', '世界级', '最高级', '顶级', '极品', '极致', '终极', '超级', '超值', '极佳', '极佳'],
  '与"首/家/国"有关': ['首个', '首款', '首家', '独家', '独家首发', '全国首发', '全球首发', '国家领导人推荐', '国家XX领导人推荐'],
  '与"品牌/质量"有关': ['销量冠军', '领袖品牌', '世界领先', '行业领先', '领先', '领导品牌', '品牌价值第一', '销量领先'],
  '与"承诺/保证"有关': ['承诺', '保证', '包过', '包退', '包换', '包满意', '保证有效', '保证无副作用', '无效退款'],
  '与"时间相关"有关': ['永久', '终身', '100年', '史无前例', '前无古人', '从未有过', '空前绝后', '绝无仅有'],
  '与"认证/奖项"有关': ['国家认证', '国际认证', '获得XX奖', 'XX品牌推荐', 'XX协会认证', 'ISO认证', '质量免检'],
};

export default function ForbiddenWordsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState('公众号');
  const [queryMode, setQueryMode] = useState('查文字');
  const [inputText, setInputText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResults, setQueryResults] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const platforms = ['公众号', '小红书', '抖音'];
  const queryModes = ['查文字', '查文档', '查链接'];
  const maxChars = 2000;

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

  // 切换分类展开状态
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // 展开所有分类
  const expandAll = () => {
    setExpandedCategories(new Set(Object.keys(forbiddenWordsData)));
  };

  // 收起所有分类
  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // 处理查询
  const handleQuery = async () => {
    if (queryMode === '查文字' && !inputText.trim()) {
      alert('请输入要查询的文本');
      return;
    }

    if (queryMode === '查文档') {
      fileInputRef.current?.click();
      return;
    }

    if (queryMode === '查链接' && !inputText.trim()) {
      alert('请输入要查询的链接');
      return;
    }

    setIsQuerying(true);

    try {
      // 调用API进行违禁词查询
      const response = await fetch('/api/tool/forbidden-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: inputText,
          platform: selectedPlatform,
          mode: queryMode,
        }),
      });

      if (!response.ok) {
        throw new Error('查询失败');
      }

      const data = await response.json();
      setQueryResults(data);
    } catch (error) {
      console.error('查询失败:', error);
      alert('查询失败，请重试');
    } finally {
      setIsQuerying(false);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsQuerying(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('platform', selectedPlatform);

      const response = await fetch('/api/tool/forbidden-words/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      setQueryResults(data);
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setIsQuerying(false);
    }
  };

  // 下载词库
  const handleDownloadLibrary = () => {
    // TODO: 实现词库下载功能
    alert('词库下载功能开发中');
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
            <div className="w-1 h-6 bg-red-600 rounded"></div>
            <h1 className="text-2xl font-semibold text-gray-900">违禁词查询</h1>
          </div>
          <span className="px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded-full">
            在线检测违规内容
          </span>
        </div>

        {/* 功能操作区 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* 平台选择 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">目标平台</h2>
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

          {/* 查询模式选择 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">查询模式</h2>
            <div className="flex flex-wrap gap-2">
              {queryModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setQueryMode(mode)}
                  className={`
                    px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium
                    ${queryMode === mode
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* 文本/链接输入框 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">
              {queryMode === '查文字' ? '输入文本' : queryMode === '查链接' ? '输入链接' : '上传文档'}
            </h2>
            {queryMode === '查文档' ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-red-300 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.doc,.docx"
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-2">点击上传文档或拖拽文件到此处</p>
                <p className="text-xs text-gray-400">支持 TXT、DOC、DOCX 格式，文件大小不超过 10MB</p>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={queryMode === '查文字' ? '请输入要检测的文本内容...' : '请输入要检测的链接...'}
                  maxLength={maxChars}
                  className={`
                    w-full min-h-[180px] px-4 py-3 rounded-xl border-2
                    focus:outline-none focus:border-red-500 transition-all duration-200
                    resize-none text-gray-900 placeholder-gray-400
                    ${inputText.length > 0 ? 'border-gray-300' : 'border-gray-200'}
                  `}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {charCount}/{maxChars}
                </div>
              </div>
            )}
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
            onClick={isAuthenticated ? handleQuery : () => router.push('/pricing')}
            disabled={isQuerying}
            className={`
              w-full font-medium py-3.5 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
              ${isQuerying
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
              }
            `}
          >
            {isQuerying ? '查询中...' : (isAuthenticated ? '违禁词查询' : '开通会员')}
          </button>
        </div>

        {/* 结果展示面板 */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">高危内容词</h2>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1 bg-red-50 rounded-full"
              >
                展开全部
              </button>
              <button
                onClick={collapseAll}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium px-3 py-1 bg-gray-100 rounded-full"
              >
                收起全部
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(forbiddenWordsData).map(([category, words]) => (
              <div key={category} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">{category}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedCategories.has(category) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedCategories.has(category) && (
                  <div className="px-4 py-3 bg-white">
                    <div className="flex flex-wrap gap-2">
                      {words.map((word, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-red-50 text-red-700 text-sm rounded-md"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 下载词库按钮 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleDownloadLibrary}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载词库
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
