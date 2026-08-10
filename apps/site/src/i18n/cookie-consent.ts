import type { LangCode } from './menu'

export type CookieConsentTranslations = {
  title: string
  description: string
  necessaryTitle: string
  necessaryDesc: string
  analyticsTitle: string
  analyticsDesc: string
  privacyLink: string
  acceptAnalytics: string
  rejectAnalytics: string
}

const translations: Record<LangCode, CookieConsentTranslations> = {
  ro: {
    title: 'Preferințe cookie',
    description:
      'Folosim cookie-uri strict necesare pentru funcționarea site-ului (autentificare, coș de cumpărături). Cookie-urile analitice ne ajută să înțelegem cum este utilizat site-ul și sunt activate doar cu acordul dvs.',
    necessaryTitle: 'Strict necesare',
    necessaryDesc: 'Indispensabile pentru autentificare, coș și securitate. Sunt întotdeauna active.',
    analyticsTitle: 'Analitice',
    analyticsDesc: 'Ne ajută să măsurăm traficul și să îmbunătățim experiența pe site.',
    privacyLink: 'Politica de confidențialitate',
    acceptAnalytics: 'Accept cookie-uri analitice',
    rejectAnalytics: 'Doar strict necesare',
  },
  en: {
    title: 'Cookie preferences',
    description:
      'We use strictly necessary cookies for the website to work (authentication, shopping cart). Analytical cookies help us understand how the site is used and are only enabled with your consent.',
    necessaryTitle: 'Strictly necessary',
    necessaryDesc: 'Required for authentication, cart, and security. Always active.',
    analyticsTitle: 'Analytics',
    analyticsDesc: 'Help us measure traffic and improve the website experience.',
    privacyLink: 'Privacy policy',
    acceptAnalytics: 'Accept analytics cookies',
    rejectAnalytics: 'Necessary cookies only',
  },
}

export function getCookieConsentTranslations(lang: LangCode): CookieConsentTranslations {
  return translations[lang] ?? translations.ro
}
