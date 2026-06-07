import type { LangCode } from '../menu'
import type { SalesLeadRow } from '../../lib/api'

export type SalesAgentLeadsTranslations = {
  title: string
  subtitle: string
  createLead: string
  loadError: string
  loading: string
  emptyState: string
  colDate: string
  colName: string
  colCompany: string
  colEmail: string
  colPhone: string
  colSource: string
  colStatus: string
  colCreatedBy: string
  colComments: string
  commentsPanelTitle: string
  commentPlaceholder: string
  commentSubmit: string
  commentSubmitting: string
  commentsLoadError: string
  commentPostError: string
  commentPostSuccess: string
  commentsEmpty: string
  closePanel: string
  detailPanelTitle: string
  detailViewComments: string
  detailUpdatedAt: string
  detailSectionQualification: string
  detailSectionContact: string
  detailSectionCompany: string
  detailSectionDetails: string
  unreadLead: string
  statusUpdateError: string
  emptyValue: string
  statusNou: string
  statusContactat: string
  statusDead: string
  statusOferta: string
  statusInchis: string
  sourceManual: string
  sourceTelefon: string
  sourceEmail: string
  sourceEveniment: string
  sourceRecomandare: string
  sourceSite: string
  sourceAltele: string
}

export type SalesAgentLeadNewTranslations = {
  backToLeads: string
  title: string
  subtitle: string
  nameRequired: string
  saveError: string
  saveSuccess: string
  sectionQualification: string
  sectionContact: string
  sectionCompany: string
  sectionDetails: string
  customerTypeLabel: string
  productLineLabel: string
  monthlyVolumeLabel: string
  fullNameLabel: string
  emailLabel: string
  workEmailLabel: string
  phoneLabel: string
  whatsappLabel: string
  companyNameLabel: string
  jobTitleLabel: string
  countryLabel: string
  websiteLabel: string
  messageLabel: string
  sourceLabel: string
  selectPlaceholder: string
  placeholderFullName: string
  placeholderEmail: string
  placeholderWorkEmail: string
  placeholderPhone: string
  placeholderCompany: string
  placeholderJobTitle: string
  placeholderCountry: string
  placeholderWebsite: string
  placeholderMessage: string
  saveButton: string
  savingButton: string
  cancelButton: string
  customerInstaller: string
  customerDistributor: string
  customerIntegrator: string
  customerEndClient: string
  customerCommercialOwner: string
  customerOther: string
  productResidentialEss: string
  productCommercialEss: string
  productSolarInverter: string
  productBatteryStorage: string
  productCompleteSolutions: string
  productOther: string
  volumeUnder10k: string
  volume10to30k: string
  volume30to50k: string
  volume50to100k: string
  volumeOver100k: string
  volumeUnknown: string
}

const roLeads: SalesAgentLeadsTranslations = {
  title: 'Leads',
  subtitle:
    'Potențiali clienți și solicitări de ofertă — urmărește contactele înainte de a le converti în ofertă comercială.',
  createLead: 'Lead nou',
  loadError: 'Eroare la încărcare.',
  loading: 'Se încarcă…',
  emptyState: 'Nu există leads încă. Apasă „Lead nou” pentru a adăuga primul contact.',
  colDate: 'Dată',
  colName: 'Nume',
  colCompany: 'Companie',
  colEmail: 'Email',
  colPhone: 'Telefon',
  colSource: 'Sursă',
  colStatus: 'Status',
  colCreatedBy: 'Creat de',
  colComments: 'Comentarii',
  commentsPanelTitle: 'Comentarii lead',
  commentPlaceholder: 'Scrie un comentariu…',
  commentSubmit: 'Adaugă comentariu',
  commentSubmitting: 'Se salvează…',
  commentsLoadError: 'Nu s-au putut încărca comentariile.',
  commentPostError: 'Nu s-a putut salva comentariul.',
  commentPostSuccess: 'Comentariu adăugat.',
  commentsEmpty: 'Nu există comentarii încă.',
  closePanel: 'Închide',
  detailPanelTitle: 'Detalii lead',
  detailViewComments: 'Comentarii',
  detailUpdatedAt: 'Ultima actualizare',
  detailSectionQualification: 'Calificare',
  detailSectionContact: 'Contact',
  detailSectionCompany: 'Companie',
  detailSectionDetails: 'Detalii',
  unreadLead: 'Lead necitit',
  statusUpdateError: 'Nu s-a putut actualiza statusul.',
  emptyValue: '—',
  statusNou: 'Nou',
  statusContactat: 'Contactat',
  statusDead: 'Dead',
  statusOferta: 'Ofertă',
  statusInchis: 'Închis',
  sourceManual: 'Manual',
  sourceTelefon: 'Telefon',
  sourceEmail: 'Email',
  sourceEveniment: 'Eveniment',
  sourceRecomandare: 'Recomandare',
  sourceSite: 'Site',
  sourceAltele: 'Altele',
}

const enLeads: SalesAgentLeadsTranslations = {
  title: 'Leads',
  subtitle:
    'Prospects and quote requests from all agents — follow up before converting them into a commercial offer.',
  createLead: 'Create a lead',
  loadError: 'Failed to load.',
  loading: 'Loading…',
  emptyState: 'No leads yet. Click “Create a lead” to add your first contact.',
  colDate: 'Date',
  colName: 'Name',
  colCompany: 'Company',
  colEmail: 'Email',
  colPhone: 'Phone',
  colSource: 'Source',
  colStatus: 'Status',
  colCreatedBy: 'Created by',
  colComments: 'Comments',
  commentsPanelTitle: 'Lead comments',
  commentPlaceholder: 'Write a comment…',
  commentSubmit: 'Add comment',
  commentSubmitting: 'Saving…',
  commentsLoadError: 'Could not load comments.',
  commentPostError: 'Could not save comment.',
  commentPostSuccess: 'Comment added.',
  commentsEmpty: 'No comments yet.',
  closePanel: 'Close',
  detailPanelTitle: 'Lead details',
  detailViewComments: 'Comments',
  detailUpdatedAt: 'Last updated',
  detailSectionQualification: 'Qualification',
  detailSectionContact: 'Contact',
  detailSectionCompany: 'Company',
  detailSectionDetails: 'Details',
  unreadLead: 'Unread lead',
  statusUpdateError: 'Could not update status.',
  emptyValue: '—',
  statusNou: 'New',
  statusContactat: 'Contacted',
  statusDead: 'Dead',
  statusOferta: 'Quote',
  statusInchis: 'Closed',
  sourceManual: 'Manual',
  sourceTelefon: 'Phone',
  sourceEmail: 'Email',
  sourceEveniment: 'Event',
  sourceRecomandare: 'Referral',
  sourceSite: 'Website',
  sourceAltele: 'Other',
}


const roNew: SalesAgentLeadNewTranslations = {
  backToLeads: '← Înapoi la Leads',
  title: 'Lead nou',
  subtitle: 'Adaugă manual un potențial client sau o solicitare de ofertă.',
  nameRequired: 'Numele complet este obligatoriu.',
  saveError: 'Nu s-a putut salva lead-ul.',
  saveSuccess: 'Lead salvat cu succes.',
  sectionQualification: 'Calificare',
  sectionContact: 'Contact',
  sectionCompany: 'Companie',
  sectionDetails: 'Detalii',
  customerTypeLabel: 'Ce tip de client sunteți?',
  productLineLabel: 'Ce linie de produse vă interesează?',
  monthlyVolumeLabel: 'Care este volumul mediu lunar de vânzări sau valoarea achizițiilor?',
  fullNameLabel: 'Nume complet',
  emailLabel: 'Email',
  workEmailLabel: 'Email de serviciu',
  phoneLabel: 'Telefon',
  whatsappLabel: 'Cont WhatsApp (doar pentru contact)',
  companyNameLabel: 'Denumire companie',
  jobTitleLabel: 'Funcție',
  countryLabel: 'Țară',
  websiteLabel: 'Website',
  messageLabel: 'Mesaj (prezentare scurtă a proiectului sau nevoilor)',
  sourceLabel: 'Sursă (intern)',
  selectPlaceholder: '— Selectează —',
  placeholderFullName: 'ex. Alexandra',
  placeholderEmail: 'email@exemplu.ro',
  placeholderWorkEmail: 'office@companie.ro',
  placeholderPhone: '+40 7xx xxx xxx',
  placeholderCompany: "ex. ABBA'S SOLAR",
  placeholderJobTitle: 'ex. Administrator',
  placeholderCountry: 'ex. RO',
  placeholderWebsite: 'https://...',
  placeholderMessage: 'Descrie pe scurt proiectul sau solicitarea…',
  saveButton: 'Salvează lead',
  savingButton: 'Se salvează…',
  cancelButton: 'Anulează',
  customerInstaller: 'Instalator',
  customerDistributor: 'Distribuitor',
  customerIntegrator: 'Integrator',
  customerEndClient: 'Client final',
  customerCommercialOwner: 'Proprietar comercial',
  customerOther: 'Altul',
  productResidentialEss: 'ESS rezidențial',
  productCommercialEss: 'ESS comercial/industrial',
  productSolarInverter: 'Invertor solar',
  productBatteryStorage: 'Stocare baterii',
  productCompleteSolutions: 'Soluții complete',
  productOther: 'Altul',
  volumeUnder10k: 'Sub 10.000 USD',
  volume10to30k: '10.000 – 30.000 USD',
  volume30to50k: '30.000 – 50.000 USD',
  volume50to100k: '50.000 – 100.000 USD',
  volumeOver100k: 'Peste 100.000 USD',
  volumeUnknown: 'Nu știu',
}

const enNew: SalesAgentLeadNewTranslations = {
  backToLeads: '← Back to Leads',
  title: 'Create a lead',
  subtitle: 'Manually add a prospect or quote request.',
  nameRequired: 'Full name is required.',
  saveError: 'Could not save the lead.',
  saveSuccess: 'Lead saved successfully.',
  sectionQualification: 'Qualification',
  sectionContact: 'Contact',
  sectionCompany: 'Company',
  sectionDetails: 'Details',
  customerTypeLabel: 'What type of customer are you?',
  productLineLabel: 'Which product line are you interested in?',
  monthlyVolumeLabel: 'What is your average monthly sales volume or purchase amount?',
  fullNameLabel: 'Full name',
  emailLabel: 'Email',
  workEmailLabel: 'Work email',
  phoneLabel: 'Phone number',
  whatsappLabel: 'WhatsApp account (for contact only)',
  companyNameLabel: 'Company name',
  jobTitleLabel: 'Job title',
  countryLabel: 'Country',
  websiteLabel: 'Website',
  messageLabel: 'Message (brief introduction of your project or needs)',
  sourceLabel: 'Source (internal)',
  selectPlaceholder: '— Select —',
  placeholderFullName: 'e.g. Alexandra',
  placeholderEmail: 'email@example.com',
  placeholderWorkEmail: 'office@company.com',
  placeholderPhone: '+40 7xx xxx xxx',
  placeholderCompany: "e.g. ABBA'S SOLAR",
  placeholderJobTitle: 'e.g. Administrator',
  placeholderCountry: 'e.g. RO',
  placeholderWebsite: 'https://...',
  placeholderMessage: 'Briefly describe the project or request…',
  saveButton: 'Save lead',
  savingButton: 'Saving…',
  cancelButton: 'Cancel',
  customerInstaller: 'Installer',
  customerDistributor: 'Distributor',
  customerIntegrator: 'Integrator',
  customerEndClient: 'End customer',
  customerCommercialOwner: 'Commercial owner',
  customerOther: 'Other',
  productResidentialEss: 'Residential ESS',
  productCommercialEss: 'Commercial/industrial ESS',
  productSolarInverter: 'Solar inverter',
  productBatteryStorage: 'Battery storage',
  productCompleteSolutions: 'Complete solutions',
  productOther: 'Other',
  volumeUnder10k: 'Under $10,000',
  volume10to30k: '$10,000 – $30,000',
  volume30to50k: '$30,000 – $50,000',
  volume50to100k: '$50,000 – $100,000',
  volumeOver100k: 'Over $100,000',
  volumeUnknown: "Don't know",
}


const leadsTranslations: Record<LangCode, SalesAgentLeadsTranslations> = {
  ro: roLeads,
  en: enLeads,
}

const leadNewTranslations: Record<LangCode, SalesAgentLeadNewTranslations> = {
  ro: roNew,
  en: enNew,
}

export function getSalesAgentLeadsTranslations(lang: LangCode): SalesAgentLeadsTranslations {
  return leadsTranslations[lang] ?? leadsTranslations.ro
}

export function getSalesAgentLeadNewTranslations(lang: LangCode): SalesAgentLeadNewTranslations {
  return leadNewTranslations[lang] ?? leadNewTranslations.ro
}

export function leadStatusLabel(tr: SalesAgentLeadsTranslations, status: SalesLeadRow['status']): string {
  switch (status) {
    case 'contactat':
      return tr.statusContactat
    case 'dead':
      return tr.statusDead
    case 'oferta':
      return tr.statusOferta
    case 'inchis':
      return tr.statusInchis
    default:
      return tr.statusNou
  }
}

export const LEAD_STATUS_SELECT_VALUES = ['nou', 'contactat', 'dead'] as const
export type LeadStatusSelectValue = (typeof LEAD_STATUS_SELECT_VALUES)[number]

export function leadStatusSelectValue(status: SalesLeadRow['status']): LeadStatusSelectValue | SalesLeadRow['status'] {
  if (LEAD_STATUS_SELECT_VALUES.includes(status as LeadStatusSelectValue)) {
    return status as LeadStatusSelectValue
  }
  return status
}

export function leadSourceLabel(tr: SalesAgentLeadsTranslations, source: string): string {
  switch (source) {
    case 'Manual':
      return tr.sourceManual
    case 'Telefon':
      return tr.sourceTelefon
    case 'Email':
      return tr.sourceEmail
    case 'Eveniment':
      return tr.sourceEveniment
    case 'Recomandare':
      return tr.sourceRecomandare
    case 'Site':
      return tr.sourceSite
    case 'Altele':
      return tr.sourceAltele
    default:
      return source
  }
}

export const LEAD_SOURCE_VALUES = [
  'Manual',
  'Telefon',
  'Email',
  'Eveniment',
  'Recomandare',
  'Site',
  'Altele',
] as const

export type LeadSourceValue = (typeof LEAD_SOURCE_VALUES)[number]

export const LEAD_CUSTOMER_TYPE_OPTIONS = [
  { value: 'Instalator', key: 'customerInstaller' as const },
  { value: 'Distribuitor', key: 'customerDistributor' as const },
  { value: 'Integrator', key: 'customerIntegrator' as const },
  { value: 'Client final', key: 'customerEndClient' as const },
  { value: 'Proprietar comercial', key: 'customerCommercialOwner' as const },
  { value: 'Altul', key: 'customerOther' as const },
] as const

export const LEAD_PRODUCT_LINE_OPTIONS = [
  { value: 'ESS rezidențial', key: 'productResidentialEss' as const },
  { value: 'ESS comercial/industrial', key: 'productCommercialEss' as const },
  { value: 'Invertor solar', key: 'productSolarInverter' as const },
  { value: 'Stocare baterii', key: 'productBatteryStorage' as const },
  { value: 'Soluții complete', key: 'productCompleteSolutions' as const },
  { value: 'Altul', key: 'productOther' as const },
] as const

export const LEAD_MONTHLY_VOLUME_OPTIONS = [
  { value: 'Sub 10.000 USD', key: 'volumeUnder10k' as const },
  { value: '10.000 – 30.000 USD', key: 'volume10to30k' as const },
  { value: '30.000 – 50.000 USD', key: 'volume30to50k' as const },
  { value: '50.000 – 100.000 USD', key: 'volume50to100k' as const },
  { value: 'Peste 100.000 USD', key: 'volumeOver100k' as const },
  { value: 'Nu știu', key: 'volumeUnknown' as const },
] as const

export function dateLocaleForLang(lang: LangCode): string {
  switch (lang) {
    case 'en':
      return 'en-GB'
    default:
      return 'ro-RO'
  }
}
