import type { LangCode } from '../menu'

export type PartnerPendingAdvantage = { title: string; subtitle: string }

export type PartnerDashboardTranslations = {
  srTitle: string
  welcomePrefix: string
  defaultDisplayName: string
  accountStatusActive: string
  quickPanelTitle: string
  quickPanelAria: string
  notifications: string
  notificationsAria: string
  productsCatalogEyebrow: string
  dashTooltipProductsSite: string
  dashTooltipOrders: string
  dashTooltipService: string
  dashTooltipProfileStats: string
  explanation: string
  dashInfoAriaProducts: string
  dashInfoAriaOrders: string
  dashInfoAriaService: string
  dashInfoAriaPublic: string
  productDashLabelComercial: string
  orderDashLabelDePlata: string
  orderDashLabelInCurs: string
  orderDashLabelLivrate: string
  serviceDashLabelPreluate: string
  serviceDashLabelInService: string
  serviceDashLabelRezolvate: string
  profitableProductsSectionTitle: string
  profitableProductsSeeCatalogLabel: string
  profitableProductsCollapseAria: string
  profitableProductsExpandAria: string
  dashNavAriaKpiProducts: string
  dashNavAriaKpiOrders: string
  dashNavAriaKpiService: string
  dashNavAriaProfileStats: string
  quickPanelPublicProfileTitle: string
  quickPanelPublicProfileIncompleteBody: string
  quickPanelPublicProfilePrivateBody: string
  quickPanelPublicProfilePublicBody: string
  profileStatsGateTitle: string
  profileStatsGateBody: string
  profileStatsGateCta: string
  profileStatsGateAria: string
  suspendedTitle: string
  suspendedBody: string
  pendingAdvantagesTitle: string
  pendingAdvantages: PartnerPendingAdvantage[]
  approvalTimelineSteps: readonly [string, string, string, string]
  approvalTimelineAria: string
  timelineComplete: string
  timelineCurrent: string
  timelineUpcoming: string
  advantagesLoadingAria: string
  myActivity: string
  unavailable: string
  orders: string
  productsInService: string
  publicProfileStats: string
  partnershipBenefitsTitle: string
  views: string
  clicks: string
  expandSidebar: string
  collapseSidebar: string
  showWelcomeSummary: string
  showPartnerDiscount: string
  searchInverterCompatibility: string
  searchInverterCompatibilitySr: string
  finishOrderOpenCart: string
  finishOrderOpenCartAria: string
  activeCartEyebrow: string
  finishOrderTitle: string
  finishOrderBody: string
  goToPartnerProducts: string
  detailsLabel: string
  detailsAria: (productTitle: string) => string
}

const roPending: PartnerPendingAdvantage[] = [
  {
    title: 'Livrare și logistică',
    subtitle:
      'Ne ocupăm de întregul lanț logistic, de la depozit până la clientul final. Tu te concentrezi pe clienți — noi gestionăm transportul.',
  },
  {
    title: 'Suport tehnic și comercial',
    subtitle:
      'Ai acces la o echipă dedicată pentru orice întrebare legată de produse, specificații tehnice sau soluții personalizate.',
  },
  {
    title: 'Vizibilitate în fața clienților',
    subtitle:
      'Profilul tău apare pe platforma Baterino, conectându-te direct cu clienți din zona ta care caută instalatori verificați.',
  },
  {
    title: 'Responsabilitate client final',
    subtitle:
      'Gestionăm after-sale-ul direct cu clientul final — reclamații, garanții și suport post-instalare — astfel reputația ta rămâne intactă.',
  },
  {
    title: 'Baterino SWAP',
    subtitle:
      'În cazul unei defecțiuni, înlocuim bateria rapid și fără birocrație. Clientul tău nu rămâne fără soluție.',
  },
  {
    title: 'Prețuri și reduceri pentru parteneri',
    subtitle:
      'Prețuri preferențiale, marje clare și o strategie construită împreună — ca să fii competitiv și profitabil la fiecare proiect.',
  },
]

const enPending: PartnerPendingAdvantage[] = [
  {
    title: 'Delivery & logistics',
    subtitle:
      'We handle the full logistics chain from warehouse to end customer. You focus on clients — we manage transport.',
  },
  {
    title: 'Technical & commercial support',
    subtitle:
      'Access a dedicated team for product questions, technical specs or tailored solutions.',
  },
  {
    title: 'Visibility to customers',
    subtitle:
      'Your profile appears on Baterino, connecting you with homeowners in your area looking for verified installers.',
  },
  {
    title: 'End-customer responsibility',
    subtitle:
      'We handle after-sales directly with the end customer — claims, warranties and post-install support — so your reputation stays intact.',
  },
  {
    title: 'Baterino SWAP',
    subtitle:
      'If a battery fails, we replace it quickly with minimal paperwork. Your customer is never left without a solution.',
  },
  {
    title: 'Partner pricing & discounts',
    subtitle:
      'Preferential prices, clear margins and a strategy built together — so you stay competitive and profitable on every project.',
  },
]


const ro: PartnerDashboardTranslations = {
  srTitle: 'Dashboard',
  welcomePrefix: 'Bine ai venit,',
  defaultDisplayName: 'Partener',
  accountStatusActive: 'Status cont: Partener activ',
  quickPanelTitle: 'Panou rapid',
  quickPanelAria: 'Panou rapid — rezumat partener',
  notifications: 'Notificări',
  notificationsAria: 'Notificări (în curând)',
  productsCatalogEyebrow: 'Produse pe site',
  dashTooltipProductsSite:
    'Numărul de SKU-uri din catalogul partenerilor afișat pe site și în secțiunea Produse.',
  dashTooltipOrders:
    'Comenzi partener (fără anulate): de plată; în curs (preluată, în pregătire, pe drum); livrate.',
  dashTooltipService: 'Flux service partener: preluate, în service, rezolvate.',
  dashTooltipProfileStats:
    'Vizualizări ale profilului dvs. public de partener și click-uri unde se colectează statistici.',
  explanation: 'Explicație',
  dashInfoAriaProducts: 'Explicație: Produse pe site',
  dashInfoAriaOrders: 'Explicație: Comenzi',
  dashInfoAriaService: 'Explicație: Produse în service',
  dashInfoAriaPublic: 'Explicație: Statistici profil public',
  productDashLabelComercial: 'Comercial',
  orderDashLabelDePlata: 'De plată',
  orderDashLabelInCurs: 'În curs',
  orderDashLabelLivrate: 'Livrate',
  serviceDashLabelPreluate: 'Preluate',
  serviceDashLabelInService: 'În service',
  serviceDashLabelRezolvate: 'Rezolvate',
  profitableProductsSectionTitle: 'Cele mai profitabile produse',
  profitableProductsSeeCatalogLabel: 'Vezi Produse',
  profitableProductsCollapseAria: 'Restrânge cele mai profitabile produse',
  profitableProductsExpandAria: 'Extinde cele mai profitabile produse',
  dashNavAriaKpiProducts: 'Deschide catalogul Produse partener',
  dashNavAriaKpiOrders: 'Deschide Comenzi partener',
  dashNavAriaKpiService: 'Deschide Reparatii partener',
  dashNavAriaProfileStats: 'Deschide Profil public',
  quickPanelPublicProfileTitle: 'Profil Public',
  quickPanelPublicProfileIncompleteBody:
    'Completează profilul companiei tale pentru ca noi să îți promovăm serviciile.',
  quickPanelPublicProfilePrivateBody: 'Publică profilul companiei tale, pentru a primi comenzi.',
  quickPanelPublicProfilePublicBody: 'Vezi pagina publică a companiei tale.',
  profileStatsGateTitle: 'Creează profilul companiei tale',
  profileStatsGateBody:
    'Completează-ți profilul public al companiei pentru ca noi să-ți promovăm serviciile.',
  profileStatsGateCta: 'Completează profilul public',
  profileStatsGateAria: 'Profil public necesar înainte ca statisticile să fie relevante',
  suspendedTitle: 'Contul tău este suspendat.',
  suspendedBody: 'Ne pare rău, însă contul tău a fost suspendat. Contactează-ne pentru a rezolva problema.',
  pendingAdvantagesTitle: 'Avantajele parteneriatului Baterino',
  pendingAdvantages: roPending,
  approvalTimelineSteps: [
    'Deschidere cont partener',
    'Dezbatere parteneriat și strategie',
    'Semnarea contractului',
    'Aprobare cont partener',
  ],
  approvalTimelineAria: 'Etape aprobare cont partener',
  timelineComplete: 'Finalizat',
  timelineCurrent: 'În curs',
  timelineUpcoming: 'Urmează',
  advantagesLoadingAria: 'Se încarcă avantajele',
  myActivity: 'Activitatea mea',
  unavailable: 'Indisponibil',
  orders: 'Comenzi',
  productsInService: 'Produse în service',
  publicProfileStats: 'Statistici profil public',
  partnershipBenefitsTitle: 'Avantajele parteneriatului Baterino',
  views: 'Vizualizări',
  clicks: 'Click-uri',
  expandSidebar: 'Extinde panoul lateral',
  collapseSidebar: 'Restrânge panoul lateral',
  showWelcomeSummary: 'Arată rezumat bun venit',
  showPartnerDiscount: 'Arată reducerea partener',
  searchInverterCompatibility: 'Căutare compatibilitate invertor',
  searchInverterCompatibilitySr: 'Deschide căutarea de compatibilitate invertoare',
  finishOrderOpenCart: 'Finalizează comanda — deschide coșul',
  finishOrderOpenCartAria: 'Ai articole în coș de finalizat. Mergi la Produse partener.',
  activeCartEyebrow: 'Comandă nefinalizată',
  finishOrderTitle: 'Finalizează comanda',
  finishOrderBody: 'Ai produse în coș care nu au fost trimise încă. Continuă pentru a plasa comanda.',
  goToPartnerProducts: 'Mergi la pagina Produse partener',
  detailsLabel: 'Detalii',
  detailsAria: (productTitle) => `Deschide detalii pentru ${productTitle}`,
}

const en: PartnerDashboardTranslations = {
  ...ro,
  srTitle: 'Dashboard',
  welcomePrefix: 'Welcome,',
  defaultDisplayName: 'Partner',
  accountStatusActive: 'Active partner',
  quickPanelTitle: 'Quick Panel',
  quickPanelAria: 'Quick Panel — partner summary',
  notifications: 'Notifications',
  notificationsAria: 'Notifications (coming soon)',
  productsCatalogEyebrow: 'Products on site',
  dashTooltipProductsSite:
    'Number of SKU rows listed in your partner-facing catalogue—the same assortment as Products.',
  dashTooltipOrders:
    'Partner orders excluding cancelled. To pay; in the delivery pipeline (received, preparing, or out for delivery); delivered.',
  dashTooltipService: 'Partner service pipeline: received, in workshop/service, and resolved cases.',
  dashTooltipProfileStats:
    'Views of your public partner profile page and taps on tracked actions where metrics are collected.',
  explanation: 'Explanation',
  dashInfoAriaProducts: 'Explanation: Products on site',
  dashInfoAriaOrders: 'Explanation: Orders',
  dashInfoAriaService: 'Explanation: Products in service',
  dashInfoAriaPublic: 'Explanation: Public profile stats',
  productDashLabelComercial: 'Commercial',
  orderDashLabelDePlata: 'To pay',
  orderDashLabelInCurs: 'In progress',
  orderDashLabelLivrate: 'Delivered',
  serviceDashLabelPreluate: 'Received',
  serviceDashLabelInService: 'In service',
  serviceDashLabelRezolvate: 'Resolved',
  profitableProductsSectionTitle: 'Most profitable products',
  profitableProductsSeeCatalogLabel: 'See products',
  profitableProductsCollapseAria: 'Collapse most profitable products',
  profitableProductsExpandAria: 'Expand most profitable products',
  dashNavAriaKpiProducts: 'Open partner products',
  dashNavAriaKpiOrders: 'Open partner orders',
  dashNavAriaKpiService: 'Open partner repairs',
  dashNavAriaProfileStats: 'Open public profile settings',
  quickPanelPublicProfileTitle: 'Public profile',
  quickPanelPublicProfileIncompleteBody:
    'Complete your company profile so we can promote your services.',
  quickPanelPublicProfilePrivateBody: 'Publish your company profile to start receiving orders.',
  quickPanelPublicProfilePublicBody: "View your company's public page.",
  profileStatsGateTitle: 'Create your company profile',
  profileStatsGateBody: "Complete your company's public profile so we can promote your services.",
  profileStatsGateCta: 'Complete public profile',
  profileStatsGateAria: 'Public profile required before statistics apply',
  suspendedTitle: 'Your account is suspended.',
  suspendedBody: 'Sorry, your account has been suspended. Contact us to resolve the issue.',
  pendingAdvantagesTitle: 'Baterino partnership benefits',
  pendingAdvantages: enPending,
  approvalTimelineSteps: [
    'Partner account opened',
    'Partnership & strategy discussion',
    'Contract signing',
    'Partner account approved',
  ],
  approvalTimelineAria: 'Partner account approval steps',
  timelineComplete: 'Completed',
  timelineCurrent: 'In progress',
  timelineUpcoming: 'Upcoming',
  advantagesLoadingAria: 'Loading benefits',
  myActivity: 'My activity',
  unavailable: 'Unavailable',
  orders: 'Orders',
  productsInService: 'Products in service',
  publicProfileStats: 'Public profile stats',
  partnershipBenefitsTitle: 'Baterino partnership benefits',
  views: 'Views',
  clicks: 'Clicks',
  expandSidebar: 'Expand sidebar',
  collapseSidebar: 'Collapse sidebar',
  showWelcomeSummary: 'Show welcome summary',
  showPartnerDiscount: 'Show partner discount',
  searchInverterCompatibility: 'Search inverter compatibility',
  searchInverterCompatibilitySr: 'Open inverter compatibility search',
  finishOrderOpenCart: 'Finish your order — open cart',
  finishOrderOpenCartAria: 'Cart has items awaiting checkout. Go to Partner products.',
  activeCartEyebrow: 'Active cart',
  finishOrderTitle: 'Finish your order',
  finishOrderBody: 'Items in cart not yet submitted. Continue when ready.',
  goToPartnerProducts: 'Go to Partner products',
  detailsLabel: 'Details',
  detailsAria: (productTitle) => `Open Details for ${productTitle}`,
}


const translations: Record<LangCode, PartnerDashboardTranslations> = { ro, en }

export function getPartnerDashboardTranslations(lang: LangCode): PartnerDashboardTranslations {
  return translations[lang] ?? translations.ro
}
