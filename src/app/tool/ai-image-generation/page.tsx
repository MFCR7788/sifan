'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/components/Toast';

// 将比例字符串转换为 Tailwind aspect-ratio 类
function getAspectRatioClass(ratio: string): string {
  const ratioMap: Record<string, string> = {
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
  };
  return ratioMap[ratio] || 'aspect-[16/9]';
}

// 参数卡片组件
const ParamCard = ({ title, children, className = '' }: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
      <h3 className="text-xs font-medium text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  );
};

export default function AIImageGenerationPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  // 未登录时重定向（必须在 early return 之前，保持 Hooks 顺序一致）
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // 提前处理加载状态
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 1. 主题内容
  const [themeContent, setThemeContent] = useState('');

  // 2. 风格描述
  const [selectedStyle, setSelectedStyle] = useState('写实摄影');

  // 3. 细节要求
  const [detailRequirement, setDetailRequirement] = useState('');

  // 4. 质量/光照
  const [quality, setQuality] = useState('2K');
  const [lighting, setLighting] = useState('柔和光线');

  // 尺寸
  const [selectedRatio, setSelectedRatio] = useState('16:9');

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [savedImages, setSavedImages] = useState<Array<any>>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    themeContent?: string;
    style?: string;
    detailRequirement?: string;
    quality?: string;
    lighting?: string;
    ratio?: string;
    prompt?: string;
  } | null>(null);
  const [history, setHistory] = useState<Array<{
    id: string;
    themeContent: string;
    style?: string;
    detailRequirement?: string;
    quality?: string;
    lighting?: string;
    ratio?: string;
    imageUrl?: string;
    prompt?: string;
    size?: string;
    timestamp: Date;
  }>>([]);

  // 风格选项
  const styleOptions = [
    { id: '写实摄影', label: '写实摄影', desc: '真实摄影风格' },
    { id: '动漫风格', label: '动漫风格', desc: '日系动漫' },
    { id: '艺术风格', label: '艺术风格', desc: '油画/水彩' },
    { id: '科技风格', label: '科技风格', desc: '赛博朋克' },
    { id: '商业设计', label: '商业设计', desc: '极简/扁平化' },
    { id: '复古风格', label: '复古风格', desc: '80年代复古' },
    { id: '抽象艺术', label: '抽象艺术', desc: '几何/流体' },
    { id: '建筑室内', label: '建筑室内', desc: '现代建筑' },
  ];

  // 质量选项
  const qualityOptions = [
    { id: '2K', label: '2K 高清' },
    { id: '4K', label: '4K 超高清' },
  ];

  // 光照选项
  const lightingOptions = [
    { id: '自然光线', label: '自然光线' },
    { id: '柔和光线', label: '柔和光线' },
    { id: '强烈光线', label: '强烈光线' },
    { id: '霓虹灯光', label: '霓虹灯光' },
    { id: '金色夕阳', label: '金色夕阳' },
    { id: '蓝色晨曦', label: '蓝色晨曦' },
  ];

  // 尺寸选项
  const ratioOptions = ['16:9', '9:16', '1:1', '4:3'];

  // 加载保存的图片列表
  useEffect(() => {
    if (isAuthenticated && user) {
      loadSavedImages();
    }
  }, [isAuthenticated, user?.id]);

  // 加载保存的图片
  const loadSavedImages = async () => {
    setIsLoadingImages(true);
    try {
      const response = await fetch('/api/ai-images');
      const data = await response.json();
      if (data.success) {
        const images = data.data || [];
        setSavedImages(images);
      }
    } catch (error) {
      console.error('加载图片列表失败:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // 处理生成
  const handleGenerate = async () => {
    if (!themeContent.trim()) {
      alert('请输入主题内容');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    // 模拟进度条更新
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      console.log('开始生成AI图像...', {
        themeContent,
        selectedStyle,
        detailRequirement,
        quality,
        lighting,
        selectedRatio
      });

      // 调用API进行图像生成
      const response = await fetch('/api/tool/ai-image-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          themeContent,
          style: selectedStyle,
          detailRequirement,
          quality,
          lighting,
          ratio: selectedRatio,
        }),
      });

      console.log('API 响应状态:', response.status, response.statusText);

      const data = await response.json();

      console.log('API 返回数据:', JSON.stringify(data, null, 2).substring(0, 1000));

      if (!response.ok) {
        console.error('API 错误:', data);
        throw new Error(data.error || `生成失败 (HTTP ${response.status})`);
      }

      if (!data.success || !data.data) {
        console.error('API 返回数据格式错误:', data);
        throw new Error('API 返回数据格式错误');
      }

      // 检查是否包含有效的图片 URL
      if (!data.data.imageUrl) {
        console.error('API 未返回图片 URL:', data.data);
        throw new Error('API 未返回图片 URL');
      }

      console.log('图片 URL:', data.data.imageUrl);

      // 进度条到 100%
      setProgress(100);
      clearInterval(progressInterval);

      // 添加到历史记录
      const newRecord = {
        id: Date.now().toString(),
        themeContent,
        style: selectedStyle,
        detailRequirement,
        quality,
        lighting,
        ratio: selectedRatio,
        imageUrl: data.data.imageUrl,
        prompt: data.data.prompt,
        size: data.data.size,
        timestamp: new Date(),
      };

      console.log('添加到历史记录:', newRecord);
      setHistory([newRecord, ...history]);

      // 自动打开历史记录
      setShowHistory(true);

      // 1秒后隐藏进度条
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error('生成失败:', error);
      const errorMessage = error instanceof Error ? error.message : '生成失败，请重试';
      alert(errorMessage);
      setProgress(0);
      clearInterval(progressInterval);
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载图片
  const handleDownloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  // 点击图片预览
  const handleImageClick = (image: any) => {
    setPreviewImage({
      url: image.image_url,
      themeContent: image.theme_content,
      style: image.style,
      detailRequirement: image.detail_requirement,
      quality: image.quality,
      lighting: image.lighting,
      ratio: image.ratio,
      prompt: image.prompt,
    });
  };

  // 复制提示词
  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      alert('提示词已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请重试');
    }
  };

  // 删除图片（管理员）
  const handleDeleteImage = async (id: string) => {
    if (!confirm('确定要删除这张图片吗？此操作不可恢复。')) {
      return;
    }

    try {
      const headers: Record<string, string> = {};

      const sessionUserId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
      if (sessionUserId) {
        headers['x-user-id'] = sessionUserId;
      }

      const response = await fetch(`/api/ai-images/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      const data = await response.json();
      if (data.success) {
        showToast('success', '删除成功');
        loadSavedImages();
      } else {
        showToast('error', data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      showToast('error', '删除失败，请重试');
    }
  };

  // 保存图片到数据库
  const handleSaveImage = async (imageUrl: string, record: any) => {
    if (!user) {
      showToast('error', '请先登录');
      return;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const sessionUserId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
    if (sessionUserId) {
      headers['x-user-id'] = sessionUserId;
    }

    try {
      const response = await fetch('/api/ai-images', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          themeContent: record.themeContent || themeContent,
          style: record.style || selectedStyle,
          detailRequirement: record.detailRequirement || detailRequirement,
          quality: record.quality || quality,
          lighting: record.lighting || lighting,
          ratio: record.ratio || selectedRatio,
          size: record.size,
          prompt: record.prompt,
          imageUrl: imageUrl,
          isPublic: false,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast('success', '保存成功');
        loadSavedImages();
      } else {
        const errorMsg = data.error || '保存失败';

        if (errorMsg.includes('重新登录') || errorMsg.includes('用户信息已过期')) {
          showToast('error', '用户信息已过期，请重新登录');
          router.push('/login');
          return;
        }

        showToast('error', errorMsg);
      }
    } catch (error) {
      console.error('保存失败:', error);
      showToast('error', '保存失败，请重试');
    }
  };

  // 验证 URL 是否有效
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };
  const handleNewChat = () => {
    setThemeContent('');
    setSelectedStyle('写实摄影');
    setDetailRequirement('');
    setQuality('2K');
    setLighting('柔和光线');
    setSelectedRatio('16:9');
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      {/* 主体内容 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 功能标签 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded"></div>
            <h1 className="text-2xl font-semibold text-gray-900">AI 图像生成</h1>
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
              <p className="text-gray-900 font-medium">你好，我是AI图像生成工具魔法小超人！</p>
              <p className="text-gray-700 text-sm leading-relaxed mt-2">
                按照四个步骤填写参数，我就能帮你生成高质量的图片。支持多种风格、质量与光照效果，让你的创作更自由！
              </p>
            </div>
          </div>

          {/* 参数配置区 */}
          <div className="space-y-6">
            {/* 1. 主题内容 */}
            <ParamCard title="1. 主题内容（必填）">
              <textarea
                value={themeContent}
                onChange={(e) => setThemeContent(e.target.value)}
                placeholder="描述你想要生成的图片主题，例如：一位美丽的女孩在海边看夕阳..."
                className="w-full min-h-[100px] px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
              />
            </ParamCard>

            {/* 2. 风格描述 */}
            <ParamCard title="2. 风格描述">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {styleOptions.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`
                      px-3 py-3 rounded-lg text-sm transition-all
                      ${selectedStyle === style.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="font-medium">{style.label}</div>
                    <div className="text-xs opacity-80 mt-1">{style.desc}</div>
                  </button>
                ))}
              </div>
            </ParamCard>

            {/* 3. 细节要求 */}
            <ParamCard title="3. 细节要求（选填）">
              <textarea
                value={detailRequirement}
                onChange={(e) => setDetailRequirement(e.target.value)}
                placeholder="描述图片的细节要求，例如：女孩穿着白色连衣裙，头发被海风吹起，表情温柔..."
                className="w-full min-h-[80px] px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
              />
            </ParamCard>

            {/* 4. 质量/光照 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ParamCard title="4.1 质量">
                <div className="flex flex-wrap gap-2">
                  {qualityOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setQuality(opt.id)}
                      className={`
                        px-4 py-2 rounded-lg text-sm transition-all
                        ${quality === opt.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </ParamCard>

              <ParamCard title="4.2 光照效果">
                <div className="flex flex-wrap gap-2">
                  {lightingOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setLighting(opt.id)}
                      className={`
                        px-3 py-2 rounded-lg text-sm transition-all
                        ${lighting === opt.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </ParamCard>
            </div>

            {/* 尺寸选择 */}
            <ParamCard title="图片尺寸比例">
              <div className="flex flex-wrap gap-2">
                {ratioOptions.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setSelectedRatio(ratio)}
                    className={`
                      px-4 py-2 rounded-lg text-sm transition-all
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
            </ParamCard>
          </div>

          {/* 生成按钮区 */}
          <div className="mt-6">
            {/* 进度条 */}
            {isGenerating && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-blue-600 font-medium">正在生成图像...</span>
                  <span className="text-xs text-blue-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleNewChat}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-medium text-gray-700">重置</span>
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !themeContent.trim()}
                className={`
                  px-8 py-2.5 rounded-xl font-medium text-white transition-all duration-200
                  ${isGenerating || !themeContent.trim()
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
          <div></div>
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
              <div className="space-y-6">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {/* 头部信息 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {record.style && (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded">
                            {record.style}
                          </span>
                        )}
                        {record.quality && (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded">
                            {record.quality}
                          </span>
                        )}
                        {record.lighting && (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700 rounded">
                            {record.lighting}
                          </span>
                        )}
                        {record.ratio && (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded">
                            {record.ratio}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {record.timestamp.toLocaleString('zh-CN')}
                        </span>
                        {record.imageUrl && (
                          <button
                            onClick={() => handleDownloadImage(
                              record.imageUrl!,
                              `ai-image-${record.timestamp.getTime()}.png`
                            )}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>下载图片</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 主题内容 */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                        {record.themeContent}
                      </p>
                      {record.detailRequirement && (
                        <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-200 mt-2">
                          <span className="font-medium">细节：</span>{record.detailRequirement}
                        </p>
                      )}
                    </div>

                    {/* 生成的图片 */}
                    {record.imageUrl && isValidImageUrl(record.imageUrl) ? (
                      <div className={`relative w-full ${getAspectRatioClass(record.ratio || '16:9')}`}>
                        <img
                          src={record.imageUrl}
                          alt="生成的图片"
                          className="w-full h-full rounded-lg border border-gray-200 object-cover"
                          loading="lazy"
                        />
                        {/* 保存按钮 */}
                        <button
                          onClick={() => handleSaveImage(record.imageUrl!, record)}
                          className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/95 hover:bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-all hover:shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          保存到作品库
                        </button>
                      </div>
                    ) : (
                      <div className="relative w-full aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">图片生成失败，URL 无效</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 保存的图片展示区 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI图像作品</h2>
          {isLoadingImages ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : savedImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500">暂无作品，快去生成第一张AI图像吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {savedImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative group overflow-hidden rounded-2xl ${isValidImageUrl(image.image_url) ? 'cursor-pointer' : 'cursor-default'}`}
                  style={{ aspectRatio: '4/3' }}
                  onClick={() => isValidImageUrl(image.image_url) && handleImageClick(image)}
                >
                  {/* 图片 */}
                  {isValidImageUrl(image.image_url) ? (
                    <img
                      src={image.image_url}
                      alt="AI图像"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <div className="text-center text-gray-500 p-4">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-xs">图片链接无效</p>
                      </div>
                    </div>
                  )}

                  {/* 悬浮遮罩 */}
                  {isValidImageUrl(image.image_url) && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  )}

                  {/* 悬浮操作层 */}
                  {isValidImageUrl(image.image_url) && (
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-3 p-4">
                      {/* 信息 */}
                      <div className="text-center">
                        <p className="text-white text-sm font-medium mb-1 line-clamp-2">
                          {image.theme_content}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-300 flex-wrap">
                          {image.style && <span>{image.style}</span>}
                          {image.lighting && <span>· {image.lighting}</span>}
                          {image.ratio && <span>· {image.ratio}</span>}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadImage(
                              image.image_url,
                              `ai-image-${image.id.substring(0, 8)}.png`
                            );
                          }}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          下载
                        </button>
                        {user?.isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(image.id);
                            }}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            删除
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 图片预览弹窗 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 图片 */}
            <img
              src={previewImage.url}
              alt="图片预览"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />

            {/* 信息区域 */}
            <div className="mt-4 bg-white rounded-xl p-6 w-full max-h-[20vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {previewImage.style && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded">
                    {previewImage.style}
                  </span>
                )}
                {previewImage.quality && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                    {previewImage.quality}
                  </span>
                )}
                {previewImage.lighting && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700 rounded">
                    {previewImage.lighting}
                  </span>
                )}
                {previewImage.ratio && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded">
                    {previewImage.ratio}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-700 font-medium mb-2">
                主题内容：
              </p>
              <p className="text-sm text-gray-600 mb-3">
                {previewImage.themeContent}
              </p>

              {previewImage.detailRequirement && (
                <>
                  <p className="text-sm text-gray-700 font-medium mb-2">
                    细节要求：
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {previewImage.detailRequirement}
                  </p>
                </>
              )}

              {previewImage.prompt && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleCopyPrompt(previewImage.prompt!)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    复制提示词
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
