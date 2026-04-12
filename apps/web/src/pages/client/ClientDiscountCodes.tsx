import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClientProfile } from '../../lib/api'
import { INSTALATORI_ONLY } from '../../lib/siteMode'

export default function ClientDiscountCodes() {
  const [referralCode, setReferralCode] = useState<string | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let c = false
    getClientProfile()
      .then((r) => {
        if (!c) setReferralCode(r.referralCode ?? null)
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

  if (error) {
    return <p className="text-red-600 text-sm font-['Inter']">{error}</p>
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Coduri reducere</h1>
      <p className="text-slate-600 text-sm font-['Inter'] mb-8">
        Codul tău personal și programele de reducere disponibile pe Baterino.
      </p>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Codul tău de recomandare</h2>
        <p className="text-sm text-slate-600 font-['Inter'] mb-4">
          Poți trimite acest cod unui client nou: acesta îl poate folosi la prima comandă, conform termenilor programului
          de recomandare (vezi și pagina „Reduceri”).
        </p>
        {referralCode === undefined ? (
          <p className="text-slate-500 text-sm font-['Inter']">Se încarcă...</p>
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
          </div>
        ) : (
          <p className="text-sm text-slate-500 font-['Inter']">Cod indisponibil momentan. Reîncearcă mai târziu.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Programe dedicate</h2>
        <p className="text-sm text-slate-600 font-['Inter'] mb-3">
          Reduceri pentru seniori, zone rurale, coduri de la parteneri și alte campanii sunt prezentate centralizat.
        </p>
        {!INSTALATORI_ONLY ? (
          <Link
            to="/reduceri"
            className="inline-flex text-sm font-semibold text-slate-900 font-['Inter'] underline underline-offset-2"
          >
            Vezi toate programele de reducere
          </Link>
        ) : (
          <p className="text-sm text-slate-500 font-['Inter']">
            Lista completă a programelor este disponibilă pe varianta extinsă a site-ului.
          </p>
        )}
      </section>
    </div>
  )
}
