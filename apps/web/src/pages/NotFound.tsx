import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { useLanguage } from '../contexts/LanguageContext'

const COPY = {
  ro: {
    title: 'Pagina nu a fost găsită',
    heading: 'Pagina nu a fost găsită',
    body: 'Ne pare rău, pagina pe care o cauți nu există sau a fost mutată.',
    home: 'Înapoi la pagina principală',
    products: 'Vezi produsele',
  },
  en: {
    title: 'Page not found',
    heading: 'Page not found',
    body: 'Sorry, the page you are looking for does not exist or has been moved.',
    home: 'Back to homepage',
    products: 'Browse products',
  },
} as const

export default function NotFound() {
  const { language } = useLanguage()
  const t = language.code === 'en' ? COPY.en : COPY.ro

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-20">
      <SEO title={t.title} description={t.body} noIndex />
      <div className="text-center max-w-md">
        <p className="text-6xl font-extrabold text-slate-900 font-['Inter']">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 font-['Inter']">{t.heading}</h1>
        <p className="mt-3 text-slate-600">{t.body}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            {t.home}
          </Link>
          <Link
            to="/produse"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-slate-900 font-semibold hover:bg-slate-50 transition-colors"
          >
            {t.products}
          </Link>
        </div>
      </div>
    </main>
  )
}
