import type { LangCode } from '../menu'
import { getClientOrdersTranslations } from '../client-orders'
import { getPartnerPublicProfileTranslations } from './public-profile'
import { getPartnerServiceTranslations } from './service'
import { getPartnerSupportTranslations } from './support'

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
  openAccountMenu: string
  closeAccountMenu: string
  navCheckout: string
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
  openAccountMenu: 'Deschide meniul contului',
  closeAccountMenu: 'Închide meniul contului',
  navCheckout: 'Comandă',
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
  openAccountMenu: 'Open account menu',
  closeAccountMenu: 'Close account menu',
  navCheckout: 'Checkout',
}


const translations: Record<LangCode, PartnerLayoutTranslations> = { ro, en }

export function getPartnerLayoutTranslations(lang: LangCode): PartnerLayoutTranslations {
  return translations[lang] ?? translations.ro
}

/** Visible page title for the partner shell top bar (matches sidebar nav labels). */
export function getPartnerTopBarPageTitle(pathname: string, lang: LangCode): string | null {
  const tr = getPartnerLayoutTranslations(lang)
  const path = pathname.replace(/\/+$/, '') || '/partner'

  if (path === '/partner' || path === '/partner/dashboard') return tr.navDashboard
  if (path.startsWith('/partner/produse')) return tr.navProducts
  if (path.startsWith('/partner/comenzi')) return tr.navOrders
  if (path.startsWith('/partner/servicii')) return tr.navRepairs
  if (path.startsWith('/partner/profil')) return tr.navPublicProfile
  if (path.startsWith('/partner/setari')) return tr.navSettings
  if (path.startsWith('/partner/suport')) return tr.navSupport
  if (path.startsWith('/partner/checkout')) return tr.navCheckout

  return null
}

/** Optional subtitle beside the top bar title (partner shell). */
export function getPartnerTopBarPageSubtitle(pathname: string, lang: LangCode): string | null {
  const path = pathname.replace(/\/+$/, '') || '/partner'
  if (path.startsWith('/partner/comenzi')) {
    return getClientOrdersTranslations(lang).pageSubtitle
  }
  if (path.startsWith('/partner/profil')) {
    return getPartnerPublicProfileTranslations(lang).pageSubtitle
  }
  if (path.startsWith('/partner/servicii')) {
    return getPartnerServiceTranslations(lang).pageSubtitle
  }
  if (path.startsWith('/partner/suport')) {
    return getPartnerSupportTranslations(lang).pageSubtitle
  }
  return null
}
