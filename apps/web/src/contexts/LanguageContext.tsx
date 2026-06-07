import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { LANGUAGES, type LangCode } from '../i18n/menu'

const STORAGE_KEY = 'baterino-lang'

/** Site-wide default; Romanian when no saved preference exists. */
export const DEFAULT_LANG: LangCode = 'ro'

export function getStoredLang(): LangCode {
  if (typeof window === 'undefined') return DEFAULT_LANG
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'ro' || stored === 'en') return stored
  return DEFAULT_LANG
}

type LanguageEntry = (typeof LANGUAGES)[number]

type LanguageContextValue = {
  language: LanguageEntry
  setLanguage: (lang: LanguageEntry) => void
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageEntry>(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
      try {
        localStorage.setItem(STORAGE_KEY, DEFAULT_LANG)
      } catch {
        /* ignore quota / private mode */
      }
    }
    const code = getStoredLang()
    return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES.find((l) => l.code === DEFAULT_LANG)!
  })

  useEffect(() => {
    document.documentElement.lang = language.code
  }, [language.code])

  const setLanguage = useCallback((lang: LanguageEntry) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang.code)
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('baterino-lang-change'))
  }, [])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
