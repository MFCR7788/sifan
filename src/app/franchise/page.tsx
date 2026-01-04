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
      <h3 className="text-2xl font-bold text-cyan-400 mb-6">区域合伙落地方案</h3>

      {/* Phase 1 */}
      <div className="p-6 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
            1
          </div>
          <h4 className="text-xl font-bold">第一阶段：系统接入与基础建设（1-3个月）</h4>
        </div>
        <div className="space-y-4 text-gray-300">
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">数字化档案建立</h5>
            <p>完成区域内所有销售网点基础信息标准化录入，包括门店位置、面积、负责人、员工信息、主营品类、客户画像等，通过魔法超人平台建立数字化档案库。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">全域一盘货系统部署</h5>
            <p>打通抖店、快手、小红书、视频号、美团、淘宝、拼多多等多平台订单抓取功能，实现多平台订单自动同步；建立"总仓-分仓-网点"三级库存体系，实现库存智能统筹。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">专属团队搭建</h5>
            <p>采用"总部统筹+区域落地"架构，配备运营总监、区域经理、培训师、客服专员等岗位，完成岗前集训（1周）和在岗带教（1个月）。</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">阶段目标</h5>
            <p className="text-white font-medium">完成核心销售网点全接入，网点单店平均销量提升15%-20%</p>
          </div>
        </div>
      </div>

      {/* Phase 2 */}
      <div className="p-6 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
            2
          </div>
          <h4 className="text-xl font-bold">第二阶段：增量策略实施（3-6个月）</h4>
        </div>
        <div className="space-y-4 text-gray-300">
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">分销裂变体系搭建</h5>
            <p>搭建"总部-区域-网点-团长"四级分销体系，设置阶梯式佣金规则；开通快团团功能，发动员工、老客户成为分销团长，实现客源裂变式增长。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">全渠道订单赋能</h5>
            <p>多平台订单自动抓取、同步至系统后台，实时同步订单状态；就近网点智能发货，避免缺货和积压问题；设置库存预警阈值，自动提醒补货。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">流量整合导入</h5>
            <p>整合抖音、快手、小红书等平台公域流量精准导流；优化美团、饿了么本地生活服务；搭建微信私域社群，实现"私域沉淀-分销拓客-复购转化"良性循环。</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">阶段目标</h5>
            <p className="text-white font-medium">所有销售网点标准化运营，整体销量提升30%-40%，培养3-5家标杆示范网点</p>
          </div>
        </div>
      </div>

      {/* Phase 3 */}
      <div className="p-6 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
            3
          </div>
          <h4 className="text-xl font-bold">第三阶段：模式沉淀与规模复制（6-12个月）</h4>
        </div>
        <div className="space-y-4 text-gray-300">
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">抖音生态专项运营</h5>
            <p>搭建抖店云连锁，实现多网点抖音店铺统一管理、商品同步、库存统筹；提供抖音矩阵代运营服务，包括账号定位、内容策划、视频拍摄剪辑、直播运营等。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">本地化服务升级</h5>
            <p>通过平台数据洞察区域消费偏好，指导商家优化商品结构；开展本地社群运营、同城直播等特色服务，提升本地客户粘性和复购率。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">方法论沉淀与复制</h5>
            <p>总结试点成功经验，形成可复制的"区域赋能方法论"；输出标准化运营手册、培训课件和案例库；向更多区域推广复制，扩大市场份额。</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-lg">
            <h5 className="font-semibold text-cyan-400 mb-2">阶段目标</h5>
            <p className="text-white font-medium">构建"线下网点数字化运营+私域流量沉淀+全渠道增量"全新模式，实现销量持续增长与品牌竞争力升级</p>
          </div>
        </div>
      </div>

      {/* Support Guarantee */}
      <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl">
        <h4 className="font-bold text-lg mb-4 text-cyan-400">赋能保障与风险管控</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold mb-2">资源保障</h5>
            <p className="text-sm text-gray-400">成立专项赋能小组，双牵头保障技术迭代、流量资源供给、运营团队投入</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold mb-2">考核保障</h5>
            <p className="text-sm text-gray-400">建立核心考核指标，与服务费、分成直接挂钩，确保赋能效果</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-semibold mb-2">退出保障</h5>
            <p className="text-sm text-gray-400">6个月内未达增量目标70%，可协商终止合作，退还50%未执行服务费</p>
          </div>
        </div>
      </div>

      {/* Profit Model */}
      <div className="p-6 bg-white/5 rounded-xl">
        <h4 className="font-bold text-lg mb-4 text-cyan-400">盈利模式</h4>
        <div className="space-y-3 text-gray-300">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-cyan-400 text-sm">1</span>
            <div>
              <p className="font-medium">基础服务费</p>
              <p className="text-sm text-gray-400">3000元/年/店，覆盖系统使用、基础培训、客服支持</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-cyan-400 text-sm">2</span>
            <div>
              <p className="font-medium">增量分成</p>
              <p className="text-sm text-gray-400">提取通过平台实现的增量销售额的3%-5%作为平台服务费</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-cyan-400 text-sm">3</span>
            <div>
              <p className="font-medium">供应链佣金</p>
              <p className="text-sm text-gray-400">整合魔法超人供应链资源，按采购额收取3%-8%佣金</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-cyan-400 text-sm">4</span>
            <div>
              <p className="font-medium">抖音生态专项服务费</p>
              <p className="text-sm text-gray-400">抖店云连锁搭建费300-500元/店，年度运营费8-10万元；抖音矩阵代运营5-8万元/年/账号</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
