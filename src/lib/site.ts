/**
 * 公司信息统一常量
 *
 * 全站地址、电话、邮箱、备案号等基础信息只在此维护一处，
 * 页面统一引用，避免多处硬编码导致更新时遗漏（地址曾出现新旧混用）。
 */

export const SITE = {
  /** 品牌主体 */
  company: '浙江思杋服饰有限公司',
  brand: '路耐 LUNAI',
  slogan: '山高路远 · 一件路耐',
  domain: 'zjsifan.com',

  /**
   * 公司注册地址（工商注册地）
   * 2026-11-21 起不对外展示 —— 全站仅呈现实际办公地址，此项仅内部备查。
   */
  registeredAddress: '浙江省杭州市上城区元宇宙基地5幢115室',

  /** 实际办公地址（已迁至滨江） */
  officeAddress: '浙江省杭州市滨江区滨康路春风园区6幢1楼路耐',

  /** 对外统一使用的总部地址（等同办公地址） */
  headquarters: '浙江省杭州市滨江区滨康路春风园区6幢1楼路耐',

  /** 加盟与商务热线 */
  hotline: '400-0678-558',
  hotlineNote: '加盟热线 / 商务咨询',

  email: '229888777@qq.com',
  workTime: '周一至周五 9:00 - 18:00',

  /** 备案与资质 */
  franchiseFiling: '特许经营备案 1330100112500649',
  franchiseFilingNo: '1330100112500649',
  icpFiling: 'ICP 浙 B2-20250051',
  icpFilingNo: '浙 B2-20250051',
  regionalQualification: '杭州滨江区高新技术企业认定',
  regionalQualificationShort: '杭州滨江区高新技术企业',
  douyinService: '抖音企业号官方服务商',
} as const;

/** 页面底部署信息（页脚统一使用） */
export const FOOTER_LINKS = [
  { label: '关于路耐', href: '/about' },
  { label: '运营模式', href: '/solution' },
  { label: '资质背书', href: '/qualifications' },
  { label: '加盟合作', href: '/franchise' },
  { label: '应用中心', href: '/apps' },
  { label: '联系我们', href: '/contact' },
] as const;
