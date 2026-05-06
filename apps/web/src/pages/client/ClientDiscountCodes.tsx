import { type FormEvent, useEffect, useState } from 'react'
import { BadgePercent } from 'lucide-react'
import { getClientProfile, postClientReferralInviteEmail } from '../../lib/api'

/** Skeleton pulse (fără radius — setezi rounded-* pe fiecare bloc). */
const sk = 'animate-pulse bg-slate-200/90'

export default function ClientDiscountCodes() {
  const [referralCode, setReferralCode] = useState<string | null | undefined>(undefined)
  const [referralEmailsSent, setReferralEmailsSent] = useState<number | undefined>(undefined)
  const [referralCodeUses, setReferralCodeUses] = useState<number | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [friendEmail, setFriendEmail] = useState('')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteOk, setInviteOk] = useState<string | null>(null)

  useEffect(() => {
    let c = false
    getClientProfile()
      .then((r) => {
        if (!c) {
          setReferralCode(r.referralCode ?? null)
          setReferralEmailsSent(r.referralInviteEmailsSent ?? 0)
          setReferralCodeUses(r.referralCodeRedemptionsCount ?? 0)
        }
      })
      .catch((e) => {
        if (!c) setError(e instanceof Error ? e.message : 'Eroare')
      })
    return () => {
      c = true
    }
  }, [])

  async function copyCode() {
    if (!referralCode) return
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  function openWhatsAppShare() {
    if (!referralCode) return
    const text = `Salut, codul tău de 5% reducere pentru baterii LiFePO4 de pe platforma Baterino este: ${referralCode}`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function sendInviteEmail(e: FormEvent) {
    e.preventDefault()
    if (!referralCode || inviteSending) return
    setInviteError(null)
    setInviteOk(null)
    const email = friendEmail.trim()
    if (!email) {
      setInviteError('Introdu adresa de email.')
      return
    }
    setInviteSending(true)
    try {
      const r = await postClientReferralInviteEmail(email)
      setInviteOk(r.message || 'Email trimis.')
      setFriendEmail('')
      if (typeof r.referralInviteEmailsSent === 'number') {
        setReferralEmailsSent(r.referralInviteEmailsSent)
      }
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Eroare la trimitere.')
    } finally {
      setInviteSending(false)
    }
  }

  if (error) {
    return <p className="text-red-600 text-sm font-['Inter']">{error}</p>
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Coduri reducere</h1>
      <p className="text-slate-600 text-sm font-['Inter'] mb-6">
        Codul tău personal de recomandare pentru clienți noi.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,280px)] lg:items-start">
        <div className="order-2 flex min-w-0 flex-col gap-6 lg:order-1">
        <section className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 pb-5 pt-1.5 shadow-sm">
          <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Codul tău de recomandare</h2>
          <p className="text-sm text-slate-600 font-['Inter'] mb-4">
            Împărtășește Baterino cu prietenii tăi — ei primesc o reducere, tu îi ajuți să facă o alegere mai bună.
          </p>
          {referralCode === undefined ? (
            <div
              className="flex flex-wrap items-center gap-3"
              role="status"
              aria-live="polite"
              aria-busy="true"
              aria-label="Se încarcă codul de recomandare"
            >
              <div className={`h-[52px] w-44 max-w-full rounded-xl ${sk}`} aria-hidden />
              <div className={`h-10 w-[5.5rem] rounded-xl ${sk}`} aria-hidden />
              <div className={`h-10 w-[11.5rem] max-w-full rounded-xl ${sk}`} aria-hidden />
            </div>
          ) : referralCode ? (
            <div className="flex flex-wrap items-center gap-3">
              <code className="rounded-xl bg-slate-100 px-4 py-3 text-lg font-mono font-bold tracking-wide text-slate-900">
                {referralCode}
              </code>
              <button
                type="button"
                onClick={copyCode}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 font-['Inter'] hover:bg-slate-50"
              >
                {copied ? 'Copiat' : 'Copiază'}
              </button>
              <button
                type="button"
                onClick={openWhatsAppShare}
                className="rounded-xl border border-emerald-600/40 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 font-['Inter'] hover:bg-emerald-100"
              >
                Distribuie pe WhatsApp
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 font-['Inter']">Cod indisponibil momentan. Reîncearcă mai târziu.</p>
          )}

          {referralCode !== undefined ? (
            <div className="mt-4 border-t border-slate-200 pt-3">
              <h3 className="text-base font-bold font-['Inter'] text-slate-900">Trimite pe email</h3>
              <p className="mt-2 text-sm text-slate-600 font-['Inter']">
                Introdu adresa de email a prietenului tău și îi trimitem codul direct în inbox.
              </p>
              <form onSubmit={sendInviteEmail} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <label className="min-w-0 flex-1 font-['Inter']">
                  <span className="sr-only">Email prieten</span>
                  <input
                    type="email"
                    name="friendEmail"
                    autoComplete="email"
                    enterKeyHint="send"
                    value={friendEmail}
                    onChange={(ev) => {
                      setFriendEmail(ev.target.value)
                      setInviteOk(null)
                      setInviteError(null)
                    }}
                    disabled={!referralCode || inviteSending}
                    placeholder="exemplu@email.com"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-slate-900/10 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </label>
                <button
                  type="submit"
                  disabled={!referralCode || inviteSending}
                  aria-busy={inviteSending}
                  className={`inline-flex min-h-[42px] min-w-[5.5rem] shrink-0 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold font-['Inter'] disabled:cursor-not-allowed ${
                    inviteSending
                      ? 'animate-pulse bg-slate-500 text-transparent'
                      : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50'
                  }`}
                >
                  {inviteSending ? (
                    <span className="h-3.5 w-16 rounded bg-white/35" aria-hidden />
                  ) : (
                    'Trimite'
                  )}
                </button>
              </form>
              {inviteError ? (
                <p className="mt-2 text-sm text-red-600 font-['Inter']">{inviteError}</p>
              ) : null}
              {inviteOk ? (
                <p className="mt-2 text-sm text-emerald-700 font-['Inter']">{inviteOk}</p>
              ) : null}
            </div>
          ) : null}
        </section>

        <aside
          className="rounded-2xl border border-slate-200 bg-neutral-50 px-4 py-4 shadow-sm sm:px-5 sm:py-5"
          aria-label="Statistici recomandări"
        >
          {referralEmailsSent !== undefined && referralCodeUses !== undefined ? (
            <div className="grid grid-cols-1 gap-4 divide-y divide-slate-200 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-y-0">
              <div className="flex flex-col items-center gap-1 pt-1 text-center sm:px-3 sm:pt-0">
                <span className="text-xs font-medium text-slate-600 font-['Inter']">Recomandări trimise</span>
                <span className="text-xl font-bold tabular-nums text-slate-900 font-['Inter']">{referralEmailsSent}</span>
              </div>
              <div className="flex flex-col items-center gap-1 pt-4 text-center sm:px-3 sm:pt-0">
                <span className="text-xs font-medium text-slate-600 font-['Inter']">Coduri folosite</span>
                <span className="text-xl font-bold tabular-nums text-slate-900 font-['Inter']">{referralCodeUses}</span>
              </div>
              <div className="flex flex-col items-center gap-1 pt-4 text-center sm:px-3 sm:pt-0 sm:pb-0">
                <span className="text-xs font-medium text-slate-600 font-['Inter']">Reduceri generate</span>
                <span className="text-xl font-bold text-slate-900 font-['Inter']">5%</span>
              </div>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 gap-4 divide-y divide-slate-200 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-y-0"
              role="status"
              aria-live="polite"
              aria-busy="true"
              aria-label="Se încarcă statisticile"
            >
              {(
                [
                  { labelW: 'w-36', valueW: 'w-8' },
                  { labelW: 'w-28', valueW: 'w-7' },
                  { labelW: 'w-32', valueW: 'w-9' },
                ] as const
              ).map((dims, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-2 text-center sm:px-3 sm:pt-0 sm:pb-0 ${i === 0 ? 'pt-1' : 'pt-4'}`}
                >
                  <div className={`h-3 ${dims.labelW} max-w-[85%] rounded-md ${sk}`} aria-hidden />
                  <div className={`h-7 ${dims.valueW} rounded-md ${sk}`} aria-hidden />
                </div>
              ))}
            </div>
          )}
        </aside>
        </div>

        <div className="order-1 flex h-full w-full min-w-0 max-w-none flex-col lg:order-2 lg:mx-0 lg:w-full lg:justify-self-start">
          <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-neutral-100 shadow-sm">
            <div className="flex flex-col items-center px-4 pb-5 pt-6 sm:px-5">
              <div
                className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-md"
                aria-hidden
              >
                <BadgePercent className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <h3 className="text-center text-[15px] font-bold uppercase leading-snug tracking-tight text-slate-900 font-['Inter'] sm:text-base">
                5% REDUCERE PENTRU PRIETENI ȘI VECINI
              </h3>
              <p className="mt-3 text-center text-sm leading-relaxed text-slate-600 font-['Nunito_Sans']">
                Orice persoană care folosește codul tău primește 5% reducere la prima comandă — aplicat automat, fără
                condiții suplimentare.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
