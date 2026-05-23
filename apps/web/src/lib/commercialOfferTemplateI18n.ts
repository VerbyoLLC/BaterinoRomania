import type { CommercialOfferLanguage } from './commercialOfferDraft'

/** BCP 47 locale pentru formatare dată/sume/TVA. */
export const COMMERCIAL_OFFER_LOCALE: Record<CommercialOfferLanguage, string> = {
  ro: 'ro-RO',
  en: 'en-GB',
  de: 'de-DE',
}

export type CommercialOfferTemplateStrings = {
  previewBadge: string
  generatedPrefix: string
  printPdf: string
  pdfGenerating: string
  backToForm: string
  documentLanguageLabel: string
  footerDisclaimer: string

  topBarDoc: string
  topBarConfidential: string
  logoSub: string
  offerTitle: string
  issuedPrefix: string
  validityPrefix: string
  supplier: string
  client: string
  taxIdPrefix: string
  contactPersonPrefix: string
  postalPrefix: string
  clientTypeIndividual: string

  productsSection: string
  colProduct: string
  colUnit: string
  colQty: string
  colPricePerUnit: string
  colVatPct: string
  colVatAmount: string
  colTotal: string
  unitPiece: string
  emptyLines: string
  lineDiscountPrefix: string

  subtotalExVat: string
  vatAveragePrefix: string
  grandTotalPayable: string

  noteWarrantyTitle: string
  noteWarrantyBody: string
  notePaymentTitle: string
  noteDeliveryTitle: string

  madeByLabel: string
  /** Titlu deasupra celor două QR-uri (telefon / WhatsApp). */
  contactMeLabel: string
  authorSalesAgent: string
  authorRepresentative: string
  qrScanPrefix: string

  emptyStateTitle: string
  emptyStateBody: string
  emptyStateBack: string

  daysSuffix: string
  zeroDays: string

  /** Pill în antet când opțiunea e bifată în formular */
  metaIncludesTechnical: string
  metaIncludesBenefits: string
}

const STRINGS: Record<CommercialOfferLanguage, CommercialOfferTemplateStrings> = {
  ro: {
    previewBadge: 'Previzualizare temporară (șablon A4)',
    generatedPrefix: 'Generat:',
    printPdf: 'Descarcă PDF A4',
    pdfGenerating: 'Se generează PDF…',
    backToForm: '← Înapoi la formular',
    documentLanguageLabel: 'Limba documentului',
    footerDisclaimer:
      'Document demonstrativ — nu constituie factură fiscală. Coduri QR: site Baterino și contact WhatsApp.',

    topBarDoc: 'Baterino \u00a0/\u00a0 Ofertă Comercială',
    topBarConfidential: 'Confidențial',
    logoSub: 'Energy Storage Infrastructure',
    offerTitle: 'Ofertă Comercială',
    issuedPrefix: 'Emisă:',
    validityPrefix: 'Valabilitate:',
    supplier: 'Furnizor',
    client: 'Client',
    taxIdPrefix: 'CUI:',
    contactPersonPrefix: 'Persoană de contact:',
    postalPrefix: 'CP',
    clientTypeIndividual: 'Persoană fizică',

    productsSection: 'Produse & servicii',
    colProduct: 'Produs',
    colUnit: 'UM',
    colQty: 'Cant.',
    colPricePerUnit: 'Preț/U',
    colVatPct: 'TVA %',
    colVatAmount: 'TVA',
    colTotal: 'Total',
    unitPiece: 'buc',
    emptyLines: 'Nu există linii de produs.',
    lineDiscountPrefix: 'Reducere linie',

    subtotalExVat: 'Subtotal (fără TVA)',
    vatAveragePrefix: 'TVA',
    grandTotalPayable: 'TOTAL DE PLATĂ',

    noteWarrantyTitle: 'Garanție & suport',
    noteWarrantyBody:
      '- Toate produsele includ garanție de 10 ani.\n- Suport tehnic disponibil 24/7 prin platforma Baterino.ro.\n- Obținerea certificatului de garanție se face automat pe site-ul baterino.ro.',
    notePaymentTitle: 'Condiții de plată',
    noteDeliveryTitle: 'Livrare',

    madeByLabel: 'Ofertă întocmită de',
    contactMeLabel: 'CONTACTEAZĂ-MĂ',
    authorSalesAgent: 'Agent comercial',
    authorRepresentative: 'Reprezentant',
    qrScanPrefix: 'Scanează pentru',

    emptyStateTitle: 'Previzualizare ofertă comercială',
    emptyStateBody:
      'Nu există date de ofertă. Deschide această pagină din formularul Ofertă nouă, folosind butonul de previzualizare.',
    emptyStateBack: '← Înapoi la Ofertă nouă',

    daysSuffix: 'zile',
    zeroDays: '0 zile',

    metaIncludesTechnical: 'Include detalii tehnice produs',
    metaIncludesBenefits: 'Include beneficii Baterino',
  },
  en: {
    previewBadge: 'Temporary preview (A4 template)',
    generatedPrefix: 'Generated:',
    printPdf: 'Download A4 PDF',
    pdfGenerating: 'Generating PDF…',
    backToForm: '← Back to form',
    documentLanguageLabel: 'Document language',
    footerDisclaimer:
      'Demonstration document — not a tax invoice. QR codes: Baterino website and WhatsApp contact.',

    topBarDoc: 'Baterino \u00a0/\u00a0 Commercial Offer',
    topBarConfidential: 'Confidential',
    logoSub: 'Energy Storage Infrastructure',
    offerTitle: 'Commercial Offer',
    issuedPrefix: 'Issued:',
    validityPrefix: 'Validity:',
    supplier: 'Supplier',
    client: 'Client',
    taxIdPrefix: 'Tax ID:',
    contactPersonPrefix: 'Contact person:',
    postalPrefix: 'Postal',
    clientTypeIndividual: 'Individual',

    productsSection: 'Products & services',
    colProduct: 'Product',
    colUnit: 'UoM',
    colQty: 'Qty',
    colPricePerUnit: 'Price/U',
    colVatPct: 'VAT %',
    colVatAmount: 'VAT',
    colTotal: 'Total',
    unitPiece: 'pcs',
    emptyLines: 'No product lines.',
    lineDiscountPrefix: 'Line discount',

    subtotalExVat: 'Subtotal (excl. VAT)',
    vatAveragePrefix: 'VAT',
    grandTotalPayable: 'AMOUNT PAYABLE',

    noteWarrantyTitle: 'Warranty & support',
    noteWarrantyBody:
      '- All products include a 10-year warranty.\n- Technical support is available 24/7 via the Baterino.ro platform.\n- The warranty certificate is issued automatically on baterino.ro.',
    notePaymentTitle: 'Payment terms',
    noteDeliveryTitle: 'Delivery',

    madeByLabel: 'Offer prepared by',
    contactMeLabel: 'CONTACT ME',
    authorSalesAgent: 'Sales agent',
    authorRepresentative: 'Representative',
    qrScanPrefix: 'Scan for',

    emptyStateTitle: 'Commercial offer preview',
    emptyStateBody:
      'No offer data. Open this page from the New offer form using the preview button.',
    emptyStateBack: '← Back to New offer',

    daysSuffix: 'days',
    zeroDays: '0 days',

    metaIncludesTechnical: 'Includes product technical details',
    metaIncludesBenefits: 'Includes Baterino benefits',
  },
  de: {
    previewBadge: 'Vorläufige Vorschau (A4-Vorlage)',
    generatedPrefix: 'Erstellt:',
    printPdf: 'A4-PDF herunterladen',
    pdfGenerating: 'PDF wird erstellt…',
    backToForm: '← Zurück zum Formular',
    documentLanguageLabel: 'Dokumentsprache',
    footerDisclaimer:
      'Demonstrationsdokument — keine Steuerrechnung. QR-Codes: Baterino-Website und WhatsApp-Kontakt.',

    topBarDoc: 'Baterino \u00a0/\u00a0 Handelsangebot',
    topBarConfidential: 'Vertraulich',
    logoSub: 'Energiespeicher-Infrastruktur',
    offerTitle: 'Handelsangebot',
    issuedPrefix: 'Ausgestellt:',
    validityPrefix: 'Gültigkeit:',
    supplier: 'Lieferant',
    client: 'Kunde',
    taxIdPrefix: 'USt-ID / Steuernummer:',
    contactPersonPrefix: 'Ansprechpartner:',
    postalPrefix: 'PLZ',
    clientTypeIndividual: 'Privatperson',

    productsSection: 'Produkte & Leistungen',
    colProduct: 'Produkt',
    colUnit: 'ME',
    colQty: 'Menge',
    colPricePerUnit: 'Preis/E',
    colVatPct: 'MwSt %',
    colVatAmount: 'MwSt',
    colTotal: 'Gesamt',
    unitPiece: 'Stk.',
    emptyLines: 'Keine Produktzeilen.',
    lineDiscountPrefix: 'Zeilenrabatt',

    subtotalExVat: 'Zwischensumme (ohne MwSt)',
    vatAveragePrefix: 'MwSt',
    grandTotalPayable: 'GESAMTBETRAG',

    noteWarrantyTitle: 'Garantie & Support',
    noteWarrantyBody:
      '- Alle Produkte beinhalten eine 10-Jahres-Garantie.\n- Technischer Support ist rund um die Uhr (24/7) über die Plattform Baterino.ro erreichbar.\n- Das Garantiezertifikat erhalten Sie automatisch auf baterino.ro.',
    notePaymentTitle: 'Zahlungsbedingungen',
    noteDeliveryTitle: 'Lieferung',

    madeByLabel: 'Angebot erstellt von',
    contactMeLabel: 'KONTAKT AUFNEHMEN',
    authorSalesAgent: 'Vertriebsmitarbeiter',
    authorRepresentative: 'Vertretung',
    qrScanPrefix: 'Scannen für',

    emptyStateTitle: 'Vorschau Handelsangebot',
    emptyStateBody:
      'Keine Angebotsdaten. Öffnen Sie diese Seite über das Formular „Neues Angebot“ mit der Vorschau-Schaltfläche.',
    emptyStateBack: '← Zurück zu Neuangebot',

    daysSuffix: 'Tage',
    zeroDays: '0 Tage',

    metaIncludesTechnical: 'Mit Produktdetails (technisch)',
    metaIncludesBenefits: 'Mit Baterino-Vorteilen',
  },
}

export function getCommercialOfferTemplateStrings(lang: CommercialOfferLanguage): CommercialOfferTemplateStrings {
  return STRINGS[lang] ?? STRINGS.ro
}

export function formatCommercialIssueDate(isoGeneratedAt: string, localeTag: string): string {
  const t = new Date(isoGeneratedAt)
  if (Number.isNaN(t.getTime())) return '—'
  return t.toLocaleDateString(localeTag, { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatCommercialValidityDays(
  draft: {
    generatedAt: string
    validUntilIso: string | null
    validUntilDisplayRo?: string | null
    validityDays?: number | null
  },
  localeTag: string,
  strings: CommercialOfferTemplateStrings,
): string {
  const iso = draft.validUntilIso?.trim()
  const vd =
    typeof draft.validityDays === 'number' && Number.isFinite(draft.validityDays) && draft.validityDays >= 1
      ? draft.validityDays
      : null
  if (vd != null && iso) {
    const end = new Date(`${iso}T12:00:00`)
    if (!Number.isNaN(end.getTime())) {
      const endFormatted = end.toLocaleDateString(localeTag, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      return `${vd} ${strings.daysSuffix} (${endFormatted})`
    }
  }

  if (!iso) return '—'
  const start = new Date(draft.generatedAt)
  const end = new Date(`${draft.validUntilIso}T12:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    try {
      const d = new Date(`${draft.validUntilIso}T12:00:00`)
      if (!Number.isNaN(d.getTime()))
        return d.toLocaleDateString(localeTag, { day: 'numeric', month: 'long', year: 'numeric' })
    } catch {
      /* ignore */
    }
    return draft.validUntilDisplayRo ?? '—'
  }
  const ms = end.getTime() - start.getTime()
  const days = Math.ceil(ms / 86400000)
  if (!Number.isFinite(days)) return '—'
  if (days < 0) return strings.zeroDays
  return `${days} ${strings.daysSuffix}`
}

export function formatWeightedVatPercent(netAfterDiscount: number, totalVat: number, localeTag: string): string {
  if (netAfterDiscount <= 0) return '—'
  const p = (totalVat / netAfterDiscount) * 100
  return new Intl.NumberFormat(localeTag, { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(p)
}
