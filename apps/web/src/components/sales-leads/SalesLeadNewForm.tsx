import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import {
  getSalesAgentLeadNewTranslations,
  getSalesAgentLeadsTranslations,
  LEAD_CUSTOMER_TYPE_OPTIONS,
  LEAD_MONTHLY_VOLUME_OPTIONS,
  LEAD_PRODUCT_LINE_OPTIONS,
  LEAD_SOURCE_VALUES,
  leadSourceLabel,
  type SalesAgentLeadNewTranslations,
  type SalesAgentLeadsTranslations,
} from '../../i18n/sales-agent'
import type { CreateSalesLeadPayload } from '../../lib/api'
import {
  sanitizeEmailTyping,
  sanitizePersonName,
  sanitizePhonePlusOnly,
} from '../../lib/formInputSanitize'

const inputClass =
  "w-full min-h-[40px] rounded-lg border border-zinc-200 px-3 text-sm font-['Inter'] text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900"
const textareaClass =
  "w-full min-h-[96px] rounded-lg border border-zinc-200 px-3 py-2 text-sm font-['Inter'] text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y"
const labelClass = "block text-xs font-medium font-['Inter'] text-slate-700 mb-1"
const sectionTitleClass = "text-sm font-semibold font-['Inter'] text-slate-900 pt-1"

export type SalesLeadNewFormProps = {
  tr: SalesAgentLeadNewTranslations
  trLeads: SalesAgentLeadsTranslations
  backHref: string
  leadsHref: string
  onSave: (payload: CreateSalesLeadPayload) => Promise<void>
  className?: string
}

export function SalesLeadNewForm({ tr, trLeads, backHref, leadsHref, onSave, className = '' }: SalesLeadNewFormProps) {
  const toast = useToast()
  const [customerType, setCustomerType] = useState('')
  const [productLine, setProductLine] = useState('')
  const [monthlyVolume, setMonthlyVolume] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [workEmail, setWorkEmail] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [country, setCountry] = useState('')
  const [website, setWebsite] = useState('')
  const [source, setSource] = useState<string>('Manual')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error(tr.nameRequired)
      return
    }
    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        source: source.trim() || 'Manual',
        customerType: customerType.trim(),
        productLine: productLine.trim(),
        monthlyVolume: monthlyVolume.trim(),
        whatsapp: whatsapp.trim(),
        message: message.trim(),
        companyName: companyName.trim(),
        workEmail: workEmail.trim(),
        jobTitle: jobTitle.trim(),
        country: country.trim(),
        website: website.trim(),
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tr.saveError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <Link
          to={backHref}
          className="text-sm font-medium text-[#1e46b4] hover:text-[#163899] font-['Inter']"
        >
          {tr.backToLeads}
        </Link>
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mt-3 mb-2">{tr.title}</h1>
        <p className="text-sm text-slate-600 font-['Inter']">{tr.subtitle}</p>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 space-y-6"
      >
        <div className="space-y-4">
          <h2 className={sectionTitleClass}>{tr.sectionQualification}</h2>

          <div>
            <label htmlFor="lead-customer-type" className={labelClass}>
              {tr.customerTypeLabel}
            </label>
            <select
              id="lead-customer-type"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              className={inputClass}
            >
              <option value="">{tr.selectPlaceholder}</option>
              {LEAD_CUSTOMER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {tr[opt.key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="lead-product-line" className={labelClass}>
              {tr.productLineLabel}
            </label>
            <select
              id="lead-product-line"
              value={productLine}
              onChange={(e) => setProductLine(e.target.value)}
              className={inputClass}
            >
              <option value="">{tr.selectPlaceholder}</option>
              {LEAD_PRODUCT_LINE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {tr[opt.key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="lead-monthly-volume" className={labelClass}>
              {tr.monthlyVolumeLabel}
            </label>
            <select
              id="lead-monthly-volume"
              value={monthlyVolume}
              onChange={(e) => setMonthlyVolume(e.target.value)}
              className={inputClass}
            >
              <option value="">{tr.selectPlaceholder}</option>
              {LEAD_MONTHLY_VOLUME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {tr[opt.key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-6">
          <h2 className={sectionTitleClass}>{tr.sectionContact}</h2>

          <div>
            <label htmlFor="lead-name" className={labelClass}>
              {tr.fullNameLabel} <span className="text-red-600">*</span>
            </label>
            <input
              id="lead-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(sanitizePersonName(e.target.value))}
              className={inputClass}
              placeholder={tr.placeholderFullName}
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-email" className={labelClass}>
                {tr.emailLabel}
              </label>
              <input
                id="lead-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(sanitizeEmailTyping(e.target.value))}
                className={inputClass}
                placeholder={tr.placeholderEmail}
              />
            </div>
            <div>
              <label htmlFor="lead-work-email" className={labelClass}>
                {tr.workEmailLabel}
              </label>
              <input
                id="lead-work-email"
                type="email"
                value={workEmail}
                onChange={(e) => setWorkEmail(sanitizeEmailTyping(e.target.value))}
                className={inputClass}
                placeholder={tr.placeholderWorkEmail}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-phone" className={labelClass}>
                {tr.phoneLabel}
              </label>
              <input
                id="lead-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(sanitizePhonePlusOnly(e.target.value))}
                className={inputClass}
                placeholder={tr.placeholderPhone}
              />
            </div>
            <div>
              <label htmlFor="lead-whatsapp" className={labelClass}>
                {tr.whatsappLabel}
              </label>
              <input
                id="lead-whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(sanitizePhonePlusOnly(e.target.value))}
                className={inputClass}
                placeholder={tr.placeholderPhone}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-6">
          <h2 className={sectionTitleClass}>{tr.sectionCompany}</h2>

          <div>
            <label htmlFor="lead-company" className={labelClass}>
              {tr.companyNameLabel}
            </label>
            <input
              id="lead-company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value.slice(0, 200))}
              className={inputClass}
              placeholder={tr.placeholderCompany}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-job-title" className={labelClass}>
                {tr.jobTitleLabel}
              </label>
              <input
                id="lead-job-title"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value.slice(0, 120))}
                className={inputClass}
                placeholder={tr.placeholderJobTitle}
              />
            </div>
            <div>
              <label htmlFor="lead-country" className={labelClass}>
                {tr.countryLabel}
              </label>
              <input
                id="lead-country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value.slice(0, 80))}
                className={inputClass}
                placeholder={tr.placeholderCountry}
              />
            </div>
          </div>

          <div>
            <label htmlFor="lead-website" className={labelClass}>
              {tr.websiteLabel}
            </label>
            <input
              id="lead-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value.slice(0, 500))}
              className={inputClass}
              placeholder={tr.placeholderWebsite}
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-6">
          <h2 className={sectionTitleClass}>{tr.sectionDetails}</h2>

          <div>
            <label htmlFor="lead-message" className={labelClass}>
              {tr.messageLabel}
            </label>
            <textarea
              id="lead-message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 4000))}
              className={textareaClass}
              placeholder={tr.placeholderMessage}
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="lead-source" className={labelClass}>
              {tr.sourceLabel}
            </label>
            <select
              id="lead-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={inputClass}
            >
              {LEAD_SOURCE_VALUES.map((opt) => (
                <option key={opt} value={opt}>
                  {leadSourceLabel(trLeads, opt)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-[#1e46b4] px-5 py-2.5 text-sm font-semibold font-['Inter'] text-white shadow-sm hover:bg-[#163899] disabled:opacity-60"
          >
            {saving ? tr.savingButton : tr.saveButton}
          </button>
          <Link
            to={leadsHref}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold font-['Inter'] text-slate-800 hover:bg-slate-50"
          >
            {tr.cancelButton}
          </Link>
        </div>
      </form>
    </div>
  )
}

export { getSalesAgentLeadNewTranslations, getSalesAgentLeadsTranslations }
