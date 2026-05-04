import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { clearAuth, getAuthEmail, getAuthRole, getAuthToken } from '../../lib/api'

function IconDashboard() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
      />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  )
}

const NAV = [{ to: '/sales-agent', label: 'Panou', icon: <IconDashboard />, end: true }]

export default function SalesAgentLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const token = getAuthToken()
    const role = getAuthRole()
    if (!token || role !== 'sales_agent') {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`, { replace: true })
      return
    }
    setAllowed(true)
  }, [location.pathname, location.search, navigate])

  if (!allowed) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500 font-['Inter']">Se încarcă...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen min-h-[100dvh] overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`w-64 flex-shrink-0 bg-slate-900 flex flex-col h-screen lg:h-full fixed lg:relative top-0 left-0 z-50 lg:z-auto transform transition-transform duration-200 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full py-6 px-4">
          <a href="/" className="flex flex-col items-center gap-2 px-3 pb-6 mb-4 border-b border-slate-700/50">
            <img
              src="/images/shared/baterino-logo-white.png"
              alt="Baterino"
              className="h-7 w-auto object-contain"
            />
            <span className="text-white/60 text-xs font-medium font-['Inter'] tracking-wider uppercase">
              Agent vânzări
            </span>
          </a>

          <nav className="flex-1 flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-['Inter'] font-medium transition-colors ${
                    isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-700/50 flex flex-col gap-1">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold font-['Inter'] truncate">Cont agent</p>
                <p className="text-slate-400 text-xs font-['Inter'] truncate">{getAuthEmail() || '—'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                clearAuth()
                navigate('/login')
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-['Inter'] font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
            >
              <IconLogout />
              Deconectare
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
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
