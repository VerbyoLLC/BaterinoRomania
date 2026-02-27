import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminCompanies, getAuthToken, testApiDb, suspendAdminCompany, approveAdminCompany, updateAdminCompanyDiscount, isPublicProfileComplete, type AdminCompany } from '../../lib/api'

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
  const [isClosingPanel, setIsClosingPanel] = useState(false)
  const [actionOpenId, setActionOpenId] = useState<string | null>(null)
  const [discountSavingId, setDiscountSavingId] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [suspendingId, setSuspendingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<keyof AdminCompany | 'user' | ''>('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const actionRef = useRef<HTMLDivElement>(null)

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
        return name.includes(q) || cui.includes(q) || email.includes(q) || contact.includes(q) || phone.includes(q) || reg.includes(q) || activity.includes(q)
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
      .then(setCompanies)
      .catch((err) => setError(err instanceof Error ? err.message : 'Eroare la încărcare.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    loadCompanies()
  }, [navigate])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setActionOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleViewDetails = (c: AdminCompany) => {
    setDetailCompany(c)
    setIsClosingPanel(false)
  }

  const handleClosePanel = () => {
    setIsClosingPanel(true)
  }

  const handlePanelTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return
    if (isClosingPanel) {
      setDetailCompany(null)
      setIsClosingPanel(false)
    }
  }

  const handleSuspend = async (c: AdminCompany) => {
    setActionOpenId(null)
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

  const handleApprove = async (c: AdminCompany) => {
    setApprovingId(c.id)
    try {
      const updated = await approveAdminCompany(c.id)
      setCompanies((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      if (detailCompany?.id === c.id) setDetailCompany(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la aprobare.')
    } finally {
      setApprovingId(null)
    }
  }

  const handleDiscountChange = async (c: AdminCompany, value: string) => {
    const num = value.trim() === '' ? null : parseFloat(value)
    if (num !== null && (Number.isNaN(num) || num < 0.5 || num > 60)) return
    const current = c.partnerDiscountPercent ?? null
    if (num === current) return
    setDiscountSavingId(c.id)
    try {
      const updated = await updateAdminCompanyDiscount(c.id, num)
      setCompanies((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      if (detailCompany?.id === c.id) setDetailCompany(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la actualizarea reducerii.')
    } finally {
      setDiscountSavingId(null)
    }
  }

  const panelOpen = detailCompany !== null || isClosingPanel

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
    <div className={`flex flex-col w-full min-h-0 ${panelOpen ? 'h-[calc(100vh-4rem)] lg:h-screen overflow-hidden' : ''}`}>
      <div className="p-6 sm:p-8 lg:p-10 flex-1 min-w-0 overflow-hidden flex flex-col">
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
          <div className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col gap-8 ${panelOpen ? 'overflow-hidden' : ''}`}>
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
                                onClick={() => handleApprove(c)}
                                disabled={approvingId === c.id}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {approvingId === c.id ? 'Se aprobă...' : 'Aprobă'}
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
                            key={`${c.id}-${c.partnerDiscountPercent ?? ''}`}
                            type="number"
                            min={0.5}
                            max={60}
                            step={0.5}
                            placeholder="—"
                            defaultValue={c.partnerDiscountPercent ?? ''}
                            onBlur={(e) => handleDiscountChange(c, e.target.value)}
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
                            <div className="relative" ref={actionOpenId === c.id ? actionRef : undefined}>
                              <button
                                type="button"
                                onClick={() => setActionOpenId(actionOpenId === c.id ? null : c.id)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                              >
                                Acțiuni
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {actionOpenId === c.id && (
                                <div className="absolute right-0 top-full mt-1 py-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                  <button
                                    type="button"
                                    onClick={() => handleSuspend(c)}
                                    disabled={suspendingId === c.id}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    {c.isSuspended ? 'Unsuspend' : 'Suspendă'}
                                  </button>
                                </div>
                              )}
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

          {/* Right: detail panel slides in from right (fixed overlay) */}
          <div
              className={`fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white border-l border-gray-200 shadow-xl z-40 transition-transform duration-300 ease-out ${
                isClosingPanel ? 'translate-x-full' : detailCompany ? 'translate-x-0' : 'translate-x-full'
              }`}
              onTransitionEnd={handlePanelTransitionEnd}
            >
              {detailCompany && (
                <div className="p-6 overflow-y-auto h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold font-['Inter'] text-black">Detalii companie</h2>
                    <button
                      type="button"
                      onClick={handleClosePanel}
                      className="text-gray-500 hover:text-slate-900 p-1"
                      aria-label="Închide"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <dl className="space-y-4 text-sm">
                    {/* Date companie */}
                    <div className="pb-4 border-b border-gray-200">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Date companie</h3>
                      <div className="space-y-3">
                        <div><dt className="text-gray-500 font-medium mb-0.5">Denumire</dt><dd className="text-gray-900">{detailCompany.companyName || '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">CUI</dt><dd className="text-gray-900">{detailCompany.cui || '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Cod Registrul Comerțului</dt><dd className="text-gray-900">{detailCompany.tradeRegisterNumber || '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Email</dt><dd className="text-gray-900">{detailCompany.user?.email ?? '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Contact</dt><dd className="text-gray-900">{[detailCompany.contactFirstName, detailCompany.contactLastName].filter(Boolean).join(' ') || '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Telefon</dt><dd className="text-gray-900">{detailCompany.phone || '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Tipuri activitate</dt><dd className="text-gray-900">{detailCompany.activityTypes ? detailCompany.activityTypes.split(',').join(', ') : '—'}</dd></div>
                        <div>
                          <dt className="text-gray-500 font-medium mb-0.5">Reducere %</dt>
                          <dd className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0.5}
                              max={60}
                              step={0.5}
                              placeholder="—"
                              defaultValue={detailCompany.partnerDiscountPercent ?? ''}
                              onBlur={(e) => handleDiscountChange(detailCompany, e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                              disabled={discountSavingId === detailCompany.id}
                              className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 disabled:opacity-50"
                            />
                            <span className="text-gray-500 text-xs">(prețul afișat partenerului)</span>
                          </dd>
                        </div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Înregistrat</dt><dd className="text-gray-900">{formatDate(detailCompany.createdAt)}</dd></div>
                      </div>
                    </div>

                    {/* Profil public */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Profil public</h3>
                      <div className="space-y-3">
                        <div>
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
                        <div><dt className="text-gray-500 font-medium mb-0.5">Nume public</dt><dd className="text-gray-900">{detailCompany.publicName || '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Descriere</dt><dd className="text-gray-900 whitespace-pre-wrap">{detailCompany.description || '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Adresă</dt><dd className="text-gray-900">{[detailCompany.street, detailCompany.city, detailCompany.county].filter(Boolean).join(', ') || detailCompany.address || '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Cod poștal</dt><dd className="text-gray-900">{detailCompany.zipCode || '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Servicii</dt><dd className="text-gray-900">{detailCompany.services ? detailCompany.services.split(',').join(', ') : '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Telefon public</dt><dd className="text-gray-900">{detailCompany.publicPhone || '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">WhatsApp</dt><dd className="text-gray-900">{detailCompany.whatsapp || '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Website</dt><dd className="text-gray-900">{detailCompany.website ? <a href={detailCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{detailCompany.website}</a> : '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">Facebook</dt><dd className="text-gray-900">{detailCompany.facebookUrl ? <a href={detailCompany.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{detailCompany.facebookUrl}</a> : '—'}</dd></div>
                        <div><dt className="text-gray-500 font-medium mb-0.5">LinkedIn</dt><dd className="text-gray-900">{detailCompany.linkedinUrl ? <a href={detailCompany.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{detailCompany.linkedinUrl}</a> : '—'}</dd></div>
                        {detailCompany.logoUrl && (
                          <div><dt className="text-gray-500 font-medium mb-0.5">Logo</dt><dd><img src={detailCompany.logoUrl} alt="Logo" className="h-16 w-auto object-contain rounded" /></dd></div>
                        )}
                      </div>
                    </div>
                  </dl>
                  <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                    {!detailCompany.isApproved && (
                      <button
                        type="button"
                        onClick={() => handleApprove(detailCompany)}
                        disabled={approvingId === detailCompany.id}
                        className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {approvingId === detailCompany.id ? 'Se aprobă...' : 'Aprobă partenerul'}
                      </button>
                    )}
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
              )}
          </div>
        </div>
      </div>
      {/* Backdrop when panel open (mobile) */}
      {panelOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={handleClosePanel}
          aria-hidden
        />
      )}
    </div>
  )
}
