import type { LangCode } from './menu'

export type TermeniSiConditiiTranslations = {
  seoTitle: string
  seoDesc: string
  pageTitle: string
  intro: string
}

const translations: Record<LangCode, TermeniSiConditiiTranslations> = {
  ro: {
    seoTitle: 'Termeni și Condiții – Baterino România',
    seoDesc: 'Termenii și condițiile generale de utilizare a site-ului și serviciilor Baterino România.',
    pageTitle: 'Termeni și Condiții',
    intro: 'Prin accesarea și utilizarea site-ului Baterino România, acceptați următorii termeni și condiții. Vă rugăm să citiți cu atenție acest document înainte de a utiliza serviciile noastre.',
  },
  en: {
    seoTitle: 'Terms and Conditions – Baterino Romania',
    seoDesc: 'General terms and conditions for using the Baterino Romania website and services.',
    pageTitle: 'Terms and Conditions',
    intro: 'By accessing and using the Baterino Romania website, you accept the following terms and conditions. Please read this document carefully before using our services.',
  },
  zh: {
    seoTitle: '条款与条件 – Baterino 罗马尼亚',
    seoDesc: 'Baterino罗马尼亚网站及服务使用的一般条款与条件。',
    pageTitle: '条款与条件',
    intro: '访问和使用Baterino罗马尼亚网站即表示您接受以下条款和条件。请在使用我们的服务前仔细阅读本文件。',
  },
}

export function getTermeniSiConditiiTranslations(lang: LangCode): TermeniSiConditiiTranslations {
  return translations[lang] ?? translations.ro
}
