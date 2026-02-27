import { NavLink, Outlet, useNavigate } from 'react-router-dom'

/* ── Icons ──────────────────────────────────────────────────────── */
function IconDashboard() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}
function IconProducts() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 17m8 4V10" />
    </svg>
  )
}
function IconClients() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}
function IconCompanies() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3m4-3v3m4-3v3" />
    </svg>
  )
}
function IconArticles() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
function IconStocks() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  )
}
function IconOrders() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}
function IconDiscounts() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  )
}
function IconLogout() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

/* ── Nav items ──────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: '/admin',            label: 'Dashboard', icon: <IconDashboard />,  end: true  },
  { to: '/admin/products',   label: 'Products',  icon: <IconProducts />,   end: false },
  { to: '/admin/clients',    label: 'Clients',   icon: <IconClients />,    end: false },
  { to: '/admin/companies',  label: 'Companies', icon: <IconCompanies />,  end: false },
  { to: '/admin/articles',   label: 'Articles',  icon: <IconArticles />,   end: false },
  { to: '/admin/stocks',     label: 'Stocks',    icon: <IconStocks />,     end: false },
  { to: '/admin/orders',     label: 'Orders',    icon: <IconOrders />,     end: false },
  { to: '/admin/discounts',  label: 'Discounts', icon: <IconDiscounts />,  end: false },
]

/* ── Layout ─────────────────────────────────────────────────────── */
export default function AdminLayout() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-neutral-100">

      {/* ── Sidebar ── */}
      <aside className="w-[168px] flex-shrink-0 bg-emerald-50 rounded-br-[20px] flex flex-col justify-between py-4 px-3 min-h-screen sticky top-0">

        {/* Top: logo + nav */}
        <div className="flex flex-col gap-1">

          {/* Logo */}
          <div className="flex flex-col items-center px-3 pt-2 pb-4 gap-1">
            <img
              src="/images/shared/baterino-pro-alb-logo.png"
              alt="Baterino"
              className="h-6 w-auto object-contain"
              style={{ filter: 'invert(1)' }}
            />
            <span className="text-black text-xs font-semibold font-['Inter'] tracking-widest uppercase mt-0.5">
              Admin Panel
            </span>
          </div>

          {/* Nav items */}
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-['Inter'] transition-colors ${
                  isActive
                    ? 'bg-black/8 font-semibold text-black'
                    : 'text-black/70 hover:bg-black/5 hover:text-black font-normal'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Bottom: user + logout */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
              A
            </div>
            <span className="text-black text-sm font-normal font-['Inter'] truncate">Power Admin</span>
          </div>

          <button
            onClick={() => navigate('/admin/login')}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm font-['Inter'] text-black/70 hover:bg-black/5 hover:text-black transition-colors w-full text-left"
          >
            <IconLogout />
            Logout
          </button>
        </div>

      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

    </div>
  )
}
