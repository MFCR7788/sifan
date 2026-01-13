'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Search, ChevronRight, FileText, Play, ArrowLeft, Menu, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
}

interface Resource {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  contentType: 'document' | 'video';
  videoUrl: string | null;
  thumbnail: string | null;
  summary: string | null;
  tags: string | null;
  viewCount: number;
  publishedAt: string | null;
  categoryId: string;
}

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categorySlug = searchParams.get('category');
  const resourceSlug = searchParams.get('resource');

  // 加载分类
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/resources/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // 加载资源列表
  useEffect(() => {
    const fetchResources = async (categoryId: string | null = null) => {
      try {
        const url = categoryId
          ? `/api/resources?categoryId=${categoryId}`
          : '/api/resources';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setResources(data.resources);
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      }
    };

    if (selectedCategory) {
      fetchResources(selectedCategory);
    }
  }, [selectedCategory]);

  // 根据URL参数设置选中的分类和资源
  useEffect(() => {
    if (categorySlug) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        setSelectedCategory(category.id);

        // 如果有资源ID，加载资源详情
        if (resourceSlug) {
          fetchResourceDetails(resourceSlug);
        } else {
          setSelectedResource(null);
        }
      }
    }
  }, [categorySlug, resourceSlug, categories]);

  const fetchResourceDetails = async (slug: string) => {
    try {
      const response = await fetch(`/api/resources/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedResource(data.resource);
      }
    } catch (error) {
      console.error('Failed to fetch resource details:', error);
    }
  };

  // AI搜索功能
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/resources/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryClick = (categoryId: string, slug: string) => {
    setSelectedCategory(categoryId);
    setSelectedResource(null);
    setSearchQuery('');
    setSearchResults([]);
    setIsMobileMenuOpen(false);
    router.push(`/resources?category=${slug}`);
  };

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    const category = categories.find(c => c.id === resource.categoryId);
    if (category) {
      router.push(`/resources?category=${category.slug}&resource=${resource.slug}`);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Newspaper':
        return <FileText className="w-5 h-5" />;
      case 'Book':
        return <FileText className="w-5 h-5" />;
      case 'Sparkles':
        return <Play className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Top Bar - Title & Search */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-40">
        <div className="max-w-[980px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={() => {
                  setSelectedResource(null);
                  router.push(`/resources?category=${categorySlug || ''}`);
                }}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap"
              >
                {selectedResource ? (
                  <>
                    {categories.find(c => c.id === selectedCategory)?.name || '资源中心'}
                    <ChevronRight className="w-4 h-4 inline ml-2" />
                    <span className="text-gray-900">{selectedResource.title}</span>
                  </>
                ) : (
                  '资源中心'
                )}
              </button>
            </div>

            {/* Search */}
            <div className="hidden md:block w-72">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="搜索资源..."
                  className="w-full px-3 py-2 pl-9 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder="搜索资源..."
            className="w-full px-3 py-2 pl-9 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[980px] mx-auto">
        <div className="flex">
          {/* Left Sidebar - Categories */}
          <aside className={`fixed left-0 top-24 bottom-0 w-72 bg-white border-r border-gray-200 z-30 md:static md:border-r-0 md:z-auto transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <nav className="h-full overflow-y-auto p-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                分类
              </h2>
              <ul className="space-y-1">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategoryClick(category.id, category.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-3 text-sm ${
                        selectedCategory === category.id
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex-shrink-0">{getIcon(category.icon)}</span>
                      <span>{category.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-20 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Right Content Area */}
          <main className="flex-1 min-w-0 px-6 py-8 md:px-12 md:py-12">
            {searchQuery && searchResults.length > 0 ? (
              // 搜索结果
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  搜索结果：{searchQuery}
                </h2>
                <div className="space-y-3">
                  {searchResults.map((resource) => (
                    <div
                      key={resource.id}
                      onClick={() => handleResourceClick(resource)}
                      className="group p-5 border border-gray-200 rounded-xl hover:border-gray-900 hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                          {resource.contentType === 'video' ? (
                            <Play className="w-4 h-4 text-white" />
                          ) : (
                            <FileText className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-600 transition-colors">
                            {resource.title}
                          </h3>
                          {resource.summary && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {resource.summary}
                            </p>
                          )}
                          {resource.tags && (
                            <div className="flex gap-2 flex-wrap">
                              {resource.tags.split(',').map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedResource ? (
              // 资源详情
              <div className="max-w-3xl">
                <div className="mb-12">
                  <button
                    onClick={() => {
                      setSelectedResource(null);
                      router.push(`/resources?category=${categorySlug}`);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    返回列表
                  </button>

                  <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6 tracking-tight">
                    {selectedResource.title}
                  </h1>

                  {selectedResource.contentType === 'video' && selectedResource.videoUrl && (
                    <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden mb-8 shadow-lg">
                      <video
                        src={selectedResource.videoUrl}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  {selectedResource.content && (
                    <div className="prose prose-gray prose-lg max-w-none">
                      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedResource.content}
                      </div>
                    </div>
                  )}

                  {selectedResource.tags && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">标签</h3>
                      <div className="flex gap-2 flex-wrap">
                        {selectedResource.tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedCategory ? (
              // 资源列表
              <div className="max-w-3xl">
                <div className="mb-8">
                  <h2 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-gray-600">
                    {categories.find(c => c.id === selectedCategory)?.description}
                  </p>
                </div>

                {resources.length > 0 ? (
                  <div className="space-y-3">
                    {resources.map((resource) => (
                      <div
                        key={resource.id}
                        onClick={() => handleResourceClick(resource)}
                        className="group p-5 border border-gray-200 rounded-xl hover:border-gray-900 hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                            {resource.contentType === 'video' ? (
                              <Play className="w-4 h-4 text-white" />
                            ) : (
                              <FileText className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-600 transition-colors">
                              {resource.title}
                            </h3>
                            {resource.summary && (
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {resource.summary}
                              </p>
                            )}
                            {resource.tags && (
                              <div className="flex gap-2 flex-wrap">
                                {resource.tags.split(',').map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                                  >
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">暂无内容</p>
                  </div>
                )}
              </div>
            ) : (
              // 默认欢迎页面
              <div className="text-center py-16 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-8">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">
                  欢迎来到资源中心
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  从左侧选择一个分类开始探索，或使用搜索功能查找资源
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id, category.slug)}
                      className="p-5 border border-gray-200 rounded-xl hover:border-gray-900 hover:shadow-md transition-all text-left"
                    >
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-3">
                        {getIcon(category.icon)}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {category.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
                placeholder="搜索资源...使用AI智能匹配"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {isSearching ? '搜索中...' : '搜索'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-[980px] mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* Left Sidebar - Categories */}
          <aside className="w-64 flex-shrink-0">
            <nav className="sticky top-24">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                分类
              </h2>
              <ul className="space-y-1">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategoryClick(category.id, category.slug)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        selectedCategory === category.id
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex-shrink-0">{getIcon(category.icon)}</span>
                      <span className="font-medium">{category.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 min-w-0">
            {searchQuery && searchResults.length > 0 ? (
              // 搜索结果
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  搜索结果
                </h2>
                <div className="space-y-4">
                  {searchResults.map((resource) => (
                    <div
                      key={resource.id}
                      onClick={() => handleResourceClick(resource)}
                      className="group p-6 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                          {resource.contentType === 'video' ? (
                            <Play className="w-5 h-5 text-white" />
                          ) : (
                            <FileText className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                            {resource.title}
                          </h3>
                          {resource.summary && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {resource.summary}
                            </p>
                          )}
                          {resource.tags && (
                            <div className="flex gap-2 flex-wrap">
                              {resource.tags.split(',').map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedResource ? (
              // 资源详情
              <div>
                <div className="mb-8">
                  <button
                    onClick={() => {
                      setSelectedResource(null);
                      router.push(`/resources?category=${categorySlug}`);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 mb-4"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    返回列表
                  </button>

                  <h1 className="text-3xl font-semibold text-gray-900 mb-4">
                    {selectedResource.title}
                  </h1>

                  {selectedResource.contentType === 'video' && selectedResource.videoUrl && (
                    <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6">
                      <video
                        src={selectedResource.videoUrl}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  {selectedResource.content && (
                    <div className="prose prose-gray max-w-none">
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {selectedResource.content}
                      </div>
                    </div>
                  )}

                  {selectedResource.tags && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex gap-2 flex-wrap">
                        {selectedResource.tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedCategory ? (
              // 资源列表
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                {resources.length > 0 ? (
                  <div className="space-y-4">
                    {resources.map((resource) => (
                      <div
                        key={resource.id}
                        onClick={() => handleResourceClick(resource)}
                        className="group p-6 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                            {resource.contentType === 'video' ? (
                              <Play className="w-5 h-5 text-white" />
                            ) : (
                              <FileText className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                              {resource.title}
                            </h3>
                            {resource.summary && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {resource.summary}
                              </p>
                            )}
                            {resource.tags && (
                              <div className="flex gap-2 flex-wrap">
                                {resource.tags.split(',').map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                                  >
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">暂无内容</p>
                  </div>
                )}
              </div>
            ) : (
              // 默认欢迎页面
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  选择一个分类开始探索
                </h2>
                <p className="text-gray-600">
                  从左侧选择一个分类，或使用上方的搜索功能查找资源
                </p>
              </div>
            )}
          </main>
        </div>
      </section>

      <Footer />
    </div>
  );
}
