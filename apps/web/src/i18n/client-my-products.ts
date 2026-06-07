import type { LangCode } from './menu'

export type ClientMyProductsTranslations = {
  pageTitle: string
  registerTitle: string
  registerDescription: string
  scanQr: string
  enterSnManual: string
  loadingList: string
  loadError: string
  registeredHeading: string
  claimSubmitting: string
  modalManualTitle: string
  modalManualHint: string
  modalManualSubmit: string
  modalManualCancel: string
  modalScanTitle: string
  modalScanClose: string
  scanAgain: string
  scanCloseCamera: string
  scanCameraError: string
  scanCameraStarting: string
  scanClaimInProgress: string
  generateWarranty: string
  generatingWarranty: string
  downloadWarranty: string
  downloadManual: string
  helpProduct: string
  serviceRequest: string
  warrantyProfileTitle: string
  warrantyProfileBody: string
  warrantyProfileCta: string
  warrantyComingTitle: string
  noManualLink: string
  /** WhatsApp prefill: {productTitle}, {serialNumber}, {modelNumber}, {clientEmail} */
  whatsappProductPrefill: string
  /** WhatsApp prefill cerere service: {productTitle}, {serialNumber}, {modelNumber}, {clientEmail}, {problemDescription} */
  whatsappServicePrefill: string
  serviceModalBrand: string
  serviceModalWarrantyLabel: string
  serviceModalProblemLabel: string
  serviceModalProblemPlaceholder: string
  serviceModalProblemRequired: string
  serviceModalSubmit: string
  serviceModalSubmitting: string
  serviceModalCancel: string
  serviceModalClose: string
  /** Etichetă buton când există deja o cerere activă pentru produs. */
  serviceRequestInProgress: string
  /** Eticheta mică sub butonul „În desfășurare” cu numărul cererii. {requestNumber} */
  serviceModalInProgressTitle: string
  /** Mesaj afișat în loc de formular când cererea este deja deschisă. {requestNumber} */
  serviceModalInProgressMessage: string
  serviceModalOk: string
  snInvalidLength: string
  claimErrorAlreadyRegistered: string
  claimErrorInvalidSerial: string
}

const translations: Record<LangCode, ClientMyProductsTranslations> = {
  ro: {
    pageTitle: 'Produsele mele',
    registerTitle: 'Înregistrează un produs',
    registerDescription:
      'Înregistrează-ți produsele pentru a descărca certificatul de garanție, acces la serviciile noastre de suport și mentenanță.',
    scanQr: 'Scanează cod QR',
    enterSnManual: 'Introdu SN manual',
    loadingList: 'Se încarcă produsele…',
    loadError: 'Nu am putut încărca lista.',
    registeredHeading: 'Produse înregistrate',
    claimSubmitting: 'Se înregistrează…',
    modalManualTitle: 'Introdu numărul de serie',
    modalManualHint: 'Introdu cele 16 cifre după prefixul LJC (fără spații).',
    modalManualSubmit: 'Înregistrează',
    modalManualCancel: 'Anulează',
    modalScanTitle: 'Scanează codul QR de pe produs.',
    modalScanClose: 'Închide',
    scanAgain: 'Scanează din nou',
    scanCloseCamera: 'Închide camera',
    scanCameraError:
      'Nu am putut porni camera. Verifică permisiunile sau folosește introducerea manuală.',
    scanCameraStarting: 'Se pornește camera…',
    scanClaimInProgress: 'Produs în curs de înregistrare',
    generateWarranty: 'Generează garanție',
    generatingWarranty: 'Generăm certificatul…',
    downloadWarranty: 'Descarcă garanție',
    downloadManual: 'Descarcă manual tehnic',
    helpProduct: 'Ajutor pentru acest produs',
    serviceRequest: 'Cerere service',
    warrantyProfileTitle: 'Completează profilul',
    warrantyProfileBody:
      'Pentru certificatul de garanție avem nevoie de nume, prenume și adresă de facturare. Le poți completa în setările contului.',
    warrantyProfileCta: 'Mergi la setări',
    warrantyComingTitle: 'În curând',
    noManualLink: 'Nu există încă un manual atașat acestui produs. Vezi pagina produsului din catalog.',
    whatsappProductPrefill:
      'Salut. Am nevoie de ajutor pentru produsul {productTitle} (SN: {serialNumber}, model {modelNumber}). Contul meu: {clientEmail}.',
    whatsappServicePrefill:
      'Salut. Doresc să deschid o cerere de service pentru produsul {productTitle} (SN: {serialNumber}, model {modelNumber}). Contul meu: {clientEmail}.\n\nProblema: {problemDescription}',
    serviceModalBrand: 'Divizia de Service',
    serviceModalWarrantyLabel: 'Garanție: 10 Ani',
    serviceModalProblemLabel: 'Descrie pe scurt problema produsului.',
    serviceModalProblemPlaceholder: 'Detalii despre problema apărută…',
    serviceModalProblemRequired: 'Te rugăm să descrii pe scurt problema.',
    serviceModalSubmit: 'Trimite cererea',
    serviceModalSubmitting: 'Se trimite…',
    serviceModalCancel: 'Anulează',
    serviceModalClose: 'Închide',
    serviceRequestInProgress: 'În desfășurare',
    serviceModalInProgressTitle: 'Cerere {requestNumber}',
    serviceModalInProgressMessage:
      'Cererea ta de service cu ID-ul {requestNumber} este în analiză. Te vom contacta dacă avem nevoie de detalii suplimentare.',
    serviceModalOk: 'Am înțeles',
    snInvalidLength: 'Introdu exact 16 cifre.',
    claimErrorAlreadyRegistered: 'Acest produs a fost deja înregistrat.',
    claimErrorInvalidSerial:
      'Acest SN este incorect sau nu aparține unui produs LithTech. Dacă ai nevoie de ajutor la înregistrarea produsului, te rugăm să ne contactezi.',
  },
  en: {
    pageTitle: 'My products',
    registerTitle: 'Register a product',
    registerDescription:
      'Register your products to download the warranty certificate and access our support and maintenance services.',
    scanQr: 'Scan QR code',
    enterSnManual: 'Enter serial number manually',
    loadingList: 'Loading your products…',
    loadError: 'Could not load your products.',
    registeredHeading: 'Registered products',
    claimSubmitting: 'Registering…',
    modalManualTitle: 'Enter serial number',
    modalManualHint: 'Enter the 16 digits after the LJC prefix (no spaces).',
    modalManualSubmit: 'Register',
    modalManualCancel: 'Cancel',
    modalScanTitle: 'Scan the QR code on the product.',
    modalScanClose: 'Close',
    scanAgain: 'Scan again',
    scanCloseCamera: 'Close camera',
    scanCameraError: 'Could not start the camera. Check permissions or use manual entry.',
    scanCameraStarting: 'Starting camera…',
    scanClaimInProgress: 'Registering product…',
    generateWarranty: 'Generate warranty',
    generatingWarranty: 'Generating certificate…',
    downloadWarranty: 'Download warranty',
    downloadManual: 'Download technical manual',
    helpProduct: 'Help with this product',
    serviceRequest: 'Service request',
    warrantyProfileTitle: 'Complete your profile',
    warrantyProfileBody:
      'We need your first name, last name and billing address on file to generate the warranty certificate. You can add them in account settings.',
    warrantyProfileCta: 'Go to settings',
    warrantyComingTitle: 'Coming soon',
    noManualLink: 'No technical manual is attached yet. See the product page in the catalog.',
    whatsappProductPrefill:
      'Hi. I need help with {productTitle} (SN: {serialNumber}, model {modelNumber}). My account: {clientEmail}.',
    whatsappServicePrefill:
      'Hi. I would like to open a service request for {productTitle} (SN: {serialNumber}, model {modelNumber}). My account: {clientEmail}.\n\nIssue: {problemDescription}',
    serviceModalBrand: 'Service Division',
    serviceModalWarrantyLabel: 'Warranty: 10 Years',
    serviceModalProblemLabel: 'Briefly describe the product issue.',
    serviceModalProblemPlaceholder: 'Details about the issue you noticed…',
    serviceModalProblemRequired: 'Please briefly describe the issue.',
    serviceModalSubmit: 'Submit request',
    serviceModalSubmitting: 'Sending…',
    serviceModalCancel: 'Cancel',
    serviceModalClose: 'Close',
    serviceRequestInProgress: 'In progress',
    serviceModalInProgressTitle: 'Request {requestNumber}',
    serviceModalInProgressMessage:
      'Your service request with ID {requestNumber} is under investigation. We might contact you for further details.',
    serviceModalOk: 'Got it',
    snInvalidLength: 'Enter exactly 16 digits.',
    claimErrorAlreadyRegistered: 'This product has already been registered.',
    claimErrorInvalidSerial:
      'This serial number is incorrect or does not belong to a LithTech product. If you need help registering your product, please contact us.',
  },
}

export function getClientMyProductsTranslations(lang: LangCode): ClientMyProductsTranslations {
  return translations[lang] ?? translations.ro
}
