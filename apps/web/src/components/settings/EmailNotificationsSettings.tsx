import { useCallback, useEffect, useState } from 'react'
import {
  getEmailNotificationPreferences,
  patchEmailNotificationPreferences,
} from '../../lib/api'

export type EmailNotificationsContent = {
  intro: string
  marketingLabel: string
  marketingDesc: string
  loadingAria: string
  saved: string
  loadError: string
  saveError: string
}

type EmailNotificationsSettingsProps = {
  content: EmailNotificationsContent
  /** Client settings use slate; partner uses gray/blue accents via class overrides. */
  variant?: 'client' | 'partner'
}

function MarketingPreferenceRowSkeleton({ variant }: { variant: 'client' | 'partner' }) {
  const rowClass =
    variant === 'partner'
      ? 'flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4'
      : 'flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4'
  const pulse = variant === 'partner' ? 'bg-gray-100 animate-pulse' : 'bg-slate-100 animate-pulse'

  return (
    <div className={rowClass} aria-busy="true" aria-hidden>
      <div className="min-w-0 flex-1 space-y-2.5 pr-2">
        <div className={`h-4 w-40 max-w-[70%] rounded ${pulse}`} />
        <div className={`h-3.5 w-full max-w-md rounded ${pulse}`} />
        <div className={`h-3.5 w-[80%] max-w-sm rounded ${pulse}`} />
      </div>
      <div className={`mt-0.5 h-5 w-5 shrink-0 rounded ${pulse}`} />
    </div>
  )
}

export default function EmailNotificationsSettings({
  content,
  variant = 'client',
}: EmailNotificationsSettingsProps) {
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const rowClass =
    variant === 'partner'
      ? 'flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4'
      : 'flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4'
  const labelClass =
    variant === 'partner'
      ? 'text-sm font-semibold text-slate-900 font-[\'Inter\']'
      : 'text-sm font-semibold text-slate-900 font-[\'Inter\']'
  const descClass =
    variant === 'partner'
      ? 'mt-1 text-sm leading-relaxed text-gray-600 font-[\'Inter\']'
      : 'mt-1 text-sm leading-relaxed text-slate-600 font-[\'Inter\']'
  const checkboxClass =
    variant === 'partner'
      ? 'mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600/25 disabled:opacity-50'
      : 'mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-slate-900 disabled:opacity-50'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getEmailNotificationPreferences()
      .then((prefs) => {
        if (!cancelled) setMarketingOptIn(prefs.marketingEmailOptIn)
      })
      .catch(() => {
        if (!cancelled) setError(content.loadError)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [content.loadError])

  const handleMarketingChange = useCallback(
    async (next: boolean) => {
      const prev = marketingOptIn
      setMarketingOptIn(next)
      setSaving(true)
      setSavedMsg(null)
      setError(null)
      try {
        const updated = await patchEmailNotificationPreferences({ marketingEmailOptIn: next })
        setMarketingOptIn(updated.marketingEmailOptIn)
        setSavedMsg(content.saved)
      } catch {
        setMarketingOptIn(prev)
        setError(content.saveError)
      } finally {
        setSaving(false)
      }
    },
    [content.saved, content.saveError, marketingOptIn],
  )

  return (
    <div className="space-y-4">
      <p className={`${descClass} -mt-1`}>{content.intro}</p>

      {loading ? (
        <>
          <span className="sr-only">{content.loadingAria}</span>
          <MarketingPreferenceRowSkeleton variant={variant} />
        </>
      ) : (
        <>
          <label className={`${rowClass} cursor-pointer ${saving ? 'opacity-70' : ''}`}>
            <div className="min-w-0 pr-2">
              <p className={labelClass}>{content.marketingLabel}</p>
              <p className={descClass}>{content.marketingDesc}</p>
            </div>
            <input
              type="checkbox"
              checked={marketingOptIn}
              disabled={saving}
              onChange={(e) => void handleMarketingChange(e.target.checked)}
              className={checkboxClass}
              aria-describedby="email-notifications-marketing-desc"
            />
          </label>
          <p id="email-notifications-marketing-desc" className="sr-only">
            {content.marketingDesc}
          </p>
        </>
      )}

      {savedMsg ? (
        <p className="text-sm text-green-700 font-['Inter']" role="status">
          {savedMsg}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 font-['Inter']" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
