import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { getAuthEmail, getPartnerOnboardingRedirect, getPartnerProfile } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { LANGUAGES } from '../../i18n/menu'
import { getPartnerLayoutTranslations } from '../../i18n/partner/layout'

/* ── Icons ──────────────────────────────────────────────────────── */
function IconProfile() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
function IconSettings() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 2.31.826 1.37 1.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 2.31-1.37 1.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-2.31-.826-1.37-1.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-2.31 1.37-1.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconProducts() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="7" width="16" height="10" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 10v4" />
    </svg>
  )
}
function IconOrders() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}
function IconRepair() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      />
    </svg>
  )
}
function IconSupport() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function IconDashboard() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  )
}
function IconLogout() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}
function IconGlobe() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 100-18 9 9 0 000 18z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 010 18M12 3a15.3 15.3 0 000 18"
      />
    </svg>
  )
}
function IconLock() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}
function IconChevronLeft() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
function IconChevronRight() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'w-4 h-4'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function NavItemLoader({ count, collapsed }: { count: number; collapsed: boolean }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 rounded-xl animate-pulse ${collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}`}
          aria-hidden
        >
          <div className="w-5 h-5 rounded-md bg-slate-700/90 shrink-0" />
          {!collapsed && <div className="h-4 flex-1 max-w-[8.5rem] rounded-md bg-slate-700/70" />}
        </div>
      ))}
    </>
  )
}

function InactiveNavRow({
  tooltip,
  icon,
  label,
  collapsed,
}: {
  tooltip: string
  icon: ReactNode
  label: string
  collapsed: boolean
}) {
  return (
    <span
      title={collapsed ? label : undefined}
      className={`group/inactive relative flex w-full cursor-not-allowed items-center rounded-xl text-sm font-['Inter'] font-medium text-slate-500 opacity-60 ${
        collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
      }`}
    >
      {icon}
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <button
            type="button"
            tabIndex={0}
            aria-label={tooltip}
            className="group/lock relative ml-auto inline-flex shrink-0 cursor-help items-center justify-center rounded-md p-1 text-slate-400 outline-none pointer-events-auto hover:text-slate-300 focus-visible:ring-2 focus-visible:ring-white/35"
            onClick={(e) => e.preventDefault()}
          >
            <IconLock />
            <span
              role="tooltip"
              className="pointer-events-none absolute right-0 bottom-full z-[200] mb-1.5 w-max max-w-[min(14rem,calc(100vw-2rem))] rounded-lg bg-slate-800 px-3 py-2 text-left text-xs font-medium leading-snug text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-150 group-hover/lock:opacity-100 group-focus-visible/lock:opacity-100"
            >
              {tooltip}
            </span>
          </button>
        </>
      )}
      {/* tooltip in collapsed mode */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-2 z-[200] whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/inactive:opacity-100">
          {label}
        </span>
      )}
    </span>
  )
}

export default function PartnerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage } = useLanguage()
  const tr = getPartnerLayoutTranslations(language.code)

  const navMain = useMemo(
    () => [
      { to: '/partner', label: tr.navDashboard, icon: <IconDashboard />, end: true },
      { to: '/partner/produse', label: tr.navProducts, icon: <IconProducts />, end: false },
      { to: '/partner/comenzi', label: tr.navOrders, icon: <IconOrders />, end: false },
      { to: '/partner/servicii', label: tr.navRepairs, icon: <IconRepair />, end: false },
      { to: '/partner/profil', label: tr.navPublicProfile, icon: <IconProfile />, end: false },
    ],
    [tr],
  )

  const navBottom = useMemo(
    () => [
      { to: '/partner/setari', label: tr.navSettings, icon: <IconSettings />, end: false },
      { to: '/partner/suport', label: tr.navSupport, icon: <IconSupport />, end: false },
    ],
    [tr],
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)
  const [isSuspended, setIsSuspended] = useState<boolean | null>(null)
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    getPartnerProfile()
      .then((p: {
        isSuspended?: boolean
        isApproved?: boolean
        companyName?: string | null
        cui?: string | null
        activityTypes?: string | null
        contactFirstName?: string | null
        phone?: string | null
      }) => {
        const onboardingPath = getPartnerOnboardingRedirect(p)
        if (onboardingPath) {
          navigate(onboardingPath, { replace: true })
          return
        }
        setIsSuspended(p?.isSuspended === true)
        setIsApproved(p?.isApproved !== false)
        setProfileLoaded(true)
      })
      .catch(() => {
        setIsSuspended(null)
        setIsApproved(null)
        setProfileLoaded(true)
      })
  }, [navigate])

  const pendingReview = isApproved === false && isSuspended !== true

  const allowedWhenSuspended = (path: string) =>
    path === '/partner' || path.startsWith('/partner/setari') || path.startsWith('/partner/suport')

  const allowedWhenPendingReview = (path: string) =>
    path === '/partner' ||
    path.startsWith('/partner/setari') ||
    path.startsWith('/partner/suport')

  useEffect(() => {
    if (isSuspended === null || isApproved === null) return
    if (isSuspended && !allowedWhenSuspended(location.pathname)) {
      navigate('/partner', { replace: true })
      return
    }
    if (pendingReview && !allowedWhenPendingReview(location.pathname)) {
      navigate('/partner', { replace: true })
    }
  }, [isSuspended, isApproved, pendingReview, location.pathname, navigate])

  useEffect(() => {
    if (!langMenuOpen) return
    const onDown = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [langMenuOpen])

  useEffect(() => {
    document.documentElement.classList.add('partner-shell')
    document.body.classList.add('partner-shell')
    return () => {
      document.documentElement.classList.remove('partner-shell')
      document.body.classList.remove('partner-shell')
    }
  }, [])

  const navLinkClass = (isActive: boolean, col: boolean) =>
    `flex items-center rounded-xl text-sm font-['Inter'] font-medium transition-colors ${
      col ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
    } ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden bg-gray-50">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`flex-shrink-0 bg-slate-900 flex flex-col h-full fixed lg:relative top-0 left-0 z-50 lg:z-auto transform transition-all duration-200 ease-in-out lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-[4.5rem]' : 'w-64'}`}
      >
        <div className="flex flex-col h-full py-6 px-3 overflow-hidden">

          {/* Logo / collapse toggle */}
          <div className={`pb-5 mb-4 border-b border-slate-700/50 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-1'}`}>
            {!collapsed && (
              <Link
                to="/partner"
                className="flex flex-col items-start gap-1 pl-2 min-w-0"
                onClick={() => setSidebarOpen(false)}
              >
                <img
                  src="/images/shared/baterino-logo-white.png"
                  alt="Baterino"
                  className="h-7 w-auto object-contain"
                />
                <span className="text-white/60 text-xs font-medium font-['Inter'] tracking-wider uppercase">
                  {tr.partnerBadge}
                </span>
              </Link>
            )}
            {collapsed && (
              <Link to="/partner" className="flex items-center justify-center" onClick={() => setSidebarOpen(false)}>
                <img
                  src="/images/shared/baterino-logo-white.png"
                  alt="Baterino"
                  className="h-6 w-auto object-contain"
                />
              </Link>
            )}
            {/* Collapse toggle — desktop only */}
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? tr.expandMenu : tr.collapseMenu}
              className={`hidden lg:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white ${collapsed ? 'mt-3' : ''}`}
            >
              {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
            </button>
          </div>

          {/* Nav */}
          <nav
            className="flex-1 flex flex-col gap-1 overflow-hidden"
            aria-busy={!profileLoaded}
            aria-label={!profileLoaded ? tr.navLoading : undefined}
          >
            {!profileLoaded ? (
              <>
                <NavItemLoader count={navMain.length} collapsed={collapsed} />
                <div className="flex-1 min-h-[1rem]" />
                <NavItemLoader count={1} collapsed={collapsed} />
                <NavItemLoader count={navBottom.length} collapsed={collapsed} />
              </>
            ) : (
              <>
                {navMain.map((item) => {
                  const isDashboard = item.to === '/partner' && item.end
                  const disabledWhenSuspended = isSuspended === true && !isDashboard
                  const disabledWhenPending = pendingReview && !isDashboard
                  const navDisabled = disabledWhenPending || disabledWhenSuspended
                  if (navDisabled) {
                    const inactiveTitle = disabledWhenPending
                      ? tr.tooltipPending
                      : tr.tooltipSuspended
                    return (
                      <InactiveNavRow
                        key={item.to}
                        tooltip={inactiveTitle}
                        icon={item.icon}
                        label={item.label}
                        collapsed={collapsed}
                      />
                    )
                  }
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      title={collapsed ? item.label : undefined}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => navLinkClass(isActive, collapsed)}
                    >
                      <span className="relative group/nav">
                        {item.icon}
                        {/* Tooltip when collapsed */}
                        {collapsed && (
                          <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[200] whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/nav:opacity-100">
                            {item.label}
                          </span>
                        )}
                      </span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  )
                })}
                <div className="flex-1 min-h-[1rem]" />
                <div className="relative" ref={langMenuRef}>
                  <button
                    type="button"
                    aria-expanded={langMenuOpen}
                    aria-controls="partner-lang-submenu"
                    aria-haspopup="listbox"
                    title={collapsed ? tr.language : undefined}
                    onClick={() => setLangMenuOpen((o) => !o)}
                    className={`w-full text-left ${navLinkClass(langMenuOpen, collapsed)} ${
                      langMenuOpen ? 'ring-1 ring-white/15' : ''
                    }`}
                  >
                    <span className="relative group/nav">
                      <IconGlobe />
                      {collapsed && (
                        <span className="pointer-events-none absolute left-full ml-3 top-1/2 z-[200] -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/nav:opacity-100">
                          {tr.language}
                        </span>
                      )}
                    </span>
                    {!collapsed && (
                      <>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate">{tr.language}</span>
                          <span className="block truncate text-xs font-normal text-slate-400 font-['Inter']">
                            {language.label}
                          </span>
                        </div>
                        <IconChevronDown
                          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                            langMenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </>
                    )}
                  </button>
                  {langMenuOpen && !collapsed && (
                    <div
                      id="partner-lang-submenu"
                      role="listbox"
                      aria-label={tr.chooseLanguage}
                      className="mt-1 flex flex-col gap-0.5 pl-3"
                    >
                      {LANGUAGES.map((lang) => {
                        const selected = language.code === lang.code
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`flex w-full items-center rounded-lg py-2 pl-9 pr-3 text-left text-sm font-['Inter'] transition-colors ${
                              selected
                                ? 'bg-white/10 font-semibold text-white'
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                            onClick={() => {
                              setLanguage(lang)
                              setSidebarOpen(false)
                            }}
                          >
                            {lang.label}
                            {selected && (
                              <span className="ml-auto text-xs font-medium text-emerald-400" aria-hidden>
                                ✓
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {langMenuOpen && collapsed && (
                    <div
                      role="listbox"
                      aria-label={tr.chooseLanguage}
                      className="absolute left-0 right-0 top-full z-[250] mt-1 rounded-xl border border-gray-200 bg-white py-1 shadow-xl"
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          role="option"
                          aria-selected={language.code === lang.code}
                          className={`block w-full px-4 py-2.5 text-left text-sm font-['Inter'] transition-colors ${
                            language.code === lang.code
                              ? 'bg-slate-100 font-semibold text-slate-900'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                          onClick={() => {
                            setLanguage(lang)
                            setLangMenuOpen(false)
                            setSidebarOpen(false)
                          }}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {navBottom.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => navLinkClass(isActive, collapsed)}
                  >
                    <span className="relative group/nav">
                      {item.icon}
                      {collapsed && (
                        <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[200] whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/nav:opacity-100">
                          {item.label}
                        </span>
                      )}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          {/* User + Logout */}
          <div className="pt-5 border-t border-slate-700/50 flex flex-col gap-1">
            {!collapsed ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  P
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold font-['Inter'] truncate">{tr.partnerAccount}</p>
                  <p className="text-slate-400 text-xs font-['Inter'] truncate">{getAuthEmail() || '—'}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-2">
                <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-semibold">
                  P
                </div>
              </div>
            )}
            <button
              onClick={() => navigate('/login')}
              title={collapsed ? tr.logout : undefined}
              className={`flex items-center rounded-xl text-sm font-['Inter'] font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors w-full text-left ${
                collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
              }`}
            >
              <IconLogout />
              {!collapsed && tr.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      {/* Scroll lives only on the outlet wrapper below so nested routes don't stack a second scrollbar (main + inner flex). */}
      <main className="flex min-h-0 flex-1 min-w-0 flex-col overflow-hidden">
        <div
          id="partner-layout-scroll"
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-clip overscroll-y-contain [&>*]:shrink-0"
        >
          {/* Mobile header — inside scroll region so sticky works and there is a single vertical scroll */}
          <div className="lg:hidden sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-ml-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              aria-label={tr.openMenu}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/partner" className="flex-shrink-0">
              <img src="/images/shared/baterino-pro-alb-logo.png" alt="Baterino" className="h-6 w-auto" />
            </Link>
            <div className="w-10" />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
