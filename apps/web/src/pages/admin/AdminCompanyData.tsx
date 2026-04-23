import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAdminCompanyData,
  getAuthToken,
  saveAdminCompanyData,
  type AdminCompanyData,
  type CompanyBankAccount,
} from '../../lib/api'

function emptyBankAccount(): CompanyBankAccount {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `acc-${Date.now()}`,
    bankName: '',
    iban: '',
    swift: '',
    accountName: '',
    currency: 'RON',
  }
}

export default function AdminCompanyData() {
  const navigate = useNavigate()
  const [data, setData] = useState<AdminCompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedOk, setSavedOk] = useState(false)

  const load = useCallback(() => {
    if (!getAuthToken()) return
    setLoading(true)
    setError('')
    getAdminCompanyData()
      .then(setData)
      .catch((err) => {
        setData(null)
        setError(err instanceof Error ? err.message : 'Eroare la încărcare.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    load()
  }, [navigate, load])

  const setField = (field: 'name' | 'cui' | 'address', value: string) => {
    setData((prev) => (prev ? { ...prev, [field]: value } : prev))
    setSavedOk(false)
  }

  const updateAccount = (id: string, field: keyof Omit<CompanyBankAccount, 'id'>, value: string) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            bankAccounts: prev.bankAccounts.map((a) =>
              a.id === id ? { ...a, [field]: value } : a
            ),
          }
        : prev
    )
    setSavedOk(false)
  }

  const addAccount = () => {
    setData((prev) =>
      prev ? { ...prev, bankAccounts: [...prev.bankAccounts, emptyBankAccount()] } : prev
    )
    setSavedOk(false)
  }

  const removeAccount = (id: string) => {
    setData((prev) =>
      prev ? { ...prev, bankAccounts: prev.bankAccounts.filter((a) => a.id !== id) } : prev
    )
    setSavedOk(false)
  }

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    setError('')
    setSavedOk(false)
    try {
      const saved = await saveAdminCompanyData(data)
      setData(saved)
      setSavedOk(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-['Inter'] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/40"

  const skeletonBar = 'rounded-lg bg-slate-100 border border-slate-200/80 animate-pulse'
  const skeletonLabel = 'h-3.5 rounded bg-slate-200/90 animate-pulse'

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,320px)] lg:items-start">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Date companie</h1>
          <p className="text-gray-500 text-sm font-['Inter'] mb-6">
            Datele firmei Baterino SRL folosite pentru documente, facturi și comunicări oficiale. Poți adăuga unul sau mai multe conturi bancare.
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter'] space-y-3">
              <p>{error}</p>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-900 hover:bg-red-50 disabled:opacity-50"
              >
                Reîncearcă
              </button>
            </div>
          )}
          {savedOk && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-['Inter']">
              Modificările au fost salvate.
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 space-y-8">
            <section className="space-y-4">
              <div className="h-4 w-36 rounded bg-slate-200/90 animate-pulse" aria-hidden />
              <div className="space-y-2">
                <div className={`w-24 ${skeletonLabel}`} aria-hidden />
                <div className={`h-10 w-full ${skeletonBar}`} aria-hidden />
              </div>
              <div className="space-y-2">
                <div className={`w-16 ${skeletonLabel}`} aria-hidden />
                <div className={`h-10 w-full max-w-xs ${skeletonBar}`} aria-hidden />
              </div>
              <div className="space-y-2">
                <div className={`w-20 ${skeletonLabel}`} aria-hidden />
                <div className={`min-h-[80px] h-24 w-full ${skeletonBar}`} aria-hidden />
              </div>
            </section>
            <section className="space-y-4 border-t border-gray-100 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="h-4 w-40 rounded bg-slate-200/90 animate-pulse" aria-hidden />
                <div className="h-10 w-40 rounded-lg bg-slate-100 border border-slate-200/80 animate-pulse" aria-hidden />
              </div>
              <div className="rounded-xl border border-gray-200 bg-slate-50/50 p-4 sm:p-5 space-y-4">
                <div className="h-3 w-20 rounded bg-slate-200/90 animate-pulse" aria-hidden />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className={`w-28 ${skeletonLabel}`} aria-hidden />
                    <div className={`h-10 w-full ${skeletonBar}`} aria-hidden />
                  </div>
                ))}
              </div>
            </section>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <div className="h-10 w-28 rounded-[10px] bg-slate-200/90 animate-pulse" aria-hidden />
            </div>
            <p className="text-xs text-slate-400 font-['Inter']">Se încarcă datele…</p>
          </div>
        ) : data ? (
          <div className="p-6 sm:p-8 space-y-8">
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 font-['Inter'] uppercase tracking-wide">
                Identificare
              </h2>
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-slate-700 font-['Inter'] mb-1.5">
                  Denumire
                </label>
                <input
                  id="company-name"
                  type="text"
                  className={inputClass}
                  value={data.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="ex. Baterino SRL"
                  autoComplete="organization"
                />
              </div>
              <div>
                <label htmlFor="company-cui" className="block text-sm font-medium text-slate-700 font-['Inter'] mb-1.5">
                  CUI
                </label>
                <input
                  id="company-cui"
                  type="text"
                  className={inputClass}
                  value={data.cui}
                  onChange={(e) => setField('cui', e.target.value)}
                  placeholder="Cod unic de înregistrare"
                />
              </div>
              <div>
                <label htmlFor="company-address" className="block text-sm font-medium text-slate-700 font-['Inter'] mb-1.5">
                  Adresă
                </label>
                <textarea
                  id="company-address"
                  rows={3}
                  className={`${inputClass} resize-y min-h-[80px]`}
                  value={data.address}
                  onChange={(e) => setField('address', e.target.value)}
                  placeholder="Adresă sediu social"
                />
              </div>
            </section>

            <section className="space-y-4 border-t border-gray-100 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-800 font-['Inter'] uppercase tracking-wide">
                  Conturi bancare
                </h2>
                <button
                  type="button"
                  onClick={addAccount}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 font-['Inter'] hover:bg-slate-50"
                >
                  Adaugă cont bancar
                </button>
              </div>

              {data.bankAccounts.length === 0 ? (
                <p className="text-sm text-gray-500 font-['Inter']">
                  Niciun cont încă. Apasă „Adaugă cont bancar” pentru a introduce IBAN, SWIFT etc.
                </p>
              ) : (
                <ul className="space-y-6">
                  {data.bankAccounts.map((acc, index) => (
                    <li
                      key={acc.id}
                      className="rounded-xl border border-gray-200 bg-slate-50/50 p-4 sm:p-5 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-500 font-['Inter'] uppercase tracking-wide">
                          Cont {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAccount(acc.id)}
                          className="text-sm font-medium text-red-700 hover:text-red-900 font-['Inter']"
                        >
                          Șterge
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 font-['Inter'] mb-1.5">
                          Denumire bancă
                        </label>
                        <input
                          type="text"
                          className={inputClass}
                          value={acc.bankName}
                          onChange={(e) => updateAccount(acc.id, 'bankName', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 font-['Inter'] mb-1.5">
                          IBAN
                        </label>
                        <input
                          type="text"
                          className={inputClass}
                          value={acc.iban}
                          onChange={(e) => updateAccount(acc.id, 'iban', e.target.value)}
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 font-['Inter'] mb-1.5">
                          SWIFT
                        </label>
                        <input
                          type="text"
                          className={inputClass}
                          value={acc.swift}
                          onChange={(e) => updateAccount(acc.id, 'swift', e.target.value)}
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 font-['Inter'] mb-1.5">
                          Monedă cont
                        </label>
                        <select
                          className={inputClass}
                          value={acc.currency}
                          onChange={(e) => updateAccount(acc.id, 'currency', e.target.value)}
                        >
                          <option value="RON">RON</option>
                          <option value="EUR">EURO</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 font-['Inter'] mb-1.5">
                          Titular cont
                        </label>
                        <input
                          type="text"
                          className={inputClass}
                          value={acc.accountName}
                          onChange={(e) => updateAccount(acc.id, 'accountName', e.target.value)}
                          placeholder="Denumire titular"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-[10px] bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white font-['Inter'] outline outline-1 outline-offset-[-1px] outline-zinc-300 hover:bg-transparent hover:outline-slate-900 hover:text-black disabled:opacity-50"
              >
                {saving ? 'Se salvează…' : 'Salvează'}
              </button>
            </div>
          </div>
        ) : (
          <p className="p-8 text-gray-500 text-sm font-['Inter']">Nu s-au putut încărca datele.</p>
        )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 shadow-sm">
            <p className="text-sm font-medium text-slate-800 font-['Inter'] leading-relaxed">
              Aceste date sunt folosite pentru generarea automată a proformei și a facturilor.
            </p>
          </div>
          <div className="rounded-xl border border-sky-200/80 bg-sky-50/90 px-4 py-3.5 shadow-sm">
            <p className="text-sm font-medium text-sky-950/90 font-['Inter'] leading-relaxed">
              IBAN și SWIFT se salvează în baza de date la „Salvează” și apar la următoarea încărcare a paginii.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
