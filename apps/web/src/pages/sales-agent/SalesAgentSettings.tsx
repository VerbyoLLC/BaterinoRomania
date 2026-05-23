import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useToast } from '../../contexts/ToastContext'
import {
  getSalesAgentSettingsTranslations,
  salesAgentSectorLabel,
  SALES_AGENT_SECTOR_VALUES,
  type SalesAgentSectorValue,
} from '../../i18n/sales-agent'
import {
  getSalesAgentMe,
  updateSalesAgentProfile,
  type AdminSalesAgent,
} from '../../lib/api'
import { sanitizeEmailTyping } from '../../lib/formInputSanitize'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../../lib/romanian-counties-cities'

const inputClass =
  "w-full min-h-[44px] rounded-lg border border-zinc-200 px-3 text-sm font-['Inter'] text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900"
const labelClass = "block text-xs font-medium font-['Inter'] text-slate-700 mb-1"

function filterNameChars(raw: string): string {
  return raw.replace(/[^\p{L}\s'.-]/gu, '')
}

function filterDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 15)
}

function agentToForm(agent: AdminSalesAgent) {
  return {
    lastName: agent.lastName ?? '',
    firstName: agent.firstName ?? '',
    phone: agent.phone ?? '',
    whatsapp: agent.whatsapp ?? '',
    email: agent.email ?? '',
    program: agent.program ?? '',
    county: agent.county ?? '',
    city: agent.city ?? '',
    sector: (SALES_AGENT_SECTOR_VALUES.includes(agent.sector as SalesAgentSectorValue)
      ? agent.sector
      : 'Toate') as SalesAgentSectorValue,
  }
}

export default function SalesAgentSettings() {
  const { language } = useLanguage()
  const toast = useToast()
  const tr = getSalesAgentSettingsTranslations(language.code)
  const [loginEmail, setLoginEmail] = useState('')
  const [form, setForm] = useState(agentToForm({
    id: '',
    lastName: '',
    firstName: '',
    phone: '',
    whatsapp: '',
    email: '',
    program: '',
    county: '',
    city: '',
    sector: 'Toate',
    agentKind: 'human',
    isSuspended: false,
    createdAt: '',
    updatedAt: '',
  }))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasAgent, setHasAgent] = useState(false)
  const [suspended, setSuspended] = useState(false)

  const cityOptions = useMemo(() => {
    if (!form.county) return []
    return getCitiesForCounty(form.county)
  }, [form.county])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getSalesAgentMe()
      .then((data) => {
        if (cancelled) return
        setLoginEmail(data.user.email ?? '')
        if (data.agent) {
          setHasAgent(true)
          setSuspended(data.agent.isSuspended === true)
          setForm(agentToForm(data.agent))
        } else {
          setHasAgent(false)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) toast.error(e instanceof Error ? e.message : tr.loadError)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tr.loadError, toast])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateSalesAgentProfile(form)
      if (updated.agent) {
        setForm(agentToForm(updated.agent))
      }
      toast.success(tr.saveSuccess)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tr.saveError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pt-2 px-6 pb-6 sm:pt-4 sm:px-8 sm:pb-8 lg:pt-6 lg:px-10 lg:pb-10 max-w-2xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">{tr.title}</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">{tr.subtitle}</p>

      {loading ? (
        <p className="text-sm text-slate-500 font-['Inter']" aria-busy>
          {tr.loading}
        </p>
      ) : null}

      {!loading && !hasAgent ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 font-['Inter']">
          {tr.notLinkedBody}
        </div>
      ) : null}

      {!loading && hasAgent && suspended ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
          {tr.suspendedBody}
        </div>
      ) : null}

      {!loading && hasAgent && !suspended ? (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 space-y-6"
        >
          <h2 className="text-lg font-bold font-['Inter'] text-slate-900">{tr.sectionProfile}</h2>

          <div>
            <label htmlFor="agent-login-email" className={labelClass}>
              {tr.loginEmailLabel}
            </label>
            <p className="mb-1.5 text-xs text-slate-500 font-['Inter']">{tr.loginEmailHint}</p>
            <input
              id="agent-login-email"
              type="email"
              readOnly
              value={loginEmail}
              className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-600`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="agent-last-name" className={labelClass}>
                {tr.fieldLastName} <span className="text-red-600">*</span>
              </label>
              <input
                id="agent-last-name"
                required
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: filterNameChars(e.target.value) }))}
                className={inputClass}
                placeholder={tr.placeholderLastName}
              />
            </div>
            <div>
              <label htmlFor="agent-first-name" className={labelClass}>
                {tr.fieldFirstName} <span className="text-red-600">*</span>
              </label>
              <input
                id="agent-first-name"
                required
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: filterNameChars(e.target.value) }))}
                className={inputClass}
                placeholder={tr.placeholderFirstName}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="agent-phone" className={labelClass}>
                {tr.fieldPhone} <span className="text-red-600">*</span>
              </label>
              <input
                id="agent-phone"
                required
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: filterDigits(e.target.value) }))}
                className={inputClass}
                placeholder={tr.placeholderPhone}
              />
            </div>
            <div>
              <label htmlFor="agent-whatsapp" className={labelClass}>
                {tr.fieldWhatsapp} <span className="text-red-600">*</span>
              </label>
              <input
                id="agent-whatsapp"
                required
                inputMode="numeric"
                value={form.whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: filterDigits(e.target.value) }))}
                className={inputClass}
                placeholder={tr.placeholderWhatsapp}
              />
            </div>
          </div>

          <div>
            <label htmlFor="agent-email" className={labelClass}>
              {tr.fieldEmail} <span className="text-red-600">*</span>
            </label>
            <input
              id="agent-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: sanitizeEmailTyping(e.target.value) }))}
              className={inputClass}
              placeholder={tr.placeholderEmail}
            />
          </div>

          <div>
            <label htmlFor="agent-program" className={labelClass}>
              {tr.fieldProgram} <span className="text-red-600">*</span>
            </label>
            <input
              id="agent-program"
              required
              value={form.program}
              onChange={(e) => setForm((f) => ({ ...f, program: e.target.value.slice(0, 512) }))}
              className={inputClass}
              placeholder={tr.placeholderProgram}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="agent-county" className={labelClass}>
                {tr.fieldCounty} <span className="text-red-600">*</span>
              </label>
              <select
                id="agent-county"
                required
                value={form.county}
                onChange={(e) => {
                  const county = e.target.value
                  setForm((f) => ({ ...f, county, city: '' }))
                }}
                className={inputClass}
              >
                <option value="">{tr.selectCounty}</option>
                {ROMANIAN_COUNTIES.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="agent-city" className={labelClass}>
                {tr.fieldCity} <span className="text-red-600">*</span>
              </label>
              <select
                id="agent-city"
                required
                value={form.city}
                disabled={!form.county}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className={inputClass}
              >
                <option value="">{tr.selectCity}</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="agent-sector" className={labelClass}>
              {tr.fieldSector} <span className="text-red-600">*</span>
            </label>
            <select
              id="agent-sector"
              required
              value={form.sector}
              onChange={(e) =>
                setForm((f) => ({ ...f, sector: e.target.value as SalesAgentSectorValue }))
              }
              className={inputClass}
            >
              {SALES_AGENT_SECTOR_VALUES.map((sector) => (
                <option key={sector} value={sector}>
                  {salesAgentSectorLabel(tr, sector)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-[#1e46b4] px-5 py-2.5 text-sm font-semibold font-['Inter'] text-white shadow-sm hover:bg-[#163899] disabled:opacity-60"
          >
            {saving ? tr.savingButton : tr.saveButton}
          </button>
        </form>
      ) : null}
    </div>
  )
}
