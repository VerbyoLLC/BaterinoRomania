import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Percent, Truck, Headphones, Store, UserCheck, RefreshCw, Check, ShoppingCart } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getPartnerProfile } from '../../lib/api'
import { readPartnerCartFromStorage } from '../../lib/partnerCart'
import { ReducerePartenerBox, SigurantaClientuluiBox, SuportTehnicBox } from './PartnerSidebarBoxes'

const PENDING_PARTNER_ADVANTAGES: { Icon: LucideIcon; title: string; subtitle: string }[] = [
  {
    Icon: Truck,
    title: 'Livrare și logistică',
    subtitle:
      'Ne ocupăm de întregul lanț logistic, de la depozit până la clientul final. Tu te concentrezi pe clienți — noi gestionăm transportul.',
  },
  {
    Icon: Headphones,
    title: 'Suport tehnic și comercial',
    subtitle:
      'Ai acces la o echipă dedicată pentru orice întrebare legată de produse, specificații tehnice sau soluții personalizate.',
  },
  {
    Icon: Store,
    title: 'Vizibilitate în fața clienților',
    subtitle:
      'Profilul tău apare pe platforma Baterino, conectându-te direct cu clienți din zona ta care caută instalatori verificați.',
  },
  {
    Icon: UserCheck,
    title: 'Responsabilitate client final',
    subtitle:
      'Gestionăm after-sale-ul direct cu clientul final — reclamații, garanții și suport post-instalare — astfel reputația ta rămâne intactă.',
  },
  {
    Icon: RefreshCw,
    title: 'Baterino SWAP',
    subtitle:
      'În cazul unei defecțiuni, înlocuim bateria rapid și fără birocrație. Clientul tău nu rămâne fără soluție.',
  },
  {
    Icon: Percent,
    title: 'Prețuri și reduceri pentru parteneri',
    subtitle:
      'Prețuri preferențiale, marje clare și o strategie construită împreună — ca să fii competitiv și profitabil la fiecare proiect.',
  },
]

const APPROVAL_TIMELINE_STEPS = [
  'Deschidere cont partener',
  'Dezbatere parteneriat și strategie',
  'Semnarea contractului',
  'Aprobare cont partener',
] as const

/** Pas activ în timpul așteptării aprobării (index 0-based): dezbatere parteneriat. */
const APPROVAL_TIMELINE_CURRENT_INDEX = 1

function IconAlert() {
  return (
    <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function PartnerApprovalTimelineSkeleton() {
  return (
    <div
      className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/90 px-5 py-6 sm:px-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/[0.04] animate-pulse"
      aria-hidden
    >
      <div className="flex items-start justify-between gap-1 sm:gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2 min-w-0">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="h-3 w-full max-w-[5.5rem] bg-slate-200/90 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PartnerApprovalTimeline() {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200/95 bg-white px-5 py-6 sm:px-7 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/[0.05]">
      {/* Accent stripe */}
      <div className="pointer-events-none mb-5 h-1 w-full max-w-xs rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 sm:mb-6" aria-hidden />

      {/* Desktop / tablet: horizontal */}
      <ol
        className="hidden sm:flex sm:items-start sm:w-full"
        aria-label="Etape aprobare cont partener"
      >
        {APPROVAL_TIMELINE_STEPS.map((label, i) => {
          const isComplete = i < APPROVAL_TIMELINE_CURRENT_INDEX
          const isCurrent = i === APPROVAL_TIMELINE_CURRENT_INDEX
          return (
            <li key={label} className="flex flex-1 min-w-0 items-start last:flex-[0_0_auto]">
              <div className="flex flex-1 min-w-0 flex-col items-center text-center">
                <TimelineStepMarker index={i} isComplete={isComplete} isCurrent={isCurrent} />
                <span
                  className={`mt-3 text-xs font-['Inter'] leading-tight sm:text-[13px] px-0.5 ${
                    isCurrent
                      ? 'font-semibold text-indigo-950'
                      : isComplete
                        ? 'font-medium text-slate-700'
                        : 'font-medium text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < APPROVAL_TIMELINE_STEPS.length - 1 && (
                <div
                  className={`mx-1.5 mt-[22px] h-[3px] min-w-[0.5rem] flex-1 rounded-full ${
                    i < APPROVAL_TIMELINE_CURRENT_INDEX ? 'bg-indigo-400' : 'bg-slate-200'
                  }`}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile: vertical */}
      <ol className="sm:hidden space-y-0 font-['Inter']" aria-label="Etape aprobare cont partener">
        {APPROVAL_TIMELINE_STEPS.map((label, i) => {
          const isComplete = i < APPROVAL_TIMELINE_CURRENT_INDEX
          const isCurrent = i === APPROVAL_TIMELINE_CURRENT_INDEX
          const isLast = i === APPROVAL_TIMELINE_STEPS.length - 1
          return (
            <li key={label} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <TimelineStepMarker index={i} isComplete={isComplete} isCurrent={isCurrent} />
                {!isLast && (
                  <div
                    className={`w-[3px] flex-1 min-h-[1.25rem] my-1.5 rounded-full ${
                      i < APPROVAL_TIMELINE_CURRENT_INDEX ? 'bg-indigo-400' : 'bg-slate-200'
                    }`}
                    aria-hidden
                  />
                )}
              </div>
              <div
                className={`pb-5 pt-2 text-sm leading-snug ${
                  isCurrent ? 'font-semibold text-indigo-950' : isComplete ? 'font-medium text-slate-700' : 'font-medium text-slate-500'
                }`}
              >
                {label}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function TimelineStepMarker({
  index,
  isComplete,
  isCurrent,
}: {
  index: number
  isComplete: boolean
  isCurrent: boolean
}) {
  if (isComplete) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
        <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        <span className="sr-only">Finalizat</span>
      </div>
    )
  }
  if (isCurrent) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700 shadow-sm ring-2 ring-indigo-500 ring-offset-2 ring-offset-white">
        {index + 1}
        <span className="sr-only">În curs</span>
      </div>
    )
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400">
      {index + 1}
      <span className="sr-only">Urmează</span>
    </div>
  )
}

function PartnerAdvantageBoxesSkeleton() {
  return (
    <section className="mb-8" aria-busy="true" aria-label="Se încarcă avantajele">
      <div className="h-7 w-72 max-w-full bg-gray-200 rounded-md animate-pulse mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col gap-1.5 bg-gray-100/80 animate-pulse"
          >
            <div className="h-10 w-10 rounded-xl bg-gray-300/90" />
            <div className="h-5 w-4/5 max-w-[14rem] bg-gray-300/90 rounded" />
            <div className="h-3.5 w-full bg-gray-200 rounded" />
            <div className="h-3.5 w-full bg-gray-200 rounded" />
            <div className="h-3.5 w-11/12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function PartnerDashboard() {
  const { language } = useLanguage()
  const lang = language.code

  const [pendingApproval, setPendingApproval] = useState<boolean | null>(null)
  const [isSuspended, setIsSuspended] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [partnerCartLineCount, setPartnerCartLineCount] = useState(0)

  const syncPartnerCartCount = useCallback(() => {
    setPartnerCartLineCount(readPartnerCartFromStorage().length)
  }, [])

  useEffect(() => {
    syncPartnerCartCount()
    window.addEventListener('storage', syncPartnerCartCount)
    window.addEventListener('focus', syncPartnerCartCount)
    document.addEventListener('visibilitychange', syncPartnerCartCount)
    return () => {
      window.removeEventListener('storage', syncPartnerCartCount)
      window.removeEventListener('focus', syncPartnerCartCount)
      document.removeEventListener('visibilitychange', syncPartnerCartCount)
    }
  }, [syncPartnerCartCount])
  const [profile, setProfile] = useState<{
    contactFirstName?: string
    contactLastName?: string
    logoUrl?: string | null
    partnerDiscountPercent?: number | null
  } | null>(null)

  useEffect(() => {
    setLoading(true)
    getPartnerProfile()
      .then((p: {
        isApproved?: boolean
        isSuspended?: boolean
        contactFirstName?: string
        contactLastName?: string
        logoUrl?: string | null
        partnerDiscountPercent?: number | null
      }) => {
        setPendingApproval(p?.isApproved === false)
        setIsSuspended(p?.isSuspended === true)
        setProfile({
          contactFirstName: p?.contactFirstName,
          contactLastName: p?.contactLastName,
          logoUrl: p?.logoUrl,
          partnerDiscountPercent: p?.partnerDiscountPercent,
        })
      })
      .catch(() => {
        setPendingApproval(null)
        setIsSuspended(null)
        setProfile(null)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-full w-full items-start">
      {/* ── Main content ── */}
      <div className="min-w-0 flex-1 pt-2 px-6 pb-6 sm:pt-4 sm:px-8 sm:pb-8 lg:pt-6 lg:px-10 lg:pb-10 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-6">
        Dashboard
      </h1>

      {/* Status + advantages loading skeletons */}
      {loading && (
        <>
          <PartnerApprovalTimelineSkeleton />
          <PartnerAdvantageBoxesSkeleton />
        </>
      )}

      {/* Suspended banner */}
      {!loading && isSuspended === true && (
        <div
          className="mb-6 rounded-2xl border border-red-200/80 pt-2 pb-5 px-5 sm:pt-3 sm:pb-6 sm:px-6 shadow-sm flex items-center gap-4"
          style={{ background: 'linear-gradient(to right, #FFF5F5, #FECACA)' }}
        >
          <div className="flex-shrink-0">
            <IconAlert />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold font-['Inter'] text-slate-900">
              Contul tău este suspendat.
            </h3>
            <p className="text-gray-600 text-sm font-['Inter'] mt-1">
              Ne pare rău, însă contul tău a fost suspendat. Contactează-ne pentru a rezolva problema.
            </p>
          </div>
        </div>
      )}
      {/* Pending approval timeline + advantages */}
      {!loading && !isSuspended && pendingApproval === true && (
        <>
          <PartnerApprovalTimeline />

          <section className="mb-8" aria-labelledby="pending-partner-advantages-heading">
            <h2
              id="pending-partner-advantages-heading"
              className="text-lg font-bold font-['Inter'] text-slate-900 mb-4"
            >
              Avantajele parteneriatului Baterino
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PENDING_PARTNER_ADVANTAGES.map(({ Icon, title, subtitle }) => (
                <div
                  key={title}
                  className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col gap-1.5"
                >
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100/80"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-base font-bold font-['Inter'] text-slate-900 leading-tight">{title}</h3>
                  <p className="text-sm font-['Inter'] text-gray-600 leading-snug">{subtitle}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Approved welcome box */}
      {!loading && !isSuspended && !pendingApproval && (
        <div
          className="mb-6 rounded-2xl border border-green-200/80 pt-2 pb-5 px-5 sm:pt-3 sm:pb-6 sm:px-6 shadow-sm flex items-center gap-4 sm:gap-6"
          style={{ background: 'linear-gradient(to right, #ECFDF5, #A7F3D0)' }}
        >
          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/60 flex items-center justify-center overflow-hidden">
            {profile?.logoUrl ? (
              <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <svg className="w-8 h-8 text-green-700/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold font-['Inter'] text-slate-900">
              Bine ai venit, {[profile?.contactFirstName, profile?.contactLastName].filter(Boolean).join(' ') || 'Partener'}
            </h3>
            <p className="text-gray-700 text-sm font-['Inter'] mt-1">
              Folosește panoul de comandă pentru a plasa comenzi noi, a urmări starea comenzilor active sau pentru a contacta echipa de suport.
            </p>
            {profile?.partnerDiscountPercent != null && profile.partnerDiscountPercent > 0 && (
              <p className="text-green-800 text-sm font-semibold font-['Inter'] mt-2">
                Beneficiezi de o reducere de {Number(profile.partnerDiscountPercent) % 1 === 0 ? Math.round(profile.partnerDiscountPercent) : profile.partnerDiscountPercent.toFixed(1)}% la toate produsele.
              </p>
            )}
          </div>
          <div className="flex-shrink-0 flex flex-col items-center justify-center mt-2.5">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] text-slate-900">
              {profile?.partnerDiscountPercent != null && profile.partnerDiscountPercent > 0
                ? `-${Number(profile.partnerDiscountPercent) % 1 === 0 ? Math.round(profile.partnerDiscountPercent) : profile.partnerDiscountPercent.toFixed(1)}%`
                : '0%'}
            </p>
            <p className="text-xs font-medium font-['Inter'] text-slate-900 uppercase tracking-wide">Reducere</p>
          </div>
        </div>
      )}

      {!loading &&
        !isSuspended &&
        !pendingApproval &&
        partnerCartLineCount > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/95 to-white px-5 py-4 sm:px-6 sm:py-5 shadow-sm ring-1 ring-amber-900/[0.04]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm ring-1 ring-amber-100"
                  aria-hidden
                >
                  <ShoppingCart className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold font-['Inter'] text-slate-900">
                    {lang === 'en'
                      ? 'Finish your order'
                      : lang === 'zh'
                        ? '完成您的订单'
                        : 'Finalizează comanda'}
                  </h3>
                  <p className="mt-1 text-sm font-['Inter'] leading-snug text-slate-600">
                    {lang === 'en'
                      ? 'You have items in your cart that have not been submitted yet. Continue checkout when you are ready.'
                      : lang === 'zh'
                        ? '购物车中有尚未提交的商品，可随时前往结账完成订单。'
                        : 'Ai produse în coș care nu au fost trimise încă. Continuă pentru a plasa comanda.'}
                  </p>
                </div>
              </div>
              <Link
                to="/partner/checkout"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold font-['Inter'] text-white shadow-sm transition hover:bg-slate-800"
              >
                {lang === 'en' ? 'Go to checkout' : lang === 'zh' ? '去结账' : 'Continuă comanda'}
              </Link>
            </div>
          </div>
        )}

      {!loading && pendingApproval !== true && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-gray-500 text-sm font-['Inter'] font-bold mb-1">Produse</p>
              <p className="text-2xl font-bold font-['Inter'] text-slate-900">0</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-gray-500 text-sm font-['Inter'] font-bold mb-1">Comenzi</p>
              <p className="text-2xl font-bold font-['Inter'] text-slate-900">0</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-gray-500 text-sm font-['Inter'] font-bold mb-1">Produse în service</p>
              <p className="text-2xl font-bold font-['Inter'] text-slate-900">0</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-gray-500 text-sm font-['Inter'] font-bold mb-3">Statistici profil public</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs font-['Inter'] mb-0.5">Vizualizări</p>
                  <p className="text-xl font-bold font-['Inter'] text-slate-900">0</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-['Inter'] mb-0.5">Click-uri</p>
                  <p className="text-xl font-bold font-['Inter'] text-slate-900">0</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      </div>

      {/* ── Right sidebar ── */}
      <aside className="hidden xl:flex w-[26rem] shrink-0 flex-col gap-4 border-l border-slate-200 bg-white p-4 self-stretch overflow-y-auto sticky top-0 max-h-screen">
        <ReducerePartenerBox
          discountPercent={profile?.partnerDiscountPercent ?? null}
          loading={loading}
        />
        <SigurantaClientuluiBox />
        <SuportTehnicBox />
      </aside>
    </div>
  )
}
