import { useCallback, useEffect, useMemo, useRef, useState, type TransitionEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import {
  createAdminAgent,
  deleteAdminAgent,
  getAdminAgentPartners,
  getAdminAgents,
  getAdminCompany,
  getAuthToken,
  isPublicProfileComplete,
  suspendAdminAgent,
  updateAdminAgent,
  type AdminAgentPartnerCompany,
  type AdminCompany,
  type AdminSalesAgent,
  type SalesAgentKind,
} from '../../lib/api'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../../lib/romanian-counties-cities'

const AGENT_SECTORS = ['Toate', 'Industrial', 'Medical', 'Rezidential', 'Maritim'] as const
const AGENT_KIND_OPTIONS: { id: SalesAgentKind; label: string }[] = [
  { id: 'human', label: 'Uman' },
  { id: 'ai', label: 'AI' },
]

function agentKindLabel(kind: SalesAgentKind | string | undefined): string {
  return kind === 'ai' ? 'AI' : 'Uman'
}

function cell(s: string | null | undefined): string {
  const t = String(s ?? '').trim()
  return t || '—'
}

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function formatAssignedAgentLabel(agents: AdminSalesAgent[], id: string | null | undefined): string {
  if (!id) return '—'
  const a = agents.find((x) => x.id === id)
  if (!a) return id
  const label = [a.firstName, a.lastName].filter(Boolean).join(' ').trim()
  return label || id
}

/** Doar litere (Unicode), spații, cratimă, punct, apostrof — pentru nume/prenume. */
function filterNameChars(raw: string): string {
  return raw.replace(/[^\p{L}\s'.-]/gu, '')
}

function filterDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 15)
}

const emptyForm = () => ({
  lastName: '',
  firstName: '',
  phone: '',
  whatsapp: '',
  email: '',
  program: '',
  county: '' as string,
  city: '',
  sector: 'Toate' as (typeof AGENT_SECTORS)[number],
  agentKind: 'human' as SalesAgentKind,
})

export default function AdminAgents() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<AdminSalesAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<AdminSalesAgent | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [rowMenuId, setRowMenuId] = useState<string | null>(null)
  const [rowActionId, setRowActionId] = useState<string | null>(null)
  const rowMenuRef = useRef<HTMLDivElement | null>(null)

  const [partnersContext, setPartnersContext] = useState<AdminSalesAgent | null>(null)
  const [partnerRows, setPartnerRows] = useState<AdminAgentPartnerCompany[]>([])
  const [partnersLoading, setPartnersLoading] = useState(false)
  const [partnersError, setPartnersError] = useState<string | null>(null)

  const [partnerDetail, setPartnerDetail] = useState<AdminCompany | null>(null)
  const [isClosingPartnerPanel, setIsClosingPartnerPanel] = useState(false)
  const [partnerDetailLoading, setPartnerDetailLoading] = useState(false)
  const [partnerDetailError, setPartnerDetailError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!getAuthToken()) return
    setLoading(true)
    setError(null)
    getAdminAgents()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Eroare la încărcare.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    load()
  }, [navigate, load])

  const cityOptions = useMemo(() => {
    if (!form.county) return []
    return getCitiesForCounty(form.county)
  }, [form.county])

  const partnerPanelVisible =
    partnerDetailLoading ||
    partnerDetail !== null ||
    isClosingPartnerPanel ||
    partnerDetailError !== null

  const closePartnerCompanyPanel = useCallback(() => {
    setIsClosingPartnerPanel(true)
  }, [])

  const onPartnerPanelTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== 'transform') return
      if (isClosingPartnerPanel) {
        setPartnerDetail(null)
        setIsClosingPartnerPanel(false)
        setPartnerDetailLoading(false)
        setPartnerDetailError(null)
      }
    },
    [isClosingPartnerPanel],
  )

  const openPartnerCompanyPanel = useCallback((partnerId: string) => {
    setPartnerDetailError(null)
    setIsClosingPartnerPanel(false)
    setPartnerDetail(null)
    setPartnerDetailLoading(true)
    getAdminCompany(partnerId)
      .then(setPartnerDetail)
      .catch((e) => setPartnerDetailError(e instanceof Error ? e.message : 'Eroare la încărcare.'))
      .finally(() => setPartnerDetailLoading(false))
  }, [])

  useEffect(() => {
    if (!modalOpen && !partnersContext && !partnerPanelVisible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (partnerPanelVisible && !isClosingPartnerPanel) {
        closePartnerCompanyPanel()
        return
      }
      if (partnersContext) {
        setPartnersContext(null)
        return
      }
      if (modalOpen && !saving) {
        setModalOpen(false)
        setEditingAgent(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    modalOpen,
    saving,
    partnersContext,
    partnerPanelVisible,
    isClosingPartnerPanel,
    closePartnerCompanyPanel,
  ])

  useEffect(() => {
    if (!rowMenuId) return
    const onDoc = (e: MouseEvent) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node)) {
        setRowMenuId(null)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [rowMenuId])

  const openModal = () => {
    setEditingAgent(null)
    setForm(emptyForm())
    setFormError(null)
    setModalOpen(true)
  }

  const openEditModal = (a: AdminSalesAgent) => {
    setEditingAgent(a)
    setForm({
      lastName: a.lastName,
      firstName: a.firstName,
      phone: a.phone,
      whatsapp: a.whatsapp,
      email: a.email,
      program: a.program,
      county: a.county,
      city: a.city,
      sector: (AGENT_SECTORS.includes(a.sector as (typeof AGENT_SECTORS)[number])
        ? a.sector
        : 'Toate') as (typeof AGENT_SECTORS)[number],
      agentKind: a.agentKind === 'ai' ? 'ai' : 'human',
    })
    setFormError(null)
    setRowMenuId(null)
    setModalOpen(true)
  }

  const handleToggleSuspend = async (a: AdminSalesAgent) => {
    setRowMenuId(null)
    const next = !a.isSuspended
    const msg = next
      ? `Suspendați agentul ${[a.firstName, a.lastName].filter(Boolean).join(' ')}? Nu va mai putea fi atribuit partenerilor.`
      : `Reactivați agentul ${[a.firstName, a.lastName].filter(Boolean).join(' ')}?`
    if (!window.confirm(msg)) return
    setRowActionId(a.id)
    try {
      const updated = await suspendAdminAgent(a.id, next)
      setRows((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Eroare.')
    } finally {
      setRowActionId(null)
    }
  }

  const handleDeleteAgent = async (a: AdminSalesAgent) => {
    setRowMenuId(null)
    const label = [a.firstName, a.lastName].filter(Boolean).join(' ').trim() || a.email
    if (
      !window.confirm(
        `Ștergeți definitiv agentul „${label}”? Partenerii atribuiți nu vor mai avea agent în suport.`,
      )
    ) {
      return
    }
    setRowActionId(a.id)
    try {
      await deleteAdminAgent(a.id)
      setRows((prev) => prev.filter((x) => x.id !== a.id))
      if (partnersContext?.id === a.id) setPartnersContext(null)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Eroare la ștergere.')
    } finally {
      setRowActionId(null)
    }
  }

  const openPartnersModal = (a: AdminSalesAgent) => {
    setPartnersContext(a)
    setPartnerRows([])
    setPartnersError(null)
    setPartnersLoading(true)
    getAdminAgentPartners(a.id)
      .then(setPartnerRows)
      .catch((e) => setPartnersError(e instanceof Error ? e.message : 'Eroare la încărcare.'))
      .finally(() => setPartnersLoading(false))
  }

  const validateAndSubmit = async () => {
    const lastName = form.lastName.trim()
    const firstName = form.firstName.trim()
    const phone = filterDigits(form.phone)
    const whatsapp = filterDigits(form.whatsapp)
    const email = form.email.trim().toLowerCase()
    const program = form.program.trim()

    if (!lastName || !/^[\p{L}\s'.-]+$/u.test(lastName)) {
      setFormError('Nume: doar litere (și diacritice), spații, cratime.')
      return
    }
    if (!firstName || !/^[\p{L}\s'.-]+$/u.test(firstName)) {
      setFormError('Prenume: doar litere (și diacritice), spații, cratime.')
      return
    }
    if (phone.length < 9) {
      setFormError('Telefon: minim 9 cifre.')
      return
    }
    if (whatsapp.length < 9) {
      setFormError('WhatsApp: minim 9 cifre.')
      return
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Introduceți un email valid.')
      return
    }
    if (!program) {
      setFormError('Completați programul.')
      return
    }
    if (!form.county || !form.city) {
      setFormError('Selectați județ și oraș.')
      return
    }

    setFormError(null)
    setSaving(true)
    const payload = {
      lastName,
      firstName,
      phone,
      whatsapp,
      email,
      program,
      county: form.county,
      city: form.city,
      sector: form.sector,
      agentKind: form.agentKind,
    }
    try {
      if (editingAgent) {
        const updated = await updateAdminAgent(editingAgent.id, payload)
        setRows((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      } else {
        const created = await createAdminAgent(payload)
        setRows((prev) => [created, ...prev])
      }
      setModalOpen(false)
      setEditingAgent(null)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Eroare la salvare.')
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((a) => {
      const blob = [
        a.id,
        a.lastName,
        a.firstName,
        a.phone,
        a.whatsapp,
        a.email,
        a.program,
        a.county,
        a.city,
        a.sector,
        a.agentKind,
        a.isSuspended ? 'suspendat' : 'activ',
        a.partnerCount,
      ]
        .map((x) => String(x ?? '').toLowerCase())
        .join(' ')
      return blob.includes(q)
    })
  }, [rows, query])

  if (loading) {
    return (
      <div className="h-full flex flex-col p-6 sm:p-8 lg:p-10">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Agenți</h1>
        <p className="text-gray-500 text-sm font-['Inter'] mb-6">
          Listă agenți — date de contact și zonă de acoperire.
        </p>
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500 font-['Inter']">Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Agenți</h1>
        <p className="text-red-600 text-sm font-['Inter'] mb-4">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 font-['Inter']"
        >
          Reîncearcă
        </button>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col h-full min-h-0 p-4 sm:p-6 lg:p-8 ${
        partnerPanelVisible ? 'overflow-hidden' : ''
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900">Agenți</h1>
          <p className="text-gray-500 text-sm font-['Inter'] mt-1">
            {filtered.length} din {rows.length} înregistrări
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:items-center sm:justify-end sm:flex-1 sm:min-w-0">
          <label className="block w-full sm:flex-1 sm:max-w-xs min-w-0">
            <span className="sr-only">Caută</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută după nume, telefon, județ…"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
            />
          </label>
          <button
            type="button"
            onClick={openModal}
            className="h-10 shrink-0 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 font-['Inter'] whitespace-nowrap"
          >
            Add Agent
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
          <table className="min-w-[1160px] w-full text-left text-sm font-['Inter'] border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Nume</th>
                <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Prenume</th>
                <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Telefon</th>
                <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Whatsapp</th>
                <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap min-w-[180px]">Email</th>
                <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Program</th>
                <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Județ</th>
                <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Oraș</th>
                <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Sector</th>
                <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Tip</th>
                <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Status</th>
                <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Parteneri</th>
                <th className="px-3 py-3 font-semibold text-slate-700 w-12" aria-label="Acțiuni" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-12 text-center text-slate-500">
                    {rows.length === 0
                      ? 'Nu există încă agenți în baza de date. Rulează migrarea Prisma dacă tabelul lipsește.'
                      : 'Niciun rezultat pentru căutare.'}
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 align-top">
                    <td className="px-3 py-3 text-slate-800 whitespace-nowrap">{cell(a.lastName)}</td>
                    <td className="px-3 py-3 text-slate-800 whitespace-nowrap">{cell(a.firstName)}</td>
                    <td className="px-3 py-3 text-slate-700 tabular-nums whitespace-nowrap">{cell(a.phone)}</td>
                    <td className="px-3 py-3 text-slate-700 tabular-nums whitespace-nowrap">{cell(a.whatsapp)}</td>
                    <td className="px-3 py-3 text-slate-700 break-all max-w-[220px]">{cell(a.email)}</td>
                    <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{cell(a.program)}</td>
                    <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{cell(a.county)}</td>
                    <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{cell(a.city)}</td>
                    <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{cell(a.sector)}</td>
                    <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{agentKindLabel(a.agentKind)}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {a.isSuspended ? (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                          Suspendat
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                          Activ
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      <button
                        type="button"
                        onClick={() => openPartnersModal(a)}
                        disabled={rowActionId === a.id}
                        className="min-w-[2.75rem] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 tabular-nums shadow-sm hover:bg-slate-50 font-['Inter'] disabled:opacity-50"
                        title="Vezi parteneri atribuiți"
                      >
                        {a.partnerCount ?? 0}
                      </button>
                    </td>
                    <td className="px-2 py-3 text-right relative">
                      <div ref={rowMenuId === a.id ? rowMenuRef : undefined} className="relative inline-block">
                        <button
                          type="button"
                          aria-label="Acțiuni agent"
                          aria-expanded={rowMenuId === a.id}
                          disabled={rowActionId === a.id}
                          onClick={() => setRowMenuId((id) => (id === a.id ? null : a.id))}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          <MoreHorizontal className="h-5 w-5" aria-hidden />
                        </button>
                        {rowMenuId === a.id ? (
                          <div
                            role="menu"
                            className="absolute right-0 top-full z-20 mt-1 min-w-[11rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 font-['Inter']"
                              onClick={() => openEditModal(a)}
                            >
                              Editează
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 font-['Inter']"
                              onClick={() => void handleToggleSuspend(a)}
                            >
                              {a.isSuspended ? 'Activează' : 'Suspendă'}
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 font-['Inter']"
                              onClick={() => void handleDeleteAgent(a)}
                            >
                              Șterge
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {partnersContext ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 overflow-y-auto"
          role="presentation"
          onClick={() => setPartnersContext(null)}
        >
          <div
            className="w-full max-w-[min(100vw-2rem,1280px)] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl my-auto max-h-[min(90vh,720px)] flex flex-col"
            role="dialog"
            aria-labelledby="partners-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="partners-modal-title"
              className="text-lg font-bold text-slate-900 font-['Inter'] pr-8"
            >
              Parteneri atribuiți
            </h2>
            <p className="mt-1 text-sm text-slate-600 font-['Inter']">
              {[partnersContext.firstName, partnersContext.lastName].filter(Boolean).join(' ').trim() ||
                partnersContext.email}
            </p>
            {partnersError ? (
              <p className="mt-3 text-sm text-red-600 font-['Inter']" role="alert">
                {partnersError}
              </p>
            ) : null}
            <div className="mt-4 flex-1 min-h-0 overflow-auto rounded-xl border border-slate-100">
              {partnersLoading ? (
                <p className="p-6 text-sm text-slate-500 font-['Inter']">Se încarcă…</p>
              ) : (
                <table className="w-full text-left text-sm font-['Inter'] border-collapse min-w-[880px]">
                  <thead className="sticky top-0 z-[1] bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold text-slate-700">Nume firmă</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-700 whitespace-nowrap">CUI</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-700 whitespace-nowrap">Județ</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-700 whitespace-nowrap">Oraș</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-700 min-w-[160px]">Email</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-700 whitespace-nowrap text-right">
                        Comenzi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {partnerRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                          Niciun partener atribuit acestui agent.
                        </td>
                      </tr>
                    ) : (
                      partnerRows.map((p) => (
                        <tr
                          key={p.id}
                          role="button"
                          tabIndex={0}
                          className="hover:bg-slate-50/80 cursor-pointer"
                          onClick={() => openPartnerCompanyPanel(p.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              openPartnerCompanyPanel(p.id)
                            }
                          }}
                        >
                          <td className="px-3 py-2.5 text-slate-800 font-medium">{cell(p.companyName)}</td>
                          <td className="px-3 py-2.5 text-slate-700 tabular-nums whitespace-nowrap">
                            {cell(p.cui)}
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">
                            {cell(p.companyCounty)}
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">
                            {cell(p.companyCity)}
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 break-all max-w-[220px]">
                            {cell(p.companyEmail)}
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 tabular-nums whitespace-nowrap text-right font-semibold">
                            {typeof p.orderCount === 'number' ? p.orderCount : 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setPartnersContext(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 font-['Inter']"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Company detail — slides in above partners modal */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white border-l border-gray-200 shadow-xl z-[70] transition-transform duration-300 ease-out ${
          isClosingPartnerPanel
            ? 'translate-x-full'
            : partnerPanelVisible
              ? 'translate-x-0'
              : 'translate-x-full'
        }`}
        onTransitionEnd={onPartnerPanelTransitionEnd}
        aria-hidden={!partnerPanelVisible}
      >
        {partnerPanelVisible ? (
          <div className="p-6 overflow-y-auto h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-['Inter'] text-black">Detalii companie</h2>
              <button
                type="button"
                onClick={closePartnerCompanyPanel}
                className="text-gray-500 hover:text-slate-900 p-1"
                aria-label="Închide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {partnerDetailError ? (
              <p className="mb-4 text-sm text-red-600 font-['Inter']" role="alert">
                {partnerDetailError}
              </p>
            ) : null}
            {partnerDetailLoading ? (
              <p className="text-sm text-slate-500 font-['Inter']">Se încarcă…</p>
            ) : partnerDetail ? (
              <dl className="space-y-4 text-sm">
                <div className="pb-4 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Date companie</h3>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Denumire</dt>
                      <dd className="text-gray-900">{partnerDetail.companyName || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">CUI</dt>
                      <dd className="text-gray-900">{partnerDetail.cui || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Stradă și nr. (sediu)</dt>
                      <dd className="text-gray-900">{partnerDetail.companyStreet || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Oraș</dt>
                      <dd className="text-gray-900">{partnerDetail.companyCity || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Județ</dt>
                      <dd className="text-gray-900">{partnerDetail.companyCounty || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Cod poștal</dt>
                      <dd className="text-gray-900">{partnerDetail.companyPostalCode || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Adresă (legacy)</dt>
                      <dd className="text-gray-900">{partnerDetail.address || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Cod Registrul Comerțului</dt>
                      <dd className="text-gray-900">{partnerDetail.tradeRegisterNumber || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Email</dt>
                      <dd className="text-gray-900">{partnerDetail.user?.email ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Contact</dt>
                      <dd className="text-gray-900">
                        {[partnerDetail.contactFirstName, partnerDetail.contactLastName].filter(Boolean).join(' ') ||
                          '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Telefon</dt>
                      <dd className="text-gray-900">{partnerDetail.phone || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Tipuri activitate</dt>
                      <dd className="text-gray-900">
                        {partnerDetail.activityTypes ? partnerDetail.activityTypes.split(',').join(', ') : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Reducere %</dt>
                      <dd className="text-gray-900">
                        {partnerDetail.partnerDiscountPercent != null
                          ? String(partnerDetail.partnerDiscountPercent)
                          : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Agent atribuit</dt>
                      <dd className="text-gray-900">
                        {formatAssignedAgentLabel(rows, partnerDetail.assignedSalesAgentId)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Înregistrat</dt>
                      <dd className="text-gray-900">{formatDate(partnerDetail.createdAt)}</dd>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Profil public</h3>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Status profil</dt>
                      <dd>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            partnerDetail.isSuspended
                              ? 'bg-red-100 text-red-800'
                              : !isPublicProfileComplete(partnerDetail)
                                ? 'bg-amber-100 text-amber-800'
                                : partnerDetail.isPublic
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {partnerDetail.isSuspended
                            ? 'Suspendat'
                            : !isPublicProfileComplete(partnerDetail)
                              ? 'Pending'
                              : partnerDetail.isPublic
                                ? 'Public'
                                : 'Privat'}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Nume public</dt>
                      <dd className="text-gray-900">{partnerDetail.publicName || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Descriere</dt>
                      <dd className="text-gray-900 whitespace-pre-wrap">{partnerDetail.description || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Adresă</dt>
                      <dd className="text-gray-900">
                        {[partnerDetail.street, partnerDetail.city, partnerDetail.county].filter(Boolean).join(', ') ||
                          partnerDetail.address ||
                          '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Cod poștal</dt>
                      <dd className="text-gray-900">{partnerDetail.zipCode || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Servicii</dt>
                      <dd className="text-gray-900">
                        {partnerDetail.services ? partnerDetail.services.split(',').join(', ') : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Telefon public</dt>
                      <dd className="text-gray-900">{partnerDetail.publicPhone || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">WhatsApp</dt>
                      <dd className="text-gray-900">{partnerDetail.whatsapp || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Website</dt>
                      <dd className="text-gray-900">
                        {partnerDetail.website ? (
                          <a
                            href={partnerDetail.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {partnerDetail.website}
                          </a>
                        ) : (
                          '—'
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">Facebook</dt>
                      <dd className="text-gray-900">
                        {partnerDetail.facebookUrl ? (
                          <a
                            href={partnerDetail.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {partnerDetail.facebookUrl}
                          </a>
                        ) : (
                          '—'
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-0.5">LinkedIn</dt>
                      <dd className="text-gray-900">
                        {partnerDetail.linkedinUrl ? (
                          <a
                            href={partnerDetail.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {partnerDetail.linkedinUrl}
                          </a>
                        ) : (
                          '—'
                        )}
                      </dd>
                    </div>
                    {partnerDetail.logoUrl ? (
                      <div>
                        <dt className="text-gray-500 font-medium mb-0.5">Logo</dt>
                        <dd>
                          <img src={partnerDetail.logoUrl} alt="Logo" className="h-16 w-auto object-contain rounded" />
                        </dd>
                      </div>
                    ) : null}
                  </div>
                </div>
              </dl>
            ) : null}
          </div>
        ) : null}
      </div>
      {partnerPanelVisible ? (
        <div
          className="fixed inset-0 bg-black/30 z-[65] lg:hidden"
          onClick={closePartnerCompanyPanel}
          aria-hidden
        />
      ) : null}

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 overflow-y-auto"
          role="presentation"
          onClick={() => {
            if (!saving) {
              setModalOpen(false)
              setEditingAgent(null)
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl my-auto"
            role="dialog"
            aria-labelledby="add-agent-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="add-agent-modal-title" className="text-lg font-bold text-slate-900 font-['Inter']">
              {editingAgent ? 'Editează agent' : 'Agent nou'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-['Inter']">
              {editingAgent ? 'Modificați datele și salvați.' : 'Completați câmpurile obligatorii.'}
            </p>

            <div className="mt-4 space-y-3 max-h-[min(70vh,560px)] overflow-y-auto pr-1">
              <label className="block text-sm font-medium text-slate-700 font-['Inter']">
                Nume
                <input
                  type="text"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: filterNameChars(e.target.value) }))
                  }
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  placeholder="Doar litere"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 font-['Inter']">
                Prenume
                <input
                  type="text"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firstName: filterNameChars(e.target.value) }))
                  }
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  placeholder="Doar litere"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 font-['Inter']">
                Telefon
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: filterDigits(e.target.value) }))}
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  placeholder="Doar cifre"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 font-['Inter']">
                WhatsApp
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: filterDigits(e.target.value) }))}
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  placeholder="Doar cifre"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 font-['Inter']">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 font-['Inter']">
                Program
                <input
                  type="text"
                  value={form.program}
                  onChange={(e) => setForm((f) => ({ ...f, program: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  placeholder="ex. L–V 9–17"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 font-['Inter']">
                Județ
                <select
                  value={form.county}
                  onChange={(e) => {
                    const county = e.target.value
                    setForm((f) => ({
                      ...f,
                      county,
                      city: '',
                    }))
                  }}
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                >
                  <option value="">— Selectează —</option>
                  {ROMANIAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700 font-['Inter']">
                Oraș
                <select
                  value={form.city}
                  disabled={!form.county}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">{form.county ? '— Selectează —' : 'Alege mai întâi județul'}</option>
                  {cityOptions.map((cy) => (
                    <option key={cy} value={cy}>
                      {cy}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700 font-['Inter']">
                Sector
                <select
                  value={form.sector}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sector: e.target.value as (typeof AGENT_SECTORS)[number],
                    }))
                  }
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                >
                  {AGENT_SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700 font-['Inter']">
                Tip agent
                <select
                  value={form.agentKind}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      agentKind: e.target.value as SalesAgentKind,
                    }))
                  }
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                >
                  {AGENT_KIND_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {formError ? (
              <p className="mt-3 text-sm text-red-600 font-['Inter']" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 font-['Inter']"
                onClick={() => {
                  if (!saving) {
                    setModalOpen(false)
                    setEditingAgent(null)
                  }
                }}
              >
                Anulează
              </button>
              <button
                type="button"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 font-['Inter']"
                onClick={() => void validateAndSubmit()}
              >
                {saving ? 'Se salvează…' : 'Salvează'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
