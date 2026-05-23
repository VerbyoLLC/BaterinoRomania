import { useMemo } from 'react'
import type { CommercialOfferLanguage } from '../../lib/commercialOfferDraft'
import type { AdminProduct, AdminProductModelRow } from '../../lib/api'
import {
  formatProductSheetDecimalPart,
  getProductSheetTemplateStrings,
  translateProductSheetSpecLabel,
  translateProductSheetSpecValue,
  type ProductSheetTemplateStrings,
} from '../../lib/productSheetTemplateI18n'
import './admin-product-sheet.css'

const FEAT_SVGS = {
  heat: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2c-1 3-4 4-4 8a4 4 0 0 0 8 0c0-4-3-5-4-8z" />
      <path d="M12 14v4" />
      <path d="M10 20h4" />
    </svg>
  ),
  wifi: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="#1e46b4" stroke="none" />
    </svg>
  ),
  bms: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  ),
  stack: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
    </svg>
  ),
}

export type SheetTechnicalRow = { kind: 'section' | 'pair'; label: string; value: string }

function buildSpecMap(rows: SheetTechnicalRow[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const r of rows) {
    if (r.kind === 'pair') m.set(r.label.trim().toLowerCase(), r.value.trim())
  }
  return m
}

function getSpec(m: Map<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = m.get(k.toLowerCase())
    if (v) return v
  }
  return ''
}

function splitKpiDisplay(raw: string, lang: CommercialOfferLanguage): { val: string; unit: string } {
  if (!raw.trim()) return { val: '—', unit: '' }
  const s = raw.trim()
  const match = s.match(/^([≈~≤]*[\d.,]+)\s*(.*)$/u)
  if (!match) return { val: formatProductSheetDecimalPart(s, lang), unit: '' }
  const tail = match[2]?.trim() ?? ''
  const unit = tail ? translateProductSheetSpecValue(` ${tail}`, lang).trimStart() : ''
  return {
    val: formatProductSheetDecimalPart(match[1], lang) || '—',
    unit: unit ? ` ${unit}` : '',
  }
}

function parseCerts(certLine: string): string[] {
  if (!certLine.trim()) return []
  return certLine
    .split(/[,;/]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 10)
}

function warrantyParts(
  map: Map<string, string>,
  t: ProductSheetTemplateStrings,
  lang: CommercialOfferLanguage,
): string {
  const w = getSpec(map, 'warranty')
  const years = w.match(/(\d+)\s*(years?|ani?|jahre?)/i)
  const n = years?.[1]
  return n ? t.warrantyYears(n) : translateProductSheetSpecValue(w, lang) || t.warrantyManufacturer
}

function isHighlightLabel(label: string): boolean {
  return /^(energy|nominal voltage|rated output power|energie|tensiune nominal(ă|a)|putere nominal)/i.test(
    label.trim(),
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function formatCycleLifeMain(raw: string, lang: CommercialOfferLanguage): string {
  if (!raw.trim()) return '—'
  const withoutTimes = raw.replace(/\s*times?\s*/i, '').trim()
  const lead = withoutTimes.match(/^([\d.,≈~≤]+)/u)
  const num = lead ? lead[1] : withoutTimes
  return formatProductSheetDecimalPart(num, lang)
}

const PRODUCT_SHEET_FOOTER_WEB = 'WWW.BATERINO.RO'
const PRODUCT_SHEET_FOOTER_EMAIL = 'VANZARI@BATERINO.RO'
const PRODUCT_SHEET_FOOTER_PHONE = '+40 770 106 374'

export type AdminProductSheetA4Props = {
  model: AdminProductModelRow
  title: string
  imageUrl: string
  matchedProduct: AdminProduct | null
  technicalRows: SheetTechnicalRow[]
  /** Limba ofertei / documentului — implicit română (Șabloane produse). */
  language?: CommercialOfferLanguage
}

export default function AdminProductSheetA4({
  model,
  title,
  imageUrl,
  matchedProduct,
  technicalRows,
  language = 'ro',
}: AdminProductSheetA4Props) {
  const t = useMemo(() => getProductSheetTemplateStrings(language), [language])
  const specMap = useMemo(() => buildSpecMap(technicalRows), [technicalRows])

  const topSeries =
    model.usageType === 'residential' ? t.seriesResidential : t.seriesIndustrial

  const chemistry = getSpec(specMap, 'chemistry', 'chimie celule')
  const storageLabel =
    model.usageType === 'residential' ? t.storageResidential : t.storageIndustrial
  const brandTag = chemistry ? `${storageLabel} · ${chemistry}` : `${storageLabel} · LiFePO4`

  const subtitle =
    String((matchedProduct as { subtitle?: string | null })?.subtitle ?? '').trim() ||
    (model.series ? `${model.series} · ${model.modelNumber}` : `${t.modelPrefix} ${model.modelNumber}`)

  const kpiEnergy = splitKpiDisplay(getSpec(specMap, 'energy'), language)
  const kpiPower = splitKpiDisplay(getSpec(specMap, 'rated output power'), language)
  const kpiVoltage = splitKpiDisplay(getSpec(specMap, 'nominal voltage'), language)
  const kpiCapacity = splitKpiDisplay(getSpec(specMap, 'nominal capacity'), language)

  const warrantyTitle = warrantyParts(specMap, t, language)
  const certs = parseCerts(getSpec(specMap, 'certification', 'certificări', 'certificari'))

  const cycleLife = getSpec(specMap, 'cycle life')
  const dischargeTemp = getSpec(specMap, 'discharge temperature')
  const altitude = getSpec(specMap, 'altitude')
  const waterproof = getSpec(specMap, 'waterproof')

  const chargeDischarge = getSpec(specMap, 'charge & discharge current', 'curent încărcare / descărcare')
  const communication = getSpec(specMap, 'communication', 'comunicație')
  const wifiBt = getSpec(specMap, 'wifi/bt', 'wifi / bluetooth')
  const selfHeat = getSpec(specMap, 'self-heating')

  const feats = useMemo(
    () => [
      {
        svg: FEAT_SVGS.heat,
        title: t.featHeat,
        desc: selfHeat ? translateProductSheetSpecValue(selfHeat, language) : t.featHeatDefault,
      },
      {
        svg: FEAT_SVGS.wifi,
        title: t.featWifi,
        desc: wifiBt ? translateProductSheetSpecValue(wifiBt, language) : t.featWifiDefault,
      },
      {
        svg: FEAT_SVGS.bms,
        title: t.featBms,
        desc: communication
          ? translateProductSheetSpecValue(communication, language)
          : t.featBmsDefault,
      },
      {
        svg: FEAT_SVGS.stack,
        title: t.featStack,
        desc: t.featStackDefault,
      },
      {
        svg: FEAT_SVGS.bolt,
        title: t.featHighCurrent,
        desc: chargeDischarge
          ? translateProductSheetSpecValue(chargeDischarge, language)
          : t.featHighCurrentDefault,
      },
      {
        svg: FEAT_SVGS.sun,
        title: t.featSolar,
        desc: t.featSolarDefault,
      },
    ],
    [selfHeat, wifiBt, communication, chargeDischarge, t, language],
  )

  return (
    <div className="admin-product-sheet">
      <div className="aps-top-bar">
        <div className="aps-top-bar-left">
          <span className="aps-top-bar-brand">Baterino &nbsp;/&nbsp; {topSeries}</span>
        </div>
        <div className="aps-top-bar-right">
          <span className="aps-top-bar-doc">{t.topBarDoc}</span>
          <img
            className="aps-top-logo"
            src="/images/email/baterino-white-logo.png"
            alt=""
            width={110}
            height={22}
          />
        </div>
      </div>

      <div className="aps-hero">
        <div className="aps-hero-left">
          <div className="aps-brand-tag">{brandTag}</div>
          <div className="aps-product-kind">{t.productKind}</div>
          <div className="aps-title-row">
            <span className="aps-product-name">{title}</span>
            {model.brand.trim() ? (
              <span className="aps-manufacturer-badge">
                <span className="aps-manufacturer-badge-text">{model.brand}</span>
              </span>
            ) : null}
          </div>
          <div className="aps-product-sub">{subtitle}</div>

          <div className="aps-kpi-row">
            <div className="aps-kpi">
              <div className="aps-kpi-val">
                {kpiEnergy.val}
                {kpiEnergy.unit ? <span className="aps-kpi-unit">{kpiEnergy.unit}</span> : null}
              </div>
              <div className="aps-kpi-lbl">{t.kpiEnergy}</div>
            </div>
            <div className="aps-kpi">
              <div className="aps-kpi-val">
                {kpiPower.val}
                {kpiPower.unit ? <span className="aps-kpi-unit">{kpiPower.unit}</span> : null}
              </div>
              <div className="aps-kpi-lbl">{t.kpiPower}</div>
            </div>
            <div className="aps-kpi">
              <div className="aps-kpi-val">
                {kpiVoltage.val}
                {kpiVoltage.unit ? <span className="aps-kpi-unit">{kpiVoltage.unit}</span> : null}
              </div>
              <div className="aps-kpi-lbl">{t.kpiVoltage}</div>
            </div>
            <div className="aps-kpi">
              <div className="aps-kpi-val">
                {kpiCapacity.val}
                {kpiCapacity.unit ? <span className="aps-kpi-unit">{kpiCapacity.unit}</span> : null}
              </div>
              <div className="aps-kpi-lbl">{t.kpiCapacity}</div>
            </div>
          </div>

          <div className="aps-warranty-block">
            <div className="aps-warranty-icon-box">
              <ShieldIcon />
            </div>
            <div>
              <div className="aps-warranty-title">
                {warrantyTitle}
                <span>· {t.warrantyStandardCoverage}</span>
              </div>
              <div className="aps-warranty-sub">{t.warrantySub}</div>
            </div>
          </div>

          {certs.length > 0 ? (
            <div className="aps-cert-row">
              {certs.map((c) => (
                <div key={c} className="aps-cert">
                  {c}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="aps-hero-right">
          <img src={imageUrl} alt="" />
        </div>
      </div>

      <div className="aps-body-grid">
        <div className="aps-spec-panel">
          <div className="aps-panel-title">{t.specsSection}</div>
          <div className="aps-spec-scroll">
            <table className="aps-spec-table">
              <tbody>
                {technicalRows.length === 0 ? (
                  <tr>
                    <td colSpan={2}>{t.specsEmpty}</td>
                  </tr>
                ) : (
                  technicalRows.map((row, i) =>
                    row.kind === 'section' ? (
                      <tr key={`sec-${i}`} className="aps-spec-section">
                        <td colSpan={2}>{translateProductSheetSpecLabel(row.label, language)}</td>
                      </tr>
                    ) : (
                      <tr key={`pair-${i}`}>
                        <td>{translateProductSheetSpecLabel(row.label, language)}</td>
                        <td className={isHighlightLabel(row.label) ? 'aps-hl' : undefined}>
                          {translateProductSheetSpecValue(row.value, language)}
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="aps-feats-panel">
          <div className="aps-panel-title">{t.featuresSection}</div>
          <div className="aps-feat-grid">
            {feats.map((f) => (
              <div key={f.title} className="aps-feat">
                {f.svg}
                <div className="aps-feat-title">{f.title}</div>
                <div className="aps-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
          <div className="aps-panel-title aps-stats-section-title">{t.statsSection}</div>
          <div className="aps-feat-grid aps-stats-grid">
            <div className="aps-feat">
              <div className="aps-feat-title">
                {formatCycleLifeMain(cycleLife, language)}
                {cycleLife.trim() ? ` ${t.valueCycles}` : ''}
              </div>
              <div className="aps-feat-desc">{t.statCycleLife}</div>
            </div>
            <div className="aps-feat">
              <div className="aps-feat-title">
                {dischargeTemp ? translateProductSheetSpecValue(dischargeTemp, language) : '—'}
              </div>
              <div className="aps-feat-desc">{t.statDischargeTemp}</div>
            </div>
            <div className="aps-feat">
              <div className="aps-feat-title">
                {altitude ? translateProductSheetSpecValue(altitude, language) : '—'}
              </div>
              <div className="aps-feat-desc">{t.statAltitude}</div>
            </div>
            <div className="aps-feat">
              <div className="aps-feat-title">
                {waterproof.trim() ? translateProductSheetSpecValue(waterproof, language) : '—'}
              </div>
              <div className="aps-feat-desc">{t.statWaterproof}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="aps-footer">
        <span className="aps-footer-contact">
          {PRODUCT_SHEET_FOOTER_WEB} · {PRODUCT_SHEET_FOOTER_EMAIL} · {PRODUCT_SHEET_FOOTER_PHONE}
        </span>
      </div>
    </div>
  )
}
