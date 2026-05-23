import type { LangCode } from '../menu'

export type PartnerSupportTranslations = {
  title: string
  subtitle: string
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
  subtitle: 'Ai nevoie de ajutor? Contactează echipa Baterino.',
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
  subtitle: 'Need help? Contact the Baterino team.',
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

const zh: PartnerSupportTranslations = {
  title: '支持',
  subtitle: '需要帮助？请联系 Baterino 团队。',
  dedicatedAgent: '您的专属客户经理',
  agentLoadingAria: '正在加载客户经理信息',
  noAgentBeforeEmail: '您尚未分配销售经理。请使用下方联系方式或发送邮件至 ',
  noAgentAfterEmail: '。',
  generalContact: '通用联系方式',
  email: '电子邮件',
  phone: '电话',
  supportHours: '支持时间',
  supportHoursWeekdays: '周一至周五：09:00 – 18:00',
  supportHoursWeekend: '周六至周日：休息',
  loadErrorFallback: '加载失败。',
}

const translations: Record<LangCode, PartnerSupportTranslations> = { ro, en, zh }

export function getPartnerSupportTranslations(lang: LangCode): PartnerSupportTranslations {
  return translations[lang] ?? translations.ro
}
