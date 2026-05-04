import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAdminCompanies, getAuthToken } from '../../lib/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [partnerPendingCount, setPartnerPendingCount] = useState<number | 'loading' | 'error'>('loading')

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    let cancelled = false
    getAdminCompanies()
      .then((list) => {
        if (!cancelled) setPartnerPendingCount(list.filter((c) => !c.isApproved).length)
      })
      .catch(() => {
        if (!cancelled) setPartnerPendingCount('error')
      })
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">Bun venit în panoul de administrare Baterino.</p>

      <section className="mt-2">
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-3">Shortcuts</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-[460px]">
          <Link
            to="/admin/stocuri/add-item"
            className="group flex aspect-square w-full max-w-[220px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-200">
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
                <path d="M8 10h8M8 14h5" />
                <path d="M18 4v4M16 6h4" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-semibold font-['Inter'] text-slate-900">Stocuri - Add Item</p>
          </Link>

          <div className="group relative flex w-full max-w-[220px] flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md">
            <Link
              to="/admin/companies"
              className="absolute inset-0 z-0 rounded-2xl outline-none ring-offset-2 ring-offset-white focus-visible:z-[5] focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-label="Parteneri noi — deschide lista de companii"
            />
            <div className="relative z-10 flex flex-col pointer-events-none">
              <button
                type="button"
                className="group/info pointer-events-auto absolute right-3 top-3 z-20 rounded-full p-0.5 text-slate-400 outline-none transition hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                aria-label="Aprobă partenerii noi înscriși în platformă."
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
                <span
                  role="tooltip"
                  className="pointer-events-none invisible absolute right-0 top-full z-30 mt-1.5 w-max max-w-[min(14rem,calc(100vw-2rem))] rounded-lg bg-slate-900 px-2.5 py-2 text-left text-[11px] font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover/info:visible group-hover/info:opacity-100 group-focus-visible/info:visible group-focus-visible/info:opacity-100 font-['Inter']"
                >
                  Aprobă partenerii noi înscriși în platformă.
                </span>
              </button>
              <div className="flex justify-start pr-8">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-200">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.054 5.054 0 0015 12.75a5.054 5.054 0 00-4.059-2.472m0 0a5.054 5.054 0 00-4.059 2.472m0 0A5.971 5.971 0 006 18.719M12 12.75a5.054 5.054 0 10-4.059-2.472m0 0a5.054 5.054 0 104.059 2.472m0 0a5.054 5.054 0 00-4.059 2.472m0 0A5.971 5.971 0 006 18.719"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mt-2 text-left text-base font-bold font-['Inter'] text-slate-900">Parteneri noi</h3>
              <div className="mt-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 font-['Inter']">
                  Cereri noi
                </p>
                <p className="text-3xl font-bold tabular-nums text-slate-900 font-['Inter']">
                  {partnerPendingCount === 'loading'
                    ? '…'
                    : partnerPendingCount === 'error'
                      ? '—'
                      : partnerPendingCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
