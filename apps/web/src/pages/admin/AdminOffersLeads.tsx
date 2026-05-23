import { Link } from 'react-router-dom'
import { SalesLeadsTable } from '../../components/sales-leads/SalesLeadsTable'
import { getSalesAgentLeadsTranslations } from '../../i18n/sales-agent'

const tr = {
  ...getSalesAgentLeadsTranslations('ro'),
  emptyState: 'Nu există leads încă. Apasă „Lead nou” pentru a adăuga primul contact.',
}

export default function AdminOffersLeads() {
  return (
    <div className="box-border w-full min-w-0 shrink max-w-full p-6 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Leads</h1>
          <p className="text-sm text-slate-600 font-['Inter'] max-w-3xl">
            Potențiali clienți și solicitări de ofertă — urmărește contactele înainte de a converti în ofertă
            comercială.
          </p>
        </div>
        <Link
          to="/admin/oferte/leads/nou"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#1e46b4] px-4 py-2.5 text-sm font-semibold font-['Inter'] text-white shadow-sm hover:bg-[#163899]"
        >
          Lead nou
        </Link>
      </div>

      <SalesLeadsTable audience="admin" tr={tr} langCode="ro" />
    </div>
  )
}
