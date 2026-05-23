/** Absolutize relative asset paths for PDF export / Puppeteer. */
export function absolutizeAssetUrl(src: string, origin: string): string {
  const s = src.trim()
  if (!s || /^https?:\/\//i.test(s) || /^data:/i.test(s)) return s
  if (s.startsWith('//')) return `https:${s}`
  if (s.startsWith('/')) return `${origin.replace(/\/$/, '')}${s}`
  return s
}

const IMAGE_INLINE_TIMEOUT_MS = 8_000
const MAX_RASTER_PX = 1400

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), ms)
    }),
  ])
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'))
    reader.readAsDataURL(blob)
  })
}

async function fetchAssetAsDataUrl(url: string, origin: string): Promise<string | null> {
  const abs = absolutizeAssetUrl(url, origin)
  try {
    const res = await fetch(abs, { signal: AbortSignal.timeout(IMAGE_INLINE_TIMEOUT_MS) })
    if (!res.ok) return null
    const blob = await res.blob()
    if (blob.size > 4 * 1024 * 1024) return null
    return blobToDataUrl(blob)
  } catch {
    return null
  }
}

async function rasterizeLoadedImage(img: HTMLImageElement): Promise<string | null> {
  let w = img.naturalWidth || img.width
  let h = img.naturalHeight || img.height
  if (w <= 0 || h <= 0) return null

  const scale = Math.min(1, MAX_RASTER_PX / Math.max(w, h))
  w = Math.max(1, Math.round(w * scale))
  h = Math.max(1, Math.round(h * scale))

  try {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', 0.88)
  } catch {
    return null
  }
}

async function waitForImageElement(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth > 0) return
  await withTimeout(
    new Promise<void>((resolve) => {
      img.addEventListener('load', () => resolve(), { once: true })
      img.addEventListener('error', () => resolve(), { once: true })
    }),
    IMAGE_INLINE_TIMEOUT_MS,
  )
}

/** Resolve a loaded <img> to a data URL (fetch preferred; canvas fallback). */
export async function resolveLiveImageAsDataUrl(
  img: HTMLImageElement,
  origin: string,
): Promise<string | null> {
  const src = img.currentSrc || img.getAttribute('src') || ''
  if (!src) return null
  if (src.startsWith('data:')) return src

  const fetched = await fetchAssetAsDataUrl(src, origin)
  if (fetched) return fetched

  await waitForImageElement(img)
  if (img.naturalWidth > 0) {
    return rasterizeLoadedImage(img)
  }

  return null
}

/** Temporarily inline images on live DOM for html2canvas, then restore. */
export async function withInlinedImagesForPdf<T>(
  root: HTMLElement,
  fn: () => Promise<T>,
  origin = typeof window !== 'undefined' ? window.location.origin : 'https://baterino.ro',
): Promise<T> {
  const snapshots = Array.from(root.querySelectorAll('img')).map((img) => ({
    img,
    src: img.getAttribute('src'),
    srcset: img.getAttribute('srcset'),
    sizes: img.getAttribute('sizes'),
  }))

  try {
    await Promise.all(
      snapshots.map(async ({ img }) => {
        const dataUrl = await withTimeout(resolveLiveImageAsDataUrl(img, origin), IMAGE_INLINE_TIMEOUT_MS)
        if (!dataUrl) return
        img.setAttribute('src', dataUrl)
        img.removeAttribute('srcset')
        img.removeAttribute('sizes')
      }),
    )
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
    return await fn()
  } finally {
    for (const { img, src, srcset, sizes } of snapshots) {
      if (src != null) img.setAttribute('src', src)
      else img.removeAttribute('src')
      if (srcset != null) img.setAttribute('srcset', srcset)
      else img.removeAttribute('srcset')
      if (sizes != null) img.setAttribute('sizes', sizes)
      else img.removeAttribute('sizes')
    }
  }
}
