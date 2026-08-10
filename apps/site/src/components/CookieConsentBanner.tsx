'use client'

import { useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getStoredLang, LanguageContext } from '../contexts/LanguageContext'
import { useCookieConsent } from '../contexts/CookieConsentContext'
import { getCookieConsentTranslations } from '../i18n/cookie-consent'
import type { LangCode } from '../i18n/menu'

function useSiteLangCode(): LangCode {
  const languageContext = useContext(LanguageContext)
  const [storedLang, setStoredLang] = useState<LangCode>(() => getStoredLang())

  useEffect(() => {
    const sync = () => setStoredLang(getStoredLang())
    window.addEventListener('baterino-lang-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('baterino-lang-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return languageContext?.language.code ?? storedLang
}

export default function CookieConsentBanner() {
  const langCode = useSiteLangCode()
  const tr = getCookieConsentTranslations(langCode)
  const { showBanner, acceptAnalytics, rejectAnalytics } = useCookieConsent()
  const pathname = usePathname()

  if (!showBanner || pathname.startsWith('/admin')) {
    return null
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-gray-200 bg-white/95 px-4 py-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:px-6 lg:px-8"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="mx-auto flex max-w-content flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1">
          <h2
            id="cookie-consent-title"
            className="text-base font-bold text-slate-900 font-['Inter'] sm:text-lg"
          >
            {tr.title}
          </h2>
          <p
            id="cookie-consent-description"
            className="mt-2 text-sm leading-relaxed text-neutral-600 font-['Inter'] sm:text-base"
          >
            {tr.description}{' '}
            <a href="/politica-confidentialitate" className="font-semibold text-black underline underline-offset-2">
              {tr.privacyLink}
            </a>
            .
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <p className="text-sm font-semibold text-slate-900 font-['Inter']">{tr.necessaryTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600 font-['Inter'] sm:text-sm">
                {tr.necessaryDesc}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <p className="text-sm font-semibold text-slate-900 font-['Inter']">{tr.analyticsTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600 font-['Inter'] sm:text-sm">
                {tr.analyticsDesc}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <button
            type="button"
            onClick={acceptAnalytics}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 font-['Inter']"
          >
            {tr.acceptAnalytics}
          </button>
          <button
            type="button"
            onClick={rejectAnalytics}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-gray-50 font-['Inter']"
          >
            {tr.rejectAnalytics}
          </button>
        </div>
      </div>
    </div>
  )
}
