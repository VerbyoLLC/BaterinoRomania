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


const translations: Record<LangCode, SalesAgentLayoutTranslations> = { ro, en }

export function getSalesAgentLayoutTranslations(lang: LangCode): SalesAgentLayoutTranslations {
  return translations[lang] ?? translations.ro
}
