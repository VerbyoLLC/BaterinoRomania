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


const translations: Record<LangCode, PartnerLayoutTranslations> = { ro, en }

export function getPartnerLayoutTranslations(lang: LangCode): PartnerLayoutTranslations {
  return translations[lang] ?? translations.ro
}
