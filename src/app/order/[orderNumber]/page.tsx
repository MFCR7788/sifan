'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  platform: string;
  serviceLevel: string;
  selectedFeatures: string[];
  valueServices: string[];
  totalPrice: number;
  monthlyFee: number;
  status: string;
  notes: string;
  createdAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);

  // 核心功能分类定义
  const coreModules = [
    {
      id: 'distribution-system',
      name: '分销裂变体系',
      description: '建立多层级分销网络，快速拓展销售渠道',
      icon: '🤝'
    },
    {
      id: 'marketing-activities',
      name: '营销活动中心',
      description: '丰富的营销工具，提升销售转化率',
      icon: '🎁'
    },
    {
      id: 'member-operation',
      name: '会员运营体系',
      description: '深度运营客户资产，提升复购率',
      icon: '👥'
    },
    {
      id: 'order-inventory',
      name: '订单与库存',
      description: '打通线上线下一盘货，实时同步库存数据',
      icon: '📦'
    },
    {
      id: 'data-analysis',
      name: '数据分析与监控',
      description: '构建数据驾驶舱，实时掌握经营状况',
      icon: '📊'
    },
    {
      id: 'advanced-functions',
      name: '高级功能',
      description: '智能化功能，提升运营效率',
      icon: '⚡'
    }
  ];

  // 功能名称到分类的映射
  const featureCategoryMap: Record<string, string> = {
    '分销员🔥': 'distribution-system',
    '分账2.0🔥': 'distribution-system',
    '一键开团🔥': 'distribution-system',
    '多方分账': 'distribution-system',
    '秒杀': 'marketing-activities',
    '预售': 'marketing-activities',
    '拼团': 'marketing-activities',
    '红包': 'marketing-activities',
    '幸运抽奖': 'marketing-activities',
    '定时折扣': 'marketing-activities',
    '打折/特价🔥': 'marketing-activities',
    '商品组合套餐': 'marketing-activities',
    '第二件打折': 'marketing-activities',
    '满额立减': 'marketing-activities',
    '购物卡🔥': 'marketing-activities',
    '会员专享券': 'member-operation',
    '积分商城2.0': 'member-operation',
    '积分签到': 'member-operation',
    '进销存': 'order-inventory',
    '多平台抓单': 'order-inventory',
    '数据大屏': 'data-analysis',
    '开放接口': 'advanced-functions',
    '区域合伙人（新）': 'advanced-functions',
    '电子发票': 'advanced-functions',
    '上门陪跑1-2个月': 'advanced-functions'
  };

  // 将功能按分类分组
  const groupFeaturesByCategory = (features: string[]) => {
    const groups: Record<string, string[]> = {};

    features.forEach(feature => {
      const categoryId = featureCategoryMap[feature] || 'other';
      if (!groups[categoryId]) {
        groups[categoryId] = [];
      }
      groups[categoryId].push(feature);
    });

    return groups;
  };

  useEffect(() => {
    if (params.orderNumber) {
      fetchOrder(params.orderNumber as string);
    }
  }, [params.orderNumber]);

  const fetchOrder = async (orderNumber: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/by-number/${orderNumber}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.error || '获取订单失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 计算分组后的核心功能
  const groupedFeatures = useMemo(() => {
    if (!order?.selectedFeatures) return {};
    return groupFeaturesByCategory(order.selectedFeatures);
  }, [order?.selectedFeatures]);

  const handlePrint = () => {
    setPrinting(true);

    // 添加打印样式（移除页眉页脚）
    const style = document.createElement('style');
    style.id = 'print-style';
    style.textContent = `
      @media print {
        @page {
          margin: 10mm;
          size: A4;
        }
        body {
          background: white !important;
        }
        .print-area {
          padding: 0 !important;
        }
        .print-area > div > div {
          box-shadow: none !important;
          border: 1px solid #e5e7eb;
        }
        .print-area > div > div .grid {
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 0.75rem !important;
        }
      }
    `;
    document.head.appendChild(style);

    window.print();

    // 清理打印样式
    setTimeout(() => {
      const printStyle = document.getElementById('print-style');
      if (printStyle) printStyle.remove();
      setPrinting(false);
    }, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const platformNames: Record<string, string> = {
    'single-store': '单店运营',
    'multi-store': '多门店连锁',
    'brand-chain': '品牌连锁'
  };

  const serviceLevelNames: Record<string, string> = {
    basic: '基础运营',
    advanced: '深度代运营',
    custom: '定制化方案'
  };

  const serviceNames: Record<string, string> = {
    'implementation': '实施服务',
    'training': '运营培训',
    'support-platinum': '白金技术支持',
    'consulting': '业务咨询',
    'customization': '定制开发',
    'data-migration': '数据迁移'
  };

  const getServiceName = (serviceId: string): string => {
    return serviceNames[serviceId] || serviceId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-6">{error || '订单不存在'}</p>
          <button
            onClick={() => router.push('/configurator')}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            返回定制页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!printing && <Navigation />}

      {/* 打印内容区域 */}
      <div className="print-area py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 打印按钮区域（打印时不显示） */}
          {!printing && (
            <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">定制方案订单</h1>
                <p className="text-sm text-gray-300 mt-1">订单号: {order.orderNumber}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/configurator')}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  打印
                </button>
              </div>
            </div>
          )}

          {/* 订单详情 */}
          <div className="p-8">
            {/* 公司信息 */}
            <div className="text-center mb-8 pb-8 border-b-2 border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">魔法超人 3.0</h1>
              <p className="text-lg text-gray-600">定制方案订单表单</p>
            </div>

            {/* 订单基本信息 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">1</span>
                订单信息
              </h2>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <span className="text-sm text-gray-600">订单编号</span>
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">提交时间</span>
                  <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">客户姓名</span>
                  <p className="font-semibold text-gray-900">{order.customerName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">联系电话</span>
                  <p className="font-semibold text-gray-900">{order.customerPhone}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">联系邮箱</span>
                  <p className="font-semibold text-gray-900">{order.customerEmail || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">订单状态</span>
                  <p className="font-semibold text-green-600">待处理</p>
                </div>
              </div>
            </div>

            {/* 业务场景 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">2</span>
                业务场景
              </h2>
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-lg font-semibold text-blue-900">{platformNames[order.platform] || order.platform}</p>
              </div>
            </div>

            {/* 核心功能 */}
            {order.selectedFeatures && order.selectedFeatures.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">3</span>
                  核心功能
                </h2>
                <div className="space-y-4">
                  {coreModules
                    .filter(module => groupedFeatures[module.id] && groupedFeatures[module.id].length > 0)
                    .map(module => (
                      <div key={module.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-2xl">{module.icon}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                            <p className="text-sm text-gray-600">{module.description}</p>
                          </div>
                          <div className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {groupedFeatures[module.id].length} 项
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {groupedFeatures[module.id].map((feature, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 增值服务 */}
            {order.valueServices && order.valueServices.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">4</span>
                  增值服务
                </h2>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {order.valueServices.map((service, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-900">{getServiceName(service)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 价格信息 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">5</span>
                价格明细
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">年度总价</span>
                  <span className="text-3xl font-bold text-blue-900">¥{order.totalPrice.toLocaleString()}/年</span>
                </div>
                {order.monthlyFee > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">功能费</span>
                    <span className="font-semibold text-gray-700">¥{order.monthlyFee.toLocaleString()}/年</span>
                  </div>
                )}
              </div>
            </div>

            {/* 备注 */}
            {order.notes && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">6</span>
                  备注说明
                </h2>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                </div>
              </div>
            )}

            {/* 公司信息 */}
            <div className="pt-8 border-t-2 border-gray-100 text-center text-sm text-gray-600">
              <p className="font-semibold text-gray-900 mb-2">浙江思杋服饰有限公司 魔法超人团队</p>
              <p>如有疑问，请联系客服 400-0678-558</p>
              <p className="mt-2 text-xs text-gray-500">本表单由魔法超人系统自动生成</p>
            </div>
          </div>
        </div>
      </div>

      {/* 打印样式 - 基础样式，详细打印样式在 JS 中动态添加 */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print-area {
            padding: 0 !important;
          }
          .print-area > div > div {
            box-shadow: none !important;
            border: 1px solid #e5e7eb;
          }
          /* 确保所有的 grid 布局都强制显示为三栏 */
          .print-area > div > div .grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 0.75rem !important;
          }
          /* 分组样式保持为单列 */
          .print-area > div > div .space-y-4 > div {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
