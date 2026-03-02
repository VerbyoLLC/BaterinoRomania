import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useViziuneHeader } from '../contexts/ViziuneHeaderContext'
import { getMenuTranslations } from '../i18n/menu'
import { LanguageDropdown } from './LanguageDropdown'
import MobileMenu from './MobileMenu'

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
        className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium py-2"
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
  const { language, setLanguage } = useLanguage()
  const { replaceMainHeader } = useViziuneHeader()
  const location = useLocation()
  const isViziuneReplaced = location.pathname === '/companie/viziune' && replaceMainHeader
  const [diviziiOpen, setDiviziiOpen] = useState(false)
  const [companieOpen, setCompanieOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const t = getMenuTranslations(language.code)
  const diviziiItems = DIVIZII_PATHS.map(({ key, path }) => ({ label: t[key], path }))
  const companieItems = COMPANIE_PATHS.map(({ key, path }) => ({ label: t[key], path }))

  const closeDropdowns = () => {
    setDiviziiOpen(false)
    setCompanieOpen(false)
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
          <Link to="/" className="flex items-center flex-shrink-0" onClick={closeDropdowns} aria-label="Baterino Romania – home">
            <img src="/images/shared/baterino-logo-black.svg" alt="Baterino Romania" className="h-8 w-auto" />
          </Link>
          <nav className="hidden md:flex flex-1 justify-center items-center gap-6">
            <Link to="/produse" className="text-gray-700 hover:text-gray-900 font-medium" onClick={closeDropdowns}>{t.produse}</Link>
            <Link to="/reduceri" className="text-gray-700 hover:text-gray-900 font-medium" onClick={closeDropdowns}>{t.reduceri}</Link>
            <Link to="/siguranta" className="text-gray-700 hover:text-gray-900 font-medium" onClick={closeDropdowns}>{t.siguranta}</Link>
            <NavDropdown label={t.divizii} items={diviziiItems} isOpen={diviziiOpen} onToggle={() => { setDiviziiOpen(!diviziiOpen); setCompanieOpen(false); setLangOpen(false); }} />
            <Link to="/instalatori" className="text-gray-700 hover:text-gray-900 font-medium" onClick={closeDropdowns}>{t.instalatori}</Link>
            <NavDropdown label={t.companie} items={companieItems} isOpen={companieOpen} onToggle={() => { setCompanieOpen(!companieOpen); setDiviziiOpen(false); setLangOpen(false); }} />
          </nav>
          <div className="hidden md:flex items-center justify-end gap-2 flex-shrink-0 min-w-[120px]">
            <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium" onClick={closeDropdowns}>{t.login}</Link>
            <LanguageDropdown current={language} isOpen={langOpen} onToggle={() => { setLangOpen(!langOpen); setDiviziiOpen(false); setCompanieOpen(false); }} onSelect={setLanguage} />
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
