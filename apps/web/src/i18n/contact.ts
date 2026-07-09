import type { LangCode } from './menu'

export type ContactTranslations = {
  seoTitle: string
  seoDesc: string
  subtitle: string
  heroTitle: string
  heroDesc: string
  contactDirectLabel: string
  chooseMethodLabel: string
  chatWhatsappLabel: string
  responseTime: string
  chatBtn: string
  callUsLabel: string
  callResponseTime: string
  mailResponseTime: string
  viewNumberBtn: string
  formName: string
  formCompany: string
  formEmail: string
  formDomain: string
  formDomainPlaceholder: string
  formRequestType: string
  formMessage: string
  formSubmit: string
  domainRezidential: string
  domainIndustrial: string
  domainMedical: string
  domainMaritim: string
  requestSales: string
  requestTechnical: string
  requestService: string
  requestPartnership: string
  formSuccess: string
  formError: string
  phoneChannelTitle: string
  emailChannelTitle: string
  emailSchedule: string
  emailCta: string
  emailModalTitle: string
  directionsBtn: string
  modalClose: string
  modalSending: string
  modalSendBtn: string
  modalSuccessTitle: string
  modalSuccessDesc: string
  modalError: string
  privacyNotice: string
  privacyPolicyLink: string
  formNamePlaceholder: string
  formCompanyPlaceholder: string
  formEmailPlaceholder: string
  formMessagePlaceholder: string
  accessLabel: string
  baterinoGlobalLabel: string
  lithtechLabel: string
  distribuitorsLabel: string
  distribuitorsDesc: string
  intraInCont: string
}

const translations: Record<LangCode, ContactTranslations> = {
  ro: {
    seoTitle: 'Contact – Baterino Romania',
    seoDesc: 'Contactează echipa Baterino Romania pentru informații despre sisteme de stocare a energiei LiFePO4, parteneriate și suport tehnic.',
    subtitle: 'SUNTEM ALATURI DE TINE',
    heroTitle: 'CENTRU DE SUPORT INTEGRAT',
    heroDesc: 'Am creat un punct unic de contact pentru suport tehnic, vânzări şi consultanţă, dedicat clienţilor din sectorul rezidenţial, industrial, medical şi maritim.',
    contactDirectLabel: 'Contact direct',
    chooseMethodLabel: 'ALEGE MODALITATEA DE CONTACT',
    chatWhatsappLabel: 'Chat Whatsapp',
    responseTime: 'Răspuns în medie sub 15 minute',
    chatBtn: 'Începe conversația',
    callUsLabel: 'Vorbește cu noi',
    callResponseTime: 'Răspuns instant',
    mailResponseTime: 'Răspuns în maxim 24 de ore',
    viewNumberBtn: 'Vezi număr',
    formName: 'Nume',
    formCompany: 'Companie',
    formEmail: 'Email',
    formDomain: 'Divizie',
    formDomainPlaceholder: 'Alege Divizie',
    formRequestType: 'Tip solicitare',
    formMessage: 'Mesaj',
    formSubmit: 'Trimite',
    domainRezidential: 'Rezidențial',
    domainIndustrial: 'Industrial',
    domainMedical: 'Medical',
    domainMaritim: 'Maritim',
    requestSales: 'Vânzări',
    requestTechnical: 'Tehnic',
    requestService: 'Service',
    requestPartnership: 'Parteneriat',
    formSuccess: 'Solicitarea a fost trimisă. Vei primi un email de confirmare cu nr. înregistrare.',
    formError: 'A apărut o eroare. Te rugăm să încerci din nou.',
    phoneChannelTitle: 'Telefon',
    emailChannelTitle: 'Email',
    emailSchedule: 'Program continuu',
    emailCta: 'Completează formularul',
    emailModalTitle: 'Trimite-ne un email',
    directionsBtn: 'Obține indicații',
    modalClose: 'Închide',
    modalSending: 'Se trimite...',
    modalSendBtn: 'Trimite mesajul',
    modalSuccessTitle: 'Mesaj trimis',
    modalSuccessDesc: 'Îți mulțumim! Echipa Baterino îți va răspunde în maxim 24 de ore la adresa {email}.',
    modalError: 'Mesajul nu a putut fi trimis. Încearcă din nou sau scrie-ne direct la contact@baterino.ro.',
    privacyNotice: 'Prin trimiterea formularului ești de acord cu',
    privacyPolicyLink: 'Politica de confidențialitate',
    formNamePlaceholder: 'Numele tău',
    formCompanyPlaceholder: 'Opțional',
    formEmailPlaceholder: 'adresa@email.ro',
    formMessagePlaceholder: 'Cu ce te putem ajuta?',
    accessLabel: 'Accesează',
    baterinoGlobalLabel: 'Baterino Global',
    lithtechLabel: 'LithTech',
    distribuitorsLabel: 'Distribuitori și Instalatori',
    distribuitorsDesc: 'Suport oferit în contul de partener Baterino.',
    intraInCont: 'Intră în Cont',
  },
  en: {
    seoTitle: 'Contact – Baterino Romania',
    seoDesc: 'Contact the Baterino Romania team for information on LiFePO4 energy storage systems, partnerships and technical support.',
    subtitle: 'WE ARE WITH YOU',
    heroTitle: 'INTEGRATED SUPPORT CENTER',
    heroDesc: 'We have created a single contact point for technical support, sales and consulting, dedicated to clients in the residential, industrial, medical and maritime sectors.',
    contactDirectLabel: 'Direct contact',
    chooseMethodLabel: 'CHOOSE CONTACT METHOD',
    chatWhatsappLabel: 'WhatsApp Chat',
    responseTime: 'Average response in under 15 minutes',
    chatBtn: 'Start conversation',
    callUsLabel: 'Talk to us',
    callResponseTime: 'Instant response',
    mailResponseTime: 'Response within 24 hours',
    viewNumberBtn: 'View number',
    formName: 'Name',
    formCompany: 'Company',
    formEmail: 'Email',
    formDomain: 'Division',
    formDomainPlaceholder: 'Choose Division',
    formRequestType: 'Request type',
    formMessage: 'Message',
    formSubmit: 'Send',
    domainRezidential: 'Residential',
    domainIndustrial: 'Industrial',
    domainMedical: 'Medical',
    domainMaritim: 'Maritime',
    requestSales: 'Sales',
    requestTechnical: 'Technical',
    requestService: 'Service',
    requestPartnership: 'Partnership',
    formSuccess: 'Your request has been sent. You will receive a confirmation email with the registration number.',
    formError: 'An error occurred. Please try again.',
    phoneChannelTitle: 'Phone',
    emailChannelTitle: 'Email',
    emailSchedule: 'Available anytime',
    emailCta: 'Fill out the form',
    emailModalTitle: 'Send us an email',
    directionsBtn: 'Get directions',
    modalClose: 'Close',
    modalSending: 'Sending...',
    modalSendBtn: 'Send message',
    modalSuccessTitle: 'Message sent',
    modalSuccessDesc: 'Thank you! The Baterino team will reply within 24 hours at {email}.',
    modalError: 'Your message could not be sent. Please try again or email us at contact@baterino.ro.',
    privacyNotice: 'By submitting this form you agree to our',
    privacyPolicyLink: 'Privacy policy',
    formNamePlaceholder: 'Your name',
    formCompanyPlaceholder: 'Optional',
    formEmailPlaceholder: 'you@email.com',
    formMessagePlaceholder: 'How can we help?',
    accessLabel: 'Access',
    baterinoGlobalLabel: 'Baterino Global',
    lithtechLabel: 'LithTech',
    distribuitorsLabel: 'Distributors and Installers',
    distribuitorsDesc: 'Support offered in the Baterino partner account.',
    intraInCont: 'Log in',
  },
}

export function getContactTranslations(lang: LangCode): ContactTranslations {
  return translations[lang] ?? translations.ro
}
