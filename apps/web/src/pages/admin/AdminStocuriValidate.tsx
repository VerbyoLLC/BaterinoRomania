import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Loader2, Warehouse } from 'lucide-react'
import {
  WAREHOUSE_SITE_LABELS,
  WAREHOUSE_SN_FACTORY_PREFIX,
  getAuthToken,
  setAdminWarehouseSavedItemSite,
  type WarehouseSite,
} from '../../lib/api'
import { formatWarehouseSerialDisplay, useWarehouseSerialLookup } from './warehouseQrScan'
import { formatWarehouseItemLocation, formatWarehouseItemModel } from './warehouseItemFormat'
import WarehouseSerialEntry from './WarehouseSerialEntry'

const SITE_OPTIONS = Object.entries(WAREHOUSE_SITE_LABELS) as [WarehouseSite, string][]

function formatDateTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('ro-RO', { dateStyle: 'short', timeStyle: 'short' }).format(d)
}

export default function AdminStocuriValidate() {
  const navigate = useNavigate()
  const { serialBody, searching, item, notFound, error, lookup, clear } = useWarehouseSerialLookup()
  const [site, setSite] = useState<WarehouseSite | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState<{ id: string; site: WarehouseSite; at: string } | null>(null)

  useEffect(() => {
    if (!getAuthToken()) navigate('/admin/login', { replace: true })
  }, [navigate])

  const startLookup = (digits: string) => {
    setSite(null)
    setSaveError(null)
    setSaved(null)
    void lookup(digits)
  }

  const confirm = async () => {
    if (!item || !site) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await setAdminWarehouseSavedItemSite(item.id, site)
      setSaved({ id: item.id, site: res.warehouseSite, at: res.warehouseSiteAt })
      setSite(null)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Eroare la alocarea depozitului.')
    } finally {
      setSaving(false)
    }
  }

  const justSaved = saved && item && saved.id === item.id ? saved : null
  const currentSite = justSaved ? justSaved.site : item?.warehouseSite ?? null
  const currentSiteAt = justSaved ? justSaved.at : item?.warehouseSiteAt ?? null

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Validate</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Scanează codul QR sau introdu manual numărul de serie, apoi alege depozitul în care se află unitatea.
      </p>

      <div className="space-y-6">
        <WarehouseSerialEntry onSerial={startLookup} busy={searching || saving} />

        {(serialBody || searching) && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-live="polite">
            <p className="text-xs font-medium text-slate-500 font-['Inter']">Număr serie</p>
            <p className="mt-1 font-mono text-sm font-bold tabular-nums text-slate-900 sm:text-2xl">
              {formatWarehouseSerialDisplay(WAREHOUSE_SN_FACTORY_PREFIX, serialBody) || '—'}
            </p>

            {searching && (
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-600 font-['Inter']">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Se caută în stocuri…
              </p>
            )}
            {notFound && (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 font-['Inter']">
                Numărul de serie nu există în stocuri.
              </p>
            )}
            {error && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-['Inter']" role="alert">
                {error}
              </p>
            )}

            {item && (
              <>
                <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-medium text-slate-500 font-['Inter']">Model</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-900 font-['Inter']">{formatWarehouseItemModel(item)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500 font-['Inter']">Locație</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-900 font-['Inter']">{formatWarehouseItemLocation(item)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500 font-['Inter']">Depozit alocat</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-900 font-['Inter']">
                      {currentSite ? (
                        <>
                          {WAREHOUSE_SITE_LABELS[currentSite] ?? currentSite}
                          {currentSiteAt && (
                            <span className="block text-xs font-normal text-slate-500">{formatDateTime(currentSiteAt)}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-amber-700">Nealocat</span>
                      )}
                    </dd>
                  </div>
                </dl>

                {justSaved ? (
                  <div className="mt-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" role="status">
                    <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800 font-['Inter']">
                      <Check className="h-4 w-4" aria-hidden />
                      Alocat în {WAREHOUSE_SITE_LABELS[justSaved.site]}.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSaved(null)
                        clear()
                      }}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 font-['Inter']"
                    >
                      Scanează următoarea
                    </button>
                  </div>
                ) : (
                  <fieldset className="mt-5">
                    <legend className="mb-2 text-sm font-semibold text-slate-800 font-['Inter']">Alege depozitul</legend>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {SITE_OPTIONS.map(([value, label]) => (
                        <label
                          key={value}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
                            site === value ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="warehouse-site"
                            value={value}
                            checked={site === value}
                            onChange={() => setSite(value)}
                            className="sr-only"
                          />
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                            <Warehouse className="h-5 w-5" aria-hidden />
                          </span>
                          <span className="flex-1 text-sm font-semibold text-slate-900 font-['Inter']">
                            {label}
                            {currentSite === value && (
                              <span className="block text-xs font-normal text-slate-500">Alocarea curentă</span>
                            )}
                          </span>
                          {site === value && <Check className="h-5 w-5 text-slate-900" aria-hidden />}
                        </label>
                      ))}
                    </div>
                    {saveError && (
                      <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-['Inter']" role="alert">
                        {saveError}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => void confirm()}
                      disabled={!site || saving}
                      className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto font-['Inter']"
                    >
                      {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                      Confirmă
                    </button>
                  </fieldset>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
