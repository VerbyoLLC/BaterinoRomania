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


const translations: Record<LangCode, SalesAgentSettingsTranslations> = { ro, en }

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
