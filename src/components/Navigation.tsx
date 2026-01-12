'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: '首页', href: '/' },
  { name: '产品', href: '/pricing' },
  { name: '定制', href: '/configurator' },
  { name: '加盟', href: '/franchise' },
  { name: '关于', href: '/about' },
  { name: '联系', href: '/contact' },
];

// 会员等级映射
const MEMBER_LEVEL_MAP: Record<string, string> = {
  basic: '基础会员',
  silver: '银牌会员',
  gold: '金牌会员',
  platinum: '白金会员',
  diamond: '钻石会员',
};

interface UserHoverCardProps {
  user: any;
  onLogout: () => void;
}

function UserHoverCard({ user, onLogout }: UserHoverCardProps) {
  const [member, setMember] = useState<any>(null);
  const [showCard, setShowCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showCard && !member) {
      fetchMemberInfo();
    }
  }, [showCard]);

  const fetchMemberInfo = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      console.log('开始获取会员信息...');
      const response = await fetch('/api/user/me/member', {
        credentials: 'include',
      });
      console.log('Member API response:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Member data:', data);
        setMember(data.member);
      } else if (response.status === 401) {
        console.log('用户未登录或Cookie丢失');
        setErrorMessage('请先登录');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || '加载失败');
      }
    } catch (error) {
      console.error('Failed to fetch member:', error);
      setErrorMessage('网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseLeave = () => {
    // 延迟关闭，给用户时间移动鼠标到悬浮卡片
    timeoutRef.current = setTimeout(() => {
      setShowCard(false);
    }, 150);
  };

  const handleCardMouseEnter = () => {
    // 鼠标进入卡片，清除关闭定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    // 鼠标离开卡片，延迟关闭
    timeoutRef.current = setTimeout(() => {
      setShowCard(false);
    }, 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setShowCard(true);
      }}
      onMouseLeave={handleMouseLeave}
    >
      {/* 触发按钮 */}
      <button className="text-xs text-gray-600 transition-colors hover:opacity-60 focus:outline-none">
        {user?.name || '个人中心'}
      </button>

      {/* 悬浮卡片 */}
      {showCard && (
        <div
          className="user-hover-card absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          {/* 用户信息头部 */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-4 text-white">
            <div className="text-sm font-semibold">{user?.name}</div>
            <div className="text-xs opacity-70 mt-1">{user?.email || '未设置邮箱'}</div>
            <div className="text-xs opacity-70">{user?.phone}</div>
          </div>

          {/* 会员信息 */}
          <div className="px-6 py-4 border-b border-gray-100">
            {isLoading ? (
              <div className="text-xs text-gray-500">加载会员信息...</div>
            ) : member ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">会员等级</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {MEMBER_LEVEL_MAP[member.memberLevel] || '未知等级'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">余额</span>
                  <span className="text-xs font-semibold text-gray-900">
                    ¥{(member.balance / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">积分</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {member.points.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : errorMessage ? (
              <div className="text-xs text-red-500">{errorMessage}</div>
            ) : (
              <div className="text-xs text-gray-500">会员信息加载失败</div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="px-6 py-3 space-y-2">
            <Link
              href="/profile"
              className="block w-full text-center text-xs bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => setShowCard(false)}
            >
              个人中心
            </Link>
            <button
              onClick={() => {
                onLogout();
                setShowCard(false);
              }}
              className="w-full text-xs text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (isAuthenticated) {
      router.push('/magic-ai');
    } else {
      setShowLoginPrompt(true);
    }
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 hover:opacity-75 transition-opacity"
            >
              <div className="relative w-7 h-7">
                <Image
                  src="/小超人.png"
                  alt="魔法超人AI"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className={`text-lg font-semibold transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-gray-900'
              }`}>
                魔法超人AI
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-baseline space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      text-xs transition-colors hover:opacity-60
                      ${isActive
                        ? 'text-gray-900 font-semibold'
                        : 'text-gray-600'
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Auth Links */}
            {!isLoading && (
              <div className="flex items-center space-x-6 pl-6 border-l border-gray-200">
                {isAuthenticated ? (
                  <UserHoverCard
                    user={user}
                    onLogout={async () => {
                      try {
                        await logout();
                        router.push('/');
                      } catch (error) {
                        console.error('Logout error:', error);
                      }
                    }}
                  />
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-xs text-gray-900 border border-gray-900 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="text-xs bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      注册
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:bg-gray-100/50 focus:outline-none"
            >
              <span className="sr-only">打开菜单</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    block px-3 py-3 text-sm transition-colors border-b border-gray-100 last:border-0
                    ${isActive
                      ? 'text-gray-900 font-semibold'
                      : 'text-gray-600'
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
            {/* Mobile Auth Links */}
            {!isLoading && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-3 text-sm text-gray-600 border-b border-gray-100"
                    >
                      {user?.name || '个人中心'}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-3 text-sm text-gray-900 border-b border-gray-100"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-3 text-sm text-gray-900 font-semibold"
                    >
                      注册
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">提示</h3>
            <p className="text-gray-600 mb-6">您好，请登录后方可用AI功能！</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  router.push('/login');
                }}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
