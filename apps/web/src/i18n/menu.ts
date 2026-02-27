export type LangCode = 'ro' | 'en' | 'zh'

export const LANGUAGES: { code: LangCode; label: string; menuLabel: string }[] = [
  { code: 'ro', label: 'Română', menuLabel: 'Română' },
  { code: 'en', label: 'English', menuLabel: 'English' },
  { code: 'zh', label: '中文', menuLabel: 'Chinese Mandarin' },
]

const translations: Record<LangCode, Record<string, string>> = {
  ro: {
    home: 'Acasă', produse: 'Produse', reduceri: 'Reduceri', siguranta: 'Siguranță', divizii: 'Divizii',
    rezidential: 'Rezidențial', industrial: 'Industrial', medical: 'Medical', maritim: 'Maritim',
    lithtech: 'Parteneriat LithTech', instalatori: 'Instalatori', companie: 'Companie',
    viziune: 'Viziune', misiune: 'Misiune', implementare: 'Implementare', echipa: 'Echipa',
    promisiune: 'Promisiune', contact: 'Contact', login: 'Login',
    prodRezSubtype: 'Low Voltage & High Voltage', prodHighVoltage: 'High Voltage',
    back: 'Înapoi',
    divRezSubtitle: 'Rezidențial și Micro-Grids', divIndSubtitle: 'Industrial și Comercial',
    compViziuneSubtitle: 'Despre noi', compLithtechSubtitle: 'Partenerul tehnologic', compContactSubtitle: 'Suport clienți și parteneri',
    loginCreateAccount: 'Creează cont', loginSignIn: 'Intră în cont', loginSubtitle: 'Clienți și Parteneri',
    mainProduse: 'Baterii LiFePO4', mainProduseSubtitle: 'Alege o baterie',
    mainReduceriSubtitle: 'Programe reduceri baterii', mainSigurantaSubtitle: 'De ce cumperi de la noi',
    mainDiviziiSubtitle: 'Diviziile noastre tehnice', mainInstalatori: 'Instalatori & Distribuitori',
    mainInstalatoriSubtitle: 'Devino partenerul nostru', mainCompanieSubtitle: 'Viziune, Parteneriat și Contact',
    mainLangSubtitle: 'Alege limba sitului', mainLogin: 'Logare', mainLoginSubtitle: 'Clienți și Parteneri',
  },
  en: {
    home: 'Home', produse: 'Products', reduceri: 'Discounts', siguranta: 'Safety', divizii: 'Divisions',
    rezidential: 'Residential', industrial: 'Industrial', medical: 'Medical', maritim: 'Maritime',
    lithtech: 'LithTech Partnership', instalatori: 'Installers', companie: 'Company',
    viziune: 'Vision', misiune: 'Mission', implementare: 'Implementation', echipa: 'Team',
    promisiune: 'Promise', contact: 'Contact', login: 'Login',
    prodRezSubtype: 'Low Voltage & High Voltage', prodHighVoltage: 'High Voltage',
    back: 'Back',
    divRezSubtitle: 'Residential & Micro-Grids', divIndSubtitle: 'Industrial & Commercial',
    compViziuneSubtitle: 'About us', compLithtechSubtitle: 'The technological partner', compContactSubtitle: 'Customer and partner support',
    loginCreateAccount: 'Create account', loginSignIn: 'Log in', loginSubtitle: 'Clients and Partners',
    mainProduse: 'LiFePO4 Batteries', mainProduseSubtitle: 'Choose a battery',
    mainReduceriSubtitle: 'Battery discount programs', mainSigurantaSubtitle: 'Why buy from us',
    mainDiviziiSubtitle: 'Our technical divisions', mainInstalatori: 'Installers & Distributors',
    mainInstalatoriSubtitle: 'Become our partner', mainCompanieSubtitle: 'Vision, Partnership and Contact',
    mainLangSubtitle: 'Choose site language', mainLogin: 'Log in', mainLoginSubtitle: 'Clients and Partners',
  },
  zh: {
    home: '首页', produse: '产品', reduceri: '折扣', siguranta: '安全', divizii: '事业部',
    rezidential: '住宅', industrial: '工业', medical: '医疗', maritim: '船舶',
    lithtech: 'LithTech合作', instalatori: '安装商', companie: '公司',
    viziune: '愿景', misiune: '使命', implementare: '实施', echipa: '团队',
    promisiune: '承诺', contact: '联系我们', login: '登录',
    prodRezSubtype: 'Low Voltage & High Voltage', prodHighVoltage: 'High Voltage',
    back: '返回',
    divRezSubtitle: '住宅与微电网', divIndSubtitle: '工业与商业',
    compViziuneSubtitle: '关于我们', compLithtechSubtitle: '技术合作伙伴', compContactSubtitle: '客户和合作伙伴支持',
    loginCreateAccount: '创建账户', loginSignIn: '登录', loginSubtitle: '客户和合作伙伴',
    mainProduse: 'LiFePO4电池', mainProduseSubtitle: '选择电池',
    mainReduceriSubtitle: '电池折扣计划', mainSigurantaSubtitle: '为什么选择我们',
    mainDiviziiSubtitle: '我们的技术部门', mainInstalatori: '安装商与经销商',
    mainInstalatoriSubtitle: '成为我们的合作伙伴', mainCompanieSubtitle: '愿景、合作与联系',
    mainLangSubtitle: '选择网站语言', mainLogin: '登录', mainLoginSubtitle: '客户和合作伙伴',
  },
}

export function getMenuTranslations(lang: LangCode): Record<string, string> {
  return translations[lang] ?? translations.ro
}
