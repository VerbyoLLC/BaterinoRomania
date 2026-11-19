import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Camera, CameraOff, Check, Keyboard, Loader2, Plus, QrCode, X } from 'lucide-react'
import {
  WAREHOUSE_SN_BODY_DIGITS,
  WAREHOUSE_SN_FACTORY_PREFIX,
  getAdminWarehouseSavedItemBySerial,
  getAuthToken,
  moveAdminWarehouseSavedItemsBatch,
  warehouseSerialToBodyDigits,
  type WarehouseBatchDestination,
  type WarehouseSavedItemBySerial,
  type WarehouseSavedItemLocation,
} from '../../lib/api'
import { canUseBrowserCamera, formatWarehouseSerialDisplay, useWarehouseQrScanner } from './warehouseQrScan'

const WAREHOUSE_LOCATION_LABELS: Record<WarehouseSavedItemLocation, string> = {
  depozit: 'Depozit',
  distribuitor: 'Distribuitor',
  client_final: 'Client Final',
  service: 'Service',
}

const BATCH_DESTINATIONS: { value: WarehouseBatchDestination; label: string; hint: string }[] = [
  { value: 'distribuitor', label: 'Distribuitor', hint: 'Vândut unui distribuitor sau instalator' },
  { value: 'client_final', label: 'Client final', hint: 'Livrat direct clientului' },
  { value: 'service', label: 'Service', hint: 'Trimis la service' },
]

const SN_GROUP_SIZE = 4
const SN_GROUP_COUNT = WAREHOUSE_SN_BODY_DIGITS / SN_GROUP_SIZE
const EMPTY_SN_GROUPS: string[] = Array.from({ length: SN_GROUP_COUNT }, () => '')
const SN_GROUP_PLACEHOLDERS = ['5131', '4003', '2507', '0001']

function formatLocation(item: WarehouseSavedItemBySerial) {
  const key = String(item.location || 'depozit').trim() as WarehouseSavedItemLocation
  const label = WAREHOUSE_LOCATION_LABELS[key] ?? 'Depozit'
  const who =
    key === 'distribuitor' ? item.distributor : key !== 'depozit' ? item.clientName || (key === 'client_final' ? item.client : null) : null
  return who ? `${label} — ${who}` : label
}

function formatModel(item: WarehouseSavedItemBySerial) {
  const name = item.modelName && item.modelName !== item.modelNumber ? ` — ${item.modelName}` : ''
  const brand = item.brand ? ` [${item.brand}]` : ''
  return `${item.modelNumber}${name}${brand}`
}

export default function AdminStocuriRemove() {
  const navigate = useNavigate()
  const [serialBody, setSerialBody] = useState('')
  const [searching, setSearching] = useState(false)
  const [item, setItem] = useState<WarehouseSavedItemBySerial | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [manualOpen, setManualOpen] = useState(false)
  const [manualGroups, setManualGroups] = useState<string[]>(EMPTY_SN_GROUPS)
  const manualDigits = manualGroups.join('')
  const [manualError, setManualError] = useState<string | null>(null)
  const groupInputRefs = useRef<(HTMLInputElement | null)[]>([])

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

  const clearResult = () => {
    setSerialBody('')
    setItem(null)
    setNotFound(false)
    setError(null)
  }

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

  const lookup = useCallback(async (digits: string) => {
    setSavedMessage(null)
    setSerialBody(digits)
    setItem(null)
    setNotFound(false)
    setError(null)
    if (digits.length !== WAREHOUSE_SN_BODY_DIGITS) {
      setError(`Codul citit nu conține un SN valid (${WAREHOUSE_SN_FACTORY_PREFIX} + ${WAREHOUSE_SN_BODY_DIGITS} cifre).`)
      return
    }
    setSearching(true)
    try {
      const found = await getAdminWarehouseSavedItemBySerial(`${WAREHOUSE_SN_FACTORY_PREFIX}${digits}`)
      if (found) setItem(found)
      else setNotFound(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eroare la căutarea numărului de serie.')
    } finally {
      setSearching(false)
    }
  }, [])

  const { videoRef, scanning, scanError, startScanner, stopScanner } = useWarehouseQrScanner((raw) => {
    void lookup(warehouseSerialToBodyDigits(raw))
  })

  const openManual = () => {
    stopScanner()
    setManualGroups(EMPTY_SN_GROUPS)
    setManualError(null)
    setManualOpen(true)
  }

  /** Typing past 4 digits, or pasting a whole SN, spills over into the following groups. */
  const changeGroup = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    const next = [...manualGroups]
    let rest = digits
    let last = index
    for (let g = index; g < SN_GROUP_COUNT && (g === index || rest); g++) {
      next[g] = rest.slice(0, SN_GROUP_SIZE)
      rest = rest.slice(SN_GROUP_SIZE)
      last = g
    }
    setManualGroups(next)
    setManualError(null)
    const focusIndex = next[last].length === SN_GROUP_SIZE ? Math.min(last + 1, SN_GROUP_COUNT - 1) : last
    if (focusIndex !== index) groupInputRefs.current[focusIndex]?.focus()
  }

  const groupKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace' || manualGroups[index] || index === 0) return
    e.preventDefault()
    const next = [...manualGroups]
    next[index - 1] = next[index - 1].slice(0, -1)
    setManualGroups(next)
    groupInputRefs.current[index - 1]?.focus()
  }

  useEffect(() => {
    if (!manualOpen) return
    const id = window.setTimeout(() => groupInputRefs.current[0]?.focus(), 50)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setManualOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [manualOpen])

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualDigits.length !== WAREHOUSE_SN_BODY_DIGITS) {
      setManualError(`Introdu exact ${WAREHOUSE_SN_BODY_DIGITS} cifre.`)
      return
    }
    setManualOpen(false)
    void lookup(manualDigits)
  }

  const cameraSupported = typeof window !== 'undefined' && canUseBrowserCamera()

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      {manualOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
          role="presentation"
          onClick={() => setManualOpen(false)}
        >
          <form
            onSubmit={submitManual}
            className="w-full max-w-md rounded-t-3xl border border-slate-200 bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-manual-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="remove-manual-title" className="mt-0 text-lg font-bold text-slate-900 font-['Inter']">
              Introdu numărul de serie
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-['Inter'] leading-relaxed">
              Prefixul <span className="font-mono font-semibold">{WAREHOUSE_SN_FACTORY_PREFIX}</span> este fix. Introdu
              cele {WAREHOUSE_SN_BODY_DIGITS} cifre de după el.
            </p>
            <div className="mt-5 flex items-stretch gap-1.5 sm:gap-2">
              <span
                className="flex shrink-0 items-center rounded-xl border border-gray-300 bg-slate-100 px-2.5 font-mono text-sm font-semibold text-slate-700 sm:px-3"
                aria-hidden
              >
                {WAREHOUSE_SN_FACTORY_PREFIX}
              </span>
              {manualGroups.map((group, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    groupInputRefs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label={`Cifrele ${i * SN_GROUP_SIZE + 1}–${(i + 1) * SN_GROUP_SIZE} după ${WAREHOUSE_SN_FACTORY_PREFIX}`}
                  value={group}
                  onChange={(e) => changeGroup(i, e.target.value)}
                  onKeyDown={(e) => groupKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  placeholder={SN_GROUP_PLACEHOLDERS[i]}
                  className="w-0 min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-1 py-2.5 text-center font-mono text-base text-slate-900 shadow-sm placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-400 font-mono font-['Inter']">
              {manualDigits.length}/{WAREHOUSE_SN_BODY_DIGITS} cifre
            </p>
            {manualError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-['Inter']">
                {manualError}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 font-['Inter']"
                onClick={() => setManualOpen(false)}
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={manualDigits.length !== WAREHOUSE_SN_BODY_DIGITS}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 font-['Inter']"
              >
                Caută
              </button>
            </div>
          </form>
        </div>
      )}

      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Remove</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        {step === 'scan'
          ? 'Scanează codul QR sau introdu manual numărul de serie, apoi adaugă unitatea în batch. Poți adăuga mai multe unități.'
          : 'Verifică unitățile din batch înainte de a continua.'}
      </p>

      {step === 'scan' && (
      <div className="space-y-6">
        {scanning && (
          <div
            className="animate-warehouse-camera-reveal overflow-hidden rounded-2xl border border-slate-900 bg-black shadow-inner shadow-slate-900/25 ring-1 ring-white/10"
            aria-live="polite"
          >
            <div className="relative aspect-[4/3] w-full max-h-[min(55vh,420px)] sm:max-h-[min(50vh,480px)]">
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-5 sm:p-8"
                aria-hidden
              >
                <div className="flex aspect-square w-[min(52vw,188px)] max-h-[min(30vh,188px)] max-w-full items-center justify-center rounded-xl border-2 border-dashed border-white/90 sm:w-[min(70vw,280px)] sm:max-h-[min(50vh,280px)]">
                  <QrCode className="h-9 w-9 shrink-0 text-white/70 sm:h-12 sm:w-12" strokeWidth={1.75} />
                </div>
              </div>
            </div>
            <div className="flex justify-center border-t border-slate-800 bg-slate-950 px-4 py-3">
              <button
                type="button"
                onClick={stopScanner}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-medium text-white font-['Inter'] hover:bg-slate-700"
              >
                <CameraOff className="h-4 w-4" aria-hidden />
                Oprește camera
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => void startScanner()}
            disabled={!cameraSupported || scanning || searching}
            className="group flex min-h-[140px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm disabled:opacity-50"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white">
              <Camera className="h-6 w-6" strokeWidth={1.6} aria-hidden />
            </span>
            <span className="text-center text-sm font-semibold text-slate-800 font-['Inter']">Scanare cod QR</span>
          </button>
          <button
            type="button"
            onClick={openManual}
            disabled={searching}
            className="group flex min-h-[140px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm disabled:opacity-50"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
              <Keyboard className="h-6 w-6" strokeWidth={1.6} aria-hidden />
            </span>
            <span className="text-center text-sm font-semibold text-slate-800 font-['Inter']">Enter manually</span>
          </button>
        </div>

        {scanError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
            {scanError}
          </p>
        )}

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
