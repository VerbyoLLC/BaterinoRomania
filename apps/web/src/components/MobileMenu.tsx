import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getMenuTranslations } from '../i18n/menu'
import { LANGUAGES } from '../i18n/menu'

const DIVIZII_SUBMENU_ITEMS = [
  { key: 'rezidential', path: '/divizii/rezidential', subtitleKey: 'divRezSubtitle' as const },
  { key: 'industrial', path: '/divizii/industrial', subtitleKey: 'divIndSubtitle' as const },
  { key: 'medical', path: '/divizii/medical', subtitleKey: 'divIndSubtitle' as const },
  { key: 'maritim', path: '/divizii/maritim', subtitleKey: 'divIndSubtitle' as const },
]

const PRODUCTS_SUBMENU_ITEMS = [
  { key: 'rezidential', path: '/produse', sectorFilter: 'rezidential' as const, image: '/images/menu/rezidential-icon.png', subtypeKey: 'prodRezSubtype' as const },
  { key: 'industrial', path: '/produse', sectorFilter: 'industrial' as const, image: '/images/menu/industrial-icon.png', subtypeKey: 'prodHighVoltage' as const },
  { key: 'medical', path: '/produse', sectorFilter: 'medical' as const, image: '/images/menu/medical-icon.png', subtypeKey: 'prodHighVoltage' as const },
  { key: 'maritim', path: '/produse', sectorFilter: 'maritim' as const, image: '/images/menu/maritim-icon.png', subtypeKey: 'prodHighVoltage' as const },
]

const COMPANIE_SUBMENU_ITEMS = [
  { key: 'viziune', path: '/companie/viziune', subtitleKey: 'compViziuneSubtitle' as const },
  { key: 'lithtech', path: '/parteneriat-strategic-lithtech-baterino', subtitleKey: 'compLithtechSubtitle' as const },
  { key: 'contact', path: '/companie', subtitleKey: 'compContactSubtitle' as const },
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

export default function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { language, setLanguage } = useLanguage()
  const t = getMenuTranslations(language.code)
  const [showProductsPage, setShowProductsPage] = useState(false)
  const [showDiviziiPage, setShowDiviziiPage] = useState(false)
  const [showCompaniePage, setShowCompaniePage] = useState(false)
  const [showLangPage, setShowLangPage] = useState(false)
  const [showLoginPage, setShowLoginPage] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
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

  const handleProductsClick = () => {
    setShowProductsPage(true)
  }

  const handleProductsBack = () => {
    setShowProductsPage(false)
  }

  const handleDiviziiClick = () => {
    setShowDiviziiPage(true)
  }

  const handleDiviziiBack = () => {
    setShowDiviziiPage(false)
  }

  const handleLangClick = () => {
    setShowLangPage(true)
  }

  const handleLangBack = () => {
    setShowLangPage(false)
  }

  const handleCompanieClick = () => {
    setShowCompaniePage(true)
  }

  const handleCompanieBack = () => {
    setShowCompaniePage(false)
  }

  const handleLoginClick = () => {
    setShowLoginPage(true)
  }

  const handleLoginBack = () => {
    setShowLoginPage(false)
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

      {/* Slide-in panel – full width, constrained to visible viewport */}
      <aside
        className={`fixed top-0 left-0 w-full max-h-[100dvh] h-[100dvh] bg-white z-50 shadow-xl transition-transform duration-300 ease-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-modal="true"
        aria-label="Menu"
      >
        {/* Fixed header – powered by + close */}
        <div className="flex items-center justify-between h-14 px-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 text-xs font-normal font-['Nunito_Sans'] leading-9">powered by</span>
            <img src="/images/menu/lithtech.png" alt="LithTech" className="w-36 h-6 object-contain" />
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

        {/* Scrollable content – fills remaining space, never exceeds viewport */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto pb-8 px-6 overscroll-contain">
          {showLoginPage ? (
            /* ── Login sub-page ── */
            <div className="pt-4">
              <button
                type="button"
                onClick={handleLoginBack}
                className="flex items-center gap-2 w-full text-left text-black text-xl font-bold font-['Inter'] leading-8 mb-6 hover:text-gray-700"
              >
                <BackIcon />
                {t.back}
              </button>

              <div className="space-y-6">
                {LOGIN_SUBMENU_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center justify-between w-full py-3 border-b border-gray-100 last:border-0"
                    onClick={handleLinkClick}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">
                        {t[item.titleKey]}
                      </p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">
                        {t[item.subtitleKey]}
                      </p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ) : showLangPage ? (
            /* ── Language sub-page ── */
            <div className="pt-4">
              <button
                type="button"
                onClick={handleLangBack}
                className="flex items-center gap-2 w-full text-left text-black text-xl font-bold font-['Inter'] leading-8 mb-6 hover:text-gray-700"
              >
                <BackIcon />
                {t.back}
              </button>

              <div className="space-y-6">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLangSelect(lang)}
                    className="flex items-center justify-between w-full py-3 border-b border-gray-100 last:border-0 text-left"
                  >
                    <span className="text-black text-xl font-bold font-['Inter'] leading-8">
                      {lang.menuLabel}
                    </span>
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
            /* ── Companie sub-page (no images, links to company pages) ── */
            <div className="pt-4">
              <button
                type="button"
                onClick={handleCompanieBack}
                className="flex items-center gap-2 w-full text-left text-black text-xl font-bold font-['Inter'] leading-8 mb-6 hover:text-gray-700"
              >
                <BackIcon />
                {t.back}
              </button>

              <div className="space-y-6">
                {COMPANIE_SUBMENU_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    to={item.path}
                    className="flex items-center justify-between w-full py-3 border-b border-gray-100 last:border-0"
                    onClick={handleLinkClick}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">
                        {t[item.key]}
                      </p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">
                        {t[item.subtitleKey]}
                      </p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ) : showDiviziiPage ? (
            /* ── Divizii sub-page (no images, links to division pages) ── */
            <div className="pt-4">
              <button
                type="button"
                onClick={handleDiviziiBack}
                className="flex items-center gap-2 w-full text-left text-black text-xl font-bold font-['Inter'] leading-8 mb-6 hover:text-gray-700"
              >
                <BackIcon />
                {t.back}
              </button>

              <div className="space-y-6">
                {DIVIZII_SUBMENU_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    to={item.path}
                    className="flex items-center justify-between w-full py-3 border-b border-gray-100 last:border-0"
                    onClick={handleLinkClick}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-xl font-bold font-['Inter'] leading-8">
                        {t[item.key]}
                      </p>
                      <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">
                        {t[item.subtitleKey]}
                      </p>
                    </div>
                    <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ) : showProductsPage ? (
            /* ── Products sub-page ── */
            <div className="pt-4">
              <button
                type="button"
                onClick={handleProductsBack}
                className="flex items-center gap-2 w-full text-left text-black text-xl font-bold font-['Inter'] leading-8 mb-6 hover:text-gray-700"
              >
                <BackIcon />
                {t.back}
              </button>

              <div className="space-y-6">
                {PRODUCTS_SUBMENU_ITEMS.map((item) => (
                    <Link
                      key={item.key}
                      to={`${item.path}?sector=${item.sectorFilter}`}
                      className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0"
                      onClick={handleLinkClick}
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="w-14 h-16 object-contain flex-shrink-0 bg-neutral-50 rounded"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-black text-xl font-bold font-['Inter'] leading-8">
                          {t[item.key]}
                        </p>
                        <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">
                          {t[item.subtypeKey]}
                        </p>
                      </div>
                      <ArrowRightIcon />
                    </Link>
                ))}
              </div>
            </div>
          ) : (
            /* ── Main menu ── */
            <div className="flex flex-col pt-2">
              {/* Produse – opens products sub-page */}
              <button
                type="button"
                onClick={handleProductsClick}
                className="flex items-center justify-between w-full py-3 border-b border-gray-100 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.mainProduse}</p>
                  <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainProduseSubtitle}</p>
                </div>
                <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
              </button>

              {/* Reduceri */}
              <Link
                to="/reduceri"
                className="flex items-center justify-between w-full py-3 border-b border-gray-100"
                onClick={handleLinkClick}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.reduceri}</p>
                  <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainReduceriSubtitle}</p>
                </div>
                <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
              </Link>

              {/* Siguranta */}
              <Link
                to="/siguranta"
                className="flex items-center justify-between w-full py-3 border-b border-gray-100"
                onClick={handleLinkClick}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.siguranta}</p>
                  <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainSigurantaSubtitle}</p>
                </div>
                <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
              </Link>

              {/* Divizii – opens sub-page */}
              <button
                type="button"
                onClick={handleDiviziiClick}
                className="flex items-center justify-between w-full py-3 border-b border-gray-100 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.divizii}</p>
                  <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainDiviziiSubtitle}</p>
                </div>
                <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
              </button>

              {/* Instalatori */}
              <Link
                to="/instalatori"
                className="flex items-center justify-between w-full py-3 border-b border-gray-100"
                onClick={handleLinkClick}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.mainInstalatori}</p>
                  <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainInstalatoriSubtitle}</p>
                </div>
                <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
              </Link>

              {/* Companie – opens sub-page */}
              <button
                type="button"
                onClick={handleCompanieClick}
                className="flex items-center justify-between w-full py-3 border-b border-gray-100 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.companie}</p>
                  <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainCompanieSubtitle}</p>
                </div>
                <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
              </button>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Gap between Companie and Language */}
              <div className="mt-6" />

              {/* Language – opens sub-page */}
              <button
                type="button"
                onClick={handleLangClick}
                className="flex items-center gap-3 w-full py-3 border-b border-gray-100 text-left"
              >
                <img src="/images/menu/language.svg" alt="" className="size-7 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-black text-xl font-bold font-['Inter'] leading-8">{language.menuLabel}</p>
                  <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainLangSubtitle}</p>
                </div>
                <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
              </button>

              {/* Login – opens sub-page */}
              <button
                type="button"
                onClick={handleLoginClick}
                className="flex items-center gap-3 w-full py-3 border-b border-gray-100 text-left"
              >
                <img src="/images/menu/account.svg" alt="" className="size-7 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-black text-xl font-bold font-['Inter'] leading-8">{t.mainLogin}</p>
                  <p className="text-black text-base font-medium font-['Inter'] leading-8 text-gray-600">{t.mainLoginSubtitle}</p>
                </div>
                <img src="/images/menu/Chevron%20Right.svg" alt="" className="size-6 flex-shrink-0" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
