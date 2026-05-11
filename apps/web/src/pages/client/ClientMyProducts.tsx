import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import jsQR from 'jsqr'
import {
  Download,
  FileText,
  Keyboard,
  Loader2,
  MessageCircle,
  Plus,
  QrCode,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react'
import {
  claimClientRegisteredProduct,
  createClientServiceRequest,
  downloadClientRegisteredProductWarrantyCertificate,
  getAuthEmail,
  getClientRegisteredProducts,
  getClientServiceRequests,
  getProductCardImageUrl,
  isServiceRequestActive,
  postClientRegisteredProductWarrantyCertificate,
  WAREHOUSE_SN_BODY_DIGITS,
  WAREHOUSE_SN_FACTORY_PREFIX,
  normalizeWarehouseSerialNumber,
  type ClientRegisteredProductDto,
  type ServiceRequestDto,
} from '../../lib/api'
import { CONTACT_WHATSAPP_WAME } from '../../lib/contactWhatsApp'
import { useLanguage } from '../../contexts/LanguageContext'
import type { LangCode } from '../../i18n/menu'
import { getClientMyProductsTranslations } from '../../i18n/client-my-products'

const pillActionBtn = `inline-flex flex-1 min-w-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-progress disabled:opacity-70 disabled:hover:bg-white disabled:hover:border-slate-200 font-['Inter']`

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue?: string }[]>
}

function getBarcodeDetectorCtor(): (new (opts: { formats: string[] }) => BarcodeDetectorLike) | null {
  if (typeof window === 'undefined') return null
  const C = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike })
    .BarcodeDetector
  return C ?? null
}

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

export default function ClientMyProducts() {
  const { language } = useLanguage()
  const lang = language.code as LangCode
  const tr = getClientMyProductsTranslations(lang)

  const [items, setItems] = useState<ClientRegisteredProductDto[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [manualOpen, setManualOpen] = useState(false)
  const [modalSnBody, setModalSnBody] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)

  const [scanOpen, setScanOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [cameraStarting, setCameraStarting] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [claimBusy, setClaimBusy] = useState(false)
  const [claimBanner, setClaimBanner] = useState<string | null>(null)

  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [infoBanner, setInfoBanner] = useState<string | null>(null)
  const [warrantyBusyId, setWarrantyBusyId] = useState<string | null>(null)

  const [serviceModalProduct, setServiceModalProduct] = useState<ClientRegisteredProductDto | null>(null)
  const [serviceProblem, setServiceProblem] = useState('')
  const [serviceError, setServiceError] = useState<string | null>(null)
  const [serviceSubmitting, setServiceSubmitting] = useState(false)
  /** Cererile active mapate pe `serialNumber` — toate cererile open / in_progress ale userului. */
  const [activeServiceBySn, setActiveServiceBySn] = useState<Record<string, ServiceRequestDto>>({})
  /** Când butonul „În desfășurare” este apăsat, afișăm un modal read-only cu ID-ul cererii. */
  const [serviceInProgress, setServiceInProgress] = useState<ServiceRequestDto | null>(null)
  const serviceTextareaRef = useRef<HTMLTextAreaElement>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanRafRef = useRef(0)
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const jsQrFrameRef = useRef(0)
  const manualSnRefs = useRef<Array<HTMLInputElement | null>>([])

  const loadList = useCallback(async () => {
    setListError(null)
    setListLoading(true)
    try {
      const rows = await getClientRegisteredProducts()
      setItems(rows)
    } catch (e) {
      setListError(e instanceof Error ? e.message : tr.loadError)
    } finally {
      setListLoading(false)
    }
  }, [tr.loadError])

  const loadServiceRequests = useCallback(async () => {
    try {
      const rows = await getClientServiceRequests()
      const map: Record<string, ServiceRequestDto> = {}
      for (const r of rows) {
        if (!isServiceRequestActive(r)) continue
        const sn = String(r.serialNumber || '')
        if (!sn) continue
        const prev = map[sn]
        if (!prev || new Date(r.createdAt).getTime() > new Date(prev.createdAt).getTime()) {
          map[sn] = r
        }
      }
      setActiveServiceBySn(map)
    } catch {
      /* Ignorăm — banda de stare a cererilor nu trebuie să rupă pagina. */
    }
  }, [])

  useEffect(() => {
    void loadList()
    void loadServiceRequests()
  }, [loadList, loadServiceRequests])

  const stopScanner = useCallback(() => {
    if (scanRafRef.current) cancelAnimationFrame(scanRafRef.current)
    scanRafRef.current = 0
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setScanning(false)
    setCameraStarting(false)
  }, [])

  useEffect(() => () => stopScanner(), [stopScanner])

  const startScanner = useCallback(async () => {
    setCameraStarting(true)
    setScanError(null)
    if (!canUseBrowserCamera()) {
      setScanError(tr.scanCameraError)
      setCameraStarting(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      setScanning(true)
    } catch {
      setScanError(tr.scanCameraError)
      setScanning(false)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    } finally {
      setCameraStarting(false)
    }
  }, [tr.scanCameraError])

  const runClaim = useCallback(
    async (
      body: { serialNumber?: string; qrRaw?: string },
      options?: { onError?: (message: string) => void },
    ) => {
      setClaimBanner(null)
      setClaimBusy(true)
      try {
        const row = await claimClientRegisteredProduct(body)
        setItems((prev) => {
          const rest = prev.filter((p) => p.savedItemId !== row.savedItemId)
          return [row, ...rest]
        })
        setManualOpen(false)
        setScanOpen(false)
        stopScanner()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Eroare.'
        options?.onError?.(msg)
        if (!options?.onError) setClaimBanner(msg)
        if (!options?.onError) {
          setScanOpen((open) => {
            if (open) queueMicrotask(() => void startScanner())
            return open
          })
        }
      } finally {
        setClaimBusy(false)
      }
    },
    [startScanner, stopScanner],
  )

  const mapClaimErrorMessage = useCallback(
    (msg: string) => {
      const m = msg.toLowerCase()
      if ((m.includes('deja') && m.includes('înregistrat')) || (m.includes('deja') && m.includes('inregistrat'))) {
        return tr.claimErrorAlreadyRegistered
      }
      if (m.includes('nu există') || m.includes('nu exista') || m.includes('sn invalid')) {
        return tr.claimErrorInvalidSerial
      }
      return msg
    },
    [tr.claimErrorAlreadyRegistered, tr.claimErrorInvalidSerial],
  )

  const applyDecodedQr = useCallback(
    (raw: string) => {
      stopScanner()
      void runClaim(
        { qrRaw: raw },
        {
          onError: (msg) => {
            setScanError(mapClaimErrorMessage(msg))
          },
        },
      )
    },
    [mapClaimErrorMessage, runClaim, stopScanner],
  )

  useLayoutEffect(() => {
    if (!scanOpen || !scanning) return
    const stream = streamRef.current
    const video = videoRef.current
    if (!stream || !video) return

    let cancelled = false
    const BarcodeDetector = getBarcodeDetectorCtor()
    const detector = BarcodeDetector ? new BarcodeDetector({ formats: ['qr_code'] }) : null
    if (!scanCanvasRef.current) scanCanvasRef.current = document.createElement('canvas')
    const canvas = scanCanvasRef.current
    jsQrFrameRef.current = 0

    ;(async () => {
      video.srcObject = stream
      try {
        await video.play()
      } catch {
        if (!cancelled) {
          setScanError(tr.scanCameraError)
          stopScanner()
        }
        return
      }
      if (cancelled) return

      const tick = async () => {
        if (cancelled) return
        const v = videoRef.current
        if (!v || !streamRef.current) return
        try {
          if (detector) {
            const codes = await detector.detect(v)
            const first = codes.find((c) => c.rawValue && String(c.rawValue).trim())
            if (first?.rawValue) {
              applyDecodedQr(String(first.rawValue))
              return
            }
          } else {
            jsQrFrameRef.current += 1
            if (jsQrFrameRef.current % JSQR_FRAME_SKIP === 0) {
              const raw = decodeQrFromVideoWithJsQR(v, canvas)
              if (raw) {
                applyDecodedQr(raw)
                return
              }
            }
          }
        } catch {
          // ignore
        }
        scanRafRef.current = requestAnimationFrame(() => {
          void tick()
        })
      }
      scanRafRef.current = requestAnimationFrame(() => {
        void tick()
      })
    })()

    return () => {
      cancelled = true
      if (scanRafRef.current) cancelAnimationFrame(scanRafRef.current)
      scanRafRef.current = 0
    }
  }, [scanOpen, scanning, applyDecodedQr, stopScanner, tr.scanCameraError])

  useEffect(() => {
    if (!scanOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setScanOpen(false)
        stopScanner()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scanOpen, stopScanner])

  useEffect(() => {
    if (!manualOpen) return
    setModalSnBody('')
    setModalError(null)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setManualOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [manualOpen])

  useEffect(() => {
    if (!serviceModalProduct) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !serviceSubmitting) {
        setServiceModalProduct(null)
        setServiceProblem('')
        setServiceError(null)
      }
    }
    window.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => serviceTextareaRef.current?.focus(), 50)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
    }
  }, [serviceModalProduct, serviceSubmitting])

  useEffect(() => {
    if (!serviceInProgress) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setServiceInProgress(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [serviceInProgress])

  const openScan = () => {
    setScanOpen(true)
    setScanError(null)
    void startScanner()
  }

  const closeScan = () => {
    setScanOpen(false)
    stopScanner()
  }

  const retryScan = () => {
    setScanError(null)
    void startScanner()
  }

  const submitManual = () => {
    setModalError(null)
    const d = modalSnBody.replace(/\D/g, '').slice(0, WAREHOUSE_SN_BODY_DIGITS)
    if (d.length !== WAREHOUSE_SN_BODY_DIGITS) {
      setModalError(tr.snInvalidLength)
      return
    }
    const serialNumber = normalizeWarehouseSerialNumber(d)
    void runClaim(
      { serialNumber },
      {
        onError: (msg) => {
          setModalError(mapClaimErrorMessage(msg))
        },
      },
    )
  }

  const modalSnChunks = [
    modalSnBody.slice(0, 4),
    modalSnBody.slice(4, 8),
    modalSnBody.slice(8, 12),
    modalSnBody.slice(12, 16),
  ]

  /** Forţează descărcarea unui blob ca fişier (fără preview în tab). */
  function triggerBlobDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  async function onWarranty(savedItemId: string) {
    if (warrantyBusyId) return
    setInfoBanner(null)
    setWarrantyBusyId(savedItemId)
    try {
      const r = await postClientRegisteredProductWarrantyCertificate(savedItemId)
      if (r.ok && r.kind === 'pdf') {
        triggerBlobDownload(r.pdfBlob, r.filename)
        setItems((prev) =>
          prev.map((it) =>
            it.savedItemId === savedItemId
              ? {
                  ...it,
                  warrantyCertificateAvailable: true,
                  warrantyCertificateGeneratedAt: new Date().toISOString(),
                }
              : it,
          ),
        )
        return
      }
      if (r.ok && r.kind === 'html') {
        /* Fallback dev (fără R2): salvăm tot ca blob, dar fişier .html. */
        triggerBlobDownload(r.htmlBlob, r.filename)
        return
      }
      if (r.code === 'profile_incomplete') {
        setProfileModalOpen(true)
        return
      }
      if (r.code === 'warranty_not_implemented') {
        setInfoBanner(r.error || tr.warrantyComingTitle)
        return
      }
      setInfoBanner(r.error)
    } catch (e) {
      setInfoBanner(e instanceof Error ? e.message : 'Eroare.')
    } finally {
      setWarrantyBusyId(null)
    }
  }

  /** Descarcă PDF-ul deja generat prin endpoint autentificat. */
  async function onDownloadWarranty(savedItemId: string) {
    if (warrantyBusyId) return
    setInfoBanner(null)
    setWarrantyBusyId(savedItemId)
    try {
      const { pdfBlob, filename } =
        await downloadClientRegisteredProductWarrantyCertificate(savedItemId)
      triggerBlobDownload(pdfBlob, filename)
    } catch (e) {
      setInfoBanner(e instanceof Error ? e.message : 'Eroare la descărcare.')
    } finally {
      setWarrantyBusyId(null)
    }
  }

  function openManualDoc(p: ClientRegisteredProductDto) {
    const docs = p.product?.documenteTehnice ?? []
    const first = docs.find((d) => d.url)
    if (first) {
      window.open(first.url, '_blank', 'noopener,noreferrer')
      return
    }
    if (p.product?.slug) {
      window.open(`/produse/${encodeURIComponent(p.product.slug)}`, '_blank', 'noopener,noreferrer')
      return
    }
    setInfoBanner(tr.noManualLink)
  }

  function whatsappHref(p: ClientRegisteredProductDto) {
    const email = (getAuthEmail() ?? '').trim() || '—'
    const title = p.product?.title || p.modelNumber
    const text = tr.whatsappProductPrefill
      .replace(/{productTitle}/g, title)
      .replace(/{serialNumber}/g, p.serialNumber)
      .replace(/{modelNumber}/g, p.modelNumber)
      .replace(/{clientEmail}/g, email)
    return `https://wa.me/${CONTACT_WHATSAPP_WAME}?text=${encodeURIComponent(text)}`
  }

  function openServiceModal(p: ClientRegisteredProductDto) {
    const active = activeServiceBySn[p.serialNumber]
    if (active) {
      setServiceInProgress(active)
      return
    }
    setServiceProblem('')
    setServiceError(null)
    setServiceModalProduct(p)
  }

  function closeServiceModal() {
    setServiceModalProduct(null)
    setServiceProblem('')
    setServiceError(null)
  }

  function closeServiceInProgress() {
    setServiceInProgress(null)
  }

  async function submitServiceRequest() {
    if (!serviceModalProduct || serviceSubmitting) return
    const desc = serviceProblem.trim()
    if (desc.length < 3) {
      setServiceError(tr.serviceModalProblemRequired)
      return
    }
    setServiceError(null)
    setServiceSubmitting(true)
    try {
      const result = await createClientServiceRequest({
        savedItemId: serviceModalProduct.savedItemId,
        problemDescription: desc,
      })
      if (result.ok) {
        setActiveServiceBySn((prev) => ({
          ...prev,
          [result.request.serialNumber]: result.request,
        }))
        closeServiceModal()
        return
      }
      if (result.code === 'already_active') {
        setActiveServiceBySn((prev) => ({
          ...prev,
          [result.request.serialNumber]: result.request,
        }))
        closeServiceModal()
        setServiceInProgress(result.request)
        return
      }
      setServiceError(result.error)
    } catch (e) {
      setServiceError(e instanceof Error ? e.message : 'Eroare.')
    } finally {
      setServiceSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl font-['Inter']">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-8">{tr.pageTitle}</h1>

      {claimBanner ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-800" role="alert">
          {claimBanner}
        </div>
      ) : null}
      {infoBanner ? (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800" role="status">
          {infoBanner}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <section
          className="max-w-md min-h-[20.5rem] rounded-2xl border border-slate-200 bg-[#f7f7f7] p-5 shadow-sm"
          aria-labelledby="register-product-title"
        >
          <div
            className="mb-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
            aria-hidden
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
          </div>
          <h2 id="register-product-title" className="text-base font-semibold leading-snug text-slate-900 mb-1.5">
            {tr.registerTitle}
          </h2>
          <p className="text-sm text-slate-600 leading-snug">{tr.registerDescription}</p>

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              className={pillActionBtn}
              disabled={claimBusy}
              onClick={() => {
                setClaimBanner(null)
                openScan()
              }}
            >
              {claimBusy ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-600" aria-hidden />
              ) : (
                <QrCode className="h-4 w-4 shrink-0 text-slate-800" strokeWidth={2} aria-hidden />
              )}
              {tr.scanQr}
            </button>
            <button
              type="button"
              className={pillActionBtn}
              disabled={claimBusy}
              onClick={() => {
                setClaimBanner(null)
                setManualOpen(true)
              }}
            >
              <Keyboard className="h-4 w-4 shrink-0 text-slate-800" strokeWidth={2} aria-hidden />
              {tr.enterSnManual}
            </button>
          </div>
        </section>

        <div>
        {listLoading ? (
          <>
            <span className="sr-only" aria-live="polite">
              {tr.loadingList}
            </span>
            <div
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-h-[20.5rem] animate-pulse"
              aria-hidden
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="h-28 w-28 shrink-0 rounded-xl bg-slate-100 ring-1 ring-slate-200/90" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-5 w-3/4 rounded-md bg-slate-200" />
                  <div className="h-3 w-4/5 rounded-md bg-slate-200" />
                  <div className="h-3 w-3/5 rounded-md bg-slate-200" />
                  <div className="h-3 w-1/2 rounded-md bg-slate-200" />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-11 w-full rounded-full bg-slate-100 ring-1 ring-slate-200/90" />
                <div className="h-11 w-full rounded-full bg-slate-100 ring-1 ring-slate-200/90" />
                <div className="h-11 w-full rounded-full bg-slate-100 ring-1 ring-slate-200/90" />
                <div className="h-11 w-full rounded-full bg-slate-100 ring-1 ring-slate-200/90" />
              </div>
            </div>
          </>
        ) : listError ? (
          <p className="text-sm text-red-600">{listError}</p>
        ) : items.length === 0 ? null : (
          <ul className="m-0 list-none space-y-4 p-0">
            {items.map((p) => {
              const img =
                (p.product?.imageUrl && String(p.product.imageUrl).trim()) ||
                getProductCardImageUrl({ images: [], cardImage: null })
              const title = p.product?.title || p.modelNumber
              return (
                <li key={p.savedItemId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-h-[20.5rem]">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200/90">
                      <img src={img} alt="" className="h-full w-full object-contain p-1" loading="lazy" />
                    </div>
                    <div className="min-w-0 flex-1">
                    {p.product?.slug ? (
                      <Link
                        to={`/produse/${encodeURIComponent(p.product.slug)}`}
                        className="text-base font-semibold text-slate-900 underline-offset-2 hover:underline"
                      >
                        {title}
                      </Link>
                    ) : (
                      <p className="text-base font-semibold text-slate-900 m-0">{title}</p>
                    )}
                    <p className="mt-1 m-0 text-xs tabular-nums text-slate-500">SN: {p.serialNumber}</p>
                    <p className="mt-0.5 m-0 text-xs tabular-nums text-slate-500">Model: {p.modelNumber}</p>
                    <p className="mt-0.5 m-0 text-xs tabular-nums text-slate-500">Garanție: 10 Ani</p>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="mt-6 flex flex-col gap-2">
                      {warrantyBusyId === p.savedItemId ? (
                        <button
                          type="button"
                          className={pillActionBtn}
                          disabled
                          aria-busy="true"
                        >
                          <Loader2
                            className="h-4 w-4 shrink-0 animate-spin text-slate-800"
                            strokeWidth={2}
                            aria-hidden
                          />
                          {tr.generatingWarranty}
                        </button>
                      ) : p.warrantyCertificateAvailable ? (
                        <button
                          type="button"
                          className={pillActionBtn}
                          onClick={() => void onDownloadWarranty(p.savedItemId)}
                        >
                          <Download
                            className="h-4 w-4 shrink-0 text-slate-800"
                            strokeWidth={2}
                            aria-hidden
                          />
                          {tr.downloadWarranty}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={pillActionBtn}
                          onClick={() => void onWarranty(p.savedItemId)}
                        >
                          <ShieldCheck
                            className="h-4 w-4 shrink-0 text-slate-800"
                            strokeWidth={2}
                            aria-hidden
                          />
                          {tr.generateWarranty}
                        </button>
                      )}
                      <button type="button" className={pillActionBtn} onClick={() => openManualDoc(p)}>
                        <FileText className="h-4 w-4 shrink-0 text-slate-800" strokeWidth={2} aria-hidden />
                        {tr.downloadManual}
                      </button>
                      <a
                        href={whatsappHref(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={pillActionBtn}
                      >
                        <MessageCircle className="h-4 w-4 shrink-0 text-slate-800" strokeWidth={2} aria-hidden />
                        {tr.helpProduct}
                      </a>
                      {(() => {
                        const active = activeServiceBySn[p.serialNumber]
                        if (active) {
                          return (
                            <button
                              type="button"
                              className={`${pillActionBtn} bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900`}
                              onClick={() => setServiceInProgress(active)}
                            >
                              <Wrench
                                className="h-4 w-4 shrink-0 text-amber-700"
                                strokeWidth={2}
                                aria-hidden
                              />
                              {tr.serviceRequestInProgress}
                            </button>
                          )
                        }
                        return (
                          <button
                            type="button"
                            className={pillActionBtn}
                            onClick={() => openServiceModal(p)}
                          >
                            <Wrench
                              className="h-4 w-4 shrink-0 text-slate-800"
                              strokeWidth={2}
                              aria-hidden
                            />
                            {tr.serviceRequest}
                          </button>
                        )
                      })()}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        </div>
      </div>

      {manualOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          role="presentation"
          onClick={() => !claimBusy && setManualOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-sn-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="manual-sn-title" className="m-0 text-lg font-bold text-slate-900">
              {tr.modalManualTitle}
            </h3>
            <p className="mt-2 m-0 text-sm text-slate-600">{tr.modalManualHint}</p>
            <p className="mt-1 m-0 text-xs text-slate-500">
              {WAREHOUSE_SN_FACTORY_PREFIX} + {WAREHOUSE_SN_BODY_DIGITS} cifre
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="select-none rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm font-bold text-slate-700">
                LJC
              </span>
              <div className="grid flex-1 grid-cols-4 gap-2">
                {modalSnChunks.map((chunk, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      manualSnRefs.current[idx] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={4}
                    value={chunk}
                    onChange={(e) => {
                      const part = e.target.value.replace(/\D/g, '').slice(0, 4)
                      const next = [...modalSnChunks]
                      next[idx] = part
                      const merged = next.join('').slice(0, WAREHOUSE_SN_BODY_DIGITS)
                      setModalSnBody(merged)
                      if (part.length === 4 && idx < 3) manualSnRefs.current[idx + 1]?.focus()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && chunk.length === 0 && idx > 0) {
                        manualSnRefs.current[idx - 1]?.focus()
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault()
                      const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, WAREHOUSE_SN_BODY_DIGITS)
                      if (!digits) return
                      setModalSnBody(digits)
                      const targetIdx = Math.min(Math.floor((digits.length - 1) / 4), 3)
                      manualSnRefs.current[targetIdx]?.focus()
                    }}
                    className="w-full rounded-xl border border-slate-300 px-2 py-2.5 text-center text-sm font-mono tabular-nums outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder={'·'.repeat(4)}
                    aria-label={`Grup ${idx + 1} din seria numerică`}
                  />
                ))}
              </div>
            </div>
            {modalError ? <p className="mt-2 m-0 text-sm text-red-600">{modalError}</p> : null}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800"
                disabled={claimBusy}
                onClick={() => setManualOpen(false)}
              >
                {tr.modalManualCancel}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                disabled={claimBusy}
                onClick={() => void submitManual()}
              >
                {claimBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {claimBusy ? tr.claimSubmitting : tr.modalManualSubmit}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {scanOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          role="presentation"
          onClick={() => !claimBusy && closeScan()}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scan-qr-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 id="scan-qr-title" className="m-0 flex-1 pr-2 text-lg font-bold text-slate-900">
                {tr.modalScanTitle}
              </h3>
              <button
                type="button"
                className="hidden rounded-lg p-1 text-slate-600 hover:bg-slate-100 sm:inline-flex"
                aria-label={tr.modalScanClose}
                disabled={claimBusy}
                onClick={() => closeScan()}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            {claimBusy ? (
              <div className="mx-auto mt-4 flex aspect-square w-full max-w-sm flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" aria-hidden />
                <p className="mt-3 mb-0 text-sm font-medium text-slate-700">{tr.scanClaimInProgress}</p>
              </div>
            ) : scanError ? (
              <>
                <div className="mx-auto mt-4 flex aspect-square w-full max-w-sm items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-center text-sm text-red-700">
                  <p className="m-0">{scanError}</p>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white sm:w-auto sm:px-4"
                    onClick={retryScan}
                  >
                    {tr.scanAgain}
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 sm:w-auto sm:px-4"
                    onClick={() => closeScan()}
                  >
                    {tr.scanCloseCamera}
                  </button>
                </div>
              </>
            ) : scanning ? (
              <>
                <div className="relative mx-auto mt-4 aspect-square w-full max-w-sm overflow-hidden rounded-xl bg-black">
                  <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center p-3"
                    aria-hidden
                  >
                    <div className="flex aspect-square w-[68%] max-w-[220px] items-center justify-center rounded-xl border-2 border-dashed border-white/90 bg-black/15 shadow-[0_0_24px_rgba(0,0,0,0.45)] backdrop-blur-[1px]">
                      <QrCode className="h-16 w-16 text-white/90" strokeWidth={1.35} />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 sm:hidden"
                  disabled={claimBusy}
                  onClick={() => closeScan()}
                >
                  {tr.scanCloseCamera}
                </button>
              </>
            ) : cameraStarting ? (
              <>
                <p className="mt-3 m-0 flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-500" aria-hidden />
                  {tr.scanCameraStarting}
                </p>
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 sm:hidden"
                  disabled={claimBusy}
                  onClick={() => closeScan()}
                >
                  {tr.scanCloseCamera}
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {serviceModalProduct ? (() => {
        const p = serviceModalProduct
        const img =
          (p.product?.imageUrl && String(p.product.imageUrl).trim()) ||
          getProductCardImageUrl({ images: [], cardImage: null })
        const title = p.product?.title || p.modelNumber
        return (
          <div
            className="fixed inset-0 z-[85] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
            role="presentation"
            onClick={() => !serviceSubmitting && closeServiceModal()}
          >
            <div
              className="w-full max-w-md rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:rounded-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="service-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative px-5 pt-6 pb-4">
                <button
                  type="button"
                  aria-label={tr.serviceModalClose}
                  className="absolute right-3 top-3 rounded-lg p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                  disabled={serviceSubmitting}
                  onClick={() => closeServiceModal()}
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>

                <div className="flex flex-col items-center">
                  <img
                    src="/images/shared/baterino-logo-black.svg"
                    alt="Baterino"
                    className="h-8 w-auto object-contain"
                  />
                  <p
                    id="service-modal-title"
                    className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {tr.serviceModalBrand}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/90">
                    <img src={img} alt="" className="h-full w-full object-contain p-1" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-sm font-semibold text-slate-900 truncate">{title}</p>
                    <p className="mt-1 m-0 text-xs tabular-nums text-slate-500">SN: {p.serialNumber}</p>
                    <p className="mt-0.5 m-0 text-xs tabular-nums text-slate-500">Model: {p.modelNumber}</p>
                    <p className="mt-0.5 m-0 text-xs tabular-nums text-slate-500">{tr.serviceModalWarrantyLabel}</p>
                  </div>
                </div>

                <label htmlFor="service-problem" className="mt-5 block text-sm font-medium text-slate-800">
                  {tr.serviceModalProblemLabel}
                </label>
                <textarea
                  ref={serviceTextareaRef}
                  id="service-problem"
                  value={serviceProblem}
                  onChange={(e) => {
                    setServiceProblem(e.target.value)
                    if (serviceError) setServiceError(null)
                  }}
                  rows={4}
                  placeholder={tr.serviceModalProblemPlaceholder}
                  disabled={serviceSubmitting}
                  className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
                  maxLength={1000}
                />
                {serviceError ? (
                  <p className="mt-2 m-0 text-sm text-red-600">{serviceError}</p>
                ) : null}

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 disabled:opacity-50"
                    disabled={serviceSubmitting}
                    onClick={() => closeServiceModal()}
                  >
                    {tr.serviceModalCancel}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    disabled={serviceSubmitting}
                    onClick={() => void submitServiceRequest()}
                  >
                    {serviceSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : null}
                    {serviceSubmitting ? tr.serviceModalSubmitting : tr.serviceModalSubmit}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })() : null}

      {serviceInProgress ? (
        <div
          className="fixed inset-0 z-[85] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          role="presentation"
          onClick={() => closeServiceInProgress()}
        >
          <div
            className="w-full max-w-md rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-in-progress-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-5 pt-6 pb-4">
              <button
                type="button"
                aria-label={tr.serviceModalClose}
                className="absolute right-3 top-3 rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => closeServiceInProgress()}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>

              <div className="flex flex-col items-center">
                <img
                  src="/images/shared/baterino-logo-black.svg"
                  alt="Baterino"
                  className="h-8 w-auto object-contain"
                />
                <p
                  id="service-in-progress-title"
                  className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  {tr.serviceModalBrand}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/90 flex items-center justify-center">
                  <Wrench className="h-8 w-8 text-amber-700" strokeWidth={1.6} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-sm font-semibold text-slate-900 truncate">
                    {serviceInProgress.productTitle}
                  </p>
                  <p className="mt-1 m-0 text-xs tabular-nums text-slate-500">
                    SN: {serviceInProgress.serialNumber}
                  </p>
                  <p className="mt-0.5 m-0 text-xs tabular-nums text-slate-500">
                    Model: {serviceInProgress.modelNumber}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-wider text-amber-800">
                  {tr.serviceModalInProgressTitle.replace(
                    '{requestNumber}',
                    serviceInProgress.requestNumber,
                  )}
                </p>
                <p className="mt-2 m-0 text-sm leading-relaxed text-slate-800">
                  {tr.serviceModalInProgressMessage.replace(
                    '{requestNumber}',
                    serviceInProgress.requestNumber,
                  )}
                </p>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                  onClick={() => closeServiceInProgress()}
                >
                  {tr.serviceModalOk}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {profileModalOpen ? (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setProfileModalOpen(false)}
        >
          <div
            className="max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="m-0 text-lg font-bold text-slate-900">{tr.warrantyProfileTitle}</h3>
            <p className="mt-2 m-0 text-sm text-slate-600">{tr.warrantyProfileBody}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800"
                onClick={() => setProfileModalOpen(false)}
              >
                OK
              </button>
              <Link
                to="/client/setari"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setProfileModalOpen(false)}
              >
                {tr.warrantyProfileCta}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
