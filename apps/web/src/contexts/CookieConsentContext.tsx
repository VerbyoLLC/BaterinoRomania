import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyStoredCookieConsent,
  loadGoogleAnalytics,
  writeCookieConsent,
  type CookieConsentPreference,
} from '../lib/cookieConsent'
import { recordCookieConsent } from '../lib/api'

type CookieConsentContextValue = {
  preference: CookieConsentPreference
  showBanner: boolean
  acceptAnalytics: () => void
  rejectAnalytics: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<CookieConsentPreference>(() => {
    if (typeof window === 'undefined') {
      return { analytics: false, decided: false }
    }
    return applyStoredCookieConsent()
  })

  const showBanner = !preference.decided

  const acceptAnalytics = useCallback(() => {
    writeCookieConsent(true)
    loadGoogleAnalytics()
    setPreference({ analytics: true, decided: true })
    void recordCookieConsent(true)
  }, [])

  const rejectAnalytics = useCallback(() => {
    writeCookieConsent(false)
    setPreference({ analytics: false, decided: true })
    void recordCookieConsent(false)
  }, [])

  const value = useMemo(
    () => ({
      preference,
      showBanner,
      acceptAnalytics,
      rejectAnalytics,
    }),
    [acceptAnalytics, preference, rejectAnalytics, showBanner],
  )

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider')
  return ctx
}
