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
  /** WhatsApp prefill cerere service: {productTitle}, {serialNumber}, {modelNumber}, {clientEmail} */
  whatsappServicePrefill: string
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
      'Salut. Doresc să deschid o cerere de service pentru produsul {productTitle} (SN: {serialNumber}, model {modelNumber}). Contul meu: {clientEmail}.',
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
      'Hi. I would like to open a service request for {productTitle} (SN: {serialNumber}, model {modelNumber}). My account: {clientEmail}.',
    snInvalidLength: 'Enter exactly 16 digits.',
    claimErrorAlreadyRegistered: 'This product has already been registered.',
    claimErrorInvalidSerial:
      'This serial number is incorrect or does not belong to a LithTech product. If you need help registering your product, please contact us.',
  },
  zh: {
    pageTitle: '我的产品',
    registerTitle: '注册产品',
    registerDescription: '注册您的产品以下载保修证书，并获得我们的维护与客户支持服务。',
    scanQr: '扫描二维码',
    enterSnManual: '手动输入序列号',
    loadingList: '正在加载…',
    loadError: '无法加载列表。',
    registeredHeading: '已注册产品',
    claimSubmitting: '正在注册…',
    modalManualTitle: '输入序列号',
    modalManualHint: '请输入 LJC 前缀后的 16 位数字（无空格）。',
    modalManualSubmit: '注册',
    modalManualCancel: '取消',
    modalScanTitle: '扫描产品上的二维码。',
    modalScanClose: '关闭',
    scanAgain: '重新扫描',
    scanCloseCamera: '关闭相机',
    scanCameraError: '无法启动摄像头。请检查权限或使用手动输入。',
    scanCameraStarting: '正在启动摄像头…',
    scanClaimInProgress: '产品注册中…',
    generateWarranty: '生成保修凭证',
    generatingWarranty: '正在生成证书…',
    downloadWarranty: '下载保修凭证',
    downloadManual: '下载技术手册',
    helpProduct: '此产品需要帮助',
    serviceRequest: '售后服务申请',
    warrantyProfileTitle: '请完善资料',
    warrantyProfileBody: '生成保修证书需要姓名与账单地址。请在账户设置中填写。',
    warrantyProfileCta: '前往设置',
    warrantyComingTitle: '即将推出',
    noManualLink: '暂无技术手册，请查看目录中的产品页。',
    whatsappProductPrefill:
      '您好。我需要关于 {productTitle} 的帮助（SN：{serialNumber}，型号 {modelNumber}）。我的账户：{clientEmail}。',
    whatsappServicePrefill:
      '您好。我希望为 {productTitle} 开具售后服务申请（SN：{serialNumber}，型号 {modelNumber}）。我的账户：{clientEmail}。',
    snInvalidLength: '请输入 16 位数字。',
    claimErrorAlreadyRegistered: '该产品已被注册。',
    claimErrorInvalidSerial: '该序列号不正确或不属于 LithTech 产品。如需注册帮助，请联系我们。',
  },
}

export function getClientMyProductsTranslations(lang: LangCode): ClientMyProductsTranslations {
  return translations[lang] ?? translations.ro
}
