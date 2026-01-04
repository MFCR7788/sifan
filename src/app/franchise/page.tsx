'use client';

import Navigation from '@/components/Navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function FranchisePage() {
  const [activeTab, setActiveTab] = useState<'policy' | 'investment' | 'process' | 'support' | 'implementation'>('policy');

  const tabs = [
    { id: 'policy', label: '加盟政策' },
    { id: 'investment', label: '投资构成' },
    { id: 'process', label: '加盟流程' },
    { id: 'support', label: '品牌支持' },
    { id: 'implementation', label: '落地方案' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

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
            {activeTab === 'implementation' && <ImplementationContent />}
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
              联系我们：400-0678-558
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

function ImplementationContent() {
  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-cyan-400 mb-6">全平台运营落地方案</h3>

      {/* Core Philosophy */}
      <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl">
        <h4 className="font-bold text-lg mb-4 text-cyan-400">核心逻辑</h4>
        <p className="text-gray-300 leading-relaxed">
          精准引流 → 私域沉淀 → 持续复购，通过多平台曝光、内容种草、广告定向形成完整的流量获取和转化闭环。
          总部提供标准化工具+培训+数据支持，确保全国门店快速复制，降低运营成本。
        </p>
      </div>

      {/* Platform Setup */}
      <div className="p-6 bg-white/5 rounded-xl">
        <h4 className="font-bold text-lg mb-4 text-cyan-400">一、主流平台开通指南</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold mb-2 text-white">抖音</h5>
            <p className="text-sm text-gray-400 mb-2">企业号蓝V认证600元/年</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 营业执照（盖章）</li>
              <li>• 法人身份证</li>
              <li>• 品牌授权书</li>
              <li>• 门店实景照片</li>
            </ul>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold mb-2 text-white">小红书</h5>
            <p className="text-sm text-gray-400 mb-2">企业号免费认证（3-5天）</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 营业执照</li>
              <li>• 品牌授权书</li>
              <li>• 门店地址证明</li>
              <li>• 品牌LOGO</li>
            </ul>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold mb-2 text-white">微信生态</h5>
            <p className="text-sm text-gray-400 mb-2">公众号300元/年</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 公众号企业号认证</li>
              <li>• 视频号企业账号</li>
              <li>• 营业执照+法人身份证</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Phase 1: Traffic Acquisition */}
      <div className="p-6 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
            1
          </div>
          <h4 className="text-xl font-bold">第一阶段：精准引流与私域沉淀（1-3个月）</h4>
        </div>
        <div className="space-y-4 text-gray-300">
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">抖音：流量爆发与私域沉淀</h5>
            <div className="space-y-2 text-sm">
              <p><strong className="text-white">内容发布：</strong>每周3-5条视频，涵盖穿搭教程、面料解析，使用热门BGM和字幕特效</p>
              <p><strong className="text-white">直播引流：</strong>每周2场直播，包括试穿展示、工厂探秘，设置"福袋抽奖"和"暗号福利"</p>
              <p><strong className="text-white">广告投放：</strong>定向家长群体（25-45岁），引导至企业微信，实现私域沉淀</p>
              <p><strong className="text-white">关键技巧：</strong>前三秒抛出痛点，如"校服易脏？3招解决！"，每15分钟口播引导加企微</p>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">小红书：高颜值种草与转化</h5>
            <div className="space-y-2 text-sm">
              <p><strong className="text-white">笔记发布：</strong>标题带关键词"校服推荐"，封面用校园场景图，内容突出特色优势</p>
              <p><strong className="text-white">活动策划：</strong>发起"校服改造大赛"，联合教育博主推广，提高品牌曝光度</p>
              <p><strong className="text-white">转化引导：</strong>文末加"扫码入群领9折券"，评论区置顶跳转链接</p>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">微信生态：私域核心阵地</h5>
            <div className="space-y-2 text-sm">
              <p><strong className="text-white">公众号推文：</strong>发布《校服保养指南》《会员日福利》等，菜单栏设置"福利中心"</p>
              <p><strong className="text-white">视频号直播：</strong>主题"设计师答疑"，发放"直播间专属优惠码"</p>
              <p><strong className="text-white">联动运营：</strong>直播后自动私信回放链接+优惠券领取指南</p>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">阶段目标</h5>
            <p className="text-white font-medium">完成多平台账号开通与基础运营，建立私域流量池，单店获客成本降低30%</p>
          </div>
        </div>
      </div>

      {/* Phase 2: Community & Membership */}
      <div className="p-6 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
            2
          </div>
          <h4 className="text-xl font-bold">第二阶段：社群裂变与会员运营（3-6个月）</h4>
        </div>
        <div className="space-y-4 text-gray-300">
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">社群裂变方法（总部提供模板）</h5>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white font-medium mb-1">老带新奖励</p>
                <p>邀请3人入群，双方各得10元无门槛券，利用企业微信"群活码"自动统计</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">拼团裂变</p>
                <p>发起"3人成团立减50元"的拼团活动，链接附带门店信息，鼓励分享至朋友圈</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">会员分层运营</h5>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="w-20 flex-shrink-0 bg-cyan-500/20 rounded px-2 py-1 text-cyan-400 text-xs">普通会员</span>
                <p>注册享9.5折，积分兑礼品（500积分换书包），满足基本优惠需求</p>
              </div>
              <div className="flex gap-3">
                <span className="w-20 flex-shrink-0 bg-cyan-500/20 rounded px-2 py-1 text-cyan-400 text-xs">PLUS会员</span>
                <p>消费满1000元升级，享8折+生日礼包+专属客服，为高价值用户提供专属服务</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white/5 rounded text-sm">
              <p className="text-white font-medium mb-1">关键动作：</p>
              <p>• 每月15日"PLUS会员日"，推送专属拼团（3人成团6折）</p>
              <p>• 对沉默会员推送"回归礼包"（满300减50），唤醒沉睡用户</p>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">阶段目标</h5>
            <p className="text-white font-medium">社群规模扩大至500人以上，会员复购率提升至40%，培养10-20名核心分销团长</p>
          </div>
        </div>
      </div>

      {/* Phase 3: System & Tools */}
      <div className="p-6 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
            3
          </div>
          <h4 className="text-xl font-bold">第三阶段：新零售系统与工具赋能（6-12个月）</h4>
        </div>
        <div className="space-y-4 text-gray-300">
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">新零售系统营销工具</h5>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">🛒</span>
                </div>
                <p className="text-white font-medium">拼团/秒杀</p>
                <p className="text-gray-400">快速提升销量</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">🎫</span>
                </div>
                <p className="text-white font-medium">优惠券</p>
                <p className="text-gray-400">提升转化率</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-white font-medium">数据看板</p>
                <p className="text-gray-400">实时监控效果</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">总部赋能工具包</h5>
            <div className="space-y-2 text-sm">
              <p><strong className="text-white">内容模板：</strong>提供直播脚本、社群话术、裂变海报（PSD文件）</p>
              <p><strong className="text-white">数据看板：</strong>提供《每日运营数据表》《会员转化率追踪表》</p>
              <p><strong className="text-white">系统指南：</strong>拼团/秒杀活动设置教程、优惠券发放流程</p>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">培训与督导支持</h5>
            <div className="space-y-2 text-sm">
              <p><strong className="text-white">线上培训：</strong>每月1次直播课，涵盖"抖音投流技巧""社群7天激活法"等</p>
              <p><strong className="text-white">驻店指导：</strong>开业前总部运营团队到店协助策划活动，手把手指导门店运营</p>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">阶段目标</h5>
            <p className="text-white font-medium">门店熟练使用新零售系统，销量提升50%-60%，建立标准化运营体系</p>
          </div>
        </div>
      </div>

      {/* Success Cases */}
      <div className="p-6 bg-white/5 rounded-xl">
        <h4 className="font-bold text-lg mb-4 text-cyan-400">关键成功案例</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-lg">
            <h5 className="font-semibold mb-2 text-white">济南康虹路店</h5>
            <p className="text-sm text-gray-300">通过会员营销体系，首月充值2万余元，销售额5万，现每日销售额稳步提升，成功实现业绩快速增长</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-lg">
            <h5 className="font-semibold mb-2 text-white">路桥壹号店</h5>
            <p className="text-sm text-gray-300">通过社群营销，老带新裂变，4月份营业额达18万，充分展示社群裂变的强大威力和运营效果</p>
          </div>
        </div>
      </div>

      {/* Execution Principles */}
      <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl">
        <h4 className="font-bold text-lg mb-4 text-cyan-400">执行原则</h4>
        <p className="text-white text-center text-lg font-medium">
          简单、明确、可复制，拒绝复杂理论，聚焦动作落地！
          <br />
          通过精准引流 - 私域沉淀 - 持续复购闭环，助力门店实现业绩倍增！
        </p>
      </div>
    </div>
  );
}
