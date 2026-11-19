import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import {
  WAREHOUSE_SN_BODY_DIGITS,
  WAREHOUSE_SN_FACTORY_PREFIX,
  getAdminWarehouseSavedItemBySerial,
  type WarehouseSavedItemBySerial,
} from '../../lib/api'

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue?: string }[]>
}

export function getBarcodeDetectorCtor(): (new (opts: { formats: string[] }) => BarcodeDetectorLike) | null {
  if (typeof window === 'undefined') return null
  const C = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike })
    .BarcodeDetector
  return C ?? null
}

/** Camera + QR decode works in most modern browsers; native BarcodeDetector is optional (Chrome/Edge). */
export function canUseBrowserCamera(): boolean {
  if (typeof navigator === 'undefined') return false
  return Boolean(navigator.mediaDevices?.getUserMedia)
}

const JSQR_MAX_FRAME_EDGE = 640
export const JSQR_FRAME_SKIP = 2

export function decodeQrFromVideoWithJsQR(video: HTMLVideoElement, canvas: HTMLCanvasElement): string | null {
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

export function formatWarehouseSerialDisplay(prefix: string, serialBody: string) {
  const digits = String(serialBody ?? '').replace(/\D/g, '').slice(0, WAREHOUSE_SN_BODY_DIGITS)
  if (!digits) return ''
  const groups = digits.match(/.{1,4}/g) ?? []
  return `${prefix} - ${groups.join(' - ')}`
}

/** Looks up a stock unit by the 16 SN digits after LJC (Stocuri → Search / Remove). */
export function useWarehouseSerialLookup() {
  const [serialBody, setSerialBody] = useState('')
  const [searching, setSearching] = useState(false)
  const [item, setItem] = useState<WarehouseSavedItemBySerial | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clear = useCallback(() => {
    setSerialBody('')
    setItem(null)
    setNotFound(false)
    setError(null)
  }, [])

  const lookup = useCallback(async (digits: string) => {
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

  return { serialBody, searching, item, notFound, error, lookup, clear }
}

/** Camera QR scanner: mount `videoRef` on a `<video>` while `scanning` is true; stops after the first decode. */
export function useWarehouseQrScanner(onDecoded: (raw: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef(0)
  const onDecodedRef = useRef(onDecoded)
  onDecodedRef.current = onDecoded

  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  const stopScanner = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setScanning(false)
  }, [])

  useEffect(() => () => stopScanner(), [stopScanner])

  const startScanner = useCallback(async () => {
    if (!canUseBrowserCamera()) {
      setScanError('Camera nu e disponibilă în acest browser. Folosește introducerea manuală a SN-ului.')
      return
    }
    setScanError(null)
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      setScanning(true)
    } catch {
      setScanError('Nu am putut porni camera. Verifică permisiunile (HTTPS sau localhost) sau introdu SN-ul manual.')
      stopScanner()
    }
  }, [stopScanner])

  useLayoutEffect(() => {
    if (!scanning) return
    const stream = streamRef.current
    const video = videoRef.current
    if (!stream || !video) return

    let cancelled = false
    const Detector = getBarcodeDetectorCtor()
    const detector = Detector ? new Detector({ formats: ['qr_code'] }) : null
    if (!canvasRef.current) canvasRef.current = document.createElement('canvas')
    const canvas = canvasRef.current
    frameRef.current = 0

    const finish = (raw: string) => {
      stopScanner()
      onDecodedRef.current(raw)
    }

    ;(async () => {
      video.srcObject = stream
      try {
        await video.play()
      } catch {
        if (!cancelled) {
          setScanError('Nu am putut reda fluxul camerei. Încearcă din nou sau folosește introducerea manuală.')
          stopScanner()
        }
        return
      }
      const tick = async () => {
        if (cancelled) return
        const v = videoRef.current
        if (!v || !streamRef.current) return
        try {
          if (detector) {
            const codes = await detector.detect(v)
            const first = codes.find((c) => c.rawValue && String(c.rawValue).trim())
            if (first?.rawValue) return finish(String(first.rawValue))
          } else {
            frameRef.current += 1
            if (frameRef.current % JSQR_FRAME_SKIP === 0) {
              const raw = decodeQrFromVideoWithJsQR(v, canvas)
              if (raw) return finish(raw)
            }
          }
        } catch {
          // ignore transient decode errors
        }
        rafRef.current = requestAnimationFrame(() => void tick())
      }
      void tick()
    })()

    return () => {
      cancelled = true
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }
  }, [scanning, stopScanner])

  return { videoRef, scanning, scanError, startScanner, stopScanner }
}
