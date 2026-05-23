import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { getSalesAgentLeadsTranslations } from '../../i18n/sales-agent'
import { SalesLeadsTable } from '../../components/sales-leads/SalesLeadsTable'

export default function SalesAgentLeads() {
  const { language } = useLanguage()
  const tr = getSalesAgentLeadsTranslations(language.code)

  return (
    <div className="pt-2 px-6 pb-6 sm:pt-4 sm:px-8 sm:pb-8 lg:pt-6 lg:px-10 lg:pb-10 w-full min-w-0 shrink max-w-full">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">{tr.title}</h1>
          <p className="text-sm text-slate-600 font-['Inter'] max-w-3xl">{tr.subtitle}</p>
        </div>
        <Link
          to="/sales-agent/leads/nou"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#1e46b4] px-4 py-2.5 text-sm font-semibold font-['Inter'] text-white shadow-sm hover:bg-[#163899]"
        >
          {tr.createLead}
        </Link>
      </div>

      <SalesLeadsTable audience="sales-agent" tr={tr} langCode={language.code} />
    </div>
  )
}
