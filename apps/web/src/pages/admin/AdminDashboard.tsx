import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getAdminCompanies,
  getAdminOrdersDashboardSummary,
  getAdminServiceDashboardSummary,
  getAuthToken,
  type AdminOrdersDashboardSummary,
  type AdminServiceDashboardSummary,
} from '../../lib/api'

const ORDER_STATUS_ORDER = [
  'de_platit',
  'preluata',
  'in_pregatire',
  'in_curs_livrare',
  'livrata',
  'anulata',
] as const

const ORDER_STATUS_LABELS: Record<(typeof ORDER_STATUS_ORDER)[number], string> = {
  de_platit: 'De plătit',
  preluata: 'Preluată',
  in_pregatire: 'În pregătire',
  in_curs_livrare: 'În curs de livrare',
  livrata: 'Livrată',
  anulata: 'Anulată',
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [partnerPendingCount, setPartnerPendingCount] = useState<number | 'loading' | 'error'>('loading')
  const [ordersSummary, setOrdersSummary] = useState<AdminOrdersDashboardSummary | 'loading' | 'error'>(
    'loading',
  )
  const [serviceSummary, setServiceSummary] = useState<AdminServiceDashboardSummary | 'loading' | 'error'>(
    'loading',
  )

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
    getAdminOrdersDashboardSummary()
      .then((s) => {
        if (!cancelled) setOrdersSummary(s)
      })
      .catch(() => {
        if (!cancelled) setOrdersSummary('error')
      })
    getAdminServiceDashboardSummary()
      .then((s) => {
        if (!cancelled) setServiceSummary(s)
      })
      .catch(() => {
        if (!cancelled) setServiceSummary('error')
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:max-w-[700px] lg:max-w-none lg:max-w-[700px]">
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

          <div className="group relative flex w-full max-w-[220px] flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
            <Link
              to="/admin/orders"
              className="absolute inset-0 z-0 rounded-2xl outline-none ring-offset-2 ring-offset-white focus-visible:z-[5] focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Comenzi — deschide lista de comenzi"
            />
            <div className="relative z-10 flex flex-col pointer-events-none">
              <div className="flex justify-start">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 transition group-hover:bg-amber-100">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mt-2 text-left text-base font-bold font-['Inter'] text-slate-900">Comenzi</h3>
              <div className="mt-3 space-y-3 text-left">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 font-['Inter']">
                    Comenzi noi (de plătit)
                  </p>
                  <p className="text-3xl font-bold tabular-nums text-slate-900 font-['Inter']">
                    {ordersSummary === 'loading'
                      ? '…'
                      : ordersSummary === 'error'
                        ? '—'
                        : ordersSummary.newOrders.total}
                  </p>
                </div>
                {ordersSummary !== 'loading' && ordersSummary !== 'error' ? (
                  <ul className="m-0 list-none space-y-1.5 p-0 text-xs font-['Inter'] text-slate-600">
                    <li className="flex justify-between gap-2 tabular-nums">
                      <span>Client</span>
                      <span className="font-semibold text-slate-900">{ordersSummary.newOrders.client}</span>
                    </li>
                    <li className="flex justify-between gap-2 tabular-nums">
                      <span>Partener</span>
                      <span className="font-semibold text-slate-900">{ordersSummary.newOrders.partner}</span>
                    </li>
                    <li className="flex justify-between gap-2 tabular-nums">
                      <span>Invitat</span>
                      <span className="font-semibold text-slate-900">{ordersSummary.newOrders.guest}</span>
                    </li>
                  </ul>
                ) : null}
                {ordersSummary !== 'loading' && ordersSummary !== 'error' ? (
                  <div className="border-t border-slate-100 pt-3">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 font-['Inter']">
                      Stări comandă (toate)
                    </p>
                    <ul className="m-0 max-h-32 list-none space-y-1 overflow-y-auto p-0 text-[11px] text-slate-600">
                      {ORDER_STATUS_ORDER.map((key) => {
                        const n = ordersSummary.byFulfillmentStatus[key] ?? 0
                        if (n === 0) return null
                        return (
                          <li key={key} className="flex justify-between gap-2 tabular-nums">
                            <span>{ORDER_STATUS_LABELS[key]}</span>
                            <span className="font-semibold text-slate-800">{n}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="group relative flex w-full max-w-[220px] flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
            <Link
              to="/admin/service"
              className="absolute inset-0 z-0 rounded-2xl outline-none ring-offset-2 ring-offset-white focus-visible:z-[5] focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Service — deschide cererile de service și retur"
            />
            <div className="relative z-10 flex flex-col pointer-events-none">
              <div className="flex justify-start">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 transition group-hover:bg-emerald-100">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mt-2 text-left text-base font-bold font-['Inter'] text-slate-900">Service</h3>
              <div className="mt-3 space-y-3 text-left">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 font-['Inter']">
                    Cereri service noi (Nouă)
                  </p>
                  <p className="text-3xl font-bold tabular-nums text-slate-900 font-['Inter']">
                    {serviceSummary === 'loading'
                      ? '…'
                      : serviceSummary === 'error'
                        ? '—'
                        : serviceSummary.service.newOpen}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 font-['Inter']">
                    Cereri retur noi (În așteptare)
                  </p>
                  <p className="text-3xl font-bold tabular-nums text-slate-900 font-['Inter']">
                    {serviceSummary === 'loading'
                      ? '…'
                      : serviceSummary === 'error'
                        ? '—'
                        : serviceSummary.retur.newPending}
                  </p>
                </div>
              </div>
            </div>
          </div>

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
