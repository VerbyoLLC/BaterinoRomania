import type { LangCode } from '../menu'

export type SalesAgentSettingsTranslations = {
  title: string
  subtitle: string
  loading: string
  loadError: string
  notLinkedBody: string
  suspendedBody: string
  saveSuccess: string
  saveError: string
  saveButton: string
  savingButton: string
  loginEmailLabel: string
  loginEmailHint: string
  sectionProfile: string
  fieldLastName: string
  fieldFirstName: string
  fieldPhone: string
  fieldWhatsapp: string
  fieldEmail: string
  fieldProgram: string
  fieldCounty: string
  fieldCity: string
  fieldSector: string
  placeholderLastName: string
  placeholderFirstName: string
  placeholderPhone: string
  placeholderWhatsapp: string
  placeholderEmail: string
  placeholderProgram: string
  placeholderCounty: string
  placeholderCity: string
  selectCounty: string
  selectCity: string
  sectorToate: string
  sectorIndustrial: string
  sectorMedical: string
  sectorRezidential: string
  sectorMaritim: string
}

const ro: SalesAgentSettingsTranslations = {
  title: 'Setări',
  subtitle: 'Actualizează datele din fișa ta de agent — partenerii și clienții le vor vedea în comunicări.',
  loading: 'Se încarcă...',
  loadError: 'Eroare la încărcare.',
  notLinkedBody:
    'Contul tău nu este încă asociat unei fișe de agent. Contactează administratorul pentru a lega emailul contului de rândul din lista Agenți.',
  suspendedBody: 'Contul de agent este suspendat. Contactează administratorul.',
  saveSuccess: 'Datele au fost salvate.',
  saveError: 'Nu s-au putut salva datele.',
  saveButton: 'Salvează modificările',
  savingButton: 'Se salvează…',
  loginEmailLabel: 'Email cont (autentificare)',
  loginEmailHint: 'Pentru schimbarea emailului de login contactează administratorul.',
  sectionProfile: 'Fișă agent',
  fieldLastName: 'Nume',
  fieldFirstName: 'Prenume',
  fieldPhone: 'Telefon',
  fieldWhatsapp: 'WhatsApp',
  fieldEmail: 'Email agent',
  fieldProgram: 'Program',
  fieldCounty: 'Județ',
  fieldCity: 'Oraș',
  fieldSector: 'Sector',
  placeholderLastName: 'ex. Popescu',
  placeholderFirstName: 'ex. Ion',
  placeholderPhone: '407xxxxxxxx',
  placeholderWhatsapp: '407xxxxxxxx',
  placeholderEmail: 'agent@exemplu.ro',
  placeholderProgram: 'ex. L–V 9:00–17:00',
  placeholderCounty: 'Selectează județul',
  placeholderCity: 'Selectează orașul',
  selectCounty: '— Selectează județul —',
  selectCity: '— Selectează orașul —',
  sectorToate: 'Toate',
  sectorIndustrial: 'Industrial',
  sectorMedical: 'Medical',
  sectorRezidential: 'Rezidențial',
  sectorMaritim: 'Maritim',
}

const en: SalesAgentSettingsTranslations = {
  title: 'Settings',
  subtitle: 'Update your agent profile — partners and clients may see these details in communications.',
  loading: 'Loading...',
  loadError: 'Failed to load.',
  notLinkedBody:
    'Your account is not yet linked to an agent record. Contact an administrator to associate your login with a row in the Agents list.',
  suspendedBody: 'Your agent account is suspended. Contact an administrator.',
  saveSuccess: 'Your details were saved.',
  saveError: 'Could not save your details.',
  saveButton: 'Save changes',
  savingButton: 'Saving…',
  loginEmailLabel: 'Login email',
  loginEmailHint: 'Contact an administrator to change your login email.',
  sectionProfile: 'Agent profile',
  fieldLastName: 'Last name',
  fieldFirstName: 'First name',
  fieldPhone: 'Phone',
  fieldWhatsapp: 'WhatsApp',
  fieldEmail: 'Agent email',
  fieldProgram: 'Schedule',
  fieldCounty: 'County',
  fieldCity: 'City',
  fieldSector: 'Sector',
  placeholderLastName: 'e.g. Smith',
  placeholderFirstName: 'e.g. John',
  placeholderPhone: '407xxxxxxxx',
  placeholderWhatsapp: '407xxxxxxxx',
  placeholderEmail: 'agent@example.com',
  placeholderProgram: 'e.g. Mon–Fri 9:00–17:00',
  placeholderCounty: 'Select county',
  placeholderCity: 'Select city',
  selectCounty: '— Select county —',
  selectCity: '— Select city —',
  sectorToate: 'All',
  sectorIndustrial: 'Industrial',
  sectorMedical: 'Medical',
  sectorRezidential: 'Residential',
  sectorMaritim: 'Maritime',
}

const zh: SalesAgentSettingsTranslations = {
  title: '设置',
  subtitle: '更新您的代理档案信息 — 合作伙伴和客户可能会在沟通中看到这些详情。',
  loading: '正在加载...',
  loadError: '加载失败。',
  notLinkedBody:
    '您的账户尚未关联代理档案。请联系管理员，将登录账户与代理列表中的记录绑定。',
  suspendedBody: '您的代理账户已暂停。请联系管理员。',
  saveSuccess: '资料已保存。',
  saveError: '无法保存资料。',
  saveButton: '保存更改',
  savingButton: '正在保存…',
  loginEmailLabel: '登录邮箱',
  loginEmailHint: '如需更改登录邮箱，请联系管理员。',
  sectionProfile: '代理档案',
  fieldLastName: '姓',
  fieldFirstName: '名',
  fieldPhone: '电话',
  fieldWhatsapp: 'WhatsApp',
  fieldEmail: '代理邮箱',
  fieldProgram: '工作时间',
  fieldCounty: '县/省',
  fieldCity: '城市',
  fieldSector: '区域',
  placeholderLastName: '例如：张',
  placeholderFirstName: '例如：三',
  placeholderPhone: '407xxxxxxxx',
  placeholderWhatsapp: '407xxxxxxxx',
  placeholderEmail: 'agent@example.com',
  placeholderProgram: '例如：周一至周五 9:00–17:00',
  placeholderCounty: '选择县/省',
  placeholderCity: '选择城市',
  selectCounty: '— 选择县/省 —',
  selectCity: '— 选择城市 —',
  sectorToate: '全部',
  sectorIndustrial: '工业',
  sectorMedical: '医疗',
  sectorRezidential: '住宅',
  sectorMaritim: '船舶',
}

const translations: Record<LangCode, SalesAgentSettingsTranslations> = { ro, en, zh }

export function getSalesAgentSettingsTranslations(lang: LangCode): SalesAgentSettingsTranslations {
  return translations[lang] ?? translations.ro
}

export const SALES_AGENT_SECTOR_VALUES = ['Toate', 'Industrial', 'Medical', 'Rezidential', 'Maritim'] as const

export type SalesAgentSectorValue = (typeof SALES_AGENT_SECTOR_VALUES)[number]

export function salesAgentSectorLabel(
  tr: SalesAgentSettingsTranslations,
  sector: SalesAgentSectorValue,
): string {
  switch (sector) {
    case 'Industrial':
      return tr.sectorIndustrial
    case 'Medical':
      return tr.sectorMedical
    case 'Rezidential':
      return tr.sectorRezidential
    case 'Maritim':
      return tr.sectorMaritim
    default:
      return tr.sectorToate
  }
}
