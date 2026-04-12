import { useState, useEffect, useRef } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useViziuneHeader } from '../contexts/ViziuneHeaderContext'
import { useCart } from '../contexts/CartContext'
import { clearAuth, getAuthEmail, getAuthRole } from '../lib/api'
import { getMenuTranslations } from '../i18n/menu'
import { LanguageDropdown } from './LanguageDropdown'
import MobileMenu from './MobileMenu'
import { INSTALATORI_ONLY } from '../lib/siteMode'

const DIVIZII_PATHS = [
  { key: 'rezidential', path: '/divizii/rezidential' },
  { key: 'industrial', path: '/divizii/industrial' },
  { key: 'medical', path: '/divizii/medical' },
  { key: 'maritim', path: '/divizii/maritim' },
]

const COMPANIE_PATHS = [
  { key: 'viziune', path: '/companie/viziune' },
  { key: 'lithtech', path: '/parteneriat-strategic-lithtech-baterino' },
  { key: 'contact', path: '/contact' },
]

function clientAccountInitials(email: string): string {
  const local = (email.split('@')[0] || '').trim()
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2)
  }
  return (local.slice(0, 2) || 'C').toUpperCase()
}

function NavDropdown({
  label,
  items,
  isOpen,
  onToggle,
}: {
  label: string
  items: { label: string; path: string }[]
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1 whitespace-nowrap text-gray-700 hover:text-gray-900 font-medium py-2"
        aria-expanded={isOpen}
      >
        {label}
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => onToggle()}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguage()
  const { replaceMainHeader } = useViziuneHeader()
  const location = useLocation()
  const isViziuneReplaced = location.pathname === '/companie/viziune' && replaceMainHeader
  const [diviziiOpen, setDiviziiOpen] = useState(false)
  const [companieOpen, setCompanieOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { itemCount } = useCart()
  const [authRole, setAuthRole] = useState<'admin' | 'client' | 'partener' | null>(() =>
    typeof window !== 'undefined' ? getAuthRole() : null,
  )
  const [authEmail, setAuthEmail] = useState<string | null>(() =>
    typeof window !== 'undefined' ? getAuthEmail() : null,
  )
  useEffect(() => {
    const sync = () => {
      setAuthRole(getAuthRole())
      setAuthEmail(getAuthEmail())
    }
    sync()
    window.addEventListener('baterino-auth-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('baterino-auth-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  const t = getMenuTranslations(language.code)
  const diviziiItems = DIVIZII_PATHS.map(({ key, path }) => ({ label: t[key], path }))
  const companieItems = COMPANIE_PATHS.map(({ key, path }) => ({ label: t[key], path }))
  const cartAria =
    language.code === 'en' ? 'Shopping cart' : language.code === 'zh' ? '购物车' : 'Coș'
  const hideInstalatoriNav = authRole === 'client'

  const closeDropdowns = () => {
    setDiviziiOpen(false)
    setCompanieOpen(false)
    setAccountOpen(false)
    setLangOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) closeDropdowns()
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <header
      ref={headerRef}
      className={`bg-white border-b border-gray-200 sticky top-0 z-30 transition-opacity duration-200 ${isViziuneReplaced ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          <Link
            to={authRole === 'client' && !INSTALATORI_ONLY ? '/produse' : '/'}
            className="flex items-center flex-shrink-0"
            onClick={closeDropdowns}
            aria-label="Baterino Romania – home"
          >
            <img src="/images/shared/baterino-logo-black.svg" alt="Baterino Romania" className="h-8 w-auto" />
          </Link>
          <nav className="hidden min-w-0 md:flex md:flex-1 md:justify-center md:items-center md:gap-4 lg:gap-6">
            {INSTALATORI_ONLY ? (
              <>
                {!hideInstalatoriNav ? (
                  <Link to="/instalatori" className="text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap" onClick={closeDropdowns}>{t.instalatori}</Link>
                ) : null}
              </>
            ) : (
              <>
                <Link to="/produse" className="text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap" onClick={closeDropdowns}>{t.produse}</Link>
                <Link to="/reduceri" className="text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap" onClick={closeDropdowns}>{t.reduceri}</Link>
                <Link to="/siguranta" className="text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap" onClick={closeDropdowns}>{t.siguranta}</Link>
                {!hideInstalatoriNav ? (
                  <Link to="/instalatori" className="text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap" onClick={closeDropdowns}>{t.instalatori}</Link>
                ) : null}
                <NavDropdown label={t.divizii} items={diviziiItems} isOpen={diviziiOpen} onToggle={() => { setDiviziiOpen(!diviziiOpen); setCompanieOpen(false); setAccountOpen(false); setLangOpen(false); }} />
                <NavDropdown label={t.companie} items={companieItems} isOpen={companieOpen} onToggle={() => { setCompanieOpen(!companieOpen); setDiviziiOpen(false); setAccountOpen(false); setLangOpen(false); }} />
              </>
            )}
          </nav>
          <div className="hidden md:flex items-center justify-end gap-2 shrink-0 lg:gap-3 lg:min-w-[120px]">
            {!INSTALATORI_ONLY ? (
              <>
                <Link
                  to="/cos"
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={closeDropdowns}
                  aria-label={cartAria}
                >
                  <ShoppingCart className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                  {itemCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  ) : null}
                </Link>
                <span className="h-6 w-px shrink-0 bg-gray-200" aria-hidden />
              </>
            ) : null}
            {authRole === 'client' ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(!accountOpen)
                    setDiviziiOpen(false)
                    setCompanieOpen(false)
                    setLangOpen(false)
                  }}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium py-2"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-label={t.accountMenuLabel}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-800 text-xs font-bold font-['Inter']">
                    {clientAccountInitials(authEmail || 'client')}
                  </span>
                  <span className="hidden lg:inline">{t.accountMenuLabel}</span>
                  <svg
                    className={`hidden h-4 w-4 transition-transform lg:block ${accountOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {accountOpen ? (
                  <div
                    className="absolute top-full right-0 mt-1 min-w-[13rem] rounded-lg border border-gray-100 bg-white py-1 shadow-lg z-20"
                    role="menu"
                  >
                    {authEmail ? (
                      <p className="px-4 py-2 text-xs text-gray-500 font-['Inter'] border-b border-gray-100 truncate" title={authEmail}>
                        {authEmail}
                      </p>
                    ) : null}
                    <Link
                      to="/client"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-['Inter']"
                      onClick={closeDropdowns}
                      role="menuitem"
                    >
                      {t.accountMenuLabel}
                    </Link>
                    <Link
                      to="/client/produse"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-['Inter']"
                      onClick={closeDropdowns}
                      role="menuitem"
                    >
                      Produsele mele
                    </Link>
                    <Link
                      to="/client/beneficii"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-['Inter']"
                      onClick={closeDropdowns}
                      role="menuitem"
                    >
                      Beneficii
                    </Link>
                    <Link
                      to="/client/coduri-reducere"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-['Inter']"
                      onClick={closeDropdowns}
                      role="menuitem"
                    >
                      Coduri reducere
                    </Link>
                    <Link
                      to="/client/comenzi"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-['Inter']"
                      onClick={closeDropdowns}
                      role="menuitem"
                    >
                      Comenzile mele
                    </Link>
                    <Link
                      to="/client/setari"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-['Inter']"
                      onClick={closeDropdowns}
                      role="menuitem"
                    >
                      Setări
                    </Link>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-['Inter'] border-t border-gray-100"
                      role="menuitem"
                      onClick={() => {
                        clearAuth()
                        closeDropdowns()
                        navigate('/login')
                      }}
                    >
                      Deconectare
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium" onClick={closeDropdowns}>
                {t.login}
              </Link>
            )}
            <LanguageDropdown current={language} isOpen={langOpen} onToggle={() => { setLangOpen(!langOpen); setDiviziiOpen(false); setCompanieOpen(false); setAccountOpen(false); }} onSelect={setLanguage} />
          </div>
          <div className="flex items-center md:hidden ml-auto">
            <button type="button" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
            </button>
          </div>
        </div>
        <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>
    </header>
  )
}
