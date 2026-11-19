import { useEffect, useState } from 'react'
import { Camera, CameraOff, Keyboard, QrCode } from 'lucide-react'
import { WAREHOUSE_SN_BODY_DIGITS, WAREHOUSE_SN_FACTORY_PREFIX, warehouseSerialToBodyDigits } from '../../lib/api'
import { canUseBrowserCamera, useWarehouseQrScanner } from './warehouseQrScan'
import WarehouseSerialGroupsInput, { EMPTY_SN_GROUPS } from './WarehouseSerialGroupsInput'

/** „Scanare cod QR” + „Enter manually”: both hand the 16 SN digits after LJC to `onSerial`. */
export default function WarehouseSerialEntry({
  onSerial,
  busy = false,
}: {
  onSerial: (digits: string) => void
  busy?: boolean
}) {
  const [manualOpen, setManualOpen] = useState(false)
  const [manualGroups, setManualGroups] = useState<string[]>(EMPTY_SN_GROUPS)
  const manualDigits = manualGroups.join('')
  const [manualError, setManualError] = useState<string | null>(null)

  const { videoRef, scanning, scanError, startScanner, stopScanner } = useWarehouseQrScanner((raw) => {
    onSerial(warehouseSerialToBodyDigits(raw))
  })

  const openManual = () => {
    stopScanner()
    setManualGroups(EMPTY_SN_GROUPS)
    setManualError(null)
    setManualOpen(true)
  }

  useEffect(() => {
    if (!manualOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setManualOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [manualOpen])

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualDigits.length !== WAREHOUSE_SN_BODY_DIGITS) {
      setManualError(`Introdu exact ${WAREHOUSE_SN_BODY_DIGITS} cifre.`)
      return
    }
    setManualOpen(false)
    onSerial(manualDigits)
  }

  const cameraSupported = typeof window !== 'undefined' && canUseBrowserCamera()

  return (
    <>
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
            aria-labelledby="serial-entry-manual-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="serial-entry-manual-title" className="mt-0 text-lg font-bold text-slate-900 font-['Inter']">
              Introdu numărul de serie
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-['Inter'] leading-relaxed">
              Prefixul <span className="font-mono font-semibold">{WAREHOUSE_SN_FACTORY_PREFIX}</span> este fix. Introdu
              cele {WAREHOUSE_SN_BODY_DIGITS} cifre de după el.
            </p>
            <div className="mt-5">
              <WarehouseSerialGroupsInput
                groups={manualGroups}
                onChange={(next) => {
                  setManualGroups(next)
                  setManualError(null)
                }}
                autoFocus
              />
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
          disabled={!cameraSupported || scanning || busy}
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
          disabled={busy}
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
    </>
  )
}
