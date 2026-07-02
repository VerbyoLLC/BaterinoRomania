import { useState, useEffect, useRef, useMemo, Fragment, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { getAuthEmail, clearAuth, getPartnerOnboardingRedirect, getPartnerProfile, partnerDiscountConfigured, type PartnerProfileGetResponse } from '../../lib/api'
import { writePartnerProfileHintFromProfile } from '../../lib/partnerProfileHint'
import {
  dismissPartnerWelcomeModalForSession,
  dismissPartnerWelcomeModalPermanently,
  shouldShowPartnerWelcomeModal,
} from '../../lib/partnerWelcomeModal'
import {
  dispatchPartnerOpenRfqFromWelcome,
  PartnerWelcomePendingDiscountModal,
} from '../../components/partner/PartnerWelcomePendingDiscountModal'
import { getPartnerWelcomeModalTranslations } from '../../i18n/partner/welcome-modal'
import { useLanguage } from '../../contexts/LanguageContext'
import { LANGUAGES, type LangCode } from '../../i18n/menu'
import { getPartnerLayoutTranslations, getPartnerTopBarPageTitle, getPartnerTopBarPageSubtitle } from '../../i18n/partner/layout'
import { getPartnerChannelProfileLabel } from '../../i18n/partner/settings'
import { ReducerePartenerBox } from './PartnerSidebarBoxes'
import { PartnerTopBarToolbar } from './PartnerTopBarToolbar'

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
    <svg
      className={`h-4 w-4 shrink-0 ${className ?? ''}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden
    >
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

function PartnerAccountMenu({
  tr,
  language,
  setLanguage,
  onNavigate,
  companyName,
  channelProfile,
}: {
  tr: ReturnType<typeof getPartnerLayoutTranslations>
  language: (typeof LANGUAGES)[number]
  setLanguage: (lang: (typeof LANGUAGES)[number]) => void
  onNavigate?: () => void
  companyName: string | null
  channelProfile: { partnerChannelType?: string | null; activityTypes?: string | null } | null
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [langExpanded, setLangExpanded] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuPanelRef = useRef<HTMLDivElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null)

  const close = () => {
    setOpen(false)
    setLangExpanded(false)
    setMenuPos(null)
  }

  const updateMenuPos = () => {
    const btn = triggerRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const width = Math.min(window.innerWidth - 16, 280)
    setMenuPos({
      top: r.bottom + 8,
      left: Math.min(Math.max(8, r.right - width), window.innerWidth - width - 8),
      width,
    })
  }

  useEffect(() => {
    if (!open) return
    updateMenuPos()
    const onScrollOrResize = () => updateMenuPos()
    window.addEventListener('resize', onScrollOrResize)
    window.addEventListener('scroll', onScrollOrResize, true)
    return () => {
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (menuRef.current?.contains(t)) return
      if (menuPanelRef.current?.contains(t)) return
      close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const rowBtn =
    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium font-[\'Inter\'] text-slate-200 transition-colors hover:bg-white/5 hover:text-white'
  const rowLink = `${rowBtn} no-underline`

  const channelLabel = channelProfile
    ? getPartnerChannelProfileLabel(language.code as LangCode, channelProfile)
    : null
  const displayCompany = companyName?.trim() || ''
  const avatarLetter = (displayCompany[0] || 'P').toUpperCase()
  const email = getAuthEmail() || '—'

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? tr.closeAccountMenu : tr.openAccountMenu}
        onClick={() => {
          if (open) {
            close()
            return
          }
          setLangExpanded(false)
          updateMenuPos()
          setOpen(true)
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white ring-2 ring-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        {avatarLetter}
      </button>

      {open && menuPos && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={menuPanelRef}
              role="menu"
              style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
              className="fixed z-[300] overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900 py-2 shadow-xl"
            >
              <div className="px-4 pb-2 pt-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold text-white">
                    {avatarLetter}
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 truncate text-sm font-semibold text-white font-['Inter']">
                      {displayCompany || tr.partnerAccount}
                    </p>
                    {channelLabel && channelLabel !== '—' ? (
                      <p className="m-0 truncate text-xs font-medium text-slate-300 font-['Inter']">{channelLabel}</p>
                    ) : null}
                    <p className="m-0 truncate text-xs text-slate-400 font-['Inter']">{email}</p>
                  </div>
                </div>
              </div>

              <div className="mb-2 border-t border-slate-700/80" />

              <div className="px-2">
                <button
                  type="button"
                  role="menuitem"
                  aria-expanded={langExpanded}
                  className={rowBtn}
                  onClick={() => setLangExpanded((e) => !e)}
                >
                  <IconGlobe />
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block truncate">{tr.language}</span>
                    <span className="block truncate text-xs font-normal text-slate-400">{language.label}</span>
                  </span>
                  <IconChevronDown
                    className={`text-slate-400 transition-transform ${langExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
                {langExpanded ? (
                  <div
                    className="mb-1 ml-2 flex flex-col gap-0.5 border-l border-slate-700/80 pl-2"
                    role="group"
                    aria-label={tr.chooseLanguage}
                  >
                    {LANGUAGES.map((lang) => {
                      const selected = language.code === lang.code
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          role="menuitemradio"
                          aria-checked={selected}
                          className={`rounded-lg py-2 pl-3 pr-2 text-left text-sm font-['Inter'] transition-colors ${
                            selected
                              ? 'bg-white/10 font-semibold text-white'
                              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                          }`}
                          onClick={() => {
                            setLanguage(lang)
                            close()
                            onNavigate?.()
                          }}
                        >
                          {lang.label}
                          {selected ? <span className="ml-2 text-xs text-emerald-400">✓</span> : null}
                        </button>
                      )
                    })}
                  </div>
                ) : null}

                <NavLink
                  to="/partner/setari"
                  role="menuitem"
                  className={rowLink}
                  onClick={() => {
                    close()
                    onNavigate?.()
                  }}
                >
                  <IconSettings />
                  <span>{tr.navSettings}</span>
                </NavLink>
                <NavLink
                  to="/partner/suport"
                  role="menuitem"
                  className={rowLink}
                  onClick={() => {
                    close()
                    onNavigate?.()
                  }}
                >
                  <IconSupport />
                  <span>{tr.navSupport}</span>
                </NavLink>
              </div>

              <div className="my-2 border-t border-slate-700/80" />

              <div className="px-2 pt-1">
                <button
                  type="button"
                  role="menuitem"
                  className={rowBtn}
                  onClick={() => {
                    clearAuth()
                    close()
                    navigate('/login', { replace: true })
                  }}
                >
                  <IconLogout />
                  <span>{tr.logout}</span>
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

export default function PartnerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage } = useLanguage()
  const tr = getPartnerLayoutTranslations(language.code)

  const pageTitle = useMemo(
    () => getPartnerTopBarPageTitle(location.pathname, language.code),
    [location.pathname, language.code],
  )

  const pageSubtitle = useMemo(
    () => getPartnerTopBarPageSubtitle(location.pathname, language.code),
    [location.pathname, language.code],
  )

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

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [isSuspended, setIsSuspended] = useState<boolean | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [partnerDiscountPercent, setPartnerDiscountPercent] = useState<number | null>(null)
  const [partnerCompanyName, setPartnerCompanyName] = useState<string | null>(null)
  const [partnerChannelProfile, setPartnerChannelProfile] = useState<{
    partnerChannelType?: string | null
    activityTypes?: string | null
  } | null>(null)
  const [contactFirstName, setContactFirstName] = useState('')
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false)

  useEffect(() => {
    getPartnerProfile()
      .then((p: PartnerProfileGetResponse) => {
        const onboardingPath = getPartnerOnboardingRedirect(p)
        if (onboardingPath) {
          navigate(onboardingPath, { replace: true })
          return
        }
        setIsSuspended(p?.isSuspended === true)
        const raw = p?.partnerDiscountPercent
        setPartnerDiscountPercent(
          raw != null && Number.isFinite(Number(raw)) ? Number(raw) : null,
        )
        setPartnerCompanyName(String(p?.companyName || '').trim() || null)
        setContactFirstName(String(p?.contactFirstName ?? '').trim())
        setPartnerChannelProfile({
          partnerChannelType: p?.partnerChannelType ?? null,
          activityTypes: Array.isArray(p?.activityTypes)
            ? p.activityTypes.join(',')
            : (p?.activityTypes ?? null),
        })
        writePartnerProfileHintFromProfile(p)
        setProfileLoaded(true)

        const email = getAuthEmail()
        const discountApproved = partnerDiscountConfigured(p?.partnerDiscountPercent)
        if (
          p?.isSuspended !== true &&
          !discountApproved &&
          shouldShowPartnerWelcomeModal(email)
        ) {
          setWelcomeModalOpen(true)
        }
      })
      .catch(() => {
        setIsSuspended(null)
        setPartnerDiscountPercent(null)
        setPartnerCompanyName(null)
        setPartnerChannelProfile(null)
        setProfileLoaded(true)
      })
  }, [navigate])

  const allowedWhenSuspended = (path: string) =>
    path === '/partner' || path.startsWith('/partner/setari') || path.startsWith('/partner/suport')

  useEffect(() => {
    if (isSuspended === null) return
    if (isSuspended && !allowedWhenSuspended(location.pathname)) {
      navigate('/partner', { replace: true })
    }
  }, [isSuspended, location.pathname, navigate])

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

  const trWelcome = getPartnerWelcomeModalTranslations(language.code)

  const handleWelcomeDismiss = (dontShowAgain: boolean) => {
    const email = getAuthEmail()
    if (dontShowAgain) dismissPartnerWelcomeModalPermanently(email)
    else dismissPartnerWelcomeModalForSession(email)
    setWelcomeModalOpen(false)
  }

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
                  src="/images/shared/baterino-logo-white.webp"
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
                  src="/images/shared/baterino-logo-white.webp"
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
              </>
            ) : (
              <>
                {navMain.map((item) => {
                  const isDashboard = item.to === '/partner' && item.end
                  const disabledWhenSuspended = isSuspended === true && !isDashboard
                  const navDisabled = disabledWhenSuspended
                  if (navDisabled) {
                    const inactiveTitle = tr.tooltipSuspended
                    return (
                      <Fragment key={item.to}>
                        <InactiveNavRow
                          tooltip={inactiveTitle}
                          icon={item.icon}
                          label={item.label}
                          collapsed={collapsed}
                        />
                        {item.to === '/partner/profil' && !collapsed ? (
                          <>
                            <div className="my-3 border-t border-slate-700/50" role="separator" aria-hidden />
                            <ReducerePartenerBox
                              variant="sidebar"
                              className="mx-0.5"
                              discountPercent={partnerDiscountPercent}
                              loading={!profileLoaded}
                            />
                          </>
                        ) : null}
                      </Fragment>
                    )
                  }
                  return (
                    <Fragment key={item.to}>
                      <NavLink
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
                      {item.to === '/partner/profil' && !collapsed ? (
                        <>
                          <div className="my-3 border-t border-slate-700/50" role="separator" aria-hidden />
                          <ReducerePartenerBox
                            variant="sidebar"
                            className="mx-0.5"
                            discountPercent={partnerDiscountPercent}
                            loading={!profileLoaded}
                          />
                        </>
                      ) : null}
                    </Fragment>
                  )
                })}
                <div className="flex-1 min-h-[1rem]" />
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex min-h-0 flex-1 min-w-0 flex-col overflow-hidden">
        <header className="z-40 flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 py-2.5 sm:gap-3 lg:px-6">
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-ml-1 rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              aria-label={tr.openMenu}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/partner" className="flex-shrink-0">
              <img src="/images/shared/baterino-pro-negru-logo.webp" alt="Baterino" className="h-6 w-auto" />
            </Link>
          </div>
          <div
            id="partner-layout-top-leading"
            className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3"
          >
            {pageTitle ? (
              <h1 className="m-0 shrink-0 text-lg font-bold tracking-tight text-slate-900 font-['Inter'] sm:text-xl">
                {pageTitle}
              </h1>
            ) : null}
            {pageSubtitle ? (
              <p className="m-0 hidden min-w-0 truncate text-sm text-gray-500 font-['Inter'] sm:block">
                {pageSubtitle}
              </p>
            ) : null}
            <div
              id="partner-layout-top-leading-extra"
              className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3"
            />
          </div>
          <div
            id="partner-layout-top-page-actions"
            className="flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3"
          />
          <PartnerTopBarToolbar />
          <PartnerAccountMenu
            tr={tr}
            language={language}
            setLanguage={setLanguage}
            onNavigate={() => setSidebarOpen(false)}
            companyName={partnerCompanyName}
            channelProfile={partnerChannelProfile}
          />
        </header>
        <div
          id="partner-layout-scroll"
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-clip overscroll-y-contain [&>*]:shrink-0"
        >
          <Outlet />
        </div>
      </main>

      <PartnerWelcomePendingDiscountModal
        open={welcomeModalOpen && profileLoaded && isSuspended !== true && !partnerDiscountConfigured(partnerDiscountPercent)}
        firstName={contactFirstName}
        tr={trWelcome}
        onDismiss={handleWelcomeDismiss}
        onExploreCatalog={() => {
          navigate('/partner/produse')
          dispatchPartnerOpenRfqFromWelcome()
        }}
      />
    </div>
  )
}
