import { useNavigate } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import { SalesLeadNewForm } from '../../components/sales-leads/SalesLeadNewForm'
import {
  getSalesAgentLeadNewTranslations,
  getSalesAgentLeadsTranslations,
} from '../../i18n/sales-agent'
import { createAdminLead } from '../../lib/api'

const tr = getSalesAgentLeadNewTranslations('ro')
const trLeads = getSalesAgentLeadsTranslations('ro')

export default function AdminOffersLeadNew() {
  const navigate = useNavigate()
  const toast = useToast()

  return (
    <SalesLeadNewForm
      className="p-6 sm:p-8 lg:p-10 max-w-2xl"
      tr={tr}
      trLeads={trLeads}
      backHref="/admin/oferte/leads"
      leadsHref="/admin/oferte/leads"
      onSave={async (payload) => {
        await createAdminLead(payload)
        toast.success(tr.saveSuccess)
        navigate('/admin/oferte/leads')
      }}
    />
  )
}
