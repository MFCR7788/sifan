'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RechargeDialog from './RechargeDialog';

const navItems = [
  { name: '首页', href: '/' },
  { name: '产品', href: '/pricing' },
  { name: '工具', href: '/magic-ai' },
  { name: '资源', href: '/resources' },
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
  onOpenRecharge: () => void;
}

function Logo() {
  return (
    <Link href="/" className="hover:opacity-75 transition-opacity">
      <div className="flex items-center gap-2">
        <div className="relative w-7 h-7">
          <Image
            src="/小超人.png"
            alt="魔法超人AGI"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="text-lg font-semibold text-gray-900">
          魔法超人AGI
        </span>
      </div>
    </Link>
  );
}

function ProductDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const productItems = [
    { name: '产品介绍', href: 'https://www.yuque.com/qingfeng-kbbz1/mfcr', external: true },
    { name: '产品报价', href: '/pricing' },
    { name: '定制方案', href: '/configurator' },
    { name: '数字转型', href: '/general-web' },
    { name: '系统登录', href: 'https://mfcr.zjsifan.com/index.php/Retail/Login/index.html', external: true },
    { name: '手机后台', href: '/mobile-admin' },
  ];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setShowDropdown(true);
      }}
      onMouseLeave={handleMouseLeave}
    >
      {/* 触发区域 - 产品链接 */}
      <Link
        href="/pricing"
        className="text-xs transition-colors hover:opacity-60"
        onClick={(e) => e.preventDefault()}
      >
        产品
      </Link>

      {/* 下拉菜单 */}
      {showDropdown && (
        <div
          className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-max"
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {productItems.map((item) => {
            const linkProps = {
              href: item.href,
              className: 'block px-5 py-3 text-sm text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200 first:rounded-t-xl last:rounded-b-xl',
              onClick: () => setShowDropdown(false),
            };

            if (item.external) {
              return <a key={item.href} {...linkProps} target="_blank" rel="noopener noreferrer">{item.name}</a>;
            }
            return <Link key={item.href} {...linkProps}>{item.name}</Link>;
          })}
        </div>
      )}
    </div>
  );
}

function AboutDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const aboutItems = [
    { name: '关于我们', href: '/about' },
    { name: '公司资质', href: '/qualifications' },
    { name: '招商加盟', href: '/franchise' },
  ];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setShowDropdown(true);
      }}
      onMouseLeave={handleMouseLeave}
    >
      {/* 触发区域 - 关于链接 */}
      <Link
        href="/about"
        className="text-xs transition-colors hover:opacity-60"
        onClick={(e) => e.preventDefault()}
      >
        关于
      </Link>

      {/* 下拉菜单 */}
      {showDropdown && (
        <div
          className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-max"
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {aboutItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-5 py-3 text-sm text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
              onClick={() => setShowDropdown(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourcesDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resourceItems = [
    { name: '行业动态', href: '/business-school' },
    { name: '前沿资讯', href: '/business-school' },
    { name: '升级日志', href: '/business-school' },
    { name: '魔法学院', href: '/business-school' },
  ];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setShowDropdown(true);
      }}
      onMouseLeave={handleMouseLeave}
    >
      {/* 触发区域 - 资源链接 */}
      <Link
        href="/business-school"
        className="text-xs transition-colors hover:opacity-60"
        onClick={(e) => e.preventDefault()}
      >
        资源
      </Link>

      {/* 下拉菜单 */}
      {showDropdown && (
        <div
          className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-max"
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {resourceItems.map((item, index) => (
            <Link
              key={`resource-${index}`}
              href={item.href}
              className={`block px-5 py-3 text-sm text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200 ${
                index === 0 ? 'rounded-t-xl' : ''
              } ${
                index === resourceItems.length - 1 ? 'rounded-b-xl' : ''
              }`}
              onClick={() => setShowDropdown(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolsDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 工具分类
  const toolCategories = [
    {
      category: '文案创作',
      items: [
        { name: '文案改写', href: '/tool/rewrite' },
        { name: '标题生成', href: '/tool/title-gen' },
        { name: 'AI文案创作', href: '/tool/ai-copywriting' },
        { name: '短视频提文案', href: '/tool/short-video-caption' },
      ],
    },
    {
      category: '内容安全',
      items: [
        { name: '违禁词', href: '/tool/forbidden-words' },
      ],
    },
    {
      category: '视觉创作',
      items: [
        { name: 'AI图像生成', href: '/tool/image-gen', hasSubmenu: true },
        { name: 'AI视频生成', href: '/video-gen' },
        { name: '封面图制作', href: '/tool/coming-soon' },
        { name: '图文提取', href: '/tool/coming-soon' },
      ],
    },
    {
      category: '智能分析',
      items: [
        { name: '账号AI分析', href: '/tool/coming-soon' },
      ],
    },
  ];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setShowDropdown(true);
      }}
      onMouseLeave={handleMouseLeave}
    >
      {/* 触发区域 - 工具链接 */}
      <Link
        href="/magic-ai"
        className="text-xs transition-colors hover:opacity-60"
        onClick={(e) => e.preventDefault()}
      >
        工具
      </Link>

      {/* 下拉菜单 - 两列分类布局 */}
      {showDropdown && (
        <div
          className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-max"
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            {/* 左列 */}
            <div className="divide-y divide-gray-100">
              {toolCategories.slice(0, 2).map((category) => (
                <div key={category.category}>
                  {/* 分类标题 */}
                  <div className="px-5 py-2 bg-gray-50">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {category.category}
                    </span>
                  </div>
                  {/* 分类项 */}
                  {category.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-5 py-2.5 text-sm text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200"
                      onClick={() => setShowDropdown(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            {/* 右列 */}
            <div className="divide-y divide-gray-100">
              {toolCategories.slice(2, 4).map((category) => (
                <div key={category.category}>
                  {/* 分类标题 */}
                  <div className="px-5 py-2 bg-gray-50">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {category.category}
                    </span>
                  </div>
                  {/* 分类项 */}
                  {category.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-5 py-2.5 text-sm text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200"
                      onClick={() => setShowDropdown(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactHoverCard() {
  const [showCard, setShowCard] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 加载图片获取尺寸
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    
    // 计算适合显示的尺寸（最大宽度 200px，根据比例计算高度）
    const maxWidth = 200;
    const width = Math.min(maxWidth, img.naturalWidth);
    const height = width / aspectRatio;
    
    setImageDimensions({ width, height });
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowCard(false);
    }, 150);
  };

  const handleCardMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
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
      {/* 触发区域 - 联系链接 */}
      <Link
        href="/contact"
        className={`
          text-xs transition-colors hover:opacity-60
        `}
      >
        联系
      </Link>

      {/* 悬浮图片对话框 */}
      {showCard && (
        <div
          className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          style={{
            width: imageDimensions?.width ? `${imageDimensions.width + 32}px` : 'auto',
          }}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 text-center">客服微信</h4>
            <img
              src="/assets/KF.png"
              alt="联系我们"
              className="rounded-lg"
              onLoad={handleImageLoad}
              style={{
                width: imageDimensions?.width ? `${imageDimensions.width}px` : 'auto',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function UserHoverCard({ user, onLogout, onOpenRecharge }: UserHoverCardProps) {
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

  // 获取认证头（双重认证：Cookie + Header）
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {};
    // 备选方案：从 sessionStorage 读取 userId
    if (typeof window !== 'undefined') {
      const sessionUserId = sessionStorage.getItem('userId');
      if (sessionUserId) {
        headers['x-user-id'] = sessionUserId;
      }
    }
    return headers;
  };

  const fetchMemberInfo = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const headers = getAuthHeaders();
      console.log('=== 开始获取会员信息 ===');
      console.log('当前URL:', typeof window !== 'undefined' ? window.location.href : 'server-side');
      console.log('浏览器Cookie:', typeof document !== 'undefined' ? document.cookie : 'N/A');
      console.log('认证头:', headers);

      const response = await fetch('/api/user/me/member', {
        credentials: 'include',
        headers,
      });

      console.log('Member API response status:', response.status);
      console.log('Member API response headers:', response.headers);

      // 先读取响应文本，避免重复读取
      const rawText = await response.text();
      console.log('原始响应内容 (前 500 字符):', rawText.substring(0, 500));

      if (response.ok) {
        try {
          const data = JSON.parse(rawText);
          console.log('✅ Member data 成功:', data);
          setMember(data.member);
        } catch (parseError) {
          console.error('❌ JSON 解析失败:', parseError);
          setErrorMessage('数据格式错误');
        }
      } else if (response.status === 401) {
        console.log('❌ 用户未登录或Cookie丢失');
        console.log('401错误详情:', rawText);
        setErrorMessage('请先登录');
      } else {
        try {
          const errorData = JSON.parse(rawText);
          console.log('❌ 其他错误:', errorData);
          setErrorMessage(errorData.error || '加载失败');
        } catch (parseError) {
          console.error('❌ JSON 解析失败:', parseError);
          setErrorMessage('服务器返回错误');
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch member:', error);
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
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">到期时间</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {member.expiresAt
                      ? new Date(member.expiresAt).toLocaleDateString('zh-CN')
                      : '永久'}
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
            {/* 第一行：充值和个人中心 */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // 阻止事件冒泡
                  onOpenRecharge();
                  setShowCard(false);
                }}
                className="flex-1 text-center text-xs bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                充值
              </button>
              <Link
                href="/profile"
                className="flex-1 text-center text-xs bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setShowCard(false)}
              >
                个人中心
              </Link>
            </div>
            {/* 第二行：退出登录 */}
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
  const { isAuthenticated, user, isLoading, logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);

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
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-baseline space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                // 为"联系"项使用特殊的悬停组件
                if (item.name === '联系') {
                  return <ContactHoverCard key={item.href} />;
                }
                // 为"产品"项使用下拉菜单组件
                if (item.name === '产品') {
                  return <ProductDropdown key={item.href} />;
                }
                // 为"工具"项使用下拉菜单组件
                if (item.name === '工具') {
                  return <ToolsDropdown key={item.href} />;
                }
                // 为"资源"项使用下拉菜单组件
                if (item.name === '资源') {
                  return <ResourcesDropdown key={item.href} />;
                }
                // 为"关于"项使用下拉菜单组件
                if (item.name === '关于') {
                  return <AboutDropdown key={item.href} />;
                }
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

              {/* 管理菜单 - 仅管理员可见 */}
              {isAuthenticated && isAdmin && (
                <Link
                  href="/admin"
                  className={`
                    text-xs transition-colors hover:opacity-60
                    ${pathname === '/admin'
                      ? 'text-gray-900 font-semibold'
                      : 'text-gray-600'
                    }
                  `}
                >
                  管理
                </Link>
              )}
            </div>

            {/* Auth Links */}
            {isLoading ? (
              // 加载时显示占位符，保持布局稳定
              <div className="flex items-center space-x-6 pl-6 border-l border-gray-200">
                <div className="w-16 h-8 bg-gray-100 rounded-full animate-pulse" />
                <div className="w-16 h-8 bg-gray-900 rounded-full animate-pulse" />
              </div>
            ) : (
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
                    onOpenRecharge={() => setShowRechargeDialog(true)}
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
              // 为"产品"项显示为标题和子菜单
              if (item.name === '产品') {
                return (
                  <div key={item.href}>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-900 border-b border-gray-100">
                      产品
                    </div>
                    <a
                      href="https://www.yuque.com/qingfeng-kbbz1/mfcr"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      产品介绍
                    </a>
                    <Link
                      href="/pricing"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      产品报价
                    </Link>
                    <Link
                      href="/configurator"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      定制方案
                    </Link>
                    <Link
                      href="/general-web"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      数字转型
                    </Link>
                    <a
                      href="https://mfcr.zjsifan.com/index.php/Retail/Login/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      系统登录
                    </a>
                    <Link
                      href="/mobile-admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      手机后台
                    </Link>
                  </div>
                );
              }
              // 为"工具"项显示为标题和子菜单
              if (item.name === '工具') {
                const mobileToolItems = [
                  { name: '文案改写', href: '/tool/rewrite' },
                  { name: '标题生成', href: '/tool/title-gen' },
                  { name: '违禁词', href: '/tool/forbidden-words' },
                  { name: '图文提取', href: '/tool/coming-soon' },
                  { name: '短视频提文案', href: '/tool/short-video-caption' },
                  { name: 'AI文案创作', href: '/tool/ai-copywriting' },
                  { name: 'AI视频生成', href: '/video-gen' },
                  { name: '封面图制作', href: '/tool/coming-soon' },
                  { name: '账号AI分析', href: '/tool/coming-soon' },
                ];

                return (
                  <div key={item.href}>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-900 border-b border-gray-100">
                      工具
                    </div>
                    {mobileToolItems.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                );
              }
              // 为"资源"项显示为标题和子菜单
              if (item.name === '资源') {
                return (
                  <div key={item.href}>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-900 border-b border-gray-100">
                      资源
                    </div>
                    <Link
                      href="/resources/industry"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      行业动态
                    </Link>
                    <Link
                      href="/resources/news"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      前沿资讯
                    </Link>
                    <Link
                      href="/resources/changelog"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      升级日志
                    </Link>
                    <Link
                      href="/resources/academy"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      魔法学院
                    </Link>
                  </div>
                );
              }
              // 为"关于"项显示为标题和子菜单
              if (item.name === '关于') {
                return (
                  <div key={item.href}>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-900 border-b border-gray-100">
                      关于
                    </div>
                    <Link
                      href="/about"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      关于我们
                    </Link>
                    <Link
                      href="/qualifications"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      公司资质
                    </Link>
                    <Link
                      href="/franchise"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-sm transition-colors border-b border-gray-100 text-gray-600"
                    >
                      招商加盟
                    </Link>
                  </div>
                );
              }
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

            {/* 管理菜单 - 仅管理员可见 */}
            {isAuthenticated && isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  block px-3 py-3 text-sm transition-colors border-b border-gray-100
                  ${pathname === '/admin'
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-600'
                  }
                `}
              >
                管理
              </Link>
            )}

            {/* Mobile Auth Links */}
            {isLoading ? (
              // 加载时显示占位符
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-3 py-3 h-10 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="px-3 py-3 h-10 bg-gray-100 rounded animate-pulse" />
              </div>
            ) : (
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

      {/* 充值对话框 - 移到 Navigation 组件层级，避免条件渲染导致的状态丢失 */}
      <RechargeDialog
        isOpen={showRechargeDialog}
        onClose={() => setShowRechargeDialog(false)}
      />
    </nav>
  );
}
