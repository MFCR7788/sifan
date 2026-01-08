'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: '首页', href: '/' },
  { name: '产品', href: '/pricing' },
  { name: '定制', href: '/configurator' },
  { name: '加盟', href: '/franchise' },
  { name: '关于', href: '/about' },
  { name: '联系', href: '/contact' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <Link href="/" className="flex items-center gap-2 hover:opacity-75 transition-opacity">
              <img
                src="/小超人.png"
                alt="魔法超人"
                className="w-7 h-7 object-contain"
              />
              <span className={`text-lg font-semibold transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-gray-900'
              }`}>
                魔法超人
              </span>
            </Link>
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
                  <>
                    <Link
                      href="/dashboard"
                      className="text-xs text-gray-600 transition-colors hover:opacity-60"
                    >
                      业务管理
                    </Link>
                    <Link
                      href="/profile"
                      className="text-xs text-gray-600 transition-colors hover:opacity-60"
                    >
                      {user?.name || '个人中心'}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-xs text-gray-600 transition-colors hover:opacity-60"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="text-xs bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
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
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-3 text-sm text-gray-600 border-b border-gray-100"
                    >
                      业务管理
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-3 text-sm text-gray-600 border-b border-gray-100"
                    >
                      个人中心
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-3 text-sm text-gray-600 border-b border-gray-100"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-3 text-sm text-blue-600 font-semibold"
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
    </nav>
  );
}
