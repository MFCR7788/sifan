'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function FranchisePage() {
  const [activeTab, setActiveTab] = useState<'policy' | 'investment' | 'process' | 'support'>('policy');

  const tabs = [
    { id: 'policy', label: '加盟政策' },
    { id: 'investment', label: '投资构成' },
    { id: 'process', label: '加盟流程' },
    { id: 'support', label: '品牌支持' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                MagicAI
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-300 hover:text-cyan-400 transition-colors">
                首页
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-cyan-400 transition-colors">
                关于我们
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-cyan-400 transition-colors">
                产品报价
              </Link>
              <Link href="/franchise" className="text-cyan-400">
                招商加盟
              </Link>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link
                href="/pricing"
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                立即体验
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                招商加盟政策
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              加入魔法超人，共创校服新零售未来
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity">
                咨询加盟
              </button>
              <Link
                href="/pricing"
                className="px-8 py-4 border border-cyan-500 rounded-full font-semibold text-lg hover:bg-cyan-500/10 transition-colors"
              >
                查看产品
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-3 rounded-full font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            {activeTab === 'policy' && <PolicyContent />}
            {activeTab === 'investment' && <InvestmentContent />}
            {activeTab === 'process' && <ProcessContent />}
            {activeTab === 'support' && <SupportContent />}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm rounded-3xl border border-cyan-500/30 text-center">
            <h2 className="text-4xl font-bold mb-4">
              准备好加入我们了吗？
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              立即联系我们，开启您的创业之旅
            </p>
            <button className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity">
              联系我们：4000678558-0
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 浙江思杋服饰有限公司 魔法超人团队. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function PolicyContent() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-cyan-400 mb-6">加盟条件</h3>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-white/5 rounded-xl">
            <h4 className="font-bold text-lg mb-4">资质要求</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• 具有独立承担民事责任能力</li>
              <li>• 具有一定的资金实力和市场开拓能力</li>
              <li>• 认同魔法超人校服品牌理念和经营模式</li>
            </ul>
          </div>

          <div className="p-6 bg-white/5 rounded-xl">
            <h4 className="font-bold text-lg mb-4">经营场所</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• 一线城市：不少于50平方米</li>
              <li>• 二线城市：不少于60平方米</li>
              <li>• 三四线城市：不少于70平方米</li>
              <li>• 优先选择学校周边3公里范围内</li>
            </ul>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl">
          <h4 className="font-bold text-lg mb-4 text-cyan-400">资金要求</h4>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-white mb-2">20万</div>
              <div className="text-gray-400 mb-1">省级代理</div>
              <div className="text-sm text-gray-500">加盟费</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-white mb-2">10万</div>
              <div className="text-gray-400 mb-1">市级代理</div>
              <div className="text-sm text-gray-500">加盟费</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-white mb-2">3万</div>
              <div className="text-gray-400 mb-1">区级代理</div>
              <div className="text-sm text-gray-500">加盟费</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-cyan-400 mb-6">分润机制</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white/5 rounded-xl">
            <div className="text-4xl font-bold text-cyan-400 mb-2">1%</div>
            <div className="text-gray-300">总部分润</div>
          </div>
          <div className="p-6 bg-white/5 rounded-xl">
            <div className="text-4xl font-bold text-cyan-400 mb-2">1%</div>
            <div className="text-gray-300">区域加盟商分润</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvestmentContent() {
  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-cyan-400 mb-6">投资构成</h3>

      <div className="space-y-4">
        <div className="p-6 bg-white/5 rounded-xl flex justify-between items-center">
          <div>
            <div className="font-bold text-lg mb-1">服务费</div>
            <div className="text-gray-400">含品牌授权费、系统使用维护费、运营培训等</div>
          </div>
          <div className="text-2xl font-bold text-cyan-400">
            首年2万/年
            <span className="text-base text-gray-400 ml-2">次年1万/年</span>
          </div>
        </div>

        <div className="p-6 bg-white/5 rounded-xl">
          <div className="font-bold text-lg mb-4">其他投资费用（由加盟商承担）</div>
          <ul className="grid md:grid-cols-2 gap-3 text-gray-300">
            <li>• 房租</li>
            <li>• 装修费用</li>
            <li>• 货柜购置</li>
            <li>• 门店设备</li>
            <li>• 营业员工资</li>
            <li>• 备货费用</li>
            <li>• 日常经营费用</li>
          </ul>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl">
        <h4 className="font-bold text-lg mb-4 text-cyan-400">盈利模式</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="font-semibold mb-1">商品销售</div>
            <div className="text-sm text-gray-400">销售校服获取利润</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="font-semibold mb-1">会员服务</div>
            <div className="text-sm text-gray-400">充值、专享商品等</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="font-semibold mb-1">促销活动</div>
            <div className="text-sm text-gray-400">总部定期组织活动</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessContent() {
  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-cyan-400 mb-6">加盟流程</h3>

      <div className="space-y-6">
        {[
          {
            step: '01',
            title: '提交申请',
            description: '填写《魔法超人校服加盟申请表》，提交个人或企业相关资料（法人身份证、租房合同、房产证、门店平面图）'
          },
          {
            step: '02',
            title: '资质审核',
            description: '总部对加盟商的资质进行审核，审核通过后签订加盟意向书，缴纳意向金'
          },
          {
            step: '03',
            title: '签订合同',
            description: '签订正式加盟合同，明确双方权利和义务，支付相关费用'
          },
          {
            step: '04',
            title: '门店筹备',
            description: '在总部指导下进行选址、装修，搭建新零售系统和线上商城'
          },
          {
            step: '05',
            title: '开业运营',
            description: '完成人员招聘、培训、宣传等准备工作，正式开业'
          }
        ].map((item, index) => (
          <div key={index} className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold">
                {item.step}
              </div>
            </div>
            <div className="flex-1 p-6 bg-white/5 rounded-xl">
              <h4 className="font-bold text-lg mb-2">{item.title}</h4>
              <p className="text-gray-400">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportContent() {
  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-cyan-400 mb-6">品牌支持</h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-white/5 rounded-xl">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h4 className="font-bold text-lg mb-2">品牌授权</h4>
          <p className="text-gray-400">授权期限3年，期满前一月优先续签，使用品牌标识、商标、专利等</p>
        </div>

        <div className="p-6 bg-white/5 rounded-xl">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h4 className="font-bold text-lg mb-2">系统赋能</h4>
          <p className="text-gray-400">提供新零售系统，支持多种支付方式，实时库存管理，数据统计分析</p>
        </div>

        <div className="p-6 bg-white/5 rounded-xl">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h4 className="font-bold text-lg mb-2">培训支持</h4>
          <p className="text-gray-400">提供线上课程和线下集训，包括市场拓展、团队管理、营销话术等</p>
        </div>

        <div className="p-6 bg-white/5 rounded-xl">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h4 className="font-bold text-lg mb-2">运营支持</h4>
          <p className="text-gray-400">协助选址、装修、产品供应、市场推广、培训指导等全方位支持</p>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl">
        <h4 className="font-bold text-lg mb-4 text-cyan-400">加盟商激励</h4>
        <div className="space-y-3 text-gray-300">
          <p>• 任务内完成门店：奖励5000元/店</p>
          <p>• 超任务完成门店：奖励10000元/店</p>
          <p>• 少于任务数：扣5000元/店</p>
          <p className="text-sm text-gray-500">*例如：任务数设定5家，完成5家奖25000元，完成6家奖35000元</p>
        </div>
      </div>
    </div>
  );
}
