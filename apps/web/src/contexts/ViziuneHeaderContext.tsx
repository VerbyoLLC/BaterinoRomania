import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ViziuneHeaderContextValue = {
  replaceMainHeader: boolean
  setReplaceMainHeader: (value: boolean) => void
}

const ViziuneHeaderContext = createContext<ViziuneHeaderContextValue | null>(null)

export function ViziuneHeaderProvider({ children }: { children: ReactNode }) {
  const [replaceMainHeader, setReplaceMainHeader] = useState(false)
  const setter = useCallback((value: boolean) => setReplaceMainHeader(value), [])
  return (
    <ViziuneHeaderContext.Provider value={{ replaceMainHeader, setReplaceMainHeader: setter }}>
      {children}
    </ViziuneHeaderContext.Provider>
  )
}

export function useViziuneHeader(): ViziuneHeaderContextValue {
  const ctx = useContext(ViziuneHeaderContext)
  if (!ctx) return { replaceMainHeader: false, setReplaceMainHeader: () => {} }
  return ctx
}
