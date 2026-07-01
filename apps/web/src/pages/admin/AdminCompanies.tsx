import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  getAdminCompanies,
  getAdminAgents,
  getAuthToken,
  testApiDb,
  suspendAdminCompany,
  updateAdminCompanyDiscount,
  updateAdminCompanySupportAgent,
  deleteApprovedAdminCompany,
  downloadAdminPartnerContract,
  openAdminPartnerContract,
  formatPartnerActivityTypeLabel,
  partnerDiscountLimitsForCompany,
  isPublicProfileComplete,
  type AdminCompany,
  type AdminSalesAgent,
  isAdminAgentAssignable,
} from '../../lib/api'

function formatAssignedAgentLabel(agents: AdminSalesAgent[], id: string | null | undefined): string {
  if (!id) return '—'
  const a = agents.find((x) => x.id === id)
  if (!a) return id
  const label = [a.firstName, a.lastName].filter(Boolean).join(' ').trim()
  return label || id
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

function formatDateTime(s: string | null | undefined) {
  if (!s) return '—'
  try {
    return new Date(s).toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export default function AdminCompanies() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dbTest, setDbTest] = useState<string | null>(null)
  const [detailCompany, setDetailCompany] = useState<AdminCompany | null>(null)
  const [actionOpenId, setActionOpenId] = useState<string | null>(null)
  const [discountSavingId, setDiscountSavingId] = useState<string | null>(null)
  const [salesAgents, setSalesAgents] = useState<AdminSalesAgent[]>([])
  const [discountModalCompany, setDiscountModalCompany] = useState<AdminCompany | null>(null)
  const [discountSliderValue, setDiscountSliderValue] = useState(0)
  const [discountSupportAgentId, setDiscountSupportAgentId] = useState('')
  const [discountModalError, setDiscountModalError] = useState('')
  const [agentSavingId, setAgentSavingId] = useState<string | null>(null)
  const [suspendingId, setSuspendingId] = useState<string | null>(null)
  const [contractLoadingId, setContractLoadingId] = useState<string | null>(null)
  const [contractError, setContractError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<keyof AdminCompany | 'user' | ''>('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const actionButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const actionMenuRef = useRef<HTMLDivElement>(null)
  const [actionMenuPos, setActionMenuPos] = useState<{ top: number; left: number } | null>(null)

  const filteredAndSorted = (list: AdminCompany[]) => (() => {
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter((c) => {
        const name = (c.companyName || c.publicName || '').toLowerCase()
        const cui = (c.cui || '').toLowerCase()
        const email = (c.user?.email || '').toLowerCase()
        const contact = [c.contactFirstName, c.contactLastName].filter(Boolean).join(' ').toLowerCase()
        const phone = (c.phone || '').toLowerCase()
        const reg = (c.tradeRegisterNumber || '').toLowerCase()
        const activity = formatPartnerActivityTypeLabel(c).toLowerCase()
        const activityRaw = (c.activityTypes || '').toLowerCase()
        const compAddr = [
          c.companyStreet,
          c.companyCity,
          c.companyCounty,
          c.companyPostalCode,
          c.address,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return (
          name.includes(q) ||
          cui.includes(q) ||
          email.includes(q) ||
          contact.includes(q) ||
          phone.includes(q) ||
          reg.includes(q) ||
          activity.includes(q) ||
          activityRaw.includes(q) ||
          compAddr.includes(q)
        )
      })
    }
    if (sortBy) {
      list = [...list].sort((a, b) => {
        const av = sortBy === 'user' ? a.user?.email : a[sortBy as keyof AdminCompany]
        const bv = sortBy === 'user' ? b.user?.email : b[sortBy as keyof AdminCompany]
        let cmp = 0
        if (av == null && bv == null) cmp = 0
        else if (av == null) cmp = 1
        else if (bv == null) cmp = -1
        else if (sortBy === 'assignedSalesAgentId') {
          const agentLabel = (id: unknown) =>
            formatAssignedAgentLabel(salesAgents, id as string | null | undefined).toLowerCase()
          cmp = agentLabel(av).localeCompare(agentLabel(bv), 'ro')
        }
        else if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv, 'ro')
        else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
        else if (typeof av === 'boolean' && typeof bv === 'boolean') cmp = (av ? 1 : 0) - (bv ? 1 : 0)
        else if (sortBy === 'createdAt') cmp = new Date(av as string).getTime() - new Date(bv as string).getTime()
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return list
  })()

  const filteredCompanies = filteredAndSorted(companies)

  const assignableSupportAgents = salesAgents.filter(isAdminAgentAssignable)

  const loadCompanies = () => {
    getAdminCompanies()
      .then((data) => {
        setCompanies(data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Eroare la încărcare.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    loadCompanies()
    getAdminAgents()
      .then(setSalesAgents)
      .catch(() => setSalesAgents([]))
  }, [navigate])

  useLayoutEffect(() => {
    if (!actionOpenId) {
      setActionMenuPos(null)
      return
    }
    const MENU_W = 176
    const update = () => {
      const btn = actionButtonRefs.current[actionOpenId]
      if (!btn) return
      const r = btn.getBoundingClientRect()
      setActionMenuPos({
        top: r.bottom + 4,
        left: Math.min(Math.max(8, r.right - MENU_W), window.innerWidth - MENU_W - 8),
      })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [actionOpenId])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node
      if (actionMenuRef.current?.contains(t)) return
      const btn = actionOpenId ? actionButtonRefs.current[actionOpenId] : null
      if (btn?.contains(t)) return
      setActionOpenId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [actionOpenId])

  const handleViewDetails = (c: AdminCompany) => {
    setContractError('')
    setDetailCompany(c)
  }

  const closeDetailModal = useCallback(() => {
    setContractError('')
    setDetailCompany(null)
  }, [])

  const handleViewPartnerContract = async (c: AdminCompany) => {
    setContractError('')
    setContractLoadingId(c.id)
    try {
      await openAdminPartnerContract(c.id)
    } catch (err) {
      setContractError(err instanceof Error ? err.message : 'Eroare la deschiderea contractului.')
    } finally {
      setContractLoadingId(null)
    }
  }

  const handleDownloadPartnerContract = async (c: AdminCompany) => {
    setContractError('')
    setContractLoadingId(c.id)
    try {
      const { pdfBlob, filename } = await downloadAdminPartnerContract(c.id)
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
    } catch (err) {
      setContractError(err instanceof Error ? err.message : 'Eroare la descărcarea contractului.')
    } finally {
      setContractLoadingId(null)
    }
  }

  const handleDeletePartner = async (c: AdminCompany) => {
    const label = (c.companyName || c.publicName || c.user?.email || 'acest partener').trim()
    const ok = window.confirm(
      `Sigur vrei să ștergi definitiv „${label}”? Contul de utilizator și datele companiei vor fi eliminate din baza de date. Acțiunea nu poate fi anulată.`,
    )
    if (!ok) return
    setActionOpenId(null)
    setActionMenuPos(null)
    setDeletingId(c.id)
    try {
      await deleteApprovedAdminCompany(c.id)
      setCompanies((prev) => prev.filter((x) => x.id !== c.id))
      if (detailCompany?.id === c.id) setDetailCompany(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la ștergere.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSuspend = async (c: AdminCompany) => {
    setActionOpenId(null)
    setActionMenuPos(null)
    setSuspendingId(c.id)
    try {
      const updated = await suspendAdminCompany(c.id, !c.isSuspended)
      setCompanies((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      if (detailCompany?.id === c.id) setDetailCompany(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la suspendare.')
    } finally {
      setSuspendingId(null)
    }
  }

  const openDiscountModal = (c: AdminCompany) => {
    const { min, max } = partnerDiscountLimitsForCompany(c)
    const existing = c.partnerDiscountPercent != null ? Number(c.partnerDiscountPercent) : null
    const initial =
      existing != null && Number.isFinite(existing) ? Math.min(max, Math.max(min, existing)) : min
    setDiscountModalCompany(c)
    setDiscountSliderValue(initial)
    setDiscountSupportAgentId(c.assignedSalesAgentId?.trim() || '')
    setDiscountModalError('')
  }

  const discountActionBtnClass =
    'px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors disabled:opacity-50 whitespace-nowrap'

  const closeDiscountModal = useCallback(() => {
    if (discountSavingId) return
    setDiscountModalCompany(null)
    setDiscountSupportAgentId('')
    setDiscountModalError('')
  }, [discountSavingId])

  const handleConfirmDiscount = async () => {
    if (!discountModalCompany) return
    const { min, max } = partnerDiscountLimitsForCompany(discountModalCompany)
    const num = Number(discountSliderValue)
    if (Number.isNaN(num) || num < min || num > max) {
      setDiscountModalError(`Reducerea trebuie să fie între ${min}% și ${max}%.`)
      return
    }
    const agentId = discountSupportAgentId.trim()
    if (!agentId) {
      setDiscountModalError('Selectează persoana de suport atribuită partenerului.')
      return
    }
    setDiscountModalError('')
    setDiscountSavingId(discountModalCompany.id)
    try {
      const updated = await updateAdminCompanyDiscount(discountModalCompany.id, num, agentId)
      setCompanies((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      if (detailCompany?.id === updated.id) setDetailCompany(updated)
      setDiscountModalCompany(null)
      setDiscountModalError('')
    } catch (err) {
      setDiscountModalError(err instanceof Error ? err.message : 'Eroare la aplicarea reducerii.')
    } finally {
      setDiscountSavingId(null)
    }
  }

  async function handleAssignSupportAgent(companyId: string, assignedSalesAgentId: string) {
    setAgentSavingId(companyId)
    setError('')
    try {
      const updated = await updateAdminCompanySupportAgent(
        companyId,
        assignedSalesAgentId.trim() || null,
      )
      setCompanies((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      if (detailCompany?.id === updated.id) setDetailCompany(updated)
      if (discountModalCompany?.id === updated.id) {
        setDiscountSupportAgentId(updated.assignedSalesAgentId?.trim() || '')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la atribuirea agentului.')
    } finally {
      setAgentSavingId(null)
    }
  }

  useEffect(() => {
    if (!discountModalCompany || discountSavingId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDiscountModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [discountModalCompany, discountSavingId, closeDiscountModal])

  useEffect(() => {
    if (!detailCompany || discountModalCompany) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDetailModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detailCompany, discountModalCompany, closeDetailModal])

  const handleSort = (col: keyof AdminCompany | 'user') => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortBy(col)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ column }: { column: keyof AdminCompany | 'user' }) => {
    if (sortBy !== column) return <span className="text-gray-400 ml-0.5 opacity-50">⇅</span>
    return <span className="text-slate-600 ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <h1 className="text-xl font-bold font-['Inter'] text-black mb-4">Companii</h1>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <h1 className="text-xl font-bold font-['Inter'] text-black mb-4">Companii</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-[10px]">
          <p className="text-sm font-['Inter'] text-red-600">{error}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setError('')
                setLoading(true)
                setDbTest(null)
                loadCompanies()
              }}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
            >
              Încearcă din nou
            </button>
            <button
              type="button"
              onClick={() => {
                setDbTest('Se verifică...')
                testApiDb().then((r) => {
                  if (r.ok) setDbTest(`OK: API + Prisma funcționează. Parteneri: ${r.partnersCount ?? 0}`)
                  else setDbTest(`Eroare: ${r.error}`)
                })
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Test conexiune API + DB
            </button>
          </div>
          {dbTest && <p className="mt-2 text-sm text-gray-600">{dbTest}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-0">
      <div className="p-6 sm:p-8 lg:p-10 flex-1 min-w-0 flex flex-col">
        <h1 className="text-xl font-bold font-['Inter'] text-black mb-4">Companii</h1>
        <p className="text-gray-500 text-sm font-['Inter'] mb-4">
          Lista companiilor (parteneri) înregistrate pe platforma Baterino.
        </p>

        {/* Search */}
        <div className="mb-4">
          <input
            type="search"
            placeholder="Caută după denumire, CUI, email, contact, telefon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          />
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden gap-0">
          <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col gap-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0">
              <h2 className="text-base font-bold font-['Inter'] text-black px-5 py-4 border-b border-gray-200 bg-green-50/50">
                Parteneri
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-['Inter']">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <button type="button" onClick={() => handleSort('companyName')} className="flex items-center hover:text-slate-900">
                          Denumire <SortIcon column="companyName" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <button type="button" onClick={() => handleSort('cui')} className="flex items-center hover:text-slate-900">
                          CUI <SortIcon column="cui" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <button type="button" onClick={() => handleSort('user')} className="flex items-center hover:text-slate-900">
                          Email <SortIcon column="user" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <button type="button" onClick={() => handleSort('contactFirstName')} className="flex items-center hover:text-slate-900">
                          Contact <SortIcon column="contactFirstName" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <button type="button" onClick={() => handleSort('phone')} className="flex items-center hover:text-slate-900">
                          Telefon <SortIcon column="phone" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <button type="button" onClick={() => handleSort('partnerChannelType')} className="flex items-center hover:text-slate-900">
                          Tip activitate <SortIcon column="partnerChannelType" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <button type="button" onClick={() => handleSort('partnerDiscountPercent')} className="flex items-center hover:text-slate-900">
                          Reducere % <SortIcon column="partnerDiscountPercent" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <button type="button" onClick={() => handleSort('assignedSalesAgentId')} className="flex items-center hover:text-slate-900">
                          Agent suport <SortIcon column="assignedSalesAgentId" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <button type="button" onClick={() => handleSort('isApproved')} className="flex items-center hover:text-slate-900">
                          Verificat <SortIcon column="isApproved" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <button type="button" onClick={() => handleSort('createdAt')} className="flex items-center hover:text-slate-900">
                          Înregistrat <SortIcon column="createdAt" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-8 text-center text-gray-500">
                          {companies.length === 0 ? 'Niciun partener înregistrat.' : 'Niciun rezultat pentru căutarea ta.'}
                        </td>
                      </tr>
                    ) : (
                      filteredCompanies.map((c) => (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          {c.companyName || c.publicName || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{c.cui || '—'}</td>
                        <td className="py-3 px-4 text-gray-700">{c.user?.email ?? '—'}</td>
                        <td className="py-3 px-4 text-gray-700">
                          {[c.contactFirstName, c.contactLastName].filter(Boolean).join(' ') || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{c.phone || '—'}</td>
                        <td className="py-3 px-4 text-gray-700">{formatPartnerActivityTypeLabel(c)}</td>
                        <td className="py-3 px-4">
                          {c.partnerDiscountPercent != null ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="tabular-nums font-medium text-gray-900">
                                {Number(c.partnerDiscountPercent).toLocaleString('ro-RO', {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 1,
                                })}
                                %
                              </span>
                              <button
                                type="button"
                                onClick={() => openDiscountModal(c)}
                                disabled={discountSavingId === c.id}
                                className={discountActionBtnClass}
                              >
                                Modifică Reducere
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openDiscountModal(c)}
                              disabled={discountSavingId === c.id}
                              className={discountActionBtnClass}
                            >
                              Aloca Reducere
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700 min-w-[11rem]">
                          <select
                            value={c.assignedSalesAgentId?.trim() || ''}
                            onChange={(e) => void handleAssignSupportAgent(c.id, e.target.value)}
                            disabled={
                              agentSavingId === c.id ||
                              discountSavingId === c.id ||
                              assignableSupportAgents.length === 0
                            }
                            aria-label={`Agent suport pentru ${c.companyName || c.publicName || 'partener'}`}
                            className="h-9 w-full min-w-[10.5rem] max-w-[14rem] cursor-pointer rounded-lg border border-gray-300 bg-white px-2.5 text-sm text-gray-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:cursor-wait disabled:opacity-60"
                          >
                            <option value="">— Selectează —</option>
                            {assignableSupportAgents.map((agent) => {
                              const label =
                                [agent.firstName, agent.lastName].filter(Boolean).join(' ').trim() || agent.email
                              return (
                                <option key={agent.id} value={agent.id}>
                                  {label}
                                </option>
                              )
                            })}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(c)}
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity ${
                              c.isSuspended
                                ? 'bg-red-100 text-red-800'
                                : c.isApproved
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.isSuspended ? 'Suspendat' : c.isApproved ? 'Da' : 'Pending'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(c.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewDetails(c)}
                              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              Detalii
                            </button>
                            <div className="relative">
                              <button
                                type="button"
                                ref={(el) => {
                                  actionButtonRefs.current[c.id] = el
                                }}
                                onClick={() => setActionOpenId(actionOpenId === c.id ? null : c.id)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                                aria-expanded={actionOpenId === c.id}
                                aria-haspopup="menu"
                              >
                                Acțiuni
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      {detailCompany && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 overflow-y-auto"
          role="presentation"
          onClick={closeDetailModal}
        >
          <div
            className="my-auto flex w-full max-w-[min(100vw-2rem,1100px)] max-h-[min(92vh,900px)] flex-col rounded-2xl border border-slate-200 bg-white shadow-xl"
            role="dialog"
            aria-labelledby="company-detail-modal-title"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
              <h2 id="company-detail-modal-title" className="text-lg font-bold font-['Inter'] text-black">
                Detalii companie
              </h2>
              <button
                type="button"
                onClick={closeDetailModal}
                className="text-gray-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
                aria-label="Închide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="flex flex-col gap-4">
                {/* 1. Date companie */}
                <section
                  className="rounded-xl border border-slate-200/80 p-4 shadow-sm"
                  style={{ backgroundColor: '#f7f7f7' }}
                >
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-600 font-['Inter']">
                    Date companie
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="min-w-0 col-span-2">
                      <dt className="text-gray-500 font-medium mb-0.5">Denumire</dt>
                      <dd className="text-gray-900 break-words">{detailCompany.companyName || '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">CUI</dt>
                      <dd className="text-gray-900 tabular-nums">{detailCompany.cui || '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Înregistrat</dt>
                      <dd className="text-gray-900">{formatDate(detailCompany.createdAt)}</dd>
                    </div>
                    <div className="min-w-0 col-span-2">
                      <dt className="text-gray-500 font-medium mb-0.5">Stradă și nr. (sediu)</dt>
                      <dd className="text-gray-900">{detailCompany.companyStreet || '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Oraș</dt>
                      <dd className="text-gray-900">{detailCompany.companyCity || '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Județ</dt>
                      <dd className="text-gray-900">{detailCompany.companyCounty || '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Cod poștal</dt>
                      <dd className="text-gray-900">{detailCompany.companyPostalCode || '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Cod Registrul Comerțului</dt>
                      <dd className="text-gray-900">{detailCompany.tradeRegisterNumber || '—'}</dd>
                    </div>
                    <div className="min-w-0 col-span-2">
                      <dt className="text-gray-500 font-medium mb-0.5">Adresă (legacy)</dt>
                      <dd className="text-gray-900 break-words">{detailCompany.address || '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Tip activitate</dt>
                      <dd className="text-gray-900">{formatPartnerActivityTypeLabel(detailCompany)}</dd>
                    </div>
                  </dl>
                </section>

                {/* 2. Date contact */}
                <section
                  className="rounded-xl border border-slate-200/80 p-4 shadow-sm"
                  style={{ backgroundColor: '#f7f7f7' }}
                >
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-600 font-['Inter']">
                    Date contact
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="min-w-0 col-span-2">
                      <dt className="text-gray-500 font-medium mb-0.5">Email</dt>
                      <dd className="text-gray-900 break-all">{detailCompany.user?.email ?? '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Contact</dt>
                      <dd className="text-gray-900">
                        {[detailCompany.contactFirstName, detailCompany.contactLastName].filter(Boolean).join(' ') || '—'}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Telefon</dt>
                      <dd className="text-gray-900 tabular-nums">{detailCompany.phone || '—'}</dd>
                    </div>
                  </dl>
                </section>

                {/* 3. Reducere aplicată */}
                <section
                  className="rounded-xl border border-slate-200/80 p-4 shadow-sm"
                  style={{ backgroundColor: '#f7f7f7' }}
                >
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-600 font-['Inter']">
                    Reducere aplicată
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Reducere %</dt>
                      <dd className="flex flex-wrap items-center gap-2">
                        {detailCompany.partnerDiscountPercent != null ? (
                          <>
                            <span className="tabular-nums font-semibold text-gray-900">
                              {Number(detailCompany.partnerDiscountPercent).toLocaleString('ro-RO', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 1,
                              })}
                              %
                            </span>
                            <button
                              type="button"
                              onClick={() => openDiscountModal(detailCompany)}
                              disabled={discountSavingId === detailCompany.id}
                              className={discountActionBtnClass}
                            >
                              Modifică Reducere
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openDiscountModal(detailCompany)}
                            disabled={discountSavingId === detailCompany.id}
                            className={discountActionBtnClass}
                          >
                            Aloca Reducere
                          </button>
                        )}
                        <span className="text-gray-500 text-xs block w-full">(preț partener)</span>
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Persoană suport</dt>
                      <dd className="text-gray-900">{formatAssignedAgentLabel(salesAgents, detailCompany.assignedSalesAgentId)}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Verificat</dt>
                      <dd>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            detailCompany.isApproved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {detailCompany.isApproved ? 'Da' : 'Pending'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </section>

                {/* 4. Profil public */}
                <section
                  className="rounded-xl border border-slate-200/80 p-4 shadow-sm"
                  style={{ backgroundColor: '#f7f7f7' }}
                >
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-600 font-['Inter']">
                    Profil public
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Status profil</dt>
                      <dd>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            detailCompany.isSuspended
                              ? 'bg-red-100 text-red-800'
                              : !isPublicProfileComplete(detailCompany)
                                ? 'bg-amber-100 text-amber-800'
                                : detailCompany.isPublic
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {detailCompany.isSuspended ? 'Suspendat' : !isPublicProfileComplete(detailCompany) ? 'Pending' : detailCompany.isPublic ? 'Public' : 'Privat'}
                        </span>
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Nume public</dt>
                      <dd className="text-gray-900">{detailCompany.publicName || '—'}</dd>
                    </div>
                    <div className="min-w-0 col-span-2">
                      <dt className="text-gray-500 font-medium mb-0.5">Descriere</dt>
                      <dd className="text-gray-900 whitespace-pre-wrap break-words">{detailCompany.description || '—'}</dd>
                    </div>
                    <div className="min-w-0 col-span-2">
                      <dt className="text-gray-500 font-medium mb-0.5">Adresă</dt>
                      <dd className="text-gray-900">{[detailCompany.street, detailCompany.city, detailCompany.county].filter(Boolean).join(', ') || detailCompany.address || '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Cod poștal</dt>
                      <dd className="text-gray-900">{detailCompany.zipCode || '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Servicii</dt>
                      <dd className="text-gray-900">{detailCompany.services ? detailCompany.services.split(',').join(', ') : '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Telefon public</dt>
                      <dd className="text-gray-900">{detailCompany.publicPhone || '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">WhatsApp</dt>
                      <dd className="text-gray-900">{detailCompany.whatsapp || '—'}</dd>
                    </div>
                    <div className="min-w-0 col-span-2">
                      <dt className="text-gray-500 font-medium mb-0.5">Website</dt>
                      <dd className="text-gray-900">
                        {detailCompany.website ? (
                          <a href={detailCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                            {detailCompany.website}
                          </a>
                        ) : (
                          '—'
                        )}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Facebook</dt>
                      <dd className="text-gray-900 break-all">
                        {detailCompany.facebookUrl ? (
                          <a href={detailCompany.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {detailCompany.facebookUrl}
                          </a>
                        ) : (
                          '—'
                        )}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">LinkedIn</dt>
                      <dd className="text-gray-900 break-all">
                        {detailCompany.linkedinUrl ? (
                          <a href={detailCompany.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {detailCompany.linkedinUrl}
                          </a>
                        ) : (
                          '—'
                        )}
                      </dd>
                    </div>
                    {detailCompany.logoUrl ? (
                      <div className="min-w-0 col-span-2">
                        <dt className="text-gray-500 font-medium mb-0.5">Logo</dt>
                        <dd>
                          <img src={detailCompany.logoUrl} alt="Logo" className="h-16 w-auto max-w-full object-contain rounded" />
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>

                {/* 5. Documente */}
                <section
                  className="rounded-xl border border-slate-200/80 p-4 shadow-sm"
                  style={{ backgroundColor: '#f7f7f7' }}
                >
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-600 font-['Inter']">
                    Documente
                  </h3>
                  {detailCompany.partnerContractAvailable ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">Acord de parteneriat Baterino</p>
                          <p className="mt-1 text-xs text-gray-500">
                            Semnat digital la {formatDateTime(detailCompany.partnerContractSignedAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewPartnerContract(detailCompany)}
                            disabled={contractLoadingId === detailCompany.id}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                          >
                            Vizualizează PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadPartnerContract(detailCompany)}
                            disabled={contractLoadingId === detailCompany.id}
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                          >
                            Descarcă
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nu există documente semnate pentru această companie.</p>
                  )}
                  {contractError ? (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {contractError}
                    </p>
                  ) : null}
                </section>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSuspend(detailCompany)}
                  disabled={suspendingId === detailCompany.id}
                  className="w-full px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50"
                  style={{
                    borderColor: detailCompany.isSuspended ? 'rgb(34 197 94)' : 'rgb(239 68 68)',
                    color: detailCompany.isSuspended ? 'rgb(22 163 74)' : 'rgb(220 38 38)',
                  }}
                >
                  {detailCompany.isSuspended ? 'Unsuspend' : 'Suspendă compania'}
                </button>
              </div>
            </div>
            <div className="flex flex-shrink-0 justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={closeDetailModal}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 font-['Inter']"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {discountModalCompany && (() => {
        const limits = partnerDiscountLimitsForCompany(discountModalCompany)
        const companyLabel =
          discountModalCompany.companyName ||
          discountModalCompany.publicName ||
          discountModalCompany.user?.email ||
          '—'
        const channelLabel = formatPartnerActivityTypeLabel(discountModalCompany)
        return (
          <div
            className="fixed inset-0 z-[195] flex items-center justify-center bg-slate-900/40 p-4"
            role="presentation"
            onClick={() => !discountSavingId && closeDiscountModal()}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
              role="dialog"
              aria-labelledby="allocate-discount-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="allocate-discount-modal-title" className="text-lg font-bold text-slate-900 font-['Inter']">
                Alocă reducere și suport partener
              </h2>
              <p className="mt-2 text-sm text-slate-600 font-['Inter']">
                Reducerea și persoana de suport sunt obligatorii pentru verificarea partenerului.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800 font-['Inter']">{companyLabel}</p>
              <p className="mt-1 text-sm text-slate-600 font-['Inter']">
                Tip cont: <span className="font-medium text-slate-800">{channelLabel}</span>
              </p>
              <div className="mt-6">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label htmlFor="partner-discount-slider" className="text-sm font-medium text-slate-700 font-['Inter']">
                    Reducere
                  </label>
                  <span className="text-lg font-bold tabular-nums text-indigo-700 font-['Inter']">
                    {discountSliderValue}%
                  </span>
                </div>
                <input
                  id="partner-discount-slider"
                  type="range"
                  min={limits.min}
                  max={limits.max}
                  step={1}
                  value={discountSliderValue}
                  onChange={(e) => setDiscountSliderValue(Number(e.target.value))}
                  disabled={Boolean(discountSavingId)}
                  className="w-full h-2 accent-indigo-600 cursor-pointer disabled:opacity-50"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500 font-['Inter'] tabular-nums">
                  <span>{limits.min}%</span>
                  <span>{limits.max}%</span>
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="partner-support-agent" className="mb-1.5 block text-sm font-medium text-slate-700 font-['Inter']">
                  Persoană suport <span className="text-red-500">*</span>
                </label>
                <select
                  id="partner-support-agent"
                  value={discountSupportAgentId}
                  onChange={(e) => {
                    setDiscountSupportAgentId(e.target.value)
                    setDiscountModalError('')
                  }}
                  disabled={Boolean(discountSavingId)}
                  className="h-11 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/25 disabled:opacity-50 font-['Inter']"
                >
                  <option value="">Selectează persoana de suport</option>
                  {assignableSupportAgents.map((agent) => {
                    const label = [agent.firstName, agent.lastName].filter(Boolean).join(' ').trim() || agent.email
                    return (
                      <option key={agent.id} value={agent.id}>
                        {label}
                        {agent.county ? ` · ${agent.county}` : ''}
                      </option>
                    )
                  })}
                </select>
                {assignableSupportAgents.length === 0 ? (
                  <p className="mt-2 text-xs text-amber-800 font-['Inter']">
                    Nu există agenți activi. Adaugă un agent în Setări → Agenți.
                  </p>
                ) : null}
              </div>
              {discountModalError ? (
                <p className="mt-3 text-sm text-red-600 font-['Inter']" role="alert">
                  {discountModalError}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  disabled={Boolean(discountSavingId)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 font-['Inter']"
                  onClick={closeDiscountModal}
                >
                  Anulează
                </button>
                <button
                  type="button"
                  disabled={Boolean(discountSavingId) || assignableSupportAgents.length === 0}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 font-['Inter']"
                  onClick={() => void handleConfirmDiscount()}
                >
                  {discountSavingId ? 'Se aplică…' : 'Aplică'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {actionOpenId &&
        actionMenuPos &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={actionMenuRef}
            className="fixed z-[200] w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            style={{ top: actionMenuPos.top, left: actionMenuPos.left }}
            role="menu"
          >
            {(() => {
              const c = companies.find((x) => x.id === actionOpenId)
              if (!c) return null
              return (
                <>
                  <button
                    type="button"
                    onClick={() => void handleSuspend(c)}
                    disabled={suspendingId === c.id || deletingId === c.id}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {suspendingId === c.id ? '...' : c.isSuspended ? 'Unsuspend' : 'Suspendă'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeletePartner(c)}
                    disabled={deletingId === c.id || suspendingId === c.id}
                    className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 border-t border-gray-100"
                  >
                    {deletingId === c.id ? 'Se șterge...' : 'Șterge'}
                  </button>
                </>
              )
            })()}
          </div>,
          document.body,
        )}
    </div>
  )
}
