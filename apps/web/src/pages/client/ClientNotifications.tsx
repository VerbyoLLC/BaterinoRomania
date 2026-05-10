import { useEffect, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import type { LangCode } from '../../i18n/menu'
import { getAuthUserId } from '../../lib/api'
import {
  getClientNotificationItems,
  getClientNotificationReadSet,
  markClientNotificationRead,
  type ClientNotificationItem,
} from '../../lib/clientNotifications'

function formatNotificationDateTime(iso: string, lang: LangCode): string {
  const date = new Date(iso)
  if (!Number.isFinite(date.getTime())) return '—'
  const locale = lang === 'en' ? 'en-GB' : lang === 'zh' ? 'zh-CN' : 'ro-RO'
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ClientNotifications() {
  const { language } = useLanguage()
  const lang = language.code as LangCode
  const [items, setItems] = useState<ClientNotificationItem[]>([])
  const [readFingerprints, setReadFingerprints] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userId = getAuthUserId()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void getClientNotificationItems(lang)
      .then((rows) => {
        if (!cancelled) setItems(rows)
        if (!cancelled) setReadFingerprints(getClientNotificationReadSet(userId))
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : lang === 'en'
                ? 'Could not load notifications.'
                : lang === 'zh'
                  ? '无法加载通知。'
                  : 'Nu am putut încărca notificările.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [lang, userId])

  const fingerprintOf = (n: ClientNotificationItem) => `${n.id}:${n.createdAt}`

  return (
    <div className="font-['Inter']">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900">
        {lang === 'en' ? 'Notifications' : lang === 'zh' ? '通知' : 'Notificări'}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        {lang === 'en'
          ? 'Updates and actions for your account.'
          : lang === 'zh'
            ? '您的账户更新与待处理事项。'
            : 'Actualizări și acțiuni pentru contul tău.'}
      </p>

      {loading ? (
        <ul className="m-0 list-none space-y-4 p-0" aria-busy="true" aria-live="polite">
          {[0, 1].map((idx) => (
            <li key={idx} className="animate-pulse rounded-2xl border border-slate-200 bg-[#f7f7f7] p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[5rem_minmax(0,1fr)_12rem] sm:items-start sm:gap-x-10 sm:gap-y-5">
                <div className="h-20 w-20 rounded-xl bg-slate-200/80" />
                <div className="space-y-2">
                  <div className="h-5 w-48 rounded bg-slate-200/80" />
                  <div className="h-4 w-full max-w-2xl rounded bg-slate-200/70" />
                  <div className="h-4 w-5/6 rounded bg-slate-200/70" />
                </div>
                <div className="space-y-2 sm:text-center">
                  <div className="mx-auto h-3 w-16 rounded bg-slate-200/70" />
                  <div className="mx-auto h-4 w-28 rounded bg-slate-200/80" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          {lang === 'en'
            ? 'No notifications right now.'
            : lang === 'zh'
              ? '当前没有通知。'
              : 'Nu ai notificări momentan.'}
        </div>
      ) : (
        <ul className="m-0 list-none space-y-4 p-0">
          {items.map((n) => (
            <li
              key={n.id}
              className={`cursor-pointer rounded-2xl border border-slate-200 p-4 transition-colors sm:p-5 ${
                readFingerprints.has(fingerprintOf(n)) ? 'bg-white' : 'bg-[#f7f7f7]'
              }`}
              onClick={() => {
                markClientNotificationRead(n, userId)
                const fp = fingerprintOf(n)
                setReadFingerprints((prev) => {
                  if (prev.has(fp)) return prev
                  const next = new Set(prev)
                  next.add(fp)
                  return next
                })
              }}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[5rem_minmax(0,1fr)_12rem] sm:items-start sm:gap-x-10 sm:gap-y-5">
                <div className="flex h-20 w-20 items-center justify-center justify-self-center rounded-xl bg-slate-50 ring-1 ring-slate-100 sm:justify-self-start">
                  {n.id === 'profile_incomplete_for_warranty' ? (
                    <TriangleAlert className="h-9 w-9 text-amber-600" strokeWidth={1.8} aria-hidden />
                  ) : (
                    <img
                      src="/images/shared/baterino-logo-black.svg"
                      alt="Baterino"
                      className="h-9 w-auto object-contain"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-base font-bold text-slate-900">{n.title}</p>
                  <p className="mb-0 mt-1 text-sm leading-relaxed text-slate-700">{n.message}</p>
                </div>
                <div className="border-t border-slate-100 pt-3 text-left sm:flex sm:h-full sm:flex-col sm:items-center sm:justify-center sm:border-t-0 sm:pt-0 sm:text-center">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {lang === 'en' ? 'Date' : lang === 'zh' ? '日期' : 'Data'}
                  </p>
                  <p className="mt-1 m-0 text-sm font-semibold tabular-nums text-slate-700">
                    {formatNotificationDateTime(n.createdAt, lang)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

    </div>
  )
}
