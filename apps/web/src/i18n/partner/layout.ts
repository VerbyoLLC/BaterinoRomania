import type { LangCode } from '../menu'

export type PartnerLayoutTranslations = {
  navDashboard: string
  navProducts: string
  navOrders: string
  navRepairs: string
  navPublicProfile: string
  navSettings: string
  navSupport: string
  partnerBadge: string
  language: string
  chooseLanguage: string
  logout: string
  partnerAccount: string
  expandMenu: string
  collapseMenu: string
  openMenu: string
  navLoading: string
  tooltipPending: string
  tooltipSuspended: string
}

const ro: PartnerLayoutTranslations = {
  navDashboard: 'Dashboard',
  navProducts: 'Produse',
  navOrders: 'Comenzi',
  navRepairs: 'Reparatii',
  navPublicProfile: 'Profil Public',
  navSettings: 'Setări',
  navSupport: 'Suport',
  partnerBadge: 'Partener',
  language: 'Limba',
  chooseLanguage: 'Alege limba',
  logout: 'Deconectare',
  partnerAccount: 'Cont Partener',
  expandMenu: 'Extinde meniul',
  collapseMenu: 'Restrânge meniul',
  openMenu: 'Deschide meniul',
  navLoading: 'Se încarcă meniul',
  tooltipPending: 'Disponibil dupa aprobare',
  tooltipSuspended: 'Indisponibil — cont suspendat',
}

const en: PartnerLayoutTranslations = {
  navDashboard: 'Dashboard',
  navProducts: 'Products',
  navOrders: 'Orders',
  navRepairs: 'Repairs',
  navPublicProfile: 'Public profile',
  navSettings: 'Settings',
  navSupport: 'Support',
  partnerBadge: 'Partner',
  language: 'Language',
  chooseLanguage: 'Choose language',
  logout: 'Log out',
  partnerAccount: 'Partner account',
  expandMenu: 'Expand menu',
  collapseMenu: 'Collapse menu',
  openMenu: 'Open menu',
  navLoading: 'Loading menu',
  tooltipPending: 'Available after approval',
  tooltipSuspended: 'Unavailable — account suspended',
}

const zh: PartnerLayoutTranslations = {
  navDashboard: '仪表板',
  navProducts: '产品',
  navOrders: '订单',
  navRepairs: '维修',
  navPublicProfile: '公开主页',
  navSettings: '设置',
  navSupport: '支持',
  partnerBadge: '合作伙伴',
  language: '语言',
  chooseLanguage: '选择语言',
  logout: '退出登录',
  partnerAccount: '合作伙伴账户',
  expandMenu: '展开菜单',
  collapseMenu: '收起菜单',
  openMenu: '打开菜单',
  navLoading: '正在加载菜单',
  tooltipPending: '审批通过后可使用',
  tooltipSuspended: '不可用 — 账户已暂停',
}

const translations: Record<LangCode, PartnerLayoutTranslations> = { ro, en, zh }

export function getPartnerLayoutTranslations(lang: LangCode): PartnerLayoutTranslations {
  return translations[lang] ?? translations.ro
}
