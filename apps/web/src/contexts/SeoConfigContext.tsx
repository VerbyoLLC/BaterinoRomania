import { createContext, useContext, useEffect, useState } from 'react'
import { getPageSeoAll, type PageSeoDto } from '../lib/api'

type PageSeoValues = Omit<PageSeoDto, 'pageKey'>

const EMPTY: PageSeoValues = { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '' }

const SeoConfigContext = createContext<Record<string, PageSeoValues>>({})

export function SeoConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Record<string, PageSeoValues>>({})

  useEffect(() => {
    getPageSeoAll().then((rows) => {
      const map: Record<string, PageSeoValues> = {}
      for (const { pageKey, ...values } of rows) map[pageKey] = values
      setConfig(map)
    })
  }, [])

  return <SeoConfigContext.Provider value={config}>{children}</SeoConfigContext.Provider>
}

export function useSeoPage(pageKey: string): PageSeoValues {
  return useContext(SeoConfigContext)[pageKey] ?? EMPTY
}
