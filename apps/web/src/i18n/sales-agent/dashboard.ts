import type { LangCode } from '../menu'

export type SalesAgentDashboardTranslations = {
  welcomePrefix: string
  welcomeFallback: string
  subtitle: string
  loadError: string
  leadsBoxTitle: string
  leadsTotalLabel: string
  leadsYourLabel: string
  leadsContributionsLabel: string
  leadsCreateCta: string
  leadsStatsLoadError: string
  loading: string
  pandaCardTitle: string
  pandaCardSubtitle: string
}

const ro: SalesAgentDashboardTranslations = {
  welcomePrefix: 'Bine ai venit,',
  welcomeFallback: 'Agent',
  subtitle: 'Rezumat leads și activitatea ta de agent.',
  loadError: 'Eroare la încărcare.',
  leadsBoxTitle: 'Leads',
  leadsTotalLabel: 'Total leads',
  leadsYourLabel: 'Lead-urile tale',
  leadsContributionsLabel: 'Contribuții',
  leadsCreateCta: 'Lead nou',
  leadsStatsLoadError: 'Nu s-au putut încărca statisticile leads.',
  loading: 'Se încarcă...',
  pandaCardTitle: 'Happy Panda',
  pandaCardSubtitle: 'Ești pe val — continuă tot așa!',
}

const en: SalesAgentDashboardTranslations = {
  welcomePrefix: 'Welcome,',
  welcomeFallback: 'Agent',
  subtitle: 'Your leads summary and agent activity at a glance.',
  loadError: 'Failed to load.',
  leadsBoxTitle: 'Leads',
  leadsTotalLabel: 'Total leads',
  leadsYourLabel: 'Your leads',
  leadsContributionsLabel: 'Contributions',
  leadsCreateCta: 'Create a lead',
  leadsStatsLoadError: 'Could not load lead statistics.',
  loading: 'Loading...',
  pandaCardTitle: 'Happy Panda',
  pandaCardSubtitle: 'You’re on a roll — keep it up!',
}


const translations: Record<LangCode, SalesAgentDashboardTranslations> = { ro, en }

export function getSalesAgentDashboardTranslations(lang: LangCode): SalesAgentDashboardTranslations {
  return translations[lang] ?? translations.ro
}
