'use client';
import ToolSidebar from '@/components/tool/ToolSidebar';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ToolSidebar from '@/components/tool/ToolSidebar';

export default function ShortVideoCaptionPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [history, setHistory] = useState<Array<{ title: string; content: string; timestamp: Date }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // 检查是否登录
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // 处理文件拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('border-blue-500', 'bg-blue-50');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // 处理文件选择
  const handleFileSelect = (file: File) => {
    // 验证文件类型
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (!validTypes.includes(file.type)) {
      alert('请上传视频文件（MP4、MOV、AVI、MKV格式）');
      return;
    }

    // 验证文件大小（最大500MB）
    if (file.size > 500 * 1024 * 1024) {
      alert('文件大小不能超过500MB');
      return;
    }

    setUploadedFile(file);
    setVideoUrl('');
  };

  // 处理文件输入
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // 处理开始提取
  const handleExtract = async () => {
    if (!videoUrl && !uploadedFile) {
      alert('请输入短视频链接或上传视频文件');
      return;
    }

    setIsExtracting(true);

    try {
      // 准备表单数据
      const formData = new FormData();
      if (videoUrl) {
        formData.append('url', videoUrl);
      }
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }

      // 调用API提取文案
      const response = await fetch('/api/tool/short-video-caption', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('提取失败');
      }

      const data = await response.json();

      // 添加到历史记录
      const newRecord = {
        title: data.title || '提取的标题',
        content: data.content || data.result || '提取的文案内容',
        timestamp: new Date(),
      };

      setHistory([newRecord, ...history]);
      setVideoUrl('');
      setUploadedFile(null);
    } catch (error) {
      console.error('提取失败:', error);
      alert('提取失败，请重试');
    } finally {
      setIsExtracting(false);
    }
  };

  // 复制文案
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  // 删除文件
  const handleDeleteFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

      {/* 主体内容 - 两栏布局 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 左侧导航栏 */}
          <ToolSidebar currentPath="/tool/short-video-caption" />

          {/* 右侧内容区 */}
          <div className="flex-1 min-w-0">
        {/* 功能标签 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded"></div>
            <h1 className="text-2xl font-semibold text-gray-900">短视频提文案</h1>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
            一键提取视频文案
          </span>
        </div>

        {/* 功能操作区 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* 视频输入区 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">视频来源</h2>

            {/* 链接输入 */}
            <div className="mb-4">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setUploadedFile(null);
                }}
                placeholder="请输入短视频链接（抖音、快手、视频号等）"
                disabled={!!uploadedFile}
                className={`
                  w-full px-4 py-3 rounded-xl border-2
                  focus:outline-none focus:border-blue-500 transition-all duration-200
                  text-gray-900 placeholder-gray-400
                  ${uploadedFile ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                  ${videoUrl.length > 0 ? 'border-gray-300' : 'border-gray-200'}
                `}
              />
            </div>

            {/* 分隔线 */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-xs text-gray-400">或</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* 文件拖放区 */}
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-200
                ${uploadedFile
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {uploadedFile ? (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile();
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    删除文件
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">点击或拖放上传视频文件</p>
                  <p className="text-xs text-gray-400">支持 MP4、MOV、AVI、MKV 格式，最大 500MB</p>
                </div>
              )}
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
            onClick={handleExtract}
            disabled={isExtracting || (!videoUrl && !uploadedFile)}
            className={`
              w-full font-medium py-3.5 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
              ${isExtracting || (!videoUrl && !uploadedFile)
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
              }
            `}
          >
            {isExtracting ? '提取中...' : '开始提取'}
          </button>
        </div>

        {/* 提取结果 */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">提取结果</h2>
          {history.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">暂无结果，等待提取</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {record.timestamp.toLocaleString('zh-CN')}
                    </span>
                    <button
                      onClick={() => handleCopy(`${record.title}\n\n${record.content}`)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      复制
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">{record.title}</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
