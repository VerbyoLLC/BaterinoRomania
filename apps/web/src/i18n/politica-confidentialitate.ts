import type { LangCode } from './menu'

export type PoliticaConfidentialitateTranslations = {
  seoTitle: string
  seoDesc: string
  pageTitle: string
  intro: string
}

const translations: Record<LangCode, PoliticaConfidentialitateTranslations> = {
  ro: {
    seoTitle: 'Politica de Confidențialitate – Baterino România',
    seoDesc: 'Politica de confidențialitate Baterino România – cum colectăm, utilizăm și protejăm datele dumneavoastră personale.',
    pageTitle: 'Politica de Confidențialitate',
    intro: 'Baterino România respectă confidențialitatea utilizatorilor și se angajează să protejeze datele personale colectate prin intermediul site-ului și serviciilor noastre. Această politică descrie practicile noastre în acest sens.',
  },
  en: {
    seoTitle: 'Privacy Policy – Baterino Romania',
    seoDesc: 'Baterino Romania privacy policy – how we collect, use and protect your personal data.',
    pageTitle: 'Privacy Policy',
    intro: 'Baterino Romania respects the privacy of users and is committed to protecting the personal data collected through our website and services. This policy describes our practices in this regard.',
  },
  zh: {
    seoTitle: '隐私政策 – Baterino 罗马尼亚',
    seoDesc: 'Baterino罗马尼亚隐私政策 – 我们如何收集、使用和保护您的个人数据。',
    pageTitle: '隐私政策',
    intro: 'Baterino罗马尼亚尊重用户隐私，致力于保护通过我们网站和服务收集的个人数据。本政策描述了我们在这一方面的做法。',
  },
}

export function getPoliticaConfidentialitateTranslations(lang: LangCode): PoliticaConfidentialitateTranslations {
  return translations[lang] ?? translations.ro
}
