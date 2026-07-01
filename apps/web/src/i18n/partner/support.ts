import type { LangCode } from '../menu'

export type PartnerSupportTranslations = {
  title: string
  pageSubtitle: string
  dedicatedAgent: string
  agentLoadingAria: string
  noAgentBeforeEmail: string
  noAgentAfterEmail: string
  generalContact: string
  email: string
  phone: string
  supportHours: string
  supportHoursWeekdays: string
  supportHoursWeekend: string
  loadErrorFallback: string
}

const ro: PartnerSupportTranslations = {
  title: 'Suport',
  pageSubtitle: 'Ai nevoie de ajutor? Contactează echipa Baterino.',
  dedicatedAgent: 'Agentul tău dedicat',
  agentLoadingAria: 'Se încarcă detaliile agentului',
  noAgentBeforeEmail: 'Încă nu ai un agent de vânzări atribuit. Poți folosi contactele de mai jos sau scrie la ',
  noAgentAfterEmail: '.',
  generalContact: 'Contact general',
  email: 'Email',
  phone: 'Telefon',
  supportHours: 'Program suport',
  supportHoursWeekdays: 'Luni – Vineri: 09:00 – 18:00',
  supportHoursWeekend: 'Sâmbătă – Duminică: Închis',
  loadErrorFallback: 'Eroare la încărcare.',
}

const en: PartnerSupportTranslations = {
  title: 'Support',
  pageSubtitle: 'Need help? Contact the Baterino team.',
  dedicatedAgent: 'Your dedicated agent',
  agentLoadingAria: 'Loading agent details',
  noAgentBeforeEmail: 'You do not have an assigned sales agent yet. Use the contacts below or email ',
  noAgentAfterEmail: '.',
  generalContact: 'General contact',
  email: 'Email',
  phone: 'Phone',
  supportHours: 'Support hours',
  supportHoursWeekdays: 'Monday – Friday: 09:00 – 18:00',
  supportHoursWeekend: 'Saturday – Sunday: Closed',
  loadErrorFallback: 'Failed to load.',
}


const translations: Record<LangCode, PartnerSupportTranslations> = { ro, en }

export function getPartnerSupportTranslations(lang: LangCode): PartnerSupportTranslations {
  return translations[lang] ?? translations.ro
}
