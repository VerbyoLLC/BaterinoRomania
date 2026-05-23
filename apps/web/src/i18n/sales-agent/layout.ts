import type { LangCode } from '../menu'

export type SalesAgentLayoutTranslations = {
  salesAgentBadge: string
  navDashboard: string
  navLeads: string
  navSettings: string
  agentAccount: string
  chooseLanguage: string
  logout: string
  openMenu: string
  loading: string
  profileMenuLabel: string
  profileNotLinked: string
  profileEmptyValue: string
}

const ro: SalesAgentLayoutTranslations = {
  salesAgentBadge: 'Agent vânzări',
  navDashboard: 'Panou',
  navLeads: 'Leads',
  navSettings: 'Setări',
  agentAccount: 'Cont agent',
  chooseLanguage: 'Alege limba',
  logout: 'Deconectare',
  openMenu: 'Deschide meniul',
  loading: 'Se încarcă...',
  profileMenuLabel: 'Fișă agent',
  profileNotLinked: 'Contul nu este legat unei fișe de agent. Contactează administratorul.',
  profileEmptyValue: '—',
}

const en: SalesAgentLayoutTranslations = {
  salesAgentBadge: 'Sales agent',
  navDashboard: 'Dashboard',
  navLeads: 'Leads',
  navSettings: 'Settings',
  agentAccount: 'Agent account',
  chooseLanguage: 'Choose language',
  logout: 'Log out',
  openMenu: 'Open menu',
  loading: 'Loading...',
  profileMenuLabel: 'Agent profile',
  profileNotLinked: 'Your account is not linked to an agent record. Contact an administrator.',
  profileEmptyValue: '—',
}

const zh: SalesAgentLayoutTranslations = {
  salesAgentBadge: '销售代理',
  navDashboard: '仪表板',
  navLeads: '潜在客户',
  navSettings: '设置',
  agentAccount: '代理账户',
  chooseLanguage: '选择语言',
  logout: '退出登录',
  openMenu: '打开菜单',
  loading: '正在加载...',
  profileMenuLabel: '代理档案',
  profileNotLinked: '您的账户尚未关联代理档案。请联系管理员。',
  profileEmptyValue: '—',
}

const translations: Record<LangCode, SalesAgentLayoutTranslations> = { ro, en, zh }

export function getSalesAgentLayoutTranslations(lang: LangCode): SalesAgentLayoutTranslations {
  return translations[lang] ?? translations.ro
}
