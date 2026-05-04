import { useEffect, useState } from 'react'
import { Clock, Mail, Phone } from 'lucide-react'
import {
  getPartnerProfile,
  type PartnerAssignedSalesAgent,
} from '../../lib/api'
import { WhatsAppGlyph } from '../../components/WhatsAppGlyph'
import { departmentRow, ensurePublicDepartmentPhones } from '../../lib/departmentPhones'
import { digitsForWaMe, telHrefFromStored } from '../../lib/contactWhatsApp'

function agentInitials(agent: PartnerAssignedSalesAgent): string {
  const a = agent.firstName.trim().charAt(0) || ''
  const b = agent.lastName.trim().charAt(0) || ''
  return (a + b).toUpperCase() || '?'
}

function formatAgentPhoneDisplay(raw: string): string {
  const t = String(raw ?? '').trim()
  if (!t) return '—'
  const d = t.replace(/\D/g, '')
  if (d.length >= 10 && d.startsWith('40')) {
    return `+${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`.trim()
  }
  return t
}

export default function PartnerSupport() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agent, setAgent] = useState<PartnerAssignedSalesAgent | null>(null)
  const [generalPhonesLoading, setGeneralPhonesLoading] = useState(true)
  const [generalPhone, setGeneralPhone] = useState('')
  const [generalWhatsapp, setGeneralWhatsapp] = useState('')

  useEffect(() => {
    let cancelled = false
    setGeneralPhonesLoading(true)
    ensurePublicDepartmentPhones()
      .then((rows) => {
        if (cancelled) return
        const gen = departmentRow(rows, 'general')
        setGeneralPhone(gen?.phone?.trim() ?? '')
        setGeneralWhatsapp(gen?.whatsapp?.trim() ?? '')
      })
      .catch(() => {
        if (!cancelled) {
          setGeneralPhone('')
          setGeneralWhatsapp('')
        }
      })
      .finally(() => {
        if (!cancelled) setGeneralPhonesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getPartnerProfile()
      .then((p) => {
        if (cancelled) return
        setAgent(p.assignedSalesAgent ?? null)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Eroare la încărcare.')
        setAgent(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl w-full">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Suport
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Ai nevoie de ajutor? Contactează echipa Baterino.
      </p>

      <div className="flex flex-col gap-4">
        {/* Agent — above general email / phone */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-bold font-['Inter'] text-slate-900">
            Agentul tău dedicat
          </h2>
          <div
            className="rounded-2xl border border-slate-200/80 px-6 pb-6 pt-4 shadow-sm"
            style={{ backgroundColor: '#f7f7f7' }}
          >
            {loading ? (
              <div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 sm:items-center"
                aria-busy="true"
                aria-label="Se încarcă detaliile agentului"
              >
                <div className="flex flex-col items-center gap-4 sm:items-start">
                  <div
                    className="mx-auto sm:mx-0 h-24 w-24 shrink-0 rounded-full bg-slate-200/90 animate-pulse ring-2 ring-white"
                    aria-hidden
                  />
                  <div
                    className="h-5 w-44 max-w-full rounded-md bg-slate-200/90 animate-pulse"
                    aria-hidden
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                  <div className="flex items-center gap-2.5" aria-hidden>
                    <div className="h-4 w-4 shrink-0 rounded-sm bg-slate-200/80 animate-pulse" />
                    <div className="h-4 min-w-0 flex-1 max-w-[min(100%,16rem)] rounded-md bg-slate-200/90 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2.5" aria-hidden>
                    <div className="h-4 w-4 shrink-0 rounded-sm bg-slate-200/80 animate-pulse" />
                    <div className="h-4 min-w-0 flex-1 max-w-[11rem] rounded-md bg-slate-200/90 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2.5" aria-hidden>
                    <div className="h-4 w-4 shrink-0 rounded-sm bg-slate-200/80 animate-pulse" />
                    <div className="h-4 min-w-0 flex-1 max-w-[11rem] rounded-md bg-slate-200/90 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <p className="text-sm text-red-600 font-['Inter']" role="alert">
                {error}
              </p>
            ) : !agent ? (
              <p className="text-sm text-slate-600 font-['Inter']">
                Încă nu ai un agent de vânzări atribuit. Poți folosi contactele de mai jos sau scrie la{' '}
                <a href="mailto:parteneri@baterino.ro" className="text-slate-900 font-semibold underline">
                  parteneri@baterino.ro
                </a>
                .
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 sm:items-center">
                <div className="flex flex-col items-center gap-4 sm:items-start">
                  <div
                    className="mx-auto sm:mx-0 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-2xl font-bold text-slate-700 ring-2 ring-white shadow-inner"
                    aria-hidden
                  >
                    {agentInitials(agent)}
                  </div>
                  <p className="w-full text-center sm:text-left text-slate-900 text-base font-semibold font-['Inter']">
                    {[agent.firstName, agent.lastName].filter(Boolean).join(' ').trim() || '—'}
                  </p>
                </div>
                <div className="flex flex-col gap-4 text-sm font-['Inter'] min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    {agent.email.trim() ? (
                      <a
                        href={`mailto:${encodeURIComponent(agent.email.trim())}`}
                        className="text-slate-900 font-medium underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900 break-all min-w-0"
                      >
                        {agent.email.trim()}
                      </a>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    {agent.phone.trim() ? (
                      <a
                        href={telHrefFromStored(agent.phone)}
                        className="text-slate-900 font-medium tabular-nums underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900 min-w-0"
                      >
                        {formatAgentPhoneDisplay(agent.phone)}
                      </a>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <WhatsAppGlyph className="h-4 w-4 shrink-0 text-slate-500" />
                    {agent.whatsapp.trim() ? (
                      <a
                        href={`https://wa.me/${digitsForWaMe(agent.whatsapp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-900 font-medium tabular-nums underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900 min-w-0"
                      >
                        {formatAgentPhoneDisplay(agent.whatsapp)}
                      </a>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-base font-bold font-['Inter'] text-slate-900">
            Contact general
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-4 md:items-stretch">
            <a
              href="mailto:parteneri@baterino.ro"
              className="flex flex-col gap-3 p-5 min-h-0 rounded-2xl border border-gray-200 bg-white hover:border-slate-300 hover:shadow-md transition-all group h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                <Mail className="w-6 h-6 text-slate-600" aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold font-['Inter'] text-slate-900">Email</h3>
                <p className="text-gray-500 text-sm font-['Inter'] mt-1 break-all">
                  parteneri@baterino.ro
                </p>
              </div>
            </a>

            <div className="flex flex-col gap-3 p-5 min-h-0 rounded-2xl border border-gray-200 bg-white hover:border-slate-300 hover:shadow-md transition-all group h-full">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                <Phone className="w-6 h-6 text-slate-600" aria-hidden />
              </div>
              <div className="min-w-0 flex flex-col gap-3">
                <h3 className="text-base font-bold font-['Inter'] text-slate-900">Telefon</h3>
                {generalPhonesLoading ? (
                  <div className="space-y-2" aria-hidden>
                    <div className="h-4 w-[11rem] max-w-full rounded-md bg-slate-200/90 animate-pulse" />
                    <div className="h-4 w-[10rem] max-w-full rounded-md bg-slate-200/90 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 text-sm font-['Inter']">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Phone className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                      {generalPhone ? (
                        <a
                          href={telHrefFromStored(generalPhone)}
                          className="text-gray-600 font-medium tabular-nums underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900 hover:text-slate-900 min-w-0"
                        >
                          {formatAgentPhoneDisplay(generalPhone)}
                        </a>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <WhatsAppGlyph className="h-4 w-4 shrink-0 text-slate-500" />
                      {generalWhatsapp ? (
                        <a
                          href={`https://wa.me/${digitsForWaMe(generalWhatsapp)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 font-medium tabular-nums underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900 hover:text-slate-900 min-w-0"
                        >
                          {formatAgentPhoneDisplay(generalWhatsapp)}
                        </a>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 p-5 rounded-2xl border border-gray-200 bg-white h-full">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-slate-600" aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold font-['Inter'] text-slate-900">Program suport</h3>
                <p className="text-gray-600 text-sm font-['Inter'] mt-1">
                  Luni – Vineri: 09:00 – 18:00
                  <br />
                  Sâmbătă – Duminică: Închis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
