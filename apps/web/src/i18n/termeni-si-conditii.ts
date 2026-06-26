import type { LangCode } from './menu'

export type TermeniSiConditiiTranslations = {
  seoTitle: string
  seoDesc: string
  pageTitle: string
  intro: string
  /** Ancoră pagină: #politica-retur */
  returnPolicyTitle: string
  returnPolicyLinkLead: string
  returnPolicyLinkLabel: string
  returnPolicyLinkSuffix: string
}

const translations: Record<LangCode, TermeniSiConditiiTranslations> = {
  ro: {
    seoTitle: 'Termeni și Condiții – Baterino România',
    seoDesc:
      'Termenii și condițiile generale de utilizare a site-ului și serviciilor Baterino România, inclusiv politica de retur.',
    pageTitle: 'Termeni și Condiții',
    intro: 'Prin accesarea și utilizarea site-ului Baterino România, acceptați următorii termeni și condiții. Vă rugăm să citiți cu atenție acest document înainte de a utiliza serviciile noastre.',
    returnPolicyTitle: 'Politica de retur',
    returnPolicyLinkLead: 'Condițiile complete privind returnarea produselor sunt publicate separat:',
    returnPolicyLinkLabel: 'Politica de Retur',
    returnPolicyLinkSuffix: '.',
  },
  en: {
    seoTitle: 'Terms and Conditions – Baterino Romania',
    seoDesc: 'General terms and conditions for using the Baterino Romania website and services, including the return policy.',
    pageTitle: 'Terms and Conditions',
    intro: 'By accessing and using the Baterino Romania website, you accept the following terms and conditions. Please read this document carefully before using our services.',
    returnPolicyTitle: 'Return policy',
    returnPolicyLinkLead: 'The full product return conditions are published separately:',
    returnPolicyLinkLabel: 'Return Policy',
    returnPolicyLinkSuffix: '.',
  },
}

export function getTermeniSiConditiiTranslations(lang: LangCode): TermeniSiConditiiTranslations {
  return translations[lang] ?? translations.ro
}
