import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCatalogCurrency, normalizeCatalogCurrencyCode, type CatalogCurrencyCode } from '../lib/api'

const DEFAULT_CURRENCY: CatalogCurrencyCode = 'RON'

type CatalogCurrencyContextValue = {
  currency: CatalogCurrencyCode
  /** încă prima încărcare de la API */
  loading: boolean
  reload: () => Promise<void>
}

const CatalogCurrencyContext = createContext<CatalogCurrencyContextValue | null>(null)

export const CATALOG_CURRENCY_UPDATED_EVENT = 'catalog-currency-updated'

export function CatalogCurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CatalogCurrencyCode>(DEFAULT_CURRENCY)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      const { currency: c } = await getCatalogCurrency()
      setCurrency(normalizeCatalogCurrencyCode(c))
    } catch {
      setCurrency(DEFAULT_CURRENCY)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    const onUpdate = () => {
      reload()
    }
    window.addEventListener(CATALOG_CURRENCY_UPDATED_EVENT, onUpdate)
    return () => window.removeEventListener(CATALOG_CURRENCY_UPDATED_EVENT, onUpdate)
  }, [reload])

  const value: CatalogCurrencyContextValue = { currency, loading, reload }

  return <CatalogCurrencyContext.Provider value={value}>{children}</CatalogCurrencyContext.Provider>
}

export function useCatalogCurrency(): CatalogCurrencyContextValue {
  const ctx = useContext(CatalogCurrencyContext)
  if (!ctx) throw new Error('useCatalogCurrency must be used within CatalogCurrencyProvider')
  return ctx
}
