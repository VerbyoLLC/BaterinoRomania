import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAdminCompanyData, getAuthToken, type AdminCompanyData } from '../../lib/api'
import AdminBenefitsClientA4 from './AdminBenefitsClientA4'
import AdminBenefitsPartnerA4 from './AdminBenefitsPartnerA4'

const labelClass = "block text-xs font-medium font-['Inter'] text-slate-700 mb-1"
const selectClass =
  "w-full min-h-[40px] cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-sm font-['Inter'] text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900"

type BenefitsTemplateId = 'client' | 'partner'

const TEMPLATE_OPTIONS: { id: BenefitsTemplateId; label: string; description: string }[] = [
  {
    id: 'client',
    label: 'Șablon 1 — Client',
    description: 'Beneficii Baterino pentru clienți finali (program reduceri, garanție, SWAP, retur etc.).',
  },
  {
    id: 'partner',
    label: 'Șablon 2 — Parteneri',
    description: 'Beneficii Baterino pentru parteneri B2B (marje, lead-uri, service, garanție gestionată etc.).',
  },
]

export default function AdminOffersBenefitsTemplates() {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState<BenefitsTemplateId>('client')
  const [company, setCompany] = useState<AdminCompanyData | null>(null)
  const [companyLoading, setCompanyLoading] = useState(true)

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    let cancelled = false
    setCompanyLoading(true)
    getAdminCompanyData()
      .then((c) => {
        if (!cancelled) setCompany(c)
      })
      .catch(() => {
        if (!cancelled) setCompany(null)
      })
      .finally(() => {
        if (!cancelled) setCompanyLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const active = TEMPLATE_OPTIONS.find((o) => o.id === selectedTemplate) ?? TEMPLATE_OPTIONS[0]

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-6xl">
      <Link
        to="/admin/setari/sabloane"
        className="text-sm font-medium text-slate-600 hover:text-slate-900 font-['Inter']"
      >
        ← Înapoi la șabloane
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Șabloane beneficii</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8 max-w-3xl">
        Alege șablonul de beneficii atașat ofertelor comerciale: variantă pentru clienți sau pentru parteneri.
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <div className="max-w-2xl">
          <label htmlFor="benefits-template-select" className={labelClass}>
            Șablon
          </label>
          <select
            id="benefits-template-select"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value as BenefitsTemplateId)}
            className={selectClass}
          >
            {TEMPLATE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-8">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 font-['Inter'] mb-4">
            Previzualizare — {active.label}
          </p>

          {companyLoading ? (
            <p className="text-sm text-slate-500 font-['Inter'] py-8 text-center">Se încarcă datele companiei…</p>
          ) : (
            <div className="-mx-2 overflow-x-auto px-2 pb-2 sm:mx-0 sm:overflow-x-visible sm:px-0">
              {selectedTemplate === 'client' ? (
                <AdminBenefitsClientA4 company={company} />
              ) : (
                <AdminBenefitsPartnerA4 company={company} />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
