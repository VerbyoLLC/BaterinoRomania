import { useEffect, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuthToken } from '../../lib/api'

type TemplateBox = {
  to: string
  title: string
  description: string
  icon: ReactNode
}

const TEMPLATE_BOXES: TemplateBox[] = [
  {
    to: '/admin/oferte/sabloane',
    title: 'Șabloane produse',
    description: 'Fișe tehnice A4 per model — previzualizare și generare broșură PDF în R2.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 8l10 5 10-5-10-5zM2 13l10 5 10-5M2 18l10 5 10-5" />
      </svg>
    ),
  },
  {
    to: '/admin/oferte/sabloane-beneficii',
    title: 'Șabloane beneficii',
    description: 'Pagini A4 cu beneficii Baterino pentru clienți sau parteneri, atașate ofertelor.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    to: '/admin/setari/sabloane-proforma',
    title: 'Șabloane proforma',
    description: 'Șablon HTML proforma pentru comenzi — previzualizare cu date exemplu din firmă.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4h4" />
      </svg>
    ),
  },
  {
    to: '/admin/warranty-certificate-preview',
    title: 'Certificat garanție',
    description: 'Șablon PDF certificat de garanție — previzualizare câmpuri și surse de date.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3l8 3v6c0 4.5-3.2 8.4-8 9-4.8-.6-8-4.5-8-9V6l8-3z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
]

export default function AdminTemplatesHub() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])

  return (
    <div className="max-w-6xl p-6 sm:p-8 lg:p-10">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Șabloane</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8 max-w-2xl">
        Șabloane documente folosite la oferte comerciale, comenzi, garanție și comunicare cu clienții. Alege
        tipul de șablon de configurat.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {TEMPLATE_BOXES.map((box) => (
          <Link
            key={box.to}
            to={box.to}
            className="group flex min-h-[200px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-200">
              {box.icon}
            </div>
            <h2 className="mt-5 text-base font-semibold font-['Inter'] text-slate-900">{box.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 font-['Inter']">{box.description}</p>
            <span className="mt-4 text-sm font-medium text-slate-700 font-['Inter'] group-hover:text-slate-900">
              Deschide →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
