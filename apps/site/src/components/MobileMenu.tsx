'use client'

import { useState, useEffect } from 'react'
import { Bell, Gift, LogOut, Package, ReceiptText, Settings, ShieldCheck, UserRound, BadgePercent } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getMenuTranslations } from '../i18n/menu'
import { LANGUAGES } from '../i18n/menu'
import { clearAuth, getAuthEmail, getAuthRole } from '../lib/api'

const DIVIZII_SUBMENU_ITEMS = [
  { key: 'rezidential', path: '/divizii/rezidential', subtitleKey: 'divRezSubtitle' as const },
  { key: 'industrial', path: '/divizii/industrial', subtitleKey: 'divIndSubtitle' as const },
  { key: 'medical', path: '/divizii/medical', subtitleKey: 'divIndSubtitle' as const },
  { key: 'maritim', path: '/divizii/maritim', subtitleKey: 'divIndSubtitle' as const },
]

const PRODUCTS_SUBMENU_ITEMS = [
  { key: 'rezidential', path: '/produse', sectorFilter: 'rezidential' as const, image: '/images/menu/rezidential-icon.webp', subtypeKey: 'prodRezSubtype' as const },
  { key: 'industrial', path: '/produse', sectorFilter: 'industrial' as const, image: '/images/menu/industrial-icon.webp', subtypeKey: 'prodHighVoltage' as const },
  { key: 'medical', path: '/produse', sectorFilter: 'medical' as const, image: '/images/menu/medical-icon.webp', subtypeKey: 'prodHighVoltage' as const },
  { key: 'maritim', path: '/produse', sectorFilter: 'maritim' as const, image: '/images/menu/maritim-icon.webp', subtypeKey: 'prodHighVoltage' as const },
]

const COMPANIE_SUBMENU_ITEMS = [
  { key: 'viziune', path: '/companie/viziune', subtitleKey: 'compViziuneSubtitle' as const },
  { key: 'lithtech', path: '/parteneriat-strategic-lithtech-baterino', subtitleKey: 'compLithtechSubtitle' as const },
  { key: 'blog', path: '/blog', subtitleKey: 'compBlogSubtitle' as const },
  { key: 'siguranta', path: '/siguranta', subtitleKey: 'mainSigurantaSubtitle' as const },
  { key: 'contact', path: '/contact', subtitleKey: 'compContactSubtitle' as const },
]

const LOGIN_SUBMENU_ITEMS = [
  { titleKey: 'loginCreateAccount' as const, path: '/signup/clienti', subtitleKey: 'loginSubtitle' as const },
  { titleKey: 'loginSignIn' as const, path: '/login', subtitleKey: 'loginSubtitle' as const },
]

function CloseIcon() {
  return (
    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

type LanguageEntry = (typeof LANGUAGES)[number]

/** Cross-app links use plain <a> — see Header.tsx for why. */
export default function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { language, setLanguage } = useLanguage()
  const t = getMenuTranslations(language.code)
  const [authRole, setAuthRole] = useState<'admin' | 'client' | 'partener' | 'sales_agent' | null>(null)
  const [authEmail, setAuthEmail] = useState<string | null>(null)
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
  const [showProductsPage, setShowProductsPage] = useState(false)
  const [showDiviziiPage, setShowDiviziiPage] = useState(false)
  const [showCompaniePage, setShowCompaniePage] = useState(false)
  const [showLangPage, setShowLangPage] = useState(false)
  const [showLoginPage, setShowLoginPage] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      const top = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (top) window.scrollTo(0, -parseInt(top, 10))
    }
    return () => {
      const top = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (top) window.scrollTo(0, -parseInt(top, 10))
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setShowProductsPage(false)
      setShowDiviziiPage(false)
      setShowCompaniePage(false)
      setShowLangPage(false)
      setShowLoginPage(false)
    }
  }, [isOpen])

  const handleLinkClick = () => {
    onClose()
    setShowProductsPage(false)
    setShowDiviziiPage(false)
    setShowCompaniePage(false)
    setShowLangPage(false)
    setShowLoginPage(false)
  }

  const handleLangSelect = (lang: LanguageEntry) => {
    setLanguage(lang)
    setShowLangPage(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel – full width, visible on all mobile resolutions */}
      <aside
        className={`fixed top-0 left-0 right-0 bottom-0 w-full h-[100dvh] min-h-[100vh] max-h-[100dvh] bg-white z-50 shadow-xl transition-transform duration-300 ease-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
        aria-modal="true"
        aria-label="Menu"
      >
        {/* Fixed header – powered by + close */}
        <div className="flex items-center justify-between h-14 px-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 text-xs font-normal font-['Nunito_Sans'] leading-9">powered by</span>
            <img src="/images/menu/lithtech.webp" alt="LithTech" className="w-36 h-6 object-contain" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable content – fills remaining space, scrolls on all mobile resolutions */}
        <div
          className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' } as React.CSSProperties}
        >
          {showLoginPage ? (
            <div className="pt-4">
              <button type="button" onClick={() => setShowLoginPage(false)} className="flex items-center gap-2 w-full text-left text-black text-xl font-bold font-['Inter'] leading-8 mb-6 hover:text-gray-700">
                <BackIcon />
                {t.back}
              </button>
              <div className="space-y-6">
                {LOGIN_SUBMENU_ITEMS.map((item) => (
                  <a key={item.path} href={item.path} className="flex items-center justify-between w-full py-3 border-b border-gray-100 last:border-0" onClick={handleLinkClick}>
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t[item.titleKey]}</p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t[item.subtitleKey]}</p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          ) : showLangPage ? (
            <div className="pt-4">
              <button type="button" onClick={() => setShowLangPage(false)} className="flex items-center gap-2 w-full text-left text-black text-xl font-bold font-['Inter'] leading-8 mb-6 hover:text-gray-700">
                <BackIcon />
                {t.back}
              </button>
              <div className="space-y-6">
                {LANGUAGES.map((lang) => (
                  <button key={lang.code} type="button" onClick={() => handleLangSelect(lang)} className="flex items-center justify-between w-full py-3 border-b border-gray-100 last:border-0 text-left">
                    <span className="text-black text-xl font-bold font-['Inter'] leading-8">{lang.menuLabel}</span>
                    {language.code === lang.code ? (
                      <img src="/images/menu/check.svg" alt="" className="size-6 flex-shrink-0" />
                    ) : (
                      <span className="size-6 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : showCompaniePage ? (
            <div className="pt-4">
              <button type="button" onClick={() => setShowCompaniePage(false)} className="flex items-center gap-2 w-full text-left text-black text-xl font-bold font-['Inter'] leading-8 mb-6 hover:text-gray-700">
                <BackIcon />
                {t.back}
              </button>
              <div className="space-y-6">
                {COMPANIE_SUBMENU_ITEMS.map((item) => (
                  <a key={item.key} href={item.path} className="flex items-center justify-between w-full py-3 border-b border-gray-100 last:border-0" onClick={handleLinkClick}>
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t[item.key]}</p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t[item.subtitleKey]}</p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          ) : showDiviziiPage ? (
            <div className="pt-4">
              <button type="button" onClick={() => setShowDiviziiPage(false)} className="flex items-center gap-2 w-full text-left text-black text-xl font-bold font-['Inter'] leading-8 mb-6 hover:text-gray-700">
                <BackIcon />
                {t.back}
              </button>
              <div className="space-y-6">
                {DIVIZII_SUBMENU_ITEMS.map((item) => (
                  <a key={item.key} href={item.path} className="flex items-center justify-between w-full py-3 border-b border-gray-100 last:border-0" onClick={handleLinkClick}>
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t[item.key]}</p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t[item.subtitleKey]}</p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          ) : showProductsPage ? (
            <div className="pt-4">
              <button type="button" onClick={() => setShowProductsPage(false)} className="flex items-center gap-2 w-full text-left text-black text-xl font-bold font-['Inter'] leading-8 mb-6 hover:text-gray-700">
                <BackIcon />
                {t.back}
              </button>
              <div className="space-y-6">
                {PRODUCTS_SUBMENU_ITEMS.map((item) => (
                  <a key={item.key} href={`${item.path}?sector=${item.sectorFilter}`} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0" onClick={handleLinkClick}>
                    <img
                      src={item.image}
                      alt=""
                      className="w-14 h-16 object-contain flex-shrink-0 bg-neutral-50 rounded"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t[item.key]}</p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t[item.subtypeKey]}</p>
                    </div>
                    <ArrowRightIcon />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            /* ── Main menu ── */
            <div className="flex flex-col pt-2">
              {authRole === 'client' ? (
                <>
                  <a href="/client" className="flex items-center justify-between w-full py-3 border-b border-gray-100" onClick={handleLinkClick}>
                    <span className="flex items-center gap-3 text-black text-xl font-bold font-['Inter'] leading-8">
                      <UserRound className="size-6 text-gray-700" aria-hidden />
                      {t.accountMenuLabel}
                    </span>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                  <a href="/client/notificari" className="flex items-center justify-between w-full py-3 border-b border-gray-100" onClick={handleLinkClick}>
                    <span className="flex items-center gap-3 text-black text-xl font-bold font-['Inter'] leading-8">
                      <Bell className="size-6 text-gray-700" aria-hidden />
                      Notificări
                    </span>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                  <a href="/client/beneficii" className="flex items-center justify-between w-full py-3 border-b border-gray-100" onClick={handleLinkClick}>
                    <span className="flex items-center gap-3 text-black text-xl font-bold font-['Inter'] leading-8">
                      <Gift className="size-6 text-gray-700" aria-hidden />
                      Beneficii
                    </span>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                  <a href="/client/produse" className="flex items-center justify-between w-full py-3 border-b border-gray-100" onClick={handleLinkClick}>
                    <span className="flex items-center gap-3 text-black text-xl font-bold font-['Inter'] leading-8">
                      <Package className="size-6 text-gray-700" aria-hidden />
                      Produsele mele
                    </span>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                  <a href="/verificare-garantie" className="flex items-center justify-between w-full py-3 border-b border-gray-100" onClick={handleLinkClick}>
                    <span className="flex items-center gap-3 text-black text-xl font-bold font-['Inter'] leading-8">
                      <ShieldCheck className="size-6 text-gray-700" aria-hidden />
                      {t.verificareGarantie}
                    </span>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                  <a href="/client/comenzi" className="flex items-center justify-between w-full py-3 border-b border-gray-100" onClick={handleLinkClick}>
                    <span className="flex items-center gap-3 text-black text-xl font-bold font-['Inter'] leading-8">
                      <ReceiptText className="size-6 text-gray-700" aria-hidden />
                      Comenzile mele
                    </span>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                  <a href="/client/coduri-reducere" className="flex items-center justify-between w-full py-3 border-b border-gray-100" onClick={handleLinkClick}>
                    <span className="flex items-center gap-3 text-black text-xl font-bold font-['Inter'] leading-8">
                      <BadgePercent className="size-6 text-gray-700" aria-hidden />
                      Coduri reducere
                    </span>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                  <a href="/client/setari" className="flex items-center justify-between w-full py-3 border-b border-gray-100" onClick={handleLinkClick}>
                    <span className="flex items-center gap-3 text-black text-xl font-bold font-['Inter'] leading-8">
                      <Settings className="size-6 text-gray-700" aria-hidden />
                      Setări
                    </span>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setShowProductsPage(true)} className="flex items-center justify-between w-full py-3 border-b border-gray-100 text-left">
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.mainProduse}</p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainProduseSubtitle}</p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </button>
                  <a href="/reduceri" className="flex items-center justify-between w-full py-3 border-b border-gray-100" onClick={handleLinkClick}>
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.reduceri}</p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainReduceriSubtitle}</p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                  <a href="/studii-de-caz" className="flex items-center justify-between w-full py-3 border-b border-gray-100" onClick={handleLinkClick}>
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.studiiDeCaz}</p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainStudiiDeCazSubtitle}</p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                  <a href="/verificare-garantie" className="flex items-center justify-between w-full py-3 border-b border-gray-100" onClick={handleLinkClick}>
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.verificareGarantie}</p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainVerificareGarantieSubtitle}</p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                  <button type="button" onClick={() => setShowDiviziiPage(true)} className="flex items-center justify-between w-full py-3 border-b border-gray-100 text-left">
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.divizii}</p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainDiviziiSubtitle}</p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </button>
                  <a href="/instalatori" className="flex items-center justify-between w-full py-3 border-b border-gray-100" onClick={handleLinkClick}>
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.mainInstalatori}</p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainInstalatoriSubtitle}</p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </a>
                  <button type="button" onClick={() => setShowCompaniePage(true)} className="flex items-center justify-between w-full py-3 border-b border-gray-100 text-left">
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.companie}</p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainCompanieSubtitle}</p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </button>
                </>
              )}
              <div className="flex-1" />
              <div className="mt-6" />
              <button type="button" onClick={() => setShowLangPage(true)} className="flex items-center gap-3 w-full py-3 border-b border-gray-100 text-left">
                <img src="/images/menu/language.svg" alt="" className="size-7 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-black text-xl font-bold font-['Inter'] leading-8">{language.menuLabel}</p>
                  <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainLangSubtitle}</p>
                </div>
                <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
              </button>
              {authRole === 'client' ? (
                <div className="mt-2 border-t border-gray-200 pt-4 space-y-2">
                  {authEmail ? (
                    <p className="text-xs text-gray-500 font-['Inter'] px-1 truncate" title={authEmail}>
                      {authEmail}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className="flex items-center gap-3 w-full py-3 border-b border-gray-100 text-left"
                    onClick={() => {
                      clearAuth()
                      handleLinkClick()
                      window.location.href = '/login'
                    }}
                  >
                    <LogOut className="size-6 flex-shrink-0 text-gray-700" aria-hidden />
                    <span className="text-black text-xl font-bold font-['Inter'] leading-8">Deconectare</span>
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setShowLoginPage(true)} className="flex items-center gap-3 w-full py-3 border-b border-gray-100 text-left">
                  <img src="/images/menu/account.svg" alt="" className="size-7 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.mainLogin}</p>
                    <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainLoginSubtitle}</p>
                  </div>
                  <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
