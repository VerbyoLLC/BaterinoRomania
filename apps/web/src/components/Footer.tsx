import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getFooterTranslations } from '../i18n/footer'

/* 16px on mobile for readability, 14px on desktop */
const linkClass =
  'text-gray-600 text-base md:text-sm font-medium leading-6 transition-colors hover:text-black hover:underline focus:outline-none focus:text-black'
/* 14px on mobile so headings stay readable */
const headingClass =
  'text-black text-sm md:text-xs font-bold uppercase tracking-wider mb-3'

function Footer() {
  const { language } = useLanguage()
  const t = getFooterTranslations(language.code)

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
              <Link to="/companie/viziune" className={linkClass}>{t.despreNoi}</Link>
              <Link to="/parteneriat-strategic-lithtech-baterino" className={linkClass}>{t.lithtech}</Link>
              <Link to="/suport" className={linkClass}>{t.suportClienti}</Link>
              <Link to="/cariere" className={linkClass}>{t.cariere}</Link>
            </nav>
          </div>
          {/* Column 3: Suport & Legal */}
          <div className="flex flex-col">
            <div className={headingClass}>{t.suportLegal}</div>
            <nav className="flex flex-col gap-2.5">
              <Link to="/siguranta" className={linkClass}>{t.sigurantaClientului}</Link>
              <Link to="/termeni-si-conditii" className={linkClass}>{t.termeniConditii}</Link>
              <Link to="/termeni-si-conditii-programe-de-reducere" className={linkClass}>{t.termeniReduceri}</Link>
              <Link to="/politica-confidentialitate" className={linkClass}>{t.politicaConfidentialitate}</Link>
            </nav>
          </div>
          {/* Column 4: Divizii */}
          <div className="flex flex-col">
            <div className={headingClass}>{t.divizii}</div>
            <nav className="flex flex-col gap-2.5">
              <Link to="/divizii/rezidential" className={linkClass}>{t.rezidential}</Link>
              <Link to="/divizii/industrial" className={linkClass}>{t.industrial}</Link>
              <Link to="/divizii/medical" className={linkClass}>{t.medical}</Link>
              <Link to="/divizii/maritim" className={linkClass}>{t.maritim}</Link>
            </nav>
          </div>
          {/* Column 5: Partneri */}
          <div className="flex flex-col">
            <div className={headingClass}>{t.partneri}</div>
            <nav className="flex flex-col gap-2.5">
              <Link to="/login" className={linkClass}>{t.clienti}</Link>
              <Link to="/instalatori" className={linkClass}>{t.instalatori}</Link>
              <Link to="/instalatori" className={linkClass}>{t.distribuitori}</Link>
              <Link to="/login?tab=partener" className={linkClass}>{t.centreMedicale}</Link>
            </nav>
          </div>
          {/* Column 6: Media */}
          <div className="flex flex-col">
            <div className={headingClass}>{t.media}</div>
            <div className="flex gap-3 mb-2">
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
              <Link
                to="/blog"
                className="size-9 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 transition-colors hover:bg-gray-300 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Blog"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                </svg>
              </Link>
            </div>
            <nav className="flex flex-col gap-2.5">
              <Link to="/blog" className={linkClass}>{t.presa}</Link>
              <Link to="/contact" className={linkClass}>{t.contact}</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
