import { useEffect, useState } from 'react'
import { getSalesAgentMe, type SalesAgentMeResponse } from '../../lib/api'

function row(label: string, value: string) {
  const v = String(value || '').trim()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 font-['Inter']">{label}</dt>
      <dd className="text-sm text-slate-900 font-['Inter']">{v || '—'}</dd>
    </div>
  )
}

export default function SalesAgentDashboard() {
  const [data, setData] = useState<SalesAgentMeResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getSalesAgentMe()
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Eroare la încărcare.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const agent = data?.agent

  return (
    <div className="pt-2 px-6 pb-6 sm:pt-4 sm:px-8 sm:pb-8 lg:pt-6 lg:px-10 lg:pb-10 max-w-2xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Panou agent</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">
        Datele din fișa ta de agent (Setări admin → Agenți), dacă contul este legat de un rând din listă.
      </p>

      {loading && (
        <p className="text-sm text-slate-500 font-['Inter']" aria-busy>
          Se încarcă...
        </p>
      )}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
          {error}
        </div>
      )}
      {!loading && !error && !agent && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 font-['Inter']">
          Contul tău nu este încă asociat unei fișe de agent în sistem. Contactează administratorul pentru a lega
          emailul contului de rândul din lista Agenți.
        </div>
      )}
      {!loading && !error && agent && (
        <section className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-3">Fișă agent</h2>
          <dl className="divide-y divide-gray-100">
            {row('Agent ID', agent.id)}
            {row('Nume', agent.lastName)}
            {row('Prenume', agent.firstName)}
            {row('Telefon', agent.phone)}
            {row('WhatsApp', agent.whatsapp)}
            {row('Email', agent.email)}
            {row('Program', agent.program)}
            {row('Județ', agent.county)}
            {row('Oraș', agent.city)}
            {row('Sector', agent.sector)}
          </dl>
        </section>
      )}
    </div>
  )
}
