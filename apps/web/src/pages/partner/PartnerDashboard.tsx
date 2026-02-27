import { useState, useEffect } from 'react'
import { getPartnerProfile } from '../../lib/api'

function IconClock() {
  return (
    <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  )
}
function IconAlert() {
  return (
    <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

export default function PartnerDashboard() {
  const [pendingApproval, setPendingApproval] = useState<boolean | null>(null)
  const [isSuspended, setIsSuspended] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
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
    <div className="pt-2 px-6 pb-6 sm:pt-4 sm:px-8 sm:pb-8 lg:pt-6 lg:px-10 lg:pb-10 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Dashboard
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">
        Prezentare generală a contului tău de partener Baterino.
      </p>

      {/* Status box loading skeleton */}
      {loading && (
        <div
          className="mb-6 rounded-2xl border border-gray-200/80 pt-2 pb-5 px-5 sm:pt-3 sm:pb-6 sm:px-6 shadow-sm flex items-center gap-4 bg-gray-100/80 animate-pulse"
          aria-busy="true"
          aria-label="Se încarcă statusul contului"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-3/4 max-w-xs bg-gray-300 rounded" />
            <div className="h-4 w-full max-w-sm bg-gray-200 rounded" />
          </div>
        </div>
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
      {/* Pending approval banner */}
      {!loading && !isSuspended && pendingApproval === true && (
        <div
          className="mb-6 rounded-2xl border border-amber-200/80 pt-2 pb-5 px-5 sm:pt-3 sm:pb-6 sm:px-6 shadow-sm flex items-center gap-4"
          style={{ background: 'linear-gradient(to right, #FFFDF5, #FEF9C3)' }}
        >
          <div className="flex-shrink-0">
            <IconClock />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold font-['Inter'] text-slate-900">
              Contul tău este în curs de aprobare.
            </h3>
            <p className="text-gray-600 text-sm font-['Inter'] mt-1">
              Datele tale sunt în curs de verificare. În caz că avem nelămuriri, te vom contacta pe telefon sau email.
            </p>
          </div>
        </div>
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
          </div>
          <div className="flex-shrink-0 flex flex-col items-center justify-center mt-2.5">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] text-slate-900">
              {profile?.partnerDiscountPercent != null && profile.partnerDiscountPercent > 0
                ? `-${Number(profile.partnerDiscountPercent) % 1 === 0 ? Math.round(profile.partnerDiscountPercent) : profile.partnerDiscountPercent.toFixed(1)}%`
                : profile?.partnerDiscountPercent === 0
                  ? '0%'
                  : '—'}
            </p>
            <p className="text-xs font-medium font-['Inter'] text-slate-900 uppercase tracking-wide">Reducere</p>
          </div>
        </div>
      )}

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
    </div>
  )
}
