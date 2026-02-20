export type LangCode = 'ro' | 'en' | 'zh'

export const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: 'ro', label: 'Română' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
]

const translations: Record<LangCode, Record<string, string>> = {
  ro: {
    home: 'Acasă', produse: 'Produse', siguranta: 'Siguranță', divizii: 'Divizii',
    rezidential: 'Rezidențial', industrial: 'Industrial', medical: 'Medical', maritim: 'Maritim',
    lithtech: 'LithTech', instalatori: 'Instalatori', companie: 'Companie',
    viziune: 'Viziune', misiune: 'Misiune', implementare: 'Implementare', echipa: 'Echipa',
    promisiune: 'Promisiune', contact: 'Contact', login: 'Login',
  },
  en: {
    home: 'Home', produse: 'Products', siguranta: 'Safety', divizii: 'Divisions',
    rezidential: 'Residential', industrial: 'Industrial', medical: 'Medical', maritim: 'Maritime',
    lithtech: 'LithTech', instalatori: 'Installers', companie: 'Company',
    viziune: 'Vision', misiune: 'Mission', implementare: 'Implementation', echipa: 'Team',
    promisiune: 'Promise', contact: 'Contact', login: 'Login',
  },
  zh: {
    home: '首页', produse: '产品', siguranta: '安全', divizii: '事业部',
    rezidential: '住宅', industrial: '工业', medical: '医疗', maritim: '船舶',
    lithtech: 'LithTech', instalatori: '安装商', companie: '公司',
    viziune: '愿景', misiune: '使命', implementare: '实施', echipa: '团队',
    promisiune: '承诺', contact: '联系我们', login: '登录',
  },
}

export function getMenuTranslations(lang: LangCode): Record<string, string> {
  return translations[lang] ?? translations.ro
}
