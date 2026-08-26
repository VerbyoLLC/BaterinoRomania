import { formatPriceInputDisplay, parsePriceInput } from './formInputSanitize'

/** Parse admin VAT field (e.g. "21" or "19,5") to a percentage number. */
export function parseVatPercent(vatRaw: string | number | null | undefined): number {
  const s = String(vatRaw ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
  const n = parseFloat(s)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Net (ex-VAT) unit from client-facing price incl. VAT. */
export function netFromInclVat(inclVat: number, vatPercent: number): number {
  if (!Number.isFinite(inclVat) || inclVat <= 0) return 0
  if (!Number.isFinite(vatPercent) || vatPercent <= 0) return inclVat
  return inclVat / (1 + vatPercent / 100)
}

/** Client-facing price incl. VAT from stored net (ex-VAT) unit. */
export function inclVatFromNet(net: number, vatPercent: number): number {
  if (!Number.isFinite(net) || net <= 0) return 0
  if (!Number.isFinite(vatPercent) || vatPercent <= 0) return net
  return net * (1 + vatPercent / 100)
}

/** DB salePrice (ex-VAT) → formatted admin input (incl. VAT). */
export function formatAdminSalePriceInclVatFromNet(
  salePriceNet: string | number | null | undefined,
  vatRaw: string | number | null | undefined,
): string {
  const net = parsePriceInput(String(salePriceNet ?? ''))
  if (!net || net <= 0) return ''
  const incl = inclVatFromNet(net, parseVatPercent(vatRaw))
  return incl > 0 ? formatPriceInputDisplay(incl) : ''
}

/** Admin incl-VAT input → net unit for API `salePrice`. */
export function parseAdminSalePriceNetFromInclVat(
  salePriceInclVatInput: string,
  vatRaw: string | number | null | undefined,
): number {
  const incl = parsePriceInput(salePriceInclVatInput)
  if (!incl || incl <= 0) return 0
  return netFromInclVat(incl, parseVatPercent(vatRaw))
}

/** Formatted net display derived from incl-VAT input + VAT %. */
export function formatAdminSalePriceNetDisplay(
  salePriceInclVatInput: string,
  vatRaw: string | number | null | undefined,
): string {
  const net = parseAdminSalePriceNetFromInclVat(salePriceInclVatInput, vatRaw)
  return net > 0 ? formatPriceInputDisplay(net) : ''
}

/** Client-facing list/card price from stored net + VAT. */
export function formatClientPriceFromNet(
  salePriceNet: string | number | null | undefined,
  vatRaw: string | number | null | undefined,
  currencySuffix: string,
): string | null {
  const net = parsePriceInput(String(salePriceNet ?? ''))
  if (!net || net <= 0) return null
  const incl = inclVatFromNet(net, parseVatPercent(vatRaw))
  if (!incl || incl <= 0) return null
  return `${Math.round(incl).toLocaleString('ro-RO', { maximumFractionDigits: 0 })} ${currencySuffix}`
}
