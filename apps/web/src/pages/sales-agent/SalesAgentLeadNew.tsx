import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useToast } from '../../contexts/ToastContext'
import {
  getSalesAgentLeadNewTranslations,
  getSalesAgentLeadsTranslations,
} from '../../i18n/sales-agent'
import { SalesLeadNewForm } from '../../components/sales-leads/SalesLeadNewForm'
import { createSalesAgentLead } from '../../lib/api'

export default function SalesAgentLeadNew() {
  const navigate = useNavigate()
  const toast = useToast()
  const { language } = useLanguage()
  const tr = getSalesAgentLeadNewTranslations(language.code)
  const trLeads = getSalesAgentLeadsTranslations(language.code)

  return (
    <SalesLeadNewForm
      className="pt-2 px-6 pb-6 sm:pt-4 sm:px-8 sm:pb-8 lg:pt-6 lg:px-10 lg:pb-10 max-w-2xl"
      tr={tr}
      trLeads={trLeads}
      backHref="/sales-agent/leads"
      leadsHref="/sales-agent/leads"
      onSave={async (payload) => {
        await createSalesAgentLead(payload)
        toast.success(tr.saveSuccess)
        navigate('/sales-agent/leads')
      }}
    />
  )
}
