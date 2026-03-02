import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getAuthToken } from '../../lib/api'

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
function IconMessages() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: <IconDashboard />, end: true },
  { to: '/admin/products', label: 'Produse', icon: <IconProducts />, end: false },
  { to: '/admin/messages', label: 'Messages', icon: <IconMessages />, end: false },
  { to: '/admin/clients', label: 'Clienți', icon: <IconClients />, end: false },
  { to: '/admin/companies', label: 'Companii', icon: <IconCompanies />, end: false },
  { to: '/admin/articles', label: 'Articole', icon: <IconArticles />, end: false },
  { to: '/admin/stocks', label: 'Stocuri', icon: <IconStocks />, end: false },
  { to: '/admin/orders', label: 'Comenzi', icon: <IconOrders />, end: false },
  { to: '/admin/discounts', label: 'Reduceri', icon: <IconDiscounts />, end: false },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!getAuthToken() && location.pathname !== '/admin/login') {
      navigate('/admin/login', { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <div className="flex h-screen min-h-[100dvh] overflow-hidden bg-gray-50">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`w-64 flex-shrink-0 bg-slate-900 flex flex-col h-screen lg:h-full fixed lg:relative top-0 left-0 z-50 lg:z-auto transform transition-transform duration-200 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full py-6 px-4">

          {/* Logo */}
          <a href="/" className="flex flex-col items-center gap-2 px-3 pb-6 mb-4 border-b border-slate-700/50">
            <img
              src="/images/shared/baterino-logo-white.png"
              alt="Baterino"
              className="h-7 w-auto object-contain"
            />
            <span className="text-white/60 text-xs font-medium font-['Inter'] tracking-wider uppercase">
              Admin
            </span>
          </a>

          {/* Nav */}
          <nav className="flex-1 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-['Inter'] font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User + Logout */}
          <div className="pt-6 border-t border-slate-700/50 flex flex-col gap-1">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold font-['Inter'] truncate">Cont Admin</p>
                <p className="text-slate-400 text-xs font-['Inter'] truncate">admin@baterino.ro</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token')
                navigate('/admin/login')
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-['Inter'] font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
            >
              <IconLogout />
              Deconectare
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            aria-label="Deschide meniul"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <a href="/" className="flex-shrink-0">
            <img src="/images/shared/baterino-pro-alb-logo.png" alt="Baterino" className="h-6 w-auto" />
          </a>
          <div className="w-10" />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
