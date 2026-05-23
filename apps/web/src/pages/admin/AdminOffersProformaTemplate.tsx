import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE, getAuthToken } from '../../lib/api'

export default function AdminOffersProformaTemplate() {
  const navigate = useNavigate()

  const previewSrc = useMemo(() => `${API_BASE}/proforma-template`, [])

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to="/admin/setari/sabloane"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 font-['Inter']"
          >
            ← Înapoi la șabloane
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 font-['Inter'] sm:text-3xl">
            Șabloane proforma
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 font-['Inter']">
            Previzualizare șablon proforma (date exemplu din Date companie). PDF-ul este generat automat la
            plasarea comenzii.
          </p>
        </div>
        <a
          href={previewSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
        >
          Deschide în tab nou
        </a>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <iframe
          title="Previzualizare șablon proforma"
          src={previewSrc}
          className="block h-[min(1200px,85vh)] w-full border-0 bg-white"
          sandbox="allow-same-origin"
        />
      </section>
    </div>
  )
}
