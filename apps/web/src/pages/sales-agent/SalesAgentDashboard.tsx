import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useToast } from '../../contexts/ToastContext'
import { getSalesAgentDashboardTranslations } from '../../i18n/sales-agent'
import {
  getSalesAgentLeadStats,
  getSalesAgentMe,
  type SalesAgentMeResponse,
  type SalesLeadStats,
} from '../../lib/api'
import { DashboardStatSkeleton, DashboardWelcomeSkeleton } from './SalesAgentSkeletons'

const MING_PANDA_AGENT_EMAIL = 'ming@baterino.ro'

function HappyPandaIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 shrink-0" aria-hidden>
      <circle cx="60" cy="62" r="44" fill="#fff" stroke="#1e293b" strokeWidth="2.5" />
      <ellipse cx="34" cy="34" rx="15" ry="17" fill="#1e293b" />
      <ellipse cx="86" cy="34" rx="15" ry="17" fill="#1e293b" />
      <ellipse cx="34" cy="36" rx="8" ry="9" fill="#fda4af" opacity="0.55" />
      <ellipse cx="86" cy="36" rx="8" ry="9" fill="#fda4af" opacity="0.55" />
      <ellipse cx="44" cy="58" rx="10" ry="12" fill="#1e293b" />
      <ellipse cx="76" cy="58" rx="10" ry="12" fill="#1e293b" />
      <circle cx="47" cy="56" r="3.5" fill="#fff" />
      <circle cx="79" cy="56" r="3.5" fill="#fff" />
      <ellipse cx="60" cy="72" rx="7" ry="5" fill="#1e293b" />
      <path
        d="M46 82 Q60 94 74 82"
        fill="none"
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function HappyPandaCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="mt-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-5 py-4 shadow-sm ring-1 ring-emerald-100/80">
      <div className="flex items-center gap-4">
        <HappyPandaIllustration />
        <div className="min-w-0">
          <h2 className="text-lg font-bold font-['Inter'] text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600 font-['Inter']">{subtitle}</p>
        </div>
      </div>
    </section>
  )
}

function statItem(label: string, value: number) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-center">
      <p className="text-2xl font-extrabold tabular-nums text-slate-900 font-['Inter']">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-600 font-['Inter']">{label}</p>
    </div>
  )
}

function buildAgentDisplayName(data: SalesAgentMeResponse | null, fallback: string): string {
  const agent = data?.agent
  const user = data?.user
  const firstName = agent?.firstName?.trim() || user?.firstName?.trim() || ''
  const lastName = agent?.lastName?.trim() || user?.lastName?.trim() || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  return fullName || fallback
}

export default function SalesAgentDashboard() {
  const { language } = useLanguage()
  const toast = useToast()
  const tr = getSalesAgentDashboardTranslations(language.code)
  const [data, setData] = useState<SalesAgentMeResponse | null>(null)
  const [leadStats, setLeadStats] = useState<SalesLeadStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [leadStatsLoading, setLeadStatsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getSalesAgentMe()
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((e: unknown) => {
        if (!cancelled) toast.error(e instanceof Error ? e.message : tr.loadError)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tr.loadError, toast])

  useEffect(() => {
    let cancelled = false
    setLeadStatsLoading(true)
    getSalesAgentLeadStats()
      .then((stats) => {
        if (!cancelled) setLeadStats(stats)
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : tr.leadsStatsLoadError)
        }
      })
      .finally(() => {
        if (!cancelled) setLeadStatsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tr.leadsStatsLoadError, toast])

  const stats = leadStats ?? { totalLeads: 0, yourLeads: 0, contributions: 0 }
  const welcomeName = buildAgentDisplayName(data, tr.welcomeFallback)
  const agentEmail = data?.user?.email?.trim().toLowerCase() ?? ''
  const showHappyPanda = !loading && agentEmail === MING_PANDA_AGENT_EMAIL

  return (
    <div className="pt-2 px-6 pb-6 sm:pt-4 sm:px-8 sm:pb-8 lg:pt-6 lg:px-10 lg:pb-10 max-w-2xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        {loading ? (
          <DashboardWelcomeSkeleton ariaLabel={tr.loading} />
        ) : (
          <>
            {tr.welcomePrefix} {welcomeName}
          </>
        )}
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">{tr.subtitle}</p>

      <section className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-4">{tr.leadsBoxTitle}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-5">
          {leadStatsLoading ? (
            <>
              <DashboardStatSkeleton ariaLabel={tr.leadsTotalLabel} />
              <DashboardStatSkeleton ariaLabel={tr.leadsYourLabel} />
              <DashboardStatSkeleton ariaLabel={tr.leadsContributionsLabel} />
            </>
          ) : (
            <>
              {statItem(tr.leadsTotalLabel, stats.totalLeads)}
              {statItem(tr.leadsYourLabel, stats.yourLeads)}
              {statItem(tr.leadsContributionsLabel, stats.contributions)}
            </>
          )}
        </div>
        <Link
          to="/sales-agent/leads/nou"
          className="inline-flex w-full items-center justify-center rounded-lg bg-[#1e46b4] px-4 py-2.5 text-sm font-semibold font-['Inter'] text-white shadow-sm hover:bg-[#163899] sm:w-auto"
        >
          {tr.leadsCreateCta}
        </Link>
      </section>

      {showHappyPanda ? <HappyPandaCard title={tr.pandaCardTitle} subtitle={tr.pandaCardSubtitle} /> : null}
    </div>
  )
}
