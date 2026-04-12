import { useEffect, useState } from 'react'
import type { LangCode } from '../i18n/menu'
import { getPublicReducerePrograms } from '../lib/api'

function shortProgramLabel(programLabel: string): string {
  return programLabel.replace(/^PROGRAMUL\s*/i, '').trim() || programLabel.trim()
}

/**
 * Maps API `reducereProgramId` → short display name for cart / checkout badges.
 */
export function useReducereProgramLabels(lang: LangCode, enabled: boolean): Record<string, string> {
  const [map, setMap] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!enabled) {
      setMap({})
      return
    }
    let cancelled = false
    getPublicReducerePrograms(lang)
      .then((rows) => {
        if (cancelled) return
        const next: Record<string, string> = {}
        for (const r of rows) {
          if (r.id) next[r.id] = shortProgramLabel(r.programLabel)
        }
        setMap(next)
      })
      .catch(() => {
        if (!cancelled) setMap({})
      })
    return () => {
      cancelled = true
    }
  }, [lang, enabled])

  return map
}
