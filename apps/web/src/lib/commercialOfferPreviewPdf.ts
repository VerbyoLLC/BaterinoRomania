import commercialOfferCss from '../pages/admin/admin-commercial-offer-a4.css?inline'
import productSheetCss from '../pages/admin/admin-product-sheet.css?inline'
import benefitsClientCss from '../pages/admin/admin-benefits-client-a4.css?inline'
import benefitsPartnerCss from '../pages/admin/admin-benefits-partner-a4.css?inline'
import {
  ADMIN_DOCUMENT_WIDTH_PX,
  DM_SANS_FONT_URL,
  getAdminDocumentPdfStyleBlocks,
  stripCssImports,
} from './adminDocumentPdfCapture'
import { absolutizeAssetUrl } from './adminDocumentPdfImages'

const COMMERCIAL_OFFER_CAPTURE_CSS = stripCssImports(commercialOfferCss)
const PRODUCT_SHEET_CAPTURE_CSS = stripCssImports(productSheetCss)
const BENEFITS_CLIENT_CAPTURE_CSS = stripCssImports(benefitsClientCss)
const BENEFITS_PARTNER_CAPTURE_CSS = stripCssImports(benefitsPartnerCss)

function buildPdfStyleBlock(): string {
  return getAdminDocumentPdfStyleBlocks([
    COMMERCIAL_OFFER_CAPTURE_CSS,
    PRODUCT_SHEET_CAPTURE_CSS,
    BENEFITS_CLIENT_CAPTURE_CSS,
    BENEFITS_PARTNER_CAPTURE_CSS,
  ]).join('\n')
}

/**
 * Construiește HTML pentru export PDF (ofertă + fișe tehnice).
 * Imaginile rămân ca URL-uri absolute — API-ul le inline-uiește server-side (rapid, cu timeout).
 */
export function buildCommercialOfferPreviewHtmlForPdf(
  stackEl: HTMLElement,
  origin = typeof window !== 'undefined' ? window.location.origin : 'https://baterino.ro',
): string {
  const root = stackEl.classList.contains('aco-offer-preview-stack')
    ? stackEl
    : stackEl.querySelector<HTMLElement>('.aco-offer-preview-stack')
  if (!root) {
    throw new Error('Nu s-a găsit conținutul ofertei pentru export PDF.')
  }

  const clone = root.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.aco-pdf-exclude').forEach((node) => node.remove())

  clone.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src')
    if (src) img.setAttribute('src', absolutizeAssetUrl(src, origin))
  })

  const styleBlock = buildPdfStyleBlock()

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ofertă comercială</title>
<link rel="stylesheet" href="${DM_SANS_FONT_URL}">
<style>${styleBlock}</style>
</head>
<body style="width:${ADMIN_DOCUMENT_WIDTH_PX}px;margin:0 auto;">
${clone.outerHTML}
</body>
</html>`
}
