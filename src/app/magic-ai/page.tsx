import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: '魔法超人AI - 智能驱动，未来已来',
  description: '魔法超人AI - 智能驱动，未来已来',
};

const menuItems = [
  { name: '首页', href: '/', description: '了解魔法超人AI的核心价值' },
  { name: '产品报价', href: '/pricing', description: '查看灵活的定价方案' },
  { name: '定制方案', href: '/configurator', description: '量身定制的解决方案' },
  { name: '招商加盟', href: '/franchise', description: '共创校服新零售未来' },
  { name: '关于我们', href: '/about', description: '了解更多关于我们' },
  { name: '联系我们', href: '/contact', description: '获取专业支持' },
];

const additionalLinks = [
  { name: '方案详情', href: '/solution', description: '深入了解解决方案' },
  { name: '会员系统', href: '/dashboard', description: '管理您的会员账户' },
  { name: '个人中心', href: '/profile', description: '查看和管理个人信息' },
];

export default function MagicAIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative w-16 h-16">
              <Image
                src="/小超人.png"
                alt="魔法超人AI"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight mb-4">
            魔法超人AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            智能驱动，未来已来
          </p>
        </div>
      </div>

      {/* Main Menu */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            主菜单
          </h2>
          <p className="text-lg text-gray-600">
            快速访问网站核心功能
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {menuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative">
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-blue-600 group-hover:scale-150 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
                <div className="mt-6 text-sm text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                  立即访问 →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Links */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            更多功能
          </h2>
          <p className="text-lg text-gray-600">
            探索更多服务与功能
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {additionalLinks.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {item.description}
              </p>
              <div className="text-xs text-blue-600 font-medium group-hover:translate-x-1 transition-transform duration-300">
                查看详情 →
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">
              开始您的数字化转型之旅
            </h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              选择适合您的方案，体验魔法超人AI带来的全新零售体验
            </p>
            <Link
              href="/pricing"
              className="inline-block px-10 py-4 bg-white text-blue-600 rounded-full font-medium hover:bg-blue-50 hover:scale-105 transition-all duration-200"
            >
              查看产品方案
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto text-center py-8 px-4">
          <p className="text-xs text-gray-500 mb-4">
            Copyright © 2025 浙江思杋服饰有限公司 魔法超人团队. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <Link href="/contact" className="hover:text-gray-900 transition-colors">
              联系我们
            </Link>
            <Link href="/about" className="hover:text-gray-900 transition-colors">
              关于我们
            </Link>
            <Link href="/franchise" className="hover:text-gray-900 transition-colors">
              招商加盟
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
