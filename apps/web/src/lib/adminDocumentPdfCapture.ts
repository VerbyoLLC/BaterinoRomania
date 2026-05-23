import html2pdf from 'html2pdf.js'
import pdfReadabilityCss from '../pages/admin/admin-document-pdf-a4.css?inline'
import { withInlinedImagesForPdf } from './adminDocumentPdfImages'

export function stripCssImports(css: string): string {
  return String(css).replace(/@import\s+url\([^)]+\)\s*;?/gi, '')
}

const PDF_READABILITY_CSS = stripCssImports(pdfReadabilityCss)

/** Screen / design canvas width (px). */
export const ADMIN_DOCUMENT_DESIGN_WIDTH_PX = 920
/** A4 portrait width at 96 CSS px/in (210 mm) — same as proforma & warranty. */
export const ADMIN_DOCUMENT_WIDTH_PX = 794
/** A4 portrait height at 96 CSS px/in (297 mm). */
export const ADMIN_DOCUMENT_HEIGHT_PX = 1123
/** Scale design canvas onto A4 for PDF capture / print. @deprecated PDF no longer uses zoom. */
export const ADMIN_DOCUMENT_PDF_ZOOM = ADMIN_DOCUMENT_WIDTH_PX / ADMIN_DOCUMENT_DESIGN_WIDTH_PX

export const DM_SANS_FONT_URL =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap'

/** Shared print / PDF rules: native A4, no zoom (readability overrides in admin-document-pdf-a4.css). */
export function buildAdminDocumentA4PdfCss(): string {
  return `
@page {
  size: A4 portrait;
  margin: 0;
}
html, body {
  margin: 0;
  padding: 0;
  background: #ffffff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.aco-offer-preview-stack {
  margin: 0 !important;
  padding: 0 !important;
  width: ${ADMIN_DOCUMENT_WIDTH_PX}px;
}
.aco-offer-preview-sheet-break {
  break-before: page;
  page-break-before: always;
  margin-top: 0 !important;
}
.aco-a4,
.admin-product-sheet,
.admin-benefits-client-a4,
.admin-benefits-partner-a4 {
  width: ${ADMIN_DOCUMENT_WIDTH_PX}px !important;
  max-width: ${ADMIN_DOCUMENT_WIDTH_PX}px !important;
  height: auto !important;
  overflow: visible !important;
  box-shadow: none !important;
  outline: none !important;
  margin: 0 auto !important;
  flex-shrink: 0;
  display: flex !important;
  flex-direction: column !important;
}
.aco-a4 {
  min-height: ${ADMIN_DOCUMENT_HEIGHT_PX}px !important;
}
.admin-product-sheet,
.admin-benefits-client-a4,
.admin-benefits-partner-a4 {
  min-height: ${ADMIN_DOCUMENT_HEIGHT_PX}px !important;
}
.admin-product-sheet .aps-footer {
  margin-top: auto !important;
}
.admin-benefits-client-a4 .abb-footer,
.admin-benefits-partner-a4 .abp-footer {
  margin-top: auto !important;
}
.admin-product-sheet .aps-hero,
.admin-product-sheet .aps-footer,
.admin-product-sheet .aps-feat,
.admin-product-sheet .aps-spec-section,
.admin-benefits-client-a4 .abb-cta,
.admin-benefits-client-a4 .abb-footer,
.admin-benefits-partner-a4 .abp-cta,
.admin-benefits-partner-a4 .abp-footer {
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}
.admin-product-sheet .aps-spec-table tr {
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}
.aco-a4 .aco-flex-spacer {
  flex: 1 1 auto !important;
  min-height: 0 !important;
}
.aco-a4 .aco-top-bar,
.aco-a4 .aco-header,
.aco-a4 .aco-divider,
.aco-a4 .aco-parties,
.aco-a4 .aco-products-section,
.aco-a4 .aco-totals-row,
.aco-a4 .aco-notes-section,
.aco-a4 .aco-footer-section,
.aco-a4 .aco-bottom-bar,
.admin-product-sheet .aps-top-bar,
.admin-product-sheet .aps-hero,
.admin-product-sheet .aps-body-grid,
.admin-product-sheet .aps-stats-grid,
.admin-product-sheet .aps-footer {
  flex-shrink: 0 !important;
}
.aco-pdf-exclude {
  display: none !important;
}
`
}

export function getAdminDocumentPdfStyleBlocks(inlinedCssBlocks: string[]): string[] {
  return [...inlinedCssBlocks, buildAdminDocumentA4PdfCss(), PDF_READABILITY_CSS]
}

export function prepareHtml2CanvasCloneDocument(clonedDoc: Document, inlinedCssBlocks: string[]): void {
  clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((node) => node.remove())
  clonedDoc.querySelectorAll('style').forEach((node) => node.remove())

  const head = clonedDoc.head ?? clonedDoc.documentElement
  const fontLink = clonedDoc.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href = DM_SANS_FONT_URL
  head.appendChild(fontLink)

  for (const block of inlinedCssBlocks) {
    const style = clonedDoc.createElement('style')
    style.textContent = block
    head.appendChild(style)
  }

  const body = clonedDoc.body
  if (body) {
    body.style.margin = '0'
    body.style.padding = '0'
    body.style.background = '#ffffff'
  }
}

export async function waitForDocumentImages(root: HTMLElement): Promise<void> {
  if (document.fonts?.ready) {
    await Promise.race([
      document.fonts.ready,
      new Promise<void>((resolve) => window.setTimeout(resolve, 5_000)),
    ])
  }

  const images = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          const done = () => resolve()
          img.addEventListener('load', done, { once: true })
          img.addEventListener('error', done, { once: true })
          window.setTimeout(done, 8_000)
        }),
    ),
  )

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export type CaptureA4PdfOptions = {
  widthPx?: number
  minHeightPx?: number
  pageBreakBeforeSelector?: string
  pageBreakAvoidSelectors?: string[]
  inlinedCssBlocks: string[]
  onCloneExtra?: (clonedDoc: Document) => void
}

/**
 * Randează un element HTML ca PDF A4 (portrait) via html2canvas + jsPDF.
 * Folosește doar CSS-ul injectat în clone (fără Tailwind / oklch).
 */
export async function captureElementAsA4PdfBlob(
  target: HTMLElement,
  options: CaptureA4PdfOptions,
): Promise<Blob> {
  const widthPx = options.widthPx ?? ADMIN_DOCUMENT_WIDTH_PX
  const minHeightPx = options.minHeightPx ?? ADMIN_DOCUMENT_HEIGHT_PX

  await waitForDocumentImages(target)

  return withInlinedImagesForPdf(target, async () => {
    const captureHeight = Math.max(
      Math.max(target.scrollHeight, target.offsetHeight),
      minHeightPx,
    )
    const cssBlocks = getAdminDocumentPdfStyleBlocks(options.inlinedCssBlocks)

    const pagebreak = options.pageBreakBeforeSelector
      ? {
          mode: ['css', 'legacy'] as const,
          before: options.pageBreakBeforeSelector,
          avoid: options.pageBreakAvoidSelectors,
        }
      : {
          mode: ['css', 'legacy'] as const,
          avoid: options.pageBreakAvoidSelectors,
        }

    const opt = {
      margin: [0, 0, 0, 0] as [number, number, number, number],
      filename: 'document.pdf',
      image: { type: 'jpeg' as const, quality: 0.94 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        letterRendering: true,
        width: widthPx,
        height: captureHeight,
        windowWidth: widthPx,
        windowHeight: captureHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc: Document) => {
          prepareHtml2CanvasCloneDocument(clonedDoc, cssBlocks)
          options.onCloneExtra?.(clonedDoc)
        },
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak,
    }

    return (await html2pdf().set(opt).from(target).outputPdf('blob')) as Blob
  })
}
