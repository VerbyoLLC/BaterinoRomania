import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jsQR from 'jsqr'
import { Camera, CameraOff, Keyboard, Loader2 } from 'lucide-react'
import {
  WAREHOUSE_SN_BODY_DIGITS,
  WAREHOUSE_SN_FACTORY_PREFIX,
  createWarehouseStockUnit,
  getAdminProductModels,
  getAuthToken,
  isValidWarehouseSerialNumber,
  normalizeWarehouseSerialNumber,
  warehouseSerialToBodyDigits,
  type AdminProductModelRow,
} from '../../lib/api'

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue?: string }[]>
}

function getBarcodeDetectorCtor(): (new (opts: { formats: string[] }) => BarcodeDetectorLike) | null {
  if (typeof window === 'undefined') return null
  const C = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike })
    .BarcodeDetector
  return C ?? null
}

/** Camera + QR decode works in most modern browsers; native BarcodeDetector is optional (Chrome/Edge). */
function canUseBrowserCamera(): boolean {
  if (typeof navigator === 'undefined') return false
  return Boolean(navigator.mediaDevices?.getUserMedia)
}

const JSQR_MAX_FRAME_EDGE = 640
const JSQR_FRAME_SKIP = 2

function decodeQrFromVideoWithJsQR(video: HTMLVideoElement, canvas: HTMLCanvasElement): string | null {
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (vw < 16 || vh < 16) return null
  let cw = vw
  let ch = vh
  const maxEdge = Math.max(vw, vh)
  if (maxEdge > JSQR_MAX_FRAME_EDGE) {
    const scale = JSQR_MAX_FRAME_EDGE / maxEdge
    cw = Math.round(vw * scale)
    ch = Math.round(vh * scale)
  }
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(video, 0, 0, cw, ch)
  const imageData = ctx.getImageData(0, 0, cw, ch)
  const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' })
  const data = result?.data?.trim()
  return data || null
}

function formatWarehouseSerialDisplay(prefix: string, serialBody: string) {
  const digits = String(serialBody ?? '').replace(/\D/g, '').slice(0, WAREHOUSE_SN_BODY_DIGITS)
  if (!digits) return ''
  const groups = digits.match(/.{1,4}/g) ?? []
  return `${prefix} - ${groups.join(' - ')}`
}

export default function AdminStocuriAddItem() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanRafRef = useRef<number>(0)
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const jsQrFrameRef = useRef(0)

  const [productModels, setProductModels] = useState<AdminProductModelRow[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  /** Row id from `product_models` (Inventar → Modele). */
  const [productModelId, setProductModelId] = useState('')
  /** Doar cele 16 cifre după prefixul fix LJC; scanarea QR sau introducerea manuală completează același câmp. */
  const [serialBody, setSerialBody] = useState('')
  /** Ultimul text brut decodat din QR (cameră) — trimis la API pentru audit când entryMethod e qr_scan. */
  const [lastDecodedQrRaw, setLastDecodedQrRaw] = useState<string | null>(null)
  const [entryMethod, setEntryMethod] = useState<'manual' | 'qr_scan'>('manual')

  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [manualSnModalOpen, setManualSnModalOpen] = useState(false)
  const [modalSnBody, setModalSnBody] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)
  const modalSnInputRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formOk, setFormOk] = useState(false)

  const cameraSupported = typeof window !== 'undefined' && canUseBrowserCamera()

  const loadAll = useCallback(async () => {
    setListError(null)
    setLoading(true)
    try {
      const m = await getAdminProductModels()
      setProductModels(Array.isArray(m) ? m : [])
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Eroare la încărcare.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    loadAll()
  }, [navigate, loadAll])

  useEffect(() => {
    if (!productModelId) return
    const stillListed = productModels.some(
      (m) => m.id === productModelId && m.availableForStock !== false,
    )
    if (!stillListed) setProductModelId('')
  }, [productModels, productModelId])

  const stopScanner = useCallback(() => {
    if (scanRafRef.current) cancelAnimationFrame(scanRafRef.current)
    scanRafRef.current = 0
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }, [])

  useEffect(() => () => stopScanner(), [stopScanner])

  const openManualSnModal = useCallback(() => {
    setModalSnBody(serialBody.replace(/\D/g, '').slice(0, WAREHOUSE_SN_BODY_DIGITS))
    setModalError(null)
    setManualSnModalOpen(true)
  }, [serialBody])

  useEffect(() => {
    if (!manualSnModalOpen) return
    const id = window.setTimeout(() => modalSnInputRef.current?.focus(), 50)
    return () => window.clearTimeout(id)
  }, [manualSnModalOpen])

  useEffect(() => {
    if (!manualSnModalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setManualSnModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [manualSnModalOpen])

  const saveManualSnModal = () => {
    setModalError(null)
    const d = modalSnBody.replace(/\D/g, '').slice(0, WAREHOUSE_SN_BODY_DIGITS)
    if (d.length !== WAREHOUSE_SN_BODY_DIGITS) {
      setModalError(`Introdu exact ${WAREHOUSE_SN_BODY_DIGITS} cifre.`)
      return
    }
    setSerialBody(d)
    setLastDecodedQrRaw(null)
    setEntryMethod('manual')
    setFormError(null)
    setFormOk(false)
    setManualSnModalOpen(false)
  }

  const applyDecodedQr = useCallback((raw: string) => {
    setLastDecodedQrRaw(raw)
    setSerialBody(warehouseSerialToBodyDigits(raw))
    setEntryMethod('qr_scan')
    setFormError(null)
    setFormOk(false)
  }, [])

  const startScanner = useCallback(async () => {
    if (!canUseBrowserCamera()) {
      setScanError('Camera nu e disponibilă în acest browser (lipsește getUserMedia). Folosește introducerea manuală a SN-ului.')
      return
    }
    setScanError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      video.srcObject = stream
      await video.play()
      setScanning(true)

      const BarcodeDetector = getBarcodeDetectorCtor()
      const detector = BarcodeDetector ? new BarcodeDetector({ formats: ['qr_code'] }) : null
      if (!scanCanvasRef.current) scanCanvasRef.current = document.createElement('canvas')
      const canvas = scanCanvasRef.current
      jsQrFrameRef.current = 0

      const tick = async () => {
        const v = videoRef.current
        if (!v || !streamRef.current) return
        try {
          if (detector) {
            const codes = await detector.detect(v)
            const first = codes.find((c) => c.rawValue && String(c.rawValue).trim())
            if (first?.rawValue) {
              applyDecodedQr(String(first.rawValue))
              stopScanner()
              return
            }
          } else {
            jsQrFrameRef.current += 1
            if (jsQrFrameRef.current % JSQR_FRAME_SKIP === 0) {
              const raw = decodeQrFromVideoWithJsQR(v, canvas)
              if (raw) {
                applyDecodedQr(raw)
                stopScanner()
                return
              }
            }
          }
        } catch {
          // ignore transient decode errors
        }
        scanRafRef.current = requestAnimationFrame(() => {
          void tick()
        })
      }
      void tick()
    } catch {
      setScanError('Nu am putut porni camera. Verifică permisiunile (HTTPS sau localhost), sau completează SN-ul manual mai jos.')
      setScanning(false)
    }
  }, [applyDecodedQr, stopScanner])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormOk(false)
    const mid = productModelId.trim()
    const digits = serialBody.replace(/\D/g, '').slice(0, WAREHOUSE_SN_BODY_DIGITS)
    if (!mid) {
      setFormError('Selectează modelul din listă (Modele).')
      return
    }
    if (digits.length !== WAREHOUSE_SN_BODY_DIGITS) {
      setFormError(
        `Introdu exact ${WAREHOUSE_SN_BODY_DIGITS} cifre după ${WAREHOUSE_SN_FACTORY_PREFIX}: tensiune (2) + capacitate (4) + lună/an (4) + lot (6).`,
      )
      return
    }
    const fullSerial = normalizeWarehouseSerialNumber(`${WAREHOUSE_SN_FACTORY_PREFIX}${digits}`)
    if (!isValidWarehouseSerialNumber(fullSerial)) {
      setFormError('SN invalid. Verifică că toate cele 16 caractere după LJC sunt cifre.')
      return
    }
    setSubmitting(true)
    try {
      await createWarehouseStockUnit({
        productModelId: mid,
        serialNumber: fullSerial,
        entryMethod,
        qrRaw: entryMethod === 'qr_scan' ? lastDecodedQrRaw : null,
      })
      setFormOk(true)
      setSerialBody('')
      setLastDecodedQrRaw(null)
      setEntryMethod('manual')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Eroare la înregistrare.')
    } finally {
      setSubmitting(false)
    }
  }

  const sortedModels = [...productModels]
    .filter((m) => m.availableForStock !== false)
    .sort((a, b) =>
      String(a.modelNumber || '').localeCompare(String(b.modelNumber || ''), 'ro', { sensitivity: 'base' }),
    )

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      {manualSnModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="presentation"
          onClick={() => setManualSnModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-sn-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="manual-sn-modal-title" className="text-lg font-bold text-slate-900 font-['Inter']">
              Introdu numărul de serie
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-['Inter'] leading-relaxed">
              Prefixul fabricii <span className="font-mono font-semibold">{WAREHOUSE_SN_FACTORY_PREFIX}</span> este
              fix. Introdu doar cele {WAREHOUSE_SN_BODY_DIGITS} cifre (tensiune, capacitate, lună/an, lot).
            </p>
            <div className="mt-5">
              <label htmlFor="modal-sn-digits" className="sr-only">
                Cifre după {WAREHOUSE_SN_FACTORY_PREFIX}
              </label>
              <div className="flex rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-slate-400">
                <span
                  className="flex items-center px-3 py-2.5 bg-slate-100 text-slate-700 font-mono text-sm font-semibold border-r border-gray-300 shrink-0"
                  aria-hidden
                >
                  {WAREHOUSE_SN_FACTORY_PREFIX}
                </span>
                <input
                  ref={modalSnInputRef}
                  id="modal-sn-digits"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={modalSnBody}
                  maxLength={WAREHOUSE_SN_BODY_DIGITS}
                  onChange={(e) => {
                    setModalSnBody(e.target.value.replace(/\D/g, '').slice(0, WAREHOUSE_SN_BODY_DIGITS))
                    setModalError(null)
                  }}
                  placeholder="5131400325070001"
                  className="min-w-0 flex-1 border-0 px-3 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-0"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400 font-mono font-['Inter']">
                {modalSnBody.replace(/\D/g, '').length}/{WAREHOUSE_SN_BODY_DIGITS} cifre
              </p>
            </div>
            {modalError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-['Inter']">
                {modalError}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 font-['Inter']"
                onClick={() => setManualSnModalOpen(false)}
              >
                Anulează
              </button>
              <button
                type="button"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 font-['Inter']"
                onClick={saveManualSnModal}
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Add Item</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Scanează codul QR sau folosește cutia pentru introducerea manuală a SN-ului, verifică numărul de serie, alege
        modelul din lista Modele, apoi înregistrează. Data intrării în depozit se salvează automat.
      </p>

      {listError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
          {listError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
        {/* Scanare QR — același șablon: titlu centrat, zonă pictogramă (dashed), descriere */}
        <div className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="mb-4 text-center text-base font-bold text-slate-900 font-['Inter']">Scanare cod QR</h2>
          <div className={scanning ? 'overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-inner' : ''}>
            <video
              ref={videoRef}
              muted
              playsInline
              className={
                scanning
                  ? 'aspect-[4/3] w-full max-h-[min(55vh,420px)] object-cover sm:aspect-video'
                  : 'sr-only'
              }
              aria-hidden={!scanning}
            />
            {!scanning ? (
              cameraSupported ? (
                <>
                  <button
                    type="button"
                    onClick={() => void startScanner()}
                    disabled={loading}
                    className="group flex w-full min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 transition-colors hover:border-sky-300 hover:bg-sky-50/40 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 sm:min-h-[220px]"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-600 text-white shadow-md transition-transform group-hover:scale-105 group-hover:bg-sky-700 group-active:scale-95">
                      <Camera className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="text-sm font-semibold text-slate-800 font-['Inter']">Pornește camera</span>
                  </button>
                  <p className="mt-4 text-center text-xs leading-relaxed text-slate-500 font-['Inter'] px-1">
                    Apasă mai sus, acordă accesul la cameră și ține codul QR în cadru. În Chrome/Edge se folosește
                    scanarea nativă; în celelalte browsere compatibile, QR-ul e citit cu decodare software (jsQR).
                  </p>
                </>
              ) : (
                <>
                  <div
                    className="flex min-h-[200px] w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 sm:min-h-[220px]"
                    aria-disabled
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-400 shadow-inner">
                      <Camera className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="text-sm font-semibold text-slate-500 font-['Inter']">Camera indisponibilă</span>
                  </div>
                  <p className="mt-4 text-center text-xs leading-relaxed text-slate-500 font-['Inter'] px-1">
                    Acest browser nu expune camera (getUserMedia). Folosește un browser actualizat pe HTTPS sau
                    localhost, sau introducerea manuală a SN-ului în dreapta.
                  </p>
                </>
              )
            ) : (
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
            )}
          </div>
          {scanning && (
            <p className="mt-4 text-center text-xs leading-relaxed text-slate-500 font-['Inter']">
              Ține codul QR clar în fața camerei până la citire.
            </p>
          )}
          {scanError && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
              {scanError}
            </p>
          )}
        </div>

        {/* Introducere manuală SN — același șablon: titlu, pictogramă (dashed), descriere */}
        <div className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="mb-4 text-center text-base font-bold text-slate-900 font-['Inter']">Introducere manuală SN</h2>
          {!scanning ? (
            <>
              <button
                type="button"
                onClick={openManualSnModal}
                className="group flex min-h-[200px] w-full flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 transition-colors hover:border-slate-400 hover:bg-slate-100/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 focus-visible:ring-offset-2 sm:min-h-[220px]"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition-transform group-hover:scale-105 group-hover:bg-slate-800 group-active:scale-95">
                  <Keyboard className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="text-sm font-semibold text-slate-800 font-['Inter']">Enter Manually the SN</span>
              </button>
              <p className="mt-4 text-center text-xs leading-relaxed text-slate-500 font-['Inter'] px-1">
                Deschide formularul în care prefixul{' '}
                <span className="font-mono font-medium text-slate-700">{WAREHOUSE_SN_FACTORY_PREFIX}</span> este fix;
                introduci doar cele {WAREHOUSE_SN_BODY_DIGITS} cifre (tensiune, capacitate, lună/an, lot).
              </p>
            </>
          ) : (
            <>
              <div
                className="flex min-h-[200px] w-full flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 sm:min-h-[220px]"
                aria-disabled
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-400 shadow-inner">
                  <Keyboard className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="text-sm font-semibold text-slate-500 font-['Inter']">Oprește camera mai întâi</span>
              </div>
              <p className="mt-4 text-center text-xs leading-relaxed text-slate-500 font-['Inter'] px-1">
                Oprește camera pentru a folosi introducerea manuală.
              </p>
            </>
          )}
        </div>
        </div>

        {/* Detalii: cod QR / SN apoi model */}
        <div className="space-y-5">
          <h2 className="text-base font-bold text-slate-900 font-['Inter'] pb-1 border-b border-gray-100">
            Detalii unitate
          </h2>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-1.5">
              <span className="text-sm font-semibold text-slate-800 font-['Inter']" id="warehouse-sn-label">
                Cod QR / număr serie
              </span>
            </div>
            <div
              className="w-full rounded-xl border-2 border-dashed border-slate-300 px-3 py-3"
              aria-describedby="warehouse-sn-hint"
            >
              <div
                id="warehouse-sn-body"
                role="status"
                aria-live="polite"
                aria-labelledby="warehouse-sn-label"
                className="flex min-h-[58px] w-full items-center justify-center text-center text-[2rem] leading-none font-mono font-bold text-slate-900 tabular-nums tracking-wide whitespace-nowrap overflow-x-auto"
              >
                {serialBody.replace(/\D/g, '').length > 0 ? (
                  formatWarehouseSerialDisplay(WAREHOUSE_SN_FACTORY_PREFIX, serialBody)
                ) : (
                  <span className="text-sm font-normal tracking-normal text-slate-400">— setează prin scanare sau introducere manuală —</span>
                )}
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={openManualSnModal}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/50 font-['Inter']"
              >
                Modifică SN
              </button>
            </div>
            <p id="warehouse-sn-hint" className="mt-1.5 text-xs text-gray-500 font-['Inter'] leading-relaxed">
              Aici este doar afișare: nu se tastează direct. Folosește scanarea QR sau cutia „Enter Manually the SN”,
              apoi <span className="font-medium text-slate-600">Modifică SN</span> dacă trebuie corectat. Format:{' '}
              <span className="font-medium text-slate-600">{WAREHOUSE_SN_FACTORY_PREFIX}</span> +{' '}
              <span className="font-medium text-slate-600">{WAREHOUSE_SN_BODY_DIGITS} cifre</span> (tensiune 2 ·
              capacitate 4 · lună/an 4 · lot 6). Exemplu: <code className="text-slate-700">LJC5131400325070043</code>{' '}
              (cifrele 7–10 după LJC = <span className="font-mono">0325</span> → produs în{' '}
              <span className="font-mono">03/2025</span>).
            </p>
            <p className="mt-0.5 text-xs text-slate-400 font-mono font-['Inter']">
              {serialBody.replace(/\D/g, '').length}/{WAREHOUSE_SN_BODY_DIGITS} cifre
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <label htmlFor="warehouse-product-model" className="block text-sm font-semibold text-slate-800 font-['Inter'] mb-1.5">
              Model (din Modele)
            </label>
            <select
              id="warehouse-product-model"
              value={productModelId}
              disabled={loading}
              onChange={(e) => {
                setProductModelId(e.target.value)
                setFormOk(false)
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-['Inter'] text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
            >
              <option value="">— Selectează —</option>
              {sortedModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.modelNumber}
                  {m.name && m.name !== m.modelNumber ? ` — ${m.name}` : ''}
                  {m.brand ? ` [${m.brand}]` : ''}
                </option>
              ))}
            </select>
            {!loading && productModels.length === 0 && (
              <p className="mt-2 text-sm text-amber-800 font-['Inter']">
                Nu există rânduri în tabelul Modele. Adaugă modele din Inventar → Modele.
              </p>
            )}
            {!loading && productModels.length > 0 && (
              <p className="mt-2 text-xs text-slate-500 font-['Inter'] leading-relaxed">
                Înregistrarea în depozit folosește produsul din catalog cu același <span className="font-medium">SKU</span> ca{' '}
                <span className="font-medium">numărul modelului</span> din Modele (ex. SKU produs = TR4000WX).
              </p>
            )}
          </div>

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
              {formError}
            </div>
          )}
          {formOk && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-['Inter']">
              Unitatea a fost înregistrată. Data intrării în depozit a fost salvată automat.
            </div>
          )}

          <button
            type="submit"
            disabled={
              submitting ||
              !productModelId ||
              serialBody.replace(/\D/g, '').length !== WAREHOUSE_SN_BODY_DIGITS
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white font-['Inter'] hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none min-w-[160px]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                Se salvează…
              </>
            ) : (
              'Înregistrează în depozit'
            )}
          </button>
        </div>
      </form>

    </div>
  )
}
