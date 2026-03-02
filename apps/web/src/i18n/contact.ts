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
    accessLabel: 'Access',
    baterinoGlobalLabel: 'Baterino Global',
    lithtechLabel: 'LithTech',
    distribuitorsLabel: 'Distributors and Installers',
    distribuitorsDesc: 'Support offered in the Baterino partner account.',
    intraInCont: 'Log in',
  },
  zh: {
    seoTitle: '联系我们 – Baterino Romania',
    seoDesc: '联系Baterino Romania团队，获取LiFePO4储能系统、合作和技术支持相关信息。',
    subtitle: '我们与您同在',
    heroTitle: '综合支持中心',
    heroDesc: '我们为住宅、工业、医疗和船舶行业客户创建了单一联系点，提供技术支持、销售和咨询。',
    contactDirectLabel: '直接联系',
    chooseMethodLabel: '选择联系方式',
    chatWhatsappLabel: 'WhatsApp 聊天',
    responseTime: '平均回复时间约15分钟',
    chatBtn: '开始对话',
    callUsLabel: '与我们交谈',
    callResponseTime: '即时回复',
    mailResponseTime: '24小时内回复',
    viewNumberBtn: '查看号码',
    formName: '姓名',
    formCompany: '公司',
    formEmail: '邮箱',
    formDomain: '事业部',
    formDomainPlaceholder: '选择事业部',
    formRequestType: '请求类型',
    formMessage: '留言',
    formSubmit: '发送',
    domainRezidential: '住宅',
    domainIndustrial: '工业',
    domainMedical: '医疗',
    domainMaritim: '船舶',
    requestSales: '销售',
    requestTechnical: '技术',
    requestService: '服务',
    requestPartnership: '合作',
    accessLabel: '访问',
    baterinoGlobalLabel: 'Baterino Global',
    lithtechLabel: 'LithTech',
    distribuitorsLabel: '经销商和安装商',
    distribuitorsDesc: '在Baterino合作伙伴账户中提供支持。',
    intraInCont: '登录',
  },
}

export function getContactTranslations(lang: LangCode): ContactTranslations {
  return translations[lang] ?? translations.ro
}
