import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { LANGUAGES, type LangCode } from '../i18n/menu'

const STORAGE_KEY = 'baterino-lang'

function getStoredLang(): LangCode {
  if (typeof window === 'undefined') return 'ro'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'ro' || stored === 'en' || stored === 'zh') return stored
  return 'ro'
}

type LanguageEntry = (typeof LANGUAGES)[number]

type LanguageContextValue = {
  language: LanguageEntry
  setLanguage: (lang: LanguageEntry) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageEntry>(() => {
    const code = getStoredLang()
    return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]
  })

  const setLanguage = useCallback((lang: LanguageEntry) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang.code)
    } catch {
      // ignore
    }
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
