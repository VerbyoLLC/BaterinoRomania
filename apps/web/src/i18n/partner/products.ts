import type { LangCode } from '../menu'

export type PartnerCatalogSectionId =
  | 'rezidential'
  | 'micro_grid'
  | 'comercial_medical'
  | 'industrial'
  | 'maritim'

export type PartnerCartTotalsLabels = {
  net: string
  vat: string
  gross: string
}

export type PartnerToolbarLabels = {
  searchProducts: string
  clearSearch: string
  openSearchPanel: string
  closeSearchPanel: string
  notifications: string
  notificationsEmptyTitle: string
  notificationsEmptySubtitle: string
}

export type PartnerProductsTranslations = {
  cartTotals: PartnerCartTotalsLabels
  cartLoading: string
  basketPanelLoading: string
  catalogSections: Record<PartnerCatalogSectionId, string>
  toolbar: PartnerToolbarLabels
  productCountOne: string
  productCountMany: string
  pageTitle: string
  cartTitle: string
  /** Short tab label — Coș / Cart */
  basketTabCart: string
  /** Short tab label — Ofertă / Quote */
  basketTabQuote: string
  basketTabsAria: string
  cartAria: string
  cartClear: string
  cartTotalsDisclaimer: string
  cartEmpty: string
  /** Empty cart tab when partner discount is approved */
  cartApprovedEmptyBadge: string
  cartApprovedEmptyIntro: string
  cartApprovedEmptyStep1Title: string
  cartApprovedEmptyStep1Subtitle: string
  cartApprovedEmptyStep2Title: string
  cartApprovedEmptyStep2Subtitle: string
  cartApprovedEmptyStep3Title: string
  cartApprovedEmptyStep3Subtitle: string
  cartApprovedEmptyFooterBefore: string
  cartApprovedEmptyFooterEmphasis: string
  cartApprovedEmptyFooterAfter: string
  cartDismiss: string
  cartPerUnit: string
  cartAriaWithCount: string
  detailTabDetails: string
  detailTabManuals: string
  detailTabVideos: string
  detailDrawerAria: string
  detailDrawerCloseAria: string
  detailDrawerPartnerPriceKicker: string
  detailDrawerPartnerPriceOnRequest: string
  detailDrawerPartnerPriceLockedBody: string
  detailDrawerPartnerPriceLearnMore: string
  detailDrawerPartnerPriceNetHint: string
  detailDrawerPartnerPriceGrossHint: string
  detailDrawerPrpLabel: string
  detailDrawerMapLabel: string
  detailDrawerRefNote: string
  detailDrawerActNoteRfq: string
  detailDrawerAddToCart: string
  detailDrawerDownloadPdf: string
  detailGlancePower: string
  cartCloseAria: string
  cartContinueShopping: string
  cartRemoveItem: string
  cartCheckout: string
  catalogNavAria: string
  catalogSectionFilterAria: string
  catalogSectionFilterPlaceholder: string
  /** Estimated partner profit on current cart (partner discount value, incl. VAT). */
  cartPartnerEstimatedProfitTitle: string
  cartPartnerEstimatedProfitDescription: string
  /** Badge on admin „Partener” priority SKUs in this catalog (not retail Promotie). */
  partnerPriorityBadge: string
  partnerPersonalizedPricePendingTitle: string
  partnerPersonalizedPricePendingBody: string
  partnerPersonalizedPricePendingAria: string
  /** Label on locked partner net price tile before discount is approved. */
  partnerPriceLockedLabel: string
  /** Label on locked partner gross price tile before discount is approved. */
  partnerPriceLockedWithVatLabel: string
  cardPartnerPriceTitle: string
  cardPartnerPriceUnlockHint: string
  cardPartnerPriceOnRequestPill: string
  cardNoPriceTitle: string
  cardNoPriceSubtitle: string
  cardPrpLabel: string
  cardMapLabel: string
  cardDetailsLabel: string
  cardSpecsLabel: string
  cardLeadTimeCategory: string
  cardDeliveryOnRequest: string
  cardAddToCart: string
  requestQuote: string
  requestQuoteNoListPrice: string
  rfqTitle: string
  rfqAriaWithCount: string
  rfqCloseAria: string
  rfqEmptyHeroTitle: string
  rfqEmptyHeroSubtitle: string
  /** Empty RFQ sidebar on Produse — same journey without „Mergi la produse”. */
  rfqEmptyHeroSubtitleCatalog: string
  rfqEmptyStep1Title: string
  rfqEmptyStep1Subtitle: string
  rfqEmptyStep2Title: string
  rfqEmptyStep2Subtitle: string
  rfqEmptyStep3Title: string
  rfqEmptyStep3Subtitle: string
  rfqEmptyStep4Title: string
  rfqEmptyStep4Subtitle: string
  rfqEmptyStep5Title: string
  rfqEmptyStep5Subtitle: string
  rfqEmptyPriceBoxTitle: string
  rfqEmptyPriceBoxBodyBefore: string
  rfqEmptyPriceBoxBodyEmphasis: string
  rfqEmptyPriceBoxBodyAfter: string
  rfqEmptyNudge: string
  rfqEmptySidebarHint: string
  /** Empty RFQ when partner discount is approved — configurable systems only */
  rfqApprovedEmptyBadge: string
  rfqApprovedEmptyIntro: string
  rfqApprovedEmptyStep1Title: string
  rfqApprovedEmptyStep1Subtitle: string
  rfqApprovedEmptyStep2Title: string
  rfqApprovedEmptyStep2Subtitle: string
  rfqApprovedEmptyStep3Title: string
  rfqApprovedEmptyStep3Subtitle: string
  rfqApprovedEmptyFooterBefore: string
  rfqApprovedEmptyFooterEmphasis: string
  rfqApprovedEmptyFooterAfter: string
  rfqSubnote: string
  rfqSubnoteBold: string
  rfqSubnoteEnd: string
  rfqRrpLabel: string
  rfqPerUnit: string
  rfqReferenceTotal: string
  rfqReferenceNote: string
  rfqSubmitCta: string
  rfqSubmittingCta: string
  rfqClear: string
  rfqRemoveItem: string
  rfqFormTitle: string
  rfqFormHeading: string
  rfqFieldSegment: string
  rfqFieldDeliveryDeadline: string
  rfqFieldDeliveryCity: string
  rfqFieldTargetPrice: string
  rfqFieldProjectDetails: string
  rfqOptional: string
  rfqSendCta: string
  rfqBackToBasket: string
  rfqDoneTitle: string
  rfqDoneBody: string
  rfqDoneBack: string
  rfqDoneViewOrders: string
  rfqOrdersSectionTitle: string
  rfqOrdersColRef: string
  rfqOrdersColDate: string
  rfqOrdersColProducts: string
  rfqOrdersColStatus: string
  rfqOrdersStatusPending: string
  rfqOrdersEmptyTitle: string
  rfqOrdersEmptyBody: string
  rfqOrdersProductCount: string
  rfqOrdersMoreProducts: string
  partnerOrdersActiveSectionTitle: string
  rfqSegmentResidential: string
  rfqSegmentCommercialIndustrial: string
  rfqSegmentMedical: string
  rfqSegmentMarine: string
  rfqDeliveryDeadlinePlaceholder: string
  rfqDeliveryCityPlaceholder: string
  rfqTargetPricePlaceholder: string
  rfqProjectDetailsPlaceholder: string
}

const ro: PartnerProductsTranslations = {
  cartTotals: { net: 'Total fără TVA', vat: 'TVA', gross: 'Total cu TVA' },
  cartLoading: 'Se încarcă coșul…',
  basketPanelLoading: 'Se încarcă…',
  catalogSections: {
    rezidential: 'Rezidențial',
    micro_grid: 'Comercial · Micro-griduri',
    comercial_medical: 'Comercial & Medical',
    industrial: 'Industrial',
    maritim: 'Maritim',
  },
  toolbar: {
    searchProducts: 'Caută produs…',
    clearSearch: 'Șterge căutarea',
    openSearchPanel: 'Deschide căutarea',
    closeSearchPanel: 'Închide căutarea',
    notifications: 'Notificări',
    notificationsEmptyTitle: 'Nicio notificare nouă',
    notificationsEmptySubtitle: 'Actualizări de comandă și alerte vor fi afișate aici.',
  },
  productCountOne: 'produs',
  productCountMany: 'produse',
  pageTitle: 'Produse',
  cartTitle: 'Coș de cumpărături',
  basketTabCart: 'Coș',
  basketTabQuote: 'Ofertă',
  basketTabsAria: 'Coș și cerere de ofertă',
  cartAria: 'Coș de cumpărături',
  cartClear: 'Golește coșul',
  cartTotalsDisclaimer: 'Totalurile de mai sus se referă doar la comanda din coș.',
  cartEmpty: 'Coșul este gol.',
  cartApprovedEmptyBadge: 'Preț partener',
  cartApprovedEmptyIntro:
    'Comanzi direct produsele cu prețul tău de partener — soluții din stoc, cu livrare rapidă și profit vizibil înainte de checkout.',
  cartApprovedEmptyStep1Title: 'Adaugi produsele din catalog',
  cartApprovedEmptyStep1Subtitle: 'Din Rezidențial, Micro-grid sau Comercial, cu „Adaugă în coș”.',
  cartApprovedEmptyStep2Title: 'Plasezi comanda',
  cartApprovedEmptyStep2Subtitle: 'Vezi totalul, TVA și profitul estimat, apoi continui la checkout.',
  cartApprovedEmptyStep3Title: 'Primești livrarea',
  cartApprovedEmptyStep3Subtitle: 'Confirmăm comanda și expediem conform termenului afișat pe produs.',
  cartApprovedEmptyFooterBefore: 'Coșul este gol acum. Pentru cabinete BESS și sisteme la scară mare, folosește tab-ul ',
  cartApprovedEmptyFooterEmphasis: 'Ofertă',
  cartApprovedEmptyFooterAfter: '.',
  cartDismiss: 'Închide',
  cartPerUnit: '/ buc.',
  cartAriaWithCount: 'Coș ({count} produse)',
  detailTabDetails: 'Detalii',
  detailTabManuals: 'Manuale',
  detailTabVideos: 'Video',
  detailDrawerAria: 'Detalii produs',
  detailDrawerCloseAria: 'Închide',
  detailDrawerPartnerPriceKicker: 'PREȚUL TĂU DE PARTENER',
  detailDrawerPartnerPriceOnRequest: 'Disponibil la cerere',
  detailDrawerPartnerPriceLockedBody: 'Se stabilește pe configurație și volum, la discuția cu echipa.',
  detailDrawerPartnerPriceLearnMore: 'Cum funcționează',
  detailDrawerPartnerPriceNetHint: 'fără TVA',
  detailDrawerPartnerPriceGrossHint: 'cu TVA',
  detailDrawerPrpLabel: 'Preț recomandat (PRP)',
  detailDrawerMapLabel: 'Preț minim afișat (MAP)',
  detailDrawerRefNote: 'Repere pentru marja ta de revânzare. Prețul tău de achiziție se stabilește separat.',
  detailDrawerActNoteRfq: 'Nu plasezi o comandă — adaugi produsul în cererea de ofertă.',
  detailDrawerAddToCart: 'Adaugă în coș',
  detailDrawerDownloadPdf: 'Descarcă fișa tehnică (PDF)',
  detailGlancePower: 'Putere înc. / desc.',
  cartCloseAria: 'Închide coșul',
  cartContinueShopping: 'Continuă cumpărăturile',
  cartRemoveItem: 'Șterge din coș',
  cartCheckout: 'Plasează comanda',
  catalogNavAria: 'Secțiuni catalog',
  catalogSectionFilterAria: 'Alege secțiunea catalogului',
  catalogSectionFilterPlaceholder: 'Secțiune catalog',
  cartPartnerEstimatedProfitTitle: 'Profitul tău estimat',
  cartPartnerEstimatedProfitDescription:
    'Profitul pe care îl obții cu această comandă, la reducerea de partener aplicată.',
  partnerPriorityBadge: 'Prioritar',
  partnerPersonalizedPricePendingTitle: 'Preț Dedicat Partener',
  partnerPersonalizedPricePendingBody:
    'Prețul tău personalizat va fi disponibil după ce reducerea ta de partener va fi aprobată.',
  partnerPersonalizedPricePendingAria: 'Informații despre prețul personalizat',
  partnerPriceLockedLabel: 'Preț Partener',
  partnerPriceLockedWithVatLabel: 'Preț Partener cu TVA',
  cardPartnerPriceTitle: 'Prețul tău de partener',
  cardPartnerPriceUnlockHint: 'Se deblochează la prima comandă',
  cardPartnerPriceOnRequestPill: 'la cerere',
  cardNoPriceTitle: 'Preț la cerere',
  cardNoPriceSubtitle: 'Se stabilește pe configurație și volum',
  cardPrpLabel: 'PRR',
  cardMapLabel: 'PMV',
  cardDetailsLabel: 'Detalii',
  cardSpecsLabel: 'Specificații',
  cardLeadTimeCategory: 'Lead time',
  cardDeliveryOnRequest: 'la cerere',
  cardAddToCart: 'Adaugă în coș',
  requestQuote: 'Adaugă la cerere',
  requestQuoteNoListPrice: 'Cere ofertă',
  rfqTitle: 'Cerere de ofertă',
  rfqAriaWithCount: 'Cerere de ofertă ({count} produse)',
  rfqCloseAria: 'Închide cererea de ofertă',
  rfqEmptyHeroTitle: 'Cum obții prețul și reducerea ta',
  rfqEmptyHeroSubtitle: 'Prețurile de partener sunt personalizate. Iată drumul în 5 pași:',
  rfqEmptyHeroSubtitleCatalog: 'Prețurile de partener sunt personalizate. Iată drumul în 4 pași:',
  rfqEmptyStep1Title: 'Mergi la produse',
  rfqEmptyStep1Subtitle: 'Deschizi catalogul din meniul Produse',
  rfqEmptyStep2Title: 'Adaugă produsele',
  rfqEmptyStep2Subtitle: 'Alegi modelele și cantitățile',
  rfqEmptyStep3Title: 'Trimiți cererea',
  rfqEmptyStep3Subtitle: 'Un singur click din coșul de cerere',
  rfqEmptyStep4Title: 'Te sunăm',
  rfqEmptyStep4Subtitle: 'În maxim 1 zi lucrătoare',
  rfqEmptyStep5Title: 'Primești prețul tău',
  rfqEmptyStep5Subtitle: 'Ofertă de partener + comandă',
  rfqEmptyPriceBoxTitle: 'Ce se întâmplă după prima comandă?',
  rfqEmptyPriceBoxBodyBefore:
    'Odată ce prețul tău personalizat este activ, comanzi direct din platformă: adaugi în coș, plătești și primești produsele ',
  rfqEmptyPriceBoxBodyEmphasis: 'automat',
  rfqEmptyPriceBoxBodyAfter: ' — fără să ne mai contactezi de fiecare dată.',
  rfqEmptyNudge: 'Apasă „Adaugă la cerere” ca să începi',
  rfqEmptySidebarHint: 'Adaugă produse din catalog apăsând „Adaugă la cerere”.',
  rfqApprovedEmptyBadge: 'Sisteme configurabile',
  rfqApprovedEmptyIntro:
    'O folosești doar pentru soluțiile dimensionate pe proiect — cabinete BESS și sisteme la scară mare — unde prețul depinde de configurație și volum.',
  rfqApprovedEmptyStep1Title: 'Adaugi sistemele configurabile',
  rfqApprovedEmptyStep1Subtitle: 'Din secțiunile Industrial și Maritim, cu „Adaugă în ofertă”.',
  rfqApprovedEmptyStep2Title: 'Trimiți cererea',
  rfqApprovedEmptyStep2Subtitle: 'Un singur click din coșul de ofertă.',
  rfqApprovedEmptyStep3Title: 'Primești oferta tehnică',
  rfqApprovedEmptyStep3Subtitle: 'Revenim cu prețul dedicat în max. 1 zi lucrătoare.',
  rfqApprovedEmptyFooterBefore:
    'Nicio cerere deschisă acum. Produsele din stoc nu mai trec prin ofertă — au deja ',
  rfqApprovedEmptyFooterEmphasis: 'prețul tău de partener',
  rfqApprovedEmptyFooterAfter: ' în coș.',
  rfqSubnote:
    'Adaugă produsele dorite și trimite cererea.',
  rfqSubnoteBold: 'Prețul tău de partener',
  rfqSubnoteEnd: ' se stabilește la discuția cu echipa. Nu plasezi o comandă acum.',
  rfqRrpLabel: 'RRP orientativ',
  rfqPerUnit: '/buc',
  rfqReferenceTotal: 'Valoare orientativă la RRP',
  rfqReferenceNote: 'Doar referință — prețul tău de partener va fi mai mic.',
  rfqSubmitCta: 'Trimite cererea de ofertă',
  rfqSubmittingCta: 'Se trimite…',
  rfqClear: 'Golește cererea',
  rfqRemoveItem: 'Elimină produsul',
  rfqFormTitle: 'Detalii cerere',
  rfqFormHeading: 'Câteva detalii ca să pregătim oferta',
  rfqFieldSegment: 'Segment',
  rfqFieldDeliveryDeadline: 'Termen livrare',
  rfqFieldDeliveryCity: 'Oraș livrare',
  rfqFieldTargetPrice: 'Preț țintă / buc',
  rfqFieldProjectDetails: 'Detalii proiect',
  rfqOptional: '(opțional)',
  rfqSendCta: 'Trimite cererea',
  rfqBackToBasket: '← Înapoi la coș',
  rfqDoneTitle: 'Cerere trimisă!',
  rfqDoneBody:
    'Echipa Baterino te contactează în maxim 1 zi lucrătoare. Poți urmări cererea în secțiunea Comenzi.',
  rfqDoneBack: 'Înapoi la produse',
  rfqDoneViewOrders: 'Vezi în Comenzi',
  rfqOrdersSectionTitle: 'Cereri de ofertă',
  rfqOrdersColRef: 'Referință',
  rfqOrdersColDate: 'Data',
  rfqOrdersColProducts: 'Produse',
  rfqOrdersColStatus: 'Status',
  rfqOrdersStatusPending: 'În așteptare',
  rfqOrdersEmptyTitle: 'Nicio cerere de ofertă',
  rfqOrdersEmptyBody: 'Trimite o cerere din catalog, apăsând „Adaugă la cerere”.',
  rfqOrdersProductCount: '{n} produse',
  rfqOrdersMoreProducts: '+ încă {n}',
  partnerOrdersActiveSectionTitle: 'Comenzi active',
  rfqSegmentResidential: 'Rezidențial',
  rfqSegmentCommercialIndustrial: 'Comercial / Industrial',
  rfqSegmentMedical: 'Medical',
  rfqSegmentMarine: 'Maritim',
  rfqDeliveryDeadlinePlaceholder: 'ex. 30 zile',
  rfqDeliveryCityPlaceholder: 'ex. Cluj',
  rfqTargetPricePlaceholder: 'ex. 7.500 RON',
  rfqProjectDetailsPlaceholder: 'Context, cerințe tehnice, volum estimat anual…',
}

const en: PartnerProductsTranslations = {
  cartTotals: { net: 'Subtotal (excl. VAT)', vat: 'VAT', gross: 'Total (incl. VAT)' },
  cartLoading: 'Loading cart…',
  basketPanelLoading: 'Loading…',
  catalogSections: {
    rezidential: 'Residential',
    micro_grid: 'Commercial · Micro-grids',
    comercial_medical: 'Commercial & Medical',
    industrial: 'Industrial',
    maritim: 'Marine',
  },
  toolbar: {
    searchProducts: 'Search products…',
    clearSearch: 'Clear search',
    openSearchPanel: 'Open search',
    closeSearchPanel: 'Close search',
    notifications: 'Notifications',
    notificationsEmptyTitle: 'No new notifications',
    notificationsEmptySubtitle: 'Order updates and alerts will appear here.',
  },
  productCountOne: 'product',
  productCountMany: 'products',
  pageTitle: 'Products',
  cartTitle: 'Shopping cart',
  basketTabCart: 'Cart',
  basketTabQuote: 'Quote',
  basketTabsAria: 'Cart and quote request',
  cartAria: 'Shopping cart',
  cartClear: 'Empty cart',
  cartTotalsDisclaimer: 'The totals above apply only to the cart order.',
  cartEmpty: 'Your cart is empty.',
  cartApprovedEmptyBadge: 'Partner price',
  cartApprovedEmptyIntro:
    'Order directly at your partner price — in-stock solutions with fast delivery and visible profit before checkout.',
  cartApprovedEmptyStep1Title: 'Add products from the catalog',
  cartApprovedEmptyStep1Subtitle: 'From Residential, Micro-grid or Commercial, with “Add to cart”.',
  cartApprovedEmptyStep2Title: 'Place your order',
  cartApprovedEmptyStep2Subtitle: 'Review total, VAT and estimated profit, then continue to checkout.',
  cartApprovedEmptyStep3Title: 'Receive delivery',
  cartApprovedEmptyStep3Subtitle: 'We confirm the order and ship per the lead time shown on each product.',
  cartApprovedEmptyFooterBefore: 'Your cart is empty. For BESS cabinets and large-scale systems, use the ',
  cartApprovedEmptyFooterEmphasis: 'Quote',
  cartApprovedEmptyFooterAfter: ' tab.',
  cartDismiss: 'Close',
  cartPerUnit: '/ unit',
  cartAriaWithCount: 'Cart ({count} products)',
  detailTabDetails: 'Details',
  detailTabManuals: 'Manuals',
  detailTabVideos: 'Videos',
  detailDrawerAria: 'Product details',
  detailDrawerCloseAria: 'Close',
  detailDrawerPartnerPriceKicker: 'YOUR PARTNER PRICE',
  detailDrawerPartnerPriceOnRequest: 'Available on request',
  detailDrawerPartnerPriceLockedBody: 'Set based on configuration and volume when you speak with our team.',
  detailDrawerPartnerPriceLearnMore: 'How it works',
  detailDrawerPartnerPriceNetHint: 'excl. VAT',
  detailDrawerPartnerPriceGrossHint: 'incl. VAT',
  detailDrawerPrpLabel: 'Recommended retail price (RRP)',
  detailDrawerMapLabel: 'Minimum advertised price (MAP)',
  detailDrawerRefNote: 'Reference points for your resale margin. Your purchase price is set separately.',
  detailDrawerActNoteRfq: 'This is not an order — you add the product to your quote request.',
  detailDrawerAddToCart: 'Add to cart',
  detailDrawerDownloadPdf: 'Download spec sheet (PDF)',
  detailGlancePower: 'Charge / discharge power',
  cartCloseAria: 'Close cart',
  cartContinueShopping: 'Continue shopping',
  cartRemoveItem: 'Remove from cart',
  cartCheckout: 'Place order',
  catalogNavAria: 'Catalog sections',
  catalogSectionFilterAria: 'Choose catalog section',
  catalogSectionFilterPlaceholder: 'Catalog section',
  cartPartnerEstimatedProfitTitle: 'Your estimated profit',
  cartPartnerEstimatedProfitDescription:
    'The profit you earn on this order with your partner discount applied.',
  partnerPriorityBadge: 'Featured',
  partnerPersonalizedPricePendingTitle: 'Dedicated Partner Price',
  partnerPersonalizedPricePendingBody:
    'Your personalized price will be available once your partner discount has been approved.',
  partnerPersonalizedPricePendingAria: 'Information about your personalized price',
  partnerPriceLockedLabel: 'Partner price',
  partnerPriceLockedWithVatLabel: 'Partner price incl. VAT',
  cardPartnerPriceTitle: 'Your partner price',
  cardPartnerPriceUnlockHint: 'Unlocks with your first order',
  cardPartnerPriceOnRequestPill: 'on request',
  cardNoPriceTitle: 'Price on request',
  cardNoPriceSubtitle: 'Set based on configuration and volume',
  cardPrpLabel: 'RRP',
  cardMapLabel: 'MAP',
  cardDetailsLabel: 'Details',
  cardSpecsLabel: 'Specifications',
  cardLeadTimeCategory: 'Lead time',
  cardDeliveryOnRequest: 'on request',
  cardAddToCart: 'Add to cart',
  requestQuote: 'Add to request',
  requestQuoteNoListPrice: 'Request quote',
  rfqTitle: 'Quote request',
  rfqAriaWithCount: 'Quote request ({count} products)',
  rfqCloseAria: 'Close quote request',
  rfqEmptyHeroTitle: 'How you get your price',
  rfqEmptyHeroSubtitle: 'Partner prices are personalized. Here is the 5-step path:',
  rfqEmptyHeroSubtitleCatalog: 'Partner prices are personalized. Here is the 4-step path:',
  rfqEmptyStep1Title: 'Go to Products',
  rfqEmptyStep1Subtitle: 'Open the catalog from the Products menu',
  rfqEmptyStep2Title: 'Add products',
  rfqEmptyStep2Subtitle: 'Choose models and quantities',
  rfqEmptyStep3Title: 'Submit your request',
  rfqEmptyStep3Subtitle: 'One click from your request basket',
  rfqEmptyStep4Title: 'We call you',
  rfqEmptyStep4Subtitle: 'Within 1 business day',
  rfqEmptyStep5Title: 'You receive your price',
  rfqEmptyStep5Subtitle: 'Partner offer + ordering',
  rfqEmptyPriceBoxTitle: 'What happens after your first order',
  rfqEmptyPriceBoxBodyBefore:
    'Once your personalized price is active, you order directly on the platform: add to cart, pay, and receive products ',
  rfqEmptyPriceBoxBodyEmphasis: 'automatically',
  rfqEmptyPriceBoxBodyAfter: ' — without contacting us every time.',
  rfqEmptyNudge: 'Tap “Add to request” to get started',
  rfqEmptySidebarHint: 'Add products from the catalog with “Add to request”.',
  rfqApprovedEmptyBadge: 'Configurable systems',
  rfqApprovedEmptyIntro:
    'Use this only for project-sized solutions — BESS cabinets and large-scale systems — where price depends on configuration and volume.',
  rfqApprovedEmptyStep1Title: 'Add configurable systems',
  rfqApprovedEmptyStep1Subtitle: 'From Industrial and Marine sections, with “Add to quote”.',
  rfqApprovedEmptyStep2Title: 'Submit the request',
  rfqApprovedEmptyStep2Subtitle: 'One click from the quote basket.',
  rfqApprovedEmptyStep3Title: 'Receive the technical offer',
  rfqApprovedEmptyStep3Subtitle: 'We reply with your dedicated price within 1 business day.',
  rfqApprovedEmptyFooterBefore:
    'No open requests right now. In-stock products no longer go through quotes — they already have your ',
  rfqApprovedEmptyFooterEmphasis: 'partner price',
  rfqApprovedEmptyFooterAfter: ' in the cart.',
  rfqSubnote: 'Add the products you need and submit your request.',
  rfqSubnoteBold: 'Your partner price',
  rfqSubnoteEnd: ' is agreed with the Baterino team — you are not placing an order yet.',
  rfqRrpLabel: 'Indicative RRP',
  rfqPerUnit: '/unit',
  rfqReferenceTotal: 'Indicative RRP total',
  rfqReferenceNote:
    'For reference only. Your partner price will be lower; VAT is not applied at this level.',
  rfqSubmitCta: 'Submit quote request',
  rfqSubmittingCta: 'Submitting…',
  rfqClear: 'Clear request',
  rfqRemoveItem: 'Remove product',
  rfqFormTitle: 'Request details',
  rfqFormHeading: 'A few details so we can prepare your quote',
  rfqFieldSegment: 'Segment',
  rfqFieldDeliveryDeadline: 'Delivery timeline',
  rfqFieldDeliveryCity: 'Delivery city',
  rfqFieldTargetPrice: 'Target price / unit',
  rfqFieldProjectDetails: 'Project details',
  rfqOptional: '(optional)',
  rfqSendCta: 'Submit request',
  rfqBackToBasket: '← Back to basket',
  rfqDoneTitle: 'Request sent!',
  rfqDoneBody:
    'The Baterino team will contact you within 1 business day. You can track your request in Orders.',
  rfqDoneBack: 'Back to products',
  rfqDoneViewOrders: 'View in Orders',
  rfqOrdersSectionTitle: 'Quote requests',
  rfqOrdersColRef: 'Reference',
  rfqOrdersColDate: 'Date',
  rfqOrdersColProducts: 'Products',
  rfqOrdersColStatus: 'Status',
  rfqOrdersStatusPending: 'Pending',
  rfqOrdersEmptyTitle: 'No quote requests yet',
  rfqOrdersEmptyBody: 'Submit a request from the catalog with “Add to request”.',
  rfqOrdersProductCount: '{n} products',
  rfqOrdersMoreProducts: '+ {n} more',
  partnerOrdersActiveSectionTitle: 'Active orders',
  rfqSegmentResidential: 'Residential',
  rfqSegmentCommercialIndustrial: 'Commercial / Industrial',
  rfqSegmentMedical: 'Medical',
  rfqSegmentMarine: 'Marine',
  rfqDeliveryDeadlinePlaceholder: 'e.g. 30 days',
  rfqDeliveryCityPlaceholder: 'e.g. Cluj',
  rfqTargetPricePlaceholder: 'e.g. 7,500 RON',
  rfqProjectDetailsPlaceholder: 'Context, technical requirements, estimated annual volume…',
}


const translations: Record<LangCode, PartnerProductsTranslations> = { ro, en }

export function formatPartnerCatalogSectionCount(lang: LangCode, count: number): string {
  const tr = getPartnerProductsTranslations(lang)
  const word = count === 1 ? tr.productCountOne : tr.productCountMany
  return `${count} ${word}`
}

export function getPartnerProductsTranslations(lang: LangCode): PartnerProductsTranslations {
  return translations[lang] ?? translations.ro
}

/** @deprecated Use getPartnerProductsTranslations(lang).cartTotals */
export function partnerCartTotalsLabels(langCode: LangCode): PartnerCartTotalsLabels {
  return getPartnerProductsTranslations(langCode).cartTotals
}

/** @deprecated Use getPartnerProductsTranslations(lang).cartLoading */
export function partnerCartLoadingLabel(langCode: LangCode): string {
  return getPartnerProductsTranslations(langCode).cartLoading
}

/** @deprecated Use getPartnerProductsTranslations(lang).catalogSections */
export function partnerCatalogSectionLabels(
  langCode: LangCode,
): Record<PartnerCatalogSectionId, string> {
  return getPartnerProductsTranslations(langCode).catalogSections
}

/** @deprecated Use getPartnerProductsTranslations(lang).toolbar */
export function partnerToolbarLabels(langCode: LangCode): PartnerToolbarLabels {
  return getPartnerProductsTranslations(langCode).toolbar
}
