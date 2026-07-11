'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getFooterTranslations } from '../i18n/footer'
import { getAuthRole } from '../lib/api'

const linkClass =
  'text-gray-600 text-base md:text-sm font-medium leading-6 transition-colors hover:text-black hover:underline focus:outline-none focus:text-black'
const headingClass =
  'text-black text-sm md:text-xs font-bold uppercase tracking-wider mb-3'

function FooterSocialLinks() {
  return (
    <div className="flex gap-2.5">
      <a
        href="https://www.facebook.com/baterino.ro/"
        target="_blank"
        rel="noopener noreferrer"
        className="size-9 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 transition-colors hover:bg-gray-300 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        aria-label="Facebook"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      <a
        href="https://www.linkedin.com/company/baterino-romania"
        target="_blank"
        rel="noopener noreferrer"
        className="size-9 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 transition-colors hover:bg-gray-300 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        aria-label="LinkedIn"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
      <a
        href="https://www.google.com/maps?cid=15926825830058361764"
        target="_blank"
        rel="noopener noreferrer"
        className="size-9 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 transition-colors hover:bg-gray-300 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        aria-label="Google Business Profile"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-5.395 11.52-12 0-.806-.078-1.594-.22-2.356L12.24 10.285z" />
        </svg>
      </a>
    </div>
  )
}

/** Cross-app links use plain <a> — see Header.tsx for why. */
function Footer() {
  const { language } = useLanguage()
  const t = getFooterTranslations(language.code)
  const [authRole, setAuthRole] = useState<'admin' | 'client' | 'partener' | 'sales_agent' | null>(null)
  useEffect(() => {
    const sync = () => setAuthRole(getAuthRole())
    sync()
    window.addEventListener('baterino-auth-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('baterino-auth-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  const isClient = authRole === 'client'

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6 lg:gap-10">
          {/* Column 1: BATERINO */}
          <div className="flex flex-col gap-3">
            <img
              src="/images/shared/baterino-logo-black.svg"
              alt="Baterino"
              className="w-32 h-6 object-contain object-left flex-shrink-0 opacity-90"
            />
            <FooterSocialLinks />
            <div className="h-px w-full max-w-[8rem] bg-gray-300" aria-hidden />
            <nav className="flex flex-col gap-2.5">
              <a href="https://baterino.com" target="_blank" rel="noopener noreferrer" className={linkClass}>{t.baterinoGlobal}</a>
              <a href="https://elarionglobal.com" target="_blank" rel="noopener noreferrer" className={linkClass}>{t.elarionGlobal}</a>
              <a href="https://www.ltc-energy.com/" target="_blank" rel="noopener noreferrer" className={linkClass}>LithTech</a>
            </nav>
          </div>
          {/* Column 2: Companie */}
          <div className="flex flex-col">
            <div className={headingClass}>{t.companie}</div>
            <nav className="flex flex-col gap-2.5">
              <a href="/companie/viziune" className={linkClass}>{t.despreNoi}</a>
              <a href="/cariere" className={linkClass}>{t.cariere}</a>
              <a href="/blog" className={linkClass}>{t.presa}</a>
              <a href="/studii-de-caz" className={linkClass}>{t.studiiDeCaz}</a>
              <a href="/contact" className={linkClass}>{t.contact}</a>
            </nav>
          </div>
          {/* Column 3: Suport */}
          <div className="flex flex-col">
            <div className={headingClass}>{t.suportLegal}</div>
            <nav className="flex flex-col gap-2.5">
              <a href="/verificare-garantie" className={linkClass}>{t.verificareGarantie}</a>
              <a href="/service-baterii-lithtech-romania" className={linkClass}>{t.serviceLithtech}</a>
              <a href="/returnare-produse" className={linkClass}>{t.returnareProduse}</a>
              <a href="/intrebari-frecvente" className={linkClass}>{t.intrebariFrecvente}</a>
              <a href="/suport" className={linkClass}>{t.suportClienti}</a>
            </nav>
          </div>
          {/* Column 4: Divizii */}
          <div className="flex flex-col">
            <div className={headingClass}>{t.divizii}</div>
            <nav className="flex flex-col gap-2.5">
              <a href="/divizii/rezidential" className={linkClass}>{t.rezidential}</a>
              <a href="/divizii/industrial" className={linkClass}>{t.industrial}</a>
              <a href="/divizii/medical" className={linkClass}>{t.medical}</a>
              <a href="/divizii/maritim" className={linkClass}>{t.maritim}</a>
            </nav>
          </div>
          {/* Column 5: Parteneri */}
          <div className="flex flex-col">
            <div className={headingClass}>{t.partneri}</div>
            <nav className="flex flex-col gap-2.5">
              <a href="/login" className={linkClass}>{t.clienti}</a>
              {!isClient ? (
                <>
                  <a href="/instalatori" className={linkClass}>{t.instalatori}</a>
                  <a href="/instalatori" className={linkClass}>{t.distribuitori}</a>
                </>
              ) : null}
              <a href="/login?tab=partener" className={linkClass}>{t.centreMedicale}</a>
            </nav>
          </div>
          {/* Column 6: Legal & Social */}
          <div className="flex flex-col">
            <div className={headingClass}>{t.media}</div>
            <nav className="flex flex-col gap-2.5">
              <a href="/termeni-si-conditii" className={linkClass}>{t.termeniConditii}</a>
              <a href="/termeni-si-conditii-programe-de-reducere" className={linkClass}>{t.termeniReduceri}</a>
              <a href="/politica-confidentialitate" className={linkClass}>{t.politicaConfidentialitate}</a>
              <a href="/politica-de-retur" className={linkClass}>{t.politicaRetur}</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
