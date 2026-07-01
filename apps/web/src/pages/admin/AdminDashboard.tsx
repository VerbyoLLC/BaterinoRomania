import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getAdminDashboardSummary,
  getAuthToken,
  type AdminDashboardSummary,
} from '../../lib/api'

type LoadState = AdminDashboardSummary | 'loading' | 'error'

type NotificationItem = {
  key: string
  label: string
  hint: string
  count: number
  to: string
  accent: string
  icon: ReactNode
}

function formatCount(value: number | 'loading' | 'error'): string {
  if (value === 'loading') return '…'
  if (value === 'error') return '—'
  return value.toLocaleString('ro-RO')
}

function NotificationCard({ item, loading }: { item: NotificationItem; loading: boolean }) {
  const active = !loading && item.count > 0
  return (
    <Link
      to={item.to}
      className={[
        'group relative flex min-h-[7.5rem] flex-col rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        active ? `${item.accent} ring-1 ring-inset` : 'border-gray-200 hover:border-slate-300',
      ].join(' ')}
    >
      {active ? (
        <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" aria-hidden />
      ) : null}
      <div className="flex items-start gap-3">
        <div
          className={[
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition',
            active ? 'bg-white/80' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200',
          ].join(' ')}
        >
          {item.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold font-['Inter'] text-slate-900">{item.label}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-500 font-['Inter']">{item.hint}</p>
        </div>
      </div>
      <p className="mt-auto pt-3 text-3xl font-bold tabular-nums text-slate-900 font-['Inter']">
        {loading ? '…' : item.count.toLocaleString('ro-RO')}
      </p>
    </Link>
  )
}

function StatTile({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-2xl font-extrabold tabular-nums text-slate-900 font-['Inter']">
        {loading ? '…' : value.toLocaleString('ro-RO')}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-600 font-['Inter']">{label}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<LoadState>('loading')

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    let cancelled = false
    getAdminDashboardSummary()
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch(() => {
        if (!cancelled) setSummary('error')
      })
    return () => {
      cancelled = true
    }
  }, [navigate])

  const loading = summary === 'loading'
  const error = summary === 'error'
  const n = summary !== 'loading' && summary !== 'error' ? summary.notifications : null
  const s = summary !== 'loading' && summary !== 'error' ? summary.statistics : null
  const orders = summary !== 'loading' && summary !== 'error' ? summary.orders.newOrders : null

  const notifications = useMemo<NotificationItem[]>(
    () => [
      {
        key: 'orders',
        label: 'Comenzi noi',
        hint: 'De plătit — necesită acțiune',
        count: n?.newOrders ?? 0,
        to: '/admin/orders',
        accent: 'border-amber-300 bg-amber-50/40 ring-amber-200',
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-800" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
        ),
      },
      {
        key: 'offers-draft',
        label: 'Oferte ciornă',
        hint: 'Draft-uri nefinalizate',
        count: n?.offerDrafts ?? 0,
        to: '/admin/oferte/lista',
        accent: 'border-violet-300 bg-violet-50/40 ring-violet-200',
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-violet-800" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ),
      },
      {
        key: 'offers-recent',
        label: 'Oferte recente',
        hint: 'Generate în ultimele 7 zile',
        count: n?.offersRecent ?? 0,
        to: '/admin/oferte/lista',
        accent: 'border-indigo-300 bg-indigo-50/40 ring-indigo-200',
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-indigo-800" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
        ),
      },
      {
        key: 'leads',
        label: 'Leads noi',
        hint: 'Nevizualizate de tine',
        count: n?.newLeads ?? 0,
        to: '/admin/oferte/leads',
        accent: 'border-sky-300 bg-sky-50/40 ring-sky-200',
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-sky-800" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        ),
      },
      {
        key: 'leads-comments',
        label: 'Comentarii leads',
        hint: 'Necitite pe leads',
        count: n?.leadsUnreadComments ?? 0,
        to: '/admin/oferte/leads',
        accent: 'border-cyan-300 bg-cyan-50/40 ring-cyan-200',
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-800" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        ),
      },
      {
        key: 'service',
        label: 'Cereri service',
        hint: 'Status deschis (Nouă)',
        count: n?.serviceRequests ?? 0,
        to: '/admin/service',
        accent: 'border-emerald-300 bg-emerald-50/40 ring-emerald-200',
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-800" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26" />
          </svg>
        ),
      },
      {
        key: 'retur',
        label: 'Cereri retur',
        hint: 'În așteptare',
        count: n?.returRequests ?? 0,
        to: '/admin/service',
        accent: 'border-teal-300 bg-teal-50/40 ring-teal-200',
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-teal-800" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        ),
      },
      {
        key: 'messages',
        label: 'Mesaje noi',
        hint: 'Formular contact — necitite',
        count: n?.unreadMessages ?? 0,
        to: '/admin/messages',
        accent: 'border-orange-300 bg-orange-50/40 ring-orange-200',
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-orange-800" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        ),
      },
      {
        key: 'clients',
        label: 'Clienți noi',
        hint: 'Înscrieri în ultimele 30 zile',
        count: n?.newClients ?? 0,
        to: '/admin/clients',
        accent: 'border-pink-300 bg-pink-50/40 ring-pink-200',
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-pink-800" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        ),
      },
    ],
    [n],
  )

  const activeNotifications = notifications.filter((item) => !loading && item.count > 0)

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 font-['Inter']">
          Bun venit în panoul de administrare Baterino.
        </p>
        {error ? (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 font-['Inter']">
            Nu s-au putut încărca datele dashboard-ului. Reîncarcă pagina sau verifică API-ul.
          </p>
        ) : null}
      </header>

      <section className="mb-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold font-['Inter'] text-slate-900">Notificări</h2>
            <p className="text-xs text-slate-500 font-['Inter']">
              {loading
                ? 'Se încarcă…'
                : activeNotifications.length > 0
                  ? `${activeNotifications.length} categorii cu acțiuni pendinte`
                  : 'Nicio acțiune urgentă — totul e la zi'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {notifications.map((item) => (
            <NotificationCard key={item.key} item={item} loading={loading} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold font-['Inter'] text-slate-900">Statistici platformă</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          <StatTile label="Clienți" value={s?.clients ?? 0} loading={loading} />
          <StatTile label="Parteneri activi" value={s?.partners ?? 0} loading={loading} />
          <StatTile label="Leads total" value={s?.leads ?? 0} loading={loading} />
          <StatTile label="Oferte generate" value={s?.offersGenerated ?? 0} loading={loading} />
          <StatTile label="Agenți vânzări" value={s?.agents ?? 0} loading={loading} />
          <StatTile label="Comenzi noi" value={s?.newOrders ?? 0} loading={loading} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold font-['Inter'] text-slate-900">Detalii &amp; scurtături</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/admin/stocuri/add-item"
            className="group flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-200">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
                <path d="M8 10h8M8 14h5" />
                <path d="M18 4v4M16 6h4" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold font-['Inter'] text-slate-900">Stocuri — Add Item</p>
          </Link>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold font-['Inter'] text-slate-900">Comenzi noi</h3>
                <Link to="/admin/orders" className="text-xs font-medium text-amber-700 hover:underline font-['Inter']">
                  Vezi toate comenzile →
                </Link>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900 font-['Inter']">
              {formatCount(loading ? 'loading' : error ? 'error' : (orders?.total ?? 0))}
            </p>
            {!loading && !error && orders ? (
              <ul className="mt-3 space-y-1.5 text-xs font-['Inter'] text-slate-600">
                <li className="flex justify-between tabular-nums">
                  <span>Client</span>
                  <span className="font-semibold text-slate-900">{orders.client}</span>
                </li>
                <li className="flex justify-between tabular-nums">
                  <span>Partener</span>
                  <span className="font-semibold text-slate-900">{orders.partner}</span>
                </li>
                <li className="flex justify-between tabular-nums">
                  <span>Invitat</span>
                  <span className="font-semibold text-slate-900">{orders.guest}</span>
                </li>
              </ul>
            ) : null}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold font-['Inter'] text-slate-900">Service &amp; retur</h3>
                <Link to="/admin/service" className="text-xs font-medium text-emerald-700 hover:underline font-['Inter']">
                  Deschide service →
                </Link>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500 font-['Inter']">Service nou</p>
                <p className="text-2xl font-bold tabular-nums text-slate-900 font-['Inter']">
                  {formatCount(loading ? 'loading' : error ? 'error' : (n?.serviceRequests ?? 0))}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500 font-['Inter']">Retur pending</p>
                <p className="text-2xl font-bold tabular-nums text-slate-900 font-['Inter']">
                  {formatCount(loading ? 'loading' : error ? 'error' : (n?.returRequests ?? 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
