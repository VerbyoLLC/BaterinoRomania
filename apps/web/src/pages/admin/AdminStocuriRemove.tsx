import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, X } from 'lucide-react'
import {
  WAREHOUSE_SN_FACTORY_PREFIX,
  getAuthToken,
  moveAdminWarehouseSavedItemsBatch,
  type WarehouseBatchDestination,
  type WarehouseSavedItemBySerial,
} from '../../lib/api'
import { formatWarehouseSerialDisplay, useWarehouseSerialLookup } from './warehouseQrScan'
import { formatWarehouseItemLocation as formatLocation, formatWarehouseItemModel as formatModel } from './warehouseItemFormat'
import WarehouseSerialEntry from './WarehouseSerialEntry'

const BATCH_DESTINATIONS: { value: WarehouseBatchDestination; label: string; hint: string }[] = [
  { value: 'distribuitor', label: 'Distribuitor', hint: 'Vândut unui distribuitor sau instalator' },
  { value: 'client_final', label: 'Client final', hint: 'Livrat direct clientului' },
  { value: 'service', label: 'Service', hint: 'Trimis la service' },
]

export default function AdminStocuriRemove() {
  const navigate = useNavigate()
  const { serialBody, searching, item, notFound, error, lookup: lookupSerial, clear: clearResult } =
    useWarehouseSerialLookup()
  const [batch, setBatch] = useState<WarehouseSavedItemBySerial[]>([])
  const [step, setStep] = useState<'scan' | 'review'>('scan')
  const itemInBatch = item ? batch.some((b) => b.id === item.id) : false

  const [destination, setDestination] = useState<WarehouseBatchDestination | null>(null)
  const [destinationName, setDestinationName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const nameRequired = destination !== 'service'
  const canConfirm =
    batch.length > 0 && destination != null && (!nameRequired || destinationName.trim().length > 0) && !saving

  const confirmBatch = async () => {
    if (!canConfirm || !destination) return
    setSaving(true)
    setSaveError(null)
    try {
      const name = destinationName.trim()
      const { updated } = await moveAdminWarehouseSavedItemsBatch({
        ids: batch.map((b) => b.id),
        location: destination,
        name,
      })
      const label = BATCH_DESTINATIONS.find((d) => d.value === destination)?.label ?? destination
      setSavedMessage(
        `${updated} ${updated === 1 ? 'unitate a fost marcată' : 'unități au fost marcate'}: ${label}${name ? ` — ${name}` : ''}.`,
      )
      setBatch([])
      setDestination(null)
      setDestinationName('')
      setStep('scan')
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Eroare la salvarea batch-ului.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!getAuthToken()) navigate('/admin/login', { replace: true })
  }, [navigate])

  const addToBatch = () => {
    if (!item || itemInBatch) return
    setBatch((prev) => [...prev, item])
    clearResult()
  }

  const removeFromBatch = (id: string) => {
    setBatch((prev) => prev.filter((b) => b.id !== id))
  }

  const goNext = () => {
    if (item && !itemInBatch) setBatch((prev) => [...prev, item])
    clearResult()
    setStep('review')
  }

  const lookup = (digits: string) => {
    setSavedMessage(null)
    void lookupSerial(digits)
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Remove</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        {step === 'scan'
          ? 'Scanează codul QR sau introdu manual numărul de serie, apoi adaugă unitatea în batch. Poți adăuga mai multe unități.'
          : 'Verifică unitățile din batch înainte de a continua.'}
      </p>

      {step === 'scan' && (
      <div className="space-y-6">
        <WarehouseSerialEntry onSerial={lookup} busy={searching} />

        {savedMessage && (
          <p
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-['Inter']"
            role="status"
          >
            {savedMessage}
          </p>
        )}

        {(serialBody || searching) && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-live="polite">
            <p className="text-xs font-medium text-slate-500 font-['Inter']">Număr serie</p>
            <p className="mt-1 overflow-x-auto whitespace-nowrap font-mono text-sm font-bold tabular-nums text-slate-900 sm:text-2xl">
              {formatWarehouseSerialDisplay(WAREHOUSE_SN_FACTORY_PREFIX, serialBody) || '—'}
            </p>

            {searching && (
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600 font-['Inter']">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Se caută în stocuri…
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
                {error}
              </p>
            )}

            {notFound && (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 font-['Inter']">
                Acest număr de serie nu există în stocuri.
              </p>
            )}

            {item && (
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-medium text-slate-500 font-['Inter']">Model</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900 font-['Inter']">{formatModel(item)}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-medium text-slate-500 font-['Inter']">Locație</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900 font-['Inter']">{formatLocation(item)}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-medium text-slate-500 font-['Inter']">Data fabricației</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900 font-['Inter']">{item.producedOn || '—'}</dd>
                </div>
              </dl>
            )}

            {item && (
              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={addToBatch}
                  disabled={itemInBatch}
                  className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 sm:px-5 font-['Inter']"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  {itemInBatch ? 'Deja în batch' : 'Add to batch'}
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 sm:px-5 font-['Inter']"
                >
                  Next
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            )}
          </div>
        )}

        {batch.length > 0 && (
          <BatchTable batch={batch} onRemove={removeFromBatch} />
        )}

        {batch.length > 0 && !item && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={goNext}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 font-['Inter']"
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          {batch.length > 0 && <BatchTable batch={batch} onRemove={removeFromBatch} />}
          {batch.length === 0 && (
            <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 font-['Inter']">
              Batch-ul este gol. Revino la scanare pentru a adăuga unități.
            </p>
          )}

          {batch.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <fieldset>
                <legend className="text-base font-bold text-slate-900 font-['Inter']">Unde merge batch-ul?</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {BATCH_DESTINATIONS.map((d) => {
                    const selected = destination === d.value
                    return (
                      <label
                        key={d.value}
                        className={`relative flex cursor-pointer flex-col rounded-xl border px-4 py-3 font-['Inter'] transition-colors ${
                          selected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="batch-destination"
                          value={d.value}
                          checked={selected}
                          onChange={() => {
                            setDestination(d.value)
                            setSaveError(null)
                          }}
                          className="sr-only"
                        />
                        <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                          {d.label}
                          {selected && <Check className="h-4 w-4" aria-hidden />}
                        </span>
                        <span className={`mt-0.5 text-xs ${selected ? 'text-slate-300' : 'text-slate-500'}`}>{d.hint}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <label htmlFor="batch-destination-name" className="mt-5 block text-sm font-semibold text-slate-800 font-['Inter']">
                Nume client{destination === 'service' ? ' (opțional)' : ''}
              </label>
              <input
                id="batch-destination-name"
                type="text"
                value={destinationName}
                maxLength={200}
                onChange={(e) => {
                  setDestinationName(e.target.value)
                  setSaveError(null)
                }}
                placeholder={destination === 'distribuitor' ? 'ex. SC Solar Install SRL' : 'ex. Ion Popescu'}
                className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 font-['Inter']"
              />

              {saveError && (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
                  {saveError}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep('scan')}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 sm:px-5 font-['Inter']"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Înapoi
            </button>
            {batch.length > 0 && (
              <button
                type="button"
                onClick={() => void confirmBatch()}
                disabled={!canConfirm}
                className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 sm:px-5 font-['Inter']"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
                Confirmă ({batch.length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function BatchTable({
  batch,
  onRemove,
}: {
  batch: WarehouseSavedItemBySerial[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
        <h2 className="mt-0 text-base font-bold text-slate-900 font-['Inter']">Batch</h2>
        <span className="text-sm text-slate-500 font-['Inter']">
          {batch.length} {batch.length === 1 ? 'unitate' : 'unități'}
        </span>
      </div>
      <ul className="divide-y divide-slate-100 sm:hidden">
        {batch.map((b, i) => (
          <li key={b.id} className="flex items-start gap-3 px-4 py-3 font-['Inter']">
            <span className="pt-0.5 text-sm text-slate-400 tabular-nums">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="break-all font-mono text-xs font-semibold text-slate-900">{b.serialNumber}</p>
              <p className="mt-1 text-sm text-slate-800">{formatModel(b)}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {formatLocation(b)} · {b.producedOn || '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(b.id)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label={`Scoate ${b.serialNumber} din batch`}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm font-['Inter']">
          <thead className="bg-slate-50 text-xs font-medium text-slate-500">
            <tr>
              <th className="px-4 py-2.5 sm:px-5">#</th>
              <th className="px-4 py-2.5">Număr serie</th>
              <th className="px-4 py-2.5">Model</th>
              <th className="px-4 py-2.5">Locație</th>
              <th className="px-4 py-2.5">Data fabricației</th>
              <th className="px-4 py-2.5 sm:px-5">
                <span className="sr-only">Acțiuni</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {batch.map((b, i) => (
              <tr key={b.id}>
                <td className="px-4 py-3 text-slate-500 tabular-nums sm:px-5">{i + 1}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold">{b.serialNumber}</td>
                <td className="px-4 py-3">{formatModel(b)}</td>
                <td className="px-4 py-3">{formatLocation(b)}</td>
                <td className="px-4 py-3 tabular-nums">{b.producedOn || '—'}</td>
                <td className="px-4 py-3 text-right sm:px-5">
                  <button
                    type="button"
                    onClick={() => onRemove(b.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Scoate ${b.serialNumber} din batch`}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
