import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CATALOG_CURRENCY_CODES,
  getAdminCatalogCurrency,
  getAuthToken,
  saveAdminCatalogCurrency,
  type CatalogCurrencyCode,
} from '../../lib/api'
import { CATALOG_CURRENCY_UPDATED_EVENT } from '../../contexts/CatalogCurrencyContext'

export default function AdminCurrency() {
  const navigate = useNavigate()
  const [currency, setCurrency] = useState<CatalogCurrencyCode>('RON')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedOk, setSavedOk] = useState(false)

  const load = useCallback(() => {
    if (!getAuthToken()) return
    setLoading(true)
    setError('')
    getAdminCatalogCurrency()
      .then(({ currency: c }) => setCurrency(c))
      .catch((err) => {
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

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSavedOk(false)
    try {
      const { currency: saved } = await saveAdminCatalogCurrency(currency)
      setCurrency(saved)
      setSavedOk(true)
      window.dispatchEvent(new Event(CATALOG_CURRENCY_UPDATED_EVENT))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Currency</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">
        Moneda afișată lângă prețurile produselor pe site (catalog, pagini produs, panou parteneri).
      </p>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 font-['Inter']">
        <p className="font-semibold text-amber-900 mb-1">Developer (temporary)</p>
        <p className="text-amber-900/90 leading-relaxed m-0">
          This feature will be developed later. Based on the currency we change the currency display on the
          residential cards, and also the currency in the edit product panel.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
          {error}
        </div>
      )}
      {savedOk && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-['Inter']">
          Moneda a fost salvată.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="admin-catalog-currency" className="text-sm font-semibold text-slate-800 font-['Inter'] shrink-0">
            Currencies:
          </label>
          <select
            id="admin-catalog-currency"
            value={currency}
            disabled={loading}
            onChange={(e) => {
              setCurrency(e.target.value as CatalogCurrencyCode)
              setSavedOk(false)
            }}
            className="min-w-[140px] rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-['Inter'] text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
          >
            {CATALOG_CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white font-['Inter'] hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Se salvează…' : 'Salvează'}
          </button>
        </div>
        {loading && <p className="mt-4 text-sm text-gray-500 font-['Inter']">Se încarcă…</p>}
      </div>
    </div>
  )
}
