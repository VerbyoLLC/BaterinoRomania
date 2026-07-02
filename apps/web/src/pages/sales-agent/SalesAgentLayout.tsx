import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  getSalesAgentLayoutTranslations,
  getSalesAgentSettingsTranslations,
  salesAgentSectorLabel,
  SALES_AGENT_SECTOR_VALUES,
  type SalesAgentSectorValue,
} from '../../i18n/sales-agent'
import { LANGUAGES } from '../../i18n/menu'
import {
  clearAuth,
  getAuthEmail,
  getAuthRole,
  getAuthToken,
  getSalesAgentMe,
  type SalesAgentMeResponse,
} from '../../lib/api'
import { ProfileDropdownSkeleton } from './SalesAgentSkeletons'

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

function IconLeads() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 11l-2-2m0 0l-2 2m2-2v6" />
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

function IconGlobe() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
      />
    </svg>
  )
}

function IconChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

const NAV = [
  { to: '/sales-agent', key: 'navDashboard' as const, icon: <IconDashboard />, end: true },
  { to: '/sales-agent/leads', key: 'navLeads' as const, icon: <IconLeads /> },
]

function buildAgentDisplayName(data: SalesAgentMeResponse | null, email: string, fallback: string): string {
  const agent = data?.agent
  const user = data?.user
  const firstName = agent?.firstName?.trim() || user?.firstName?.trim() || ''
  const lastName = agent?.lastName?.trim() || user?.lastName?.trim() || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  return fullName || email.trim() || fallback
}

function profileField(label: string, value: string, empty: string) {
  const v = value.trim()
  return (
    <div className="flex gap-2 text-xs font-['Inter'] leading-snug">
      <dt className="w-[5.5rem] shrink-0 font-medium text-slate-500">{label}</dt>
      <dd className="min-w-0 flex-1 text-slate-800 break-words">{v || empty}</dd>
    </div>
  )
}

function agentSectorLabel(
  settingsTr: ReturnType<typeof getSalesAgentSettingsTranslations>,
  sector: string,
): string {
  if (SALES_AGENT_SECTOR_VALUES.includes(sector as SalesAgentSectorValue)) {
    return salesAgentSectorLabel(settingsTr, sector as SalesAgentSectorValue)
  }
  return sector
}

export default function SalesAgentLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage } = useLanguage()
  const tr = getSalesAgentLayoutTranslations(language.code)
  const settingsTr = getSalesAgentSettingsTranslations(language.code)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [profileData, setProfileData] = useState<SalesAgentMeResponse | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const langMenuRef = useRef<HTMLDivElement>(null)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const authEmail = getAuthEmail() ?? ''
  const settingsActive = location.pathname.startsWith('/sales-agent/settings')

  const avatarLetter = useMemo(() => {
    const email = authEmail.trim()
    if (!email) return 'A'
    return email.charAt(0).toUpperCase()
  }, [authEmail])

  const displayName = useMemo(
    () => buildAgentDisplayName(profileData, authEmail, tr.agentAccount),
    [profileData, authEmail, tr.agentAccount],
  )

  const agent = profileData?.agent

  useEffect(() => {
    const token = getAuthToken()
    const role = getAuthRole()
    if (!token || role !== 'sales_agent') {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`, { replace: true })
      return
    }
    setAllowed(true)
  }, [location.pathname, location.search, navigate])

  useEffect(() => {
    if (!allowed) return
    let cancelled = false
    setProfileLoading(true)
    getSalesAgentMe()
      .then((data) => {
        if (!cancelled) setProfileData(data)
      })
      .catch(() => {
        if (!cancelled) setProfileData(null)
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [allowed])

  useEffect(() => {
    setAccountMenuOpen(false)
    setLangMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!langMenuOpen && !accountMenuOpen) return
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node
      if (langMenuOpen && langMenuRef.current && !langMenuRef.current.contains(target)) {
        setLangMenuOpen(false)
      }
      if (accountMenuOpen && accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setAccountMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [langMenuOpen, accountMenuOpen])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  if (!allowed) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500 font-['Inter']">{tr.loading}</p>
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
              src="/images/shared/baterino-logo-white.webp"
              alt="Baterino"
              className="h-7 w-auto object-contain"
            />
            <span className="text-white/60 text-xs font-medium font-['Inter'] tracking-wider uppercase">
              {tr.salesAgentBadge}
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
                {tr[item.key]}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 min-w-0 flex-col overflow-hidden">
        <header className="relative z-40 flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-2.5 lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-ml-1 rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label={tr.openMenu}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="hidden text-xs font-medium uppercase tracking-wider text-slate-400 font-['Inter'] lg:inline">
              {tr.salesAgentBadge}
            </span>
            <a href="/" className="flex-shrink-0 lg:hidden">
              <img src="/images/shared/baterino-pro-alb-logo.webp" alt="Baterino" className="h-6 w-auto" />
            </a>
          </div>

          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setLangMenuOpen((open) => !open)
                  setAccountMenuOpen(false)
                }}
                aria-expanded={langMenuOpen}
                aria-haspopup="listbox"
                aria-label={tr.chooseLanguage}
                title={tr.chooseLanguage}
                className={`rounded-lg p-2 transition-colors ${
                  langMenuOpen
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <IconGlobe />
              </button>
              {langMenuOpen ? (
                <div
                  role="listbox"
                  aria-label={tr.chooseLanguage}
                  className="absolute right-0 top-full z-50 mt-1.5 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
                >
                  {LANGUAGES.map((lang) => {
                    const selected = language.code === lang.code
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`flex w-full items-center px-3 py-2.5 text-left text-sm font-['Inter'] font-medium transition-colors ${
                          selected
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        onClick={() => {
                          setLanguage(lang)
                          setLangMenuOpen(false)
                        }}
                      >
                        {lang.label}
                        {selected ? (
                          <span className="ml-auto text-xs font-medium text-emerald-600" aria-hidden>
                            ✓
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <NavLink
              to="/sales-agent/settings"
              aria-label={tr.navSettings}
              title={tr.navSettings}
              className={`rounded-lg p-2 transition-colors ${
                settingsActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <IconSettings />
            </NavLink>

            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => {
                  const opening = !accountMenuOpen
                  setAccountMenuOpen(opening)
                  setLangMenuOpen(false)
                  if (opening) {
                    setProfileLoading(true)
                    getSalesAgentMe()
                      .then(setProfileData)
                      .catch(() => setProfileData(null))
                      .finally(() => setProfileLoading(false))
                  }
                }}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-label={tr.agentAccount}
                className={`flex min-w-0 max-w-[min(100%,12rem)] items-center gap-2 rounded-lg px-2 py-1.5 text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:max-w-xs sm:px-2.5 sm:py-2 ${
                  accountMenuOpen ? 'bg-slate-100 text-slate-900' : ''
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                  {avatarLetter}
                </span>
                <span className="hidden min-w-0 truncate text-sm font-medium font-['Inter'] sm:inline">
                  {authEmail || tr.agentAccount}
                </span>
                <IconChevronDown open={accountMenuOpen} />
              </button>

              {accountMenuOpen ? (
                <div
                  role="menu"
                  aria-label={tr.profileMenuLabel}
                  className="absolute right-0 top-full z-50 mt-1.5 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold font-['Inter'] text-slate-900 truncate">{displayName}</p>
                    <p className="text-xs font-['Inter'] text-slate-500 truncate">{authEmail || tr.agentAccount}</p>
                  </div>

                  {profileLoading ? (
                    <ProfileDropdownSkeleton ariaLabel={tr.loading} />
                  ) : agent ? (
                    <dl className="space-y-2 px-4 py-3">
                      {profileField(settingsTr.fieldPhone, agent.phone, tr.profileEmptyValue)}
                      {profileField(settingsTr.fieldWhatsapp, agent.whatsapp, tr.profileEmptyValue)}
                      {profileField(settingsTr.fieldEmail, agent.email, tr.profileEmptyValue)}
                      {profileField(settingsTr.fieldProgram, agent.program, tr.profileEmptyValue)}
                      {profileField(
                        settingsTr.fieldCounty,
                        [agent.county, agent.city].filter(Boolean).join(', '),
                        tr.profileEmptyValue,
                      )}
                      {profileField(
                        settingsTr.fieldSector,
                        agentSectorLabel(settingsTr, agent.sector),
                        tr.profileEmptyValue,
                      )}
                    </dl>
                  ) : (
                    <p className="px-4 py-3 text-sm text-amber-950 font-['Inter']">{tr.profileNotLinked}</p>
                  )}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              aria-label={tr.logout}
              title={tr.logout}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <IconLogout />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
