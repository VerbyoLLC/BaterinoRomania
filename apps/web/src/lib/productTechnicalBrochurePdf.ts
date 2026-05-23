import productSheetCss from '../pages/admin/admin-product-sheet.css?inline'
import { captureElementAsA4PdfBlob, stripCssImports } from './adminDocumentPdfCapture'

const PRODUCT_SHEET_CAPTURE_CSS = stripCssImports(productSheetCss)

/**
 * Convertește DOM-ul fișei `.admin-product-sheet` în PDF A4 (client-side).
 * Imaginile de pe alte domenii necesită CORS pe bucket-ul media pentru html2canvas.
 */
export async function captureProductSheetElementAsPdfBlob(rootEl: HTMLElement): Promise<Blob> {
  const sheet = rootEl.querySelector<HTMLElement>('.admin-product-sheet')
  const target = sheet ?? rootEl

  return captureElementAsA4PdfBlob(target, {
    inlinedCssBlocks: [PRODUCT_SHEET_CAPTURE_CSS],
    pageBreakAvoidSelectors: [
      '.aps-hero',
      '.aps-footer',
      '.aps-feat',
      '.aps-spec-section',
      '.aps-spec-table tr',
    ],
  })
}
