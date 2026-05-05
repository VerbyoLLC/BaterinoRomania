import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  getAdminCompanies,
  getAdminAgents,
  getAuthToken,
  testApiDb,
  suspendAdminCompany,
  approveAdminCompany,
  updateAdminCompanyDiscount,
  deleteApprovedAdminCompany,
  isPublicProfileComplete,
  type AdminCompany,
  type AdminSalesAgent,
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

export default function AdminCompanies() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dbTest, setDbTest] = useState<string | null>(null)
  const [detailCompany, setDetailCompany] = useState<AdminCompany | null>(null)
  const [actionOpenId, setActionOpenId] = useState<string | null>(null)
  const [discountSavingId, setDiscountSavingId] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [salesAgents, setSalesAgents] = useState<AdminSalesAgent[]>([])
  const [approveModalCompany, setApproveModalCompany] = useState<AdminCompany | null>(null)
  const [approveDiscount, setApproveDiscount] = useState('')
  const [approveAgentId, setApproveAgentId] = useState('')
  const [approveModalError, setApproveModalError] = useState('')
  const [suspendingId, setSuspendingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<keyof AdminCompany | 'user' | ''>('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [editingDiscount, setEditingDiscount] = useState<Record<string, string>>({})
  const actionButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const actionMenuRef = useRef<HTMLDivElement>(null)
  const [actionMenuPos, setActionMenuPos] = useState<{ top: number; left: number } | null>(null)

  const pendingCompanies = companies.filter((c) => !c.isApproved)
  const approvedCompanies = companies.filter((c) => c.isApproved)

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
        const activity = (c.activityTypes || '').toLowerCase()
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
        else if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv, 'ro')
        else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
        else if (typeof av === 'boolean' && typeof bv === 'boolean') cmp = (av ? 1 : 0) - (bv ? 1 : 0)
        else if (sortBy === 'createdAt') cmp = new Date(av as string).getTime() - new Date(bv as string).getTime()
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return list
  })()

  const filteredPending = filteredAndSorted(pendingCompanies)
  const filteredApproved = filteredAndSorted(approvedCompanies)

  const loadCompanies = () => {
    getAdminCompanies()
      .then((data) => {
        setCompanies(data)
        setEditingDiscount({})
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
    setDetailCompany(c)
  }

  const closeDetailModal = useCallback(() => {
    setDetailCompany(null)
  }, [])

  const handleDeleteApproved = async (c: AdminCompany) => {
    if (!c.isApproved) return
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

  const openApproveModal = (c: AdminCompany) => {
    setApproveModalCompany(c)
    setApproveDiscount(c.partnerDiscountPercent != null ? String(c.partnerDiscountPercent) : '')
    setApproveAgentId(c.assignedSalesAgentId ?? '')
    setApproveModalError('')
  }

  const closeApproveModal = useCallback(() => {
    setApproveModalCompany(null)
    setApproveModalError('')
  }, [])

  const handleConfirmApprove = async () => {
    if (!approveModalCompany) return
    const discRaw = approveDiscount.trim()
    if (discRaw === '') {
      setApproveModalError('Reducerea este obligatorie.')
      return
    }
    const num = parseFloat(discRaw)
    if (Number.isNaN(num) || num < 0.5 || num > 60) {
      setApproveModalError('Reducerea trebuie să fie între 0,5 și 60.')
      return
    }
    const partnerDiscountPercent = num

    const assignedSalesAgentId = approveAgentId.trim()
    if (!assignedSalesAgentId) {
      setApproveModalError('Agentul de vânzări este obligatoriu.')
      return
    }

    setApproveModalError('')
    setApprovingId(approveModalCompany.id)
    try {
      const updated = await approveAdminCompany(approveModalCompany.id, {
        partnerDiscountPercent,
        assignedSalesAgentId,
      })
      setCompanies((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      if (detailCompany?.id === updated.id) setDetailCompany(updated)
      closeApproveModal()
    } catch (err) {
      setApproveModalError(err instanceof Error ? err.message : 'Eroare la aprobare.')
    } finally {
      setApprovingId(null)
    }
  }

  useEffect(() => {
    if (!approveModalCompany || approvingId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeApproveModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [approveModalCompany, approvingId, closeApproveModal])

  const handleDiscountChange = useCallback(async (c: AdminCompany, value: string) => {
    const num = value.trim() === '' ? null : parseFloat(value)
    if (num !== null && (Number.isNaN(num) || num < 0.5 || num > 60)) return
    const current = c.partnerDiscountPercent ?? null
    if (num === current) return
    setDiscountSavingId(c.id)
    try {
      const updated = await updateAdminCompanyDiscount(c.id, num)
      setCompanies((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      if (detailCompany?.id === c.id) setDetailCompany(updated)
      setEditingDiscount((prev) => {
        const next = { ...prev }
        delete next[c.id]
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la actualizarea reducerii.')
    } finally {
      setDiscountSavingId(null)
    }
  }, [detailCompany?.id])

  const discountDebounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const handleDiscountInput = useCallback((c: AdminCompany, value: string) => {
    const prev = discountDebounceRef.current[c.id]
    if (prev) clearTimeout(prev)
    const num = value.trim() === '' ? null : parseFloat(value)
    if (num !== null && (Number.isNaN(num) || num < 0.5 || num > 60)) return
    discountDebounceRef.current[c.id] = setTimeout(() => {
      handleDiscountChange(c, value)
      delete discountDebounceRef.current[c.id]
    }, 600)
  }, [handleDiscountChange])

  useEffect(() => {
    if (!detailCompany || approveModalCompany) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDetailModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detailCompany, approveModalCompany, closeDetailModal])

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
            {/* Table 1: Partners Awaiting Approval */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
              <h2 className="text-base font-bold font-['Inter'] text-black px-5 py-4 border-b border-gray-200 bg-amber-50/50">
                Partners Awaiting Approval
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
                        <button type="button" onClick={() => handleSort('createdAt')} className="flex items-center hover:text-slate-900">
                          Înregistrat <SortIcon column="createdAt" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPending.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-gray-500">
                          {pendingCompanies.length === 0 ? 'Niciun partener în așteptarea aprobării.' : 'Niciun rezultat pentru căutarea ta.'}
                        </td>
                      </tr>
                    ) : (
                      filteredPending.map((c) => (
                        <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-3 px-4 text-gray-900 font-medium">{c.companyName || c.publicName || '—'}</td>
                          <td className="py-3 px-4 text-gray-700">{c.cui || '—'}</td>
                          <td className="py-3 px-4 text-gray-700">{c.user?.email ?? '—'}</td>
                          <td className="py-3 px-4 text-gray-700">{[c.contactFirstName, c.contactLastName].filter(Boolean).join(' ') || '—'}</td>
                          <td className="py-3 px-4 text-gray-700">{c.phone || '—'}</td>
                          <td className="py-3 px-4 text-gray-600">{formatDate(c.createdAt)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button type="button" onClick={() => handleViewDetails(c)} className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                                Detalii
                              </button>
                              <button
                                type="button"
                                onClick={() => openApproveModal(c)}
                                disabled={approvingId === c.id}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                              >
                                Aprobă
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSuspend(c)}
                                disabled={suspendingId === c.id}
                                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 disabled:opacity-50"
                              >
                                {suspendingId === c.id ? '...' : c.isSuspended ? 'Unsuspend' : 'Suspendă'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Approved Partners */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0">
              <h2 className="text-base font-bold font-['Inter'] text-black px-5 py-4 border-b border-gray-200 bg-green-50/50">
                Approved Partners
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
                        <button type="button" onClick={() => handleSort('activityTypes')} className="flex items-center hover:text-slate-900">
                          Activitate <SortIcon column="activityTypes" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <button type="button" onClick={() => handleSort('partnerDiscountPercent')} className="flex items-center hover:text-slate-900">
                          Reducere % <SortIcon column="partnerDiscountPercent" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <button type="button" onClick={() => handleSort('isPublic')} className="flex items-center hover:text-slate-900">
                          Public <SortIcon column="isPublic" />
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
                    {filteredApproved.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-gray-500">
                          {approvedCompanies.length === 0 ? 'Niciun partener aprobat.' : 'Niciun rezultat pentru căutarea ta.'}
                        </td>
                      </tr>
                    ) : (
                      filteredApproved.map((c) => (
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
                        <td className="py-3 px-4 text-gray-700">
                          {c.activityTypes ? c.activityTypes.split(',').join(', ') : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min={0.5}
                            max={60}
                            step={0.5}
                            placeholder="—"
                            value={editingDiscount[c.id] ?? (c.partnerDiscountPercent != null ? String(c.partnerDiscountPercent) : '')}
                            onChange={(e) => {
                              setEditingDiscount((prev) => ({ ...prev, [c.id]: e.target.value }))
                              handleDiscountInput(c, e.target.value)
                            }}
                            onBlur={(e) => {
                              const id = discountDebounceRef.current[c.id]
                              if (id) {
                                clearTimeout(id)
                                delete discountDebounceRef.current[c.id]
                              }
                              handleDiscountChange(c, e.target.value)
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                            disabled={discountSavingId === c.id}
                            className="w-16 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(c)}
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity ${
                              c.isSuspended
                                ? 'bg-red-100 text-red-800'
                                : !isPublicProfileComplete(c)
                                  ? 'bg-amber-100 text-amber-800'
                                  : c.isPublic
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {c.isSuspended ? 'Suspendat' : !isPublicProfileComplete(c) ? 'Pending' : c.isPublic ? 'Da' : 'Nu'}
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
                    <div className="min-w-0 col-span-2">
                      <dt className="text-gray-500 font-medium mb-0.5">Tipuri activitate</dt>
                      <dd className="text-gray-900">{detailCompany.activityTypes ? detailCompany.activityTypes.split(',').join(', ') : '—'}</dd>
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
                        <input
                          type="number"
                          min={0.5}
                          max={60}
                          step={0.5}
                          placeholder="—"
                          value={editingDiscount[detailCompany.id] ?? (detailCompany.partnerDiscountPercent != null ? String(detailCompany.partnerDiscountPercent) : '')}
                          onChange={(e) => {
                            setEditingDiscount((prev) => ({ ...prev, [detailCompany.id]: e.target.value }))
                            handleDiscountInput(detailCompany, e.target.value)
                          }}
                          onBlur={(e) => {
                            const id = discountDebounceRef.current[detailCompany.id]
                            if (id) {
                              clearTimeout(id)
                              delete discountDebounceRef.current[detailCompany.id]
                            }
                            handleDiscountChange(detailCompany, e.target.value)
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          disabled={discountSavingId === detailCompany.id}
                          className="w-24 max-w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 disabled:opacity-50"
                        />
                        <span className="text-gray-500 text-xs block w-full">(preț partener)</span>
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-gray-500 font-medium mb-0.5">Agent atribuit</dt>
                      <dd className="text-gray-900">{formatAssignedAgentLabel(salesAgents, detailCompany.assignedSalesAgentId)}</dd>
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
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                {!detailCompany.isApproved ? (
                  <button
                    type="button"
                    onClick={() => openApproveModal(detailCompany)}
                    disabled={approvingId === detailCompany.id}
                    className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Aprobă partenerul
                  </button>
                ) : null}
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

      {approveModalCompany && (
        <div
          className="fixed inset-0 z-[190] flex items-center justify-center bg-slate-900/40 p-4"
          role="presentation"
          onClick={() => !approvingId && closeApproveModal()}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-labelledby="approve-partner-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="approve-partner-modal-title" className="text-lg font-bold text-slate-900 font-['Inter']">
              Aprobă partenerul
            </h2>
            <p className="mt-1 text-sm text-slate-600 font-['Inter']">
              {approveModalCompany.companyName ||
                approveModalCompany.publicName ||
                approveModalCompany.user?.email ||
                '—'}
            </p>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-slate-700 font-['Inter']">
                Reducere % (față de catalog) <span className="text-red-500">*</span>
                <input
                  type="number"
                  min={0.5}
                  max={60}
                  step={0.5}
                  placeholder="Ex: 10"
                  value={approveDiscount}
                  onChange={(e) => setApproveDiscount(e.target.value)}
                  disabled={Boolean(approvingId)}
                  required
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 font-['Inter']">
                Agent de vânzări <span className="text-red-500">*</span>
                <select
                  value={approveAgentId}
                  onChange={(e) => setApproveAgentId(e.target.value)}
                  disabled={Boolean(approvingId)}
                  required
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                >
                  <option value="">— Selectează agentul —</option>
                  {salesAgents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {[a.firstName, a.lastName].filter(Boolean).join(' ').trim() || a.email || a.id}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {approveModalError ? (
              <p className="mt-3 text-sm text-red-600 font-['Inter']" role="alert">
                {approveModalError}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={Boolean(approvingId)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 font-['Inter']"
                onClick={() => !approvingId && closeApproveModal()}
              >
                Anulează
              </button>
              <button
                type="button"
                disabled={Boolean(approvingId)}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 font-['Inter']"
                onClick={() => void handleConfirmApprove()}
              >
                {approvingId ? 'Se aprobă…' : 'Aprobă'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {c.isApproved && (
                    <button
                      type="button"
                      onClick={() => void handleDeleteApproved(c)}
                      disabled={deletingId === c.id || suspendingId === c.id}
                      className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 border-t border-gray-100"
                    >
                      {deletingId === c.id ? 'Se șterge...' : 'Șterge'}
                    </button>
                  )}
                </>
              )
            })()}
          </div>,
          document.body,
        )}
    </div>
  )
}
