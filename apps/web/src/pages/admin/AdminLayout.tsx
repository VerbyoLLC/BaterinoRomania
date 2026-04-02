import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getAuthToken, getAdminInquiriesUnreadCount } from '../../lib/api'

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
function IconParteneri() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
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
function IconMedia() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  )
}
function IconStudiiDeCaz() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
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
function IconInventar() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
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
function IconPhone() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}
function IconSettings() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconCurrency() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function IconChevronNav({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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

type NavLinkItem = { kind: 'link'; to: string; label: string; icon: ReactNode; end: boolean }

type NavGroupItem = {
  kind: 'group'
  id: string
  label: string
  icon: ReactNode
  children: { to: string; label: string; icon: ReactNode }[]
}

const SETARI_PATHS = ['/admin/currency', '/admin/phone-numbers'] as const
const PARTENERI_PATHS = ['/admin/clients', '/admin/companies'] as const
const MEDIA_PATHS = ['/admin/articles', '/admin/studii-de-caz', '/admin/discounts'] as const
const INVENTAR_PATHS = ['/admin/products', '/admin/stocks'] as const

const NAV_ITEMS: (NavLinkItem | NavGroupItem)[] = [
  { kind: 'link', to: '/admin', label: 'Dashboard', icon: <IconDashboard />, end: true },
  { kind: 'link', to: '/admin/orders', label: 'Comenzi', icon: <IconOrders />, end: false },
  { kind: 'link', to: '/admin/messages', label: 'Messages', icon: <IconMessages />, end: false },
  {
    kind: 'group',
    id: 'inventar',
    label: 'Inventar',
    icon: <IconInventar />,
    children: [
      { to: '/admin/products', label: 'Produse', icon: <IconProducts /> },
      { to: '/admin/stocks', label: 'Stocuri', icon: <IconStocks /> },
    ],
  },
  {
    kind: 'group',
    id: 'parteneri',
    label: 'Parteneri',
    icon: <IconParteneri />,
    children: [
      { to: '/admin/clients', label: 'Clienți', icon: <IconClients /> },
      { to: '/admin/companies', label: 'Companii', icon: <IconCompanies /> },
    ],
  },
  {
    kind: 'group',
    id: 'media',
    label: 'Media',
    icon: <IconMedia />,
    children: [
      { to: '/admin/articles', label: 'Articole', icon: <IconArticles /> },
      { to: '/admin/studii-de-caz', label: 'Studii de caz', icon: <IconStudiiDeCaz /> },
      { to: '/admin/discounts', label: 'Reduceri', icon: <IconDiscounts /> },
    ],
  },
  {
    kind: 'group',
    id: 'setari',
    label: 'Setări',
    icon: <IconSettings />,
    children: [
      { to: '/admin/currency', label: 'Currency', icon: <IconCurrency /> },
      { to: '/admin/phone-numbers', label: 'Numere de telefon', icon: <IconPhone /> },
    ],
  },
]

function pathUnderSetari(pathname: string) {
  return SETARI_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function pathUnderParteneri(pathname: string) {
  return PARTENERI_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function pathUnderMedia(pathname: string) {
  return MEDIA_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function pathUnderInventar(pathname: string) {
  return INVENTAR_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [setariOpen, setSetariOpen] = useState(() => pathUnderSetari(location.pathname))
  const [parteneriOpen, setParteneriOpen] = useState(() => pathUnderParteneri(location.pathname))
  const [mediaOpen, setMediaOpen] = useState(() => pathUnderMedia(location.pathname))
  const [inventarOpen, setInventarOpen] = useState(() => pathUnderInventar(location.pathname))

  useEffect(() => {
    if (!getAuthToken() && location.pathname !== '/admin/login') {
      navigate('/admin/login', { replace: true })
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    if (!getAuthToken() || location.pathname === '/admin/login') return
    const fetchCount = () => {
      getAdminInquiriesUnreadCount()
        .then(setUnreadCount)
        .catch(() => setUnreadCount(0))
    }
    fetchCount()
    window.addEventListener('admin-inquiries-updated', fetchCount)
    return () => window.removeEventListener('admin-inquiries-updated', fetchCount)
  }, [location.pathname])

  useEffect(() => {
    if (pathUnderSetari(location.pathname)) setSetariOpen(true)
    if (pathUnderParteneri(location.pathname)) setParteneriOpen(true)
    if (pathUnderMedia(location.pathname)) setMediaOpen(true)
    if (pathUnderInventar(location.pathname)) setInventarOpen(true)
  }, [location.pathname])

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
            {NAV_ITEMS.map((item) => {
              if (item.kind === 'link') {
                return (
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
                    <span className="relative flex-shrink-0">
                      {item.icon}
                      {item.to === '/admin/messages' && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </span>
                    {item.label}
                  </NavLink>
                )
              }

              const childActive = item.children.some(
                (c) => location.pathname === c.to || location.pathname.startsWith(`${c.to}/`)
              )
              const groupOpen =
                item.id === 'setari'
                  ? setariOpen
                  : item.id === 'parteneri'
                    ? parteneriOpen
                    : item.id === 'media'
                      ? mediaOpen
                      : item.id === 'inventar'
                        ? inventarOpen
                        : false
              const setGroupOpen =
                item.id === 'setari'
                  ? setSetariOpen
                  : item.id === 'parteneri'
                    ? setParteneriOpen
                    : item.id === 'media'
                      ? setMediaOpen
                      : item.id === 'inventar'
                        ? setInventarOpen
                        : () => {}
              return (
                <div key={item.id} className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => setGroupOpen((o) => !o)}
                    className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-['Inter'] font-medium transition-colors text-left ${
                      childActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                    aria-expanded={groupOpen}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="flex-1 min-w-0">{item.label}</span>
                    <IconChevronNav open={groupOpen} />
                  </button>
                  {groupOpen && (
                    <div className="flex flex-col gap-0.5 pl-2 border-l border-slate-700/60 ml-6 mr-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end={false}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-['Inter'] font-medium transition-colors ${
                              isActive
                                ? 'bg-white/10 text-white'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`
                          }
                        >
                          <span className="flex-shrink-0 opacity-90">{child.icon}</span>
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User + Logout */}
          <div className="pt-6 border-t border-slate-700/50 flex flex-col gap-1">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold font-['Inter'] truncate">Cont Admin</p>
                <p className="text-slate-400 text-xs font-['Inter'] truncate">AdminTest</p>
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
