import type { AppModule } from './types';

/**
 * 应用注册中心（积木清单）
 *
 * ⭐ 新增一个应用的完整步骤：
 *   1) 在下面 APP_MODULES 数组加一条记录
 *   2) 建 src/app/<href 对应目录>/page.tsx 写页面
 *   3) 完成 —— 应用中心、导航入口、权限过滤会自动纳入
 *
 * 参考实现见 src/app/apps/TEMPLATE.md
 */
export const APP_MODULES: AppModule[] = [
  // ───────────── 经营 ─────────────
  {
    id: 'smart-retail',
    name: '智慧零售 3.0',
    shortDesc: '机构建制化、总部商城、多门店分销与团购核销收银一体化',
    icon: '🏪',
    href: '/admin',
    category: '经营',
    requiredRole: 'admin',
    status: 'live',
    version: '3.0',
    tags: ['四流合一', '建制化管理', '数据看板'],
  },
  {
    id: 'members',
    name: '会员管理',
    shortDesc: '会员档案、等级权益、积分余额与交易流水',
    icon: '💎',
    href: '/admin/members',
    category: '经营',
    requiredRole: 'admin',
    status: 'live',
    tags: ['会员体系', '积分'],
  },
  {
    id: 'orders',
    name: '订单管理',
    shortDesc: '全渠道订单归集、履约跟踪与售后处理',
    icon: '📋',
    href: '/admin/orders',
    category: '经营',
    requiredRole: 'admin',
    status: 'live',
    tags: ['订单', '履约'],
  },
  {
    id: 'transactions',
    name: '交易明细',
    shortDesc: '收银流水、支付渠道与对账明细逐笔可查',
    icon: '💳',
    href: '/admin/transactions',
    category: '经营',
    requiredRole: 'admin',
    status: 'live',
    tags: ['收银', '对账'],
  },
  {
    id: 'users',
    name: '用户与权限',
    shortDesc: '账号档案、角色分配与启用状态管理',
    icon: '👥',
    href: '/admin/users',
    category: '经营',
    requiredRole: 'admin',
    status: 'live',
    tags: ['权限', '账号'],
  },
  {
    id: 'knowledge-base',
    name: '知识库',
    shortDesc: '产品资料与话术入库，供 AI 工具与客服统一调用',
    icon: '📚',
    href: '/admin/knowledge-base',
    category: '经营',
    requiredRole: 'admin',
    status: 'live',
    tags: ['资料', '话术'],
  },
  {
    id: 'profile',
    name: '个人中心',
    shortDesc: '账号资料、会员权益、积分与充值',
    icon: '👤',
    href: '/profile',
    category: '经营',
    requiredRole: 'member',
    status: 'live',
    tags: ['账号', '权益'],
  },

  // ───────────── 营销 ─────────────
  {
    id: 'cover-generator',
    name: '封面生成器',
    shortDesc: '上传素材即可生成多尺寸封面图，支持智能排版',
    icon: '🎨',
    href: '/tool/cover-generator',
    category: '营销',
    requiredRole: 'member',
    status: 'live',
    tags: ['设计', '排版'],
  },
  {
    id: 'ai-copywriting',
    name: 'AI 文案生成',
    shortDesc: '按品类与人群生成多版本营销文案',
    icon: '✍️',
    href: '/tool/ai-copywriting',
    category: '营销',
    requiredRole: 'member',
    status: 'live',
    tags: ['文案', '种草'],
  },
  {
    id: 'forbidden-words',
    name: '违禁词检测',
    shortDesc: '广告法合规词库校验，降低平台处罚风险',
    icon: '🛡️',
    href: '/tool/forbidden-words',
    category: '营销',
    requiredRole: 'member',
    status: 'live',
    tags: ['合规', '风控'],
  },
  {
    id: 'title-gen',
    name: '标题生成',
    shortDesc: '基于卖点批量产出高点击标题',
    icon: '🏷️',
    href: '/tool/title-gen',
    category: '营销',
    requiredRole: 'member',
    status: 'live',
    tags: ['标题', '引流'],
  },
  {
    id: 'rewrite',
    name: '文案改写',
    shortDesc: '换风格改写，保持原意提升可读性',
    icon: '♻️',
    href: '/tool/rewrite',
    category: '营销',
    requiredRole: 'member',
    status: 'live',
    tags: ['改写'],
  },
  {
    id: 'short-video-caption',
    name: '短视频文案',
    shortDesc: '口播脚本与分镜建议，直接可用于拍摄',
    icon: '🎬',
    href: '/tool/short-video-caption',
    category: '营销',
    requiredRole: 'member',
    status: 'live',
    tags: ['短视频', '脚本'],
  },

  // ───────────── 内容 ─────────────
  {
    id: 'ai-image-generation',
    name: 'AI 图片生成',
    shortDesc: '文生图与图生图，满足商品与场景素材需求',
    icon: '🖼️',
    href: '/tool/ai-image-generation',
    category: '内容',
    requiredRole: 'member',
    status: 'live',
    tags: ['生图', '素材'],
  },
  {
    id: 'video-gen',
    name: '视频生成',
    shortDesc: '短视频素材生成与导出',
    icon: '🎥',
    href: '/video-gen',
    category: '内容',
    requiredRole: 'member',
    status: 'beta',
    tags: ['视频'],
  },
  {
    id: 'resources',
    name: '资源中心',
    shortDesc: '行业动态、升级日志与前沿资讯',
    icon: '📰',
    href: '/resources',
    category: '内容',
    requiredRole: 'public',
    status: 'live',
    tags: ['资讯'],
  },
  {
    id: 'business-school',
    name: '商学院',
    shortDesc: '门店经营、选品与团队管理课程',
    icon: '🎓',
    href: '/business-school',
    category: '内容',
    requiredRole: 'public',
    status: 'live',
    tags: ['课程', '赋能'],
  },

  // ───────────── 工具 ─────────────
  {
    id: 'configurator',
    name: '应用配置器',
    shortDesc: '按需组合系统模块，生成属于门店的方案',
    icon: '🧩',
    href: '/configurator',
    category: '工具',
    requiredRole: 'public',
    status: 'live',
    tags: ['配置'],
  },
  {
    id: 'app-center',
    name: '应用中心',
    shortDesc: '全部系统模块的统一入口，新增模块即时上架',
    icon: '🚀',
    href: '/apps',
    category: '工具',
    requiredRole: 'public',
    status: 'live',
    tags: ['模块', '入口'],
  },
  {
    id: 'ai-assistant',
    name: 'AI 智能助手',
    shortDesc: '对话式经营顾问，基于知识库给出建议',
    icon: '🧠',
    href: '/magic-ai',
    category: '工具',
    requiredRole: 'member',
    status: 'coming',
    tags: ['对话', '顾问'],
  },
  {
    id: 'channel-partner',
    name: '渠道合作中心',
    shortDesc: '区域公司、店中店合作方在线协同与进度看板',
    icon: '🤝',
    href: '/partner',
    category: '工具',
    requiredRole: 'member',
    status: 'coming',
    tags: ['加盟', '协同'],
  },
];

/** 按 id 查找模块 */
export function getModuleById(id: string): AppModule | undefined {
  return APP_MODULES.find((m) => m.id === id);
}

/** 按分类分组（保持 APP_CATEGORY_ORDER 顺序） */
export function groupByCategory(
  modules: AppModule[]
): { category: string; items: AppModule[] }[] {
  const map = new Map<string, AppModule[]>();
  for (const m of modules) {
    const list = map.get(m.category) || [];
    list.push(m);
    map.set(m.category, list);
  }
  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items,
  }));
}
