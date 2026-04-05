import type { LangCode } from './menu'

export type GuestCheckoutTranslations = {
  pageTitle: string
  pageDescription: string
  headline: string
  subline: string
  /** Vertical nav + panel — four steps */
  navStep1: string
  navStep2: string
  navStep3: string
  navStep4: string
  panelStep1: string
  panelStep2: string
  panelStep3: string
  panelStep4: string
  contactIntro: string
  addressIntro: string
  /** Billing block heading */
  sectionBillingTitle: string
  /** Delivery block heading (when different from billing) */
  sectionDeliveryTitle: string
  /** Checkbox label fragment before first bold phrase */
  differentDeliveryPart1: string
  /** Bold: delivery address phrase */
  differentDeliveryBoldDelivery: string
  /** Between the two bold phrases */
  differentDeliveryPart2: string
  /** Bold: billing address phrase */
  differentDeliveryBoldBilling: string
  /** After second bold phrase (e.g. ?) */
  differentDeliveryPart3: string
  selectCountyPlaceholder: string
  selectCityPlaceholder: string
  selectCityPlaceholderNeedCounty: string
  btnContinueStep2: string
  btnContinueStep3: string
  btnContinueStep4: string
  btnBackStep1: string
  btnBackStep2: string
  btnBackStep3: string
  orderProductLabel: string
  orderQtyLabel: string
  orderTotalLabel: string
  orderBackToProduct: string
  orderShippingLabel: string
  orderShippingTitle: string
  orderShippingSubtitle: string
  orderShippingAmountLabel: string
  /** Family name / surname (RO: Nume) */
  fieldNume: string
  /** First name (RO: Prenume) */
  fieldPrenume: string
  fieldPhone: string
  fieldEmail: string
  fieldAddress: string
  fieldCity: string
  fieldCounty: string
  fieldPostal: string
  placeholderNume: string
  placeholderPrenume: string
  placeholderPhone: string
  placeholderEmail: string
  placeholderAddress: string
  placeholderCity: string
  placeholderCounty: string
  placeholderPostal: string
  fieldErrorRequired: string
  /** Shown under a single empty required field */
  fieldErrorEmpty: string
  fieldErrorEmail: string
  fieldErrorPhone: string
  finalizeStep1: string
  finalizeStep2: string
  finalizeStep3: string
  finalizeStep4: string
  btnPlaceOrder: string
  orderPlaceLoading: string
  placeOrderErrorGeneric: string
  orderNumberLabel: string
  /** Use literal `{email}` in the string; UI replaces with the customer email. */
  orderTrackHint: string
  orderSuccessTitle: string
  orderSuccessBody: string
  authTitle: string
  authSubline: string
  authEmail: string
  authPassword: string
  authSubmit: string
  authLoading: string
  authPasswordTooShort: string
  authErrorGeneric: string
  /** Footer: „Ai deja cont?” */
  authSignupPrompt: string
  /** Footer: link text → login */
  authSignupLink: string
  authDividerOr: string
  authGoogleSignup: string
  missingSlugTitle: string
  missingSlugBody: string
  browseProducts: string
  loadErrorTitle: string
  loadErrorBody: string
  notAvailableTitle: string
  notAvailableBody: string
  breadcrumbHome: string
  breadcrumbCheckout: string
  guestBadge: string
  loadingProduct: string
  /** Heading above the numbered finalization steps */
  paymentCalloutTitle: string
  stepsAriaLabel: string
}

const translations: Record<LangCode, GuestCheckoutTranslations> = {
  ro: {
    pageTitle: 'Comandă ca invitat',
    pageDescription:
      'Finalizează comanda pentru bateria rezidențială fără cont sau creează un cont client pentru beneficii suplimentare.',
    headline: 'Comanda ta',
    subline:
      'Poți continua fără cont (fără program de reducere) sau îți poți crea un cont client în dreapta pentru reduceri și o experiență completă.',
    navStep1: 'Produs și preț',
    navStep2: 'Date de contact',
    navStep3: 'Adresă livrare și date factură',
    navStep4: 'Finalizare comandă',
    panelStep1: 'Pasul 1: Produs și preț',
    panelStep2: 'Pasul 2: Date de contact',
    panelStep3: 'Pasul 3: Adresă de livrare și date factură',
    panelStep4: 'Pasul 4: Finalizare comandă',
    contactIntro: 'Completează datele tale de contact. Le folosim pentru confirmarea comenzii.',
    addressIntro: 'Completează adresa de facturare. Dacă livrarea este în alt loc, bifează opțiunea de mai jos.',
    sectionBillingTitle: 'Adresa de facturare',
    sectionDeliveryTitle: 'Adresa de livrare',
    differentDeliveryPart1: 'Este ',
    differentDeliveryBoldDelivery: 'adresa de livrare',
    differentDeliveryPart2: ' diferită de ',
    differentDeliveryBoldBilling: 'adresa de facturare',
    differentDeliveryPart3: '?',
    selectCountyPlaceholder: 'Selectează județul',
    selectCityPlaceholder: 'Selectează localitatea',
    selectCityPlaceholderNeedCounty: 'Selectează mai întâi județul',
    btnContinueStep2: 'Continuă',
    btnContinueStep3: 'Continuă',
    btnContinueStep4: 'Continuă',
    btnBackStep1: 'Înapoi la produs',
    btnBackStep2: 'Înapoi la date de contact',
    btnBackStep3: 'Înapoi la adresă de livrare și date factură',
    orderProductLabel: 'Produs',
    orderQtyLabel: 'Cantitate',
    orderTotalLabel: 'Total estimat',
    orderBackToProduct: 'Înapoi la produs',
    orderShippingLabel: 'Livrare',
    orderShippingTitle: 'Transport Baterino gratuit',
    orderShippingSubtitle:
      'Oriunde ai fi în România, ajungem repede la tine. Infrastructura națională Baterino ne permite să livrăm și să recuperăm produsele foarte rapid.',
    orderShippingAmountLabel: 'Cost livrare',
    fieldNume: 'Nume',
    fieldPrenume: 'Prenume',
    fieldPhone: 'Telefon',
    fieldEmail: 'Email',
    fieldAddress: 'Adresă (stradă, număr)',
    fieldCity: 'Localitate',
    fieldCounty: 'Județ',
    fieldPostal: 'Cod poștal',
    placeholderNume: 'ex. Popescu',
    placeholderPrenume: 'ex. Maria',
    placeholderPhone: '7XX XXX XXX',
    placeholderEmail: 'nume@exemplu.ro',
    placeholderAddress: 'Stradă, număr, bloc, scară, ap.',
    placeholderCity: 'ex. București',
    placeholderCounty: 'ex. Ilfov',
    placeholderPostal: '123456',
    fieldErrorRequired: 'Completează toate câmpurile obligatorii.',
    fieldErrorEmpty: 'Acest câmp este obligatoriu.',
    fieldErrorEmail: 'Introdu o adresă de email validă.',
    fieldErrorPhone: 'Numărul de telefon trebuie să aibă exact 9 cifre (după +40).',
    finalizeStep1: 'Vei primi o factură proformă pe e-mailul pe care ni l-ai comunicat mai sus.',
    finalizeStep2:
      'Te vom contacta telefonic pentru a ne cunoaște și a verifica că produsul este cel care îți trebuie.',
    finalizeStep3: 'Achită factura proformă.',
    finalizeStep4: 'Produsul este trimis în maxim 24 de ore de la recepționarea plății.',
    btnPlaceOrder: 'Plasează comanda',
    orderPlaceLoading: 'Se trimite…',
    placeOrderErrorGeneric: 'Nu am putut înregistra comanda. Încearcă din nou.',
    orderNumberLabel: 'Număr comandă',
    orderTrackHint:
      'Pentru urmărire sau întrebări, menționează numărul de comandă și adresa de e-mail folosită: {email}.',
    orderSuccessTitle: 'Comanda a fost înregistrată',
    orderSuccessBody:
      'Îți mulțumim! Vei primi în curând factura proformă la adresa de e-mail indicată. Te vom contacta și telefonic, conform pașilor de mai sus.',
    authTitle: 'Creează cont client',
    authSubline: 'Înregistrează-te pentru a salva datele și a accesa programele de reducere.',
    authEmail: 'Email',
    authPassword: 'Parolă',
    authSubmit: 'Creează contul',
    authLoading: 'Se creează contul…',
    authPasswordTooShort: 'Parola trebuie să aibă cel puțin 8 caractere.',
    authErrorGeneric: 'Eroare la înregistrare.',
    authSignupPrompt: 'Ai deja cont?',
    authSignupLink: 'Autentifică-te',
    authDividerOr: 'sau',
    authGoogleSignup: 'Înregistrare cu Google',
    missingSlugTitle: 'Lipsește produsul',
    missingSlugBody: 'Nu s-a putut identifica produsul. Alege un produs din catalog.',
    browseProducts: 'Vezi produsele',
    loadErrorTitle: 'Produs negăsit',
    loadErrorBody: 'Nu am putut încărca acest produs. Verifică linkul sau încearcă din pagina produsului.',
    notAvailableTitle: 'Comandă indisponibilă',
    notAvailableBody:
      'Acest produs nu poate fi comandat în fluxul public de invitat (preț nepublic, stoc sau tip produs).',
    breadcrumbHome: 'Acasă',
    breadcrumbCheckout: 'Comandă',
    guestBadge: 'Fără cont — preț public',
    loadingProduct: 'Se încarcă produsul…',
    paymentCalloutTitle: 'Ce urmează',
    stepsAriaLabel: 'Pași comandă',
  },
  en: {
    pageTitle: 'Guest checkout',
    pageDescription:
      'Complete your residential battery order without an account, or create a client account on the right for the full experience.',
    headline: 'Your order',
    subline:
      'You can continue as a guest (no discount programme) or create a client account on the right for discounts and the full experience.',
    navStep1: 'Product and price',
    navStep2: 'Contact information',
    navStep3: 'Delivery address and invoice details',
    navStep4: 'Complete order',
    panelStep1: 'Step 1: Product and price',
    panelStep2: 'Step 2: Contact information',
    panelStep3: 'Step 3: Delivery address and invoice details',
    panelStep4: 'Step 4: Complete order',
    contactIntro: 'Enter your contact details. We use them to confirm your order.',
    addressIntro: 'Enter your billing address. If delivery should go elsewhere, use the option below.',
    sectionBillingTitle: 'Billing address',
    sectionDeliveryTitle: 'Delivery address',
    differentDeliveryPart1: 'Is the ',
    differentDeliveryBoldDelivery: 'delivery address',
    differentDeliveryPart2: ' different from the ',
    differentDeliveryBoldBilling: 'billing address',
    differentDeliveryPart3: '?',
    selectCountyPlaceholder: 'Select county',
    selectCityPlaceholder: 'Select city / locality',
    selectCityPlaceholderNeedCounty: 'Select county first',
    btnContinueStep2: 'Continue',
    btnContinueStep3: 'Continue',
    btnContinueStep4: 'Continue',
    btnBackStep1: 'Back to product',
    btnBackStep2: 'Back to contact',
    btnBackStep3: 'Back to delivery and invoice details',
    orderProductLabel: 'Product',
    orderQtyLabel: 'Quantity',
    orderTotalLabel: 'Estimated total',
    orderBackToProduct: 'Back to product',
    orderShippingLabel: 'Delivery',
    orderShippingTitle: 'Free Baterino delivery',
    orderShippingSubtitle:
      'Wherever you are in Romania, we get to you quickly. Baterino\'s national infrastructure lets us deliver and collect products very fast.',
    orderShippingAmountLabel: 'Shipping cost',
    fieldNume: 'Last name',
    fieldPrenume: 'First name',
    fieldPhone: 'Phone',
    fieldEmail: 'Email',
    fieldAddress: 'Address (street, number)',
    fieldCity: 'City',
    fieldCounty: 'County / region',
    fieldPostal: 'Postal code',
    placeholderNume: 'e.g. Smith',
    placeholderPrenume: 'e.g. Jane',
    placeholderPhone: '7XX XXX XXX',
    placeholderEmail: 'name@example.com',
    placeholderAddress: 'Street, number, building, flat',
    placeholderCity: 'e.g. Bucharest',
    placeholderCounty: 'e.g. Ilfov',
    placeholderPostal: '123456',
    fieldErrorRequired: 'Please fill in all required fields.',
    fieldErrorEmpty: 'This field is required.',
    fieldErrorEmail: 'Enter a valid email address.',
    fieldErrorPhone: 'The mobile number must be exactly 9 digits (after +40).',
    finalizeStep1: 'You will receive a proforma invoice by email at the address you provided above.',
    finalizeStep2:
      'We will call you to get acquainted and confirm this is the right product for your needs.',
    finalizeStep3: 'Pay the proforma invoice.',
    finalizeStep4: 'The product is shipped within 24 hours of payment being received.',
    btnPlaceOrder: 'Place order',
    orderPlaceLoading: 'Submitting…',
    placeOrderErrorGeneric: 'We could not submit your order. Please try again.',
    orderNumberLabel: 'Order number',
    orderTrackHint:
      'For follow-up, quote your order number and the email address you used: {email}.',
    orderSuccessTitle: 'Order received',
    orderSuccessBody:
      'Thank you. Your proforma invoice will arrive shortly at the email address you provided. We will also call you as described in the steps above.',
    authTitle: 'Create a client account',
    authSubline: 'Register to save your details and access discount programmes.',
    authEmail: 'Email',
    authPassword: 'Password',
    authSubmit: 'Create account',
    authLoading: 'Creating account…',
    authPasswordTooShort: 'Password must be at least 8 characters.',
    authErrorGeneric: 'Registration failed.',
    authSignupPrompt: 'Already have an account?',
    authSignupLink: 'Sign in',
    authDividerOr: 'or',
    authGoogleSignup: 'Continue with Google',
    missingSlugTitle: 'Missing product',
    missingSlugBody: 'We could not tell which product to order. Pick one from the catalogue.',
    browseProducts: 'Browse products',
    loadErrorTitle: 'Product not found',
    loadErrorBody: 'We could not load this product. Check the link or start again from the product page.',
    notAvailableTitle: 'Checkout not available',
    notAvailableBody:
      'This product cannot be ordered in the public guest flow (pricing, stock, or product type).',
    breadcrumbHome: 'Home',
    breadcrumbCheckout: 'Checkout',
    guestBadge: 'Guest — public price',
    loadingProduct: 'Loading product…',
    paymentCalloutTitle: 'What happens next',
    stepsAriaLabel: 'Checkout steps',
  },
  zh: {
    pageTitle: '访客下单',
    pageDescription: '无需注册即可完成住宅电池订单，或在右侧注册客户账户以使用完整功能。',
    headline: '您的订单',
    subline: '您可以以访客继续（无折扣计划），或在右侧注册客户账户以享受折扣与完整功能。',
    navStep1: '商品与价格',
    navStep2: '联系信息',
    navStep3: '收货地址与发票信息',
    navStep4: '完成订单',
    panelStep1: '第 1 步：商品与价格',
    panelStep2: '第 2 步：联系信息',
    panelStep3: '第 3 步：收货地址与发票信息',
    panelStep4: '第 4 步：完成订单',
    contactIntro: '填写联系方式，用于订单确认。',
    addressIntro: '请填写账单地址。若收货地址不同，请勾选下方选项。',
    sectionBillingTitle: '账单地址',
    sectionDeliveryTitle: '收货地址',
    differentDeliveryPart1: '',
    differentDeliveryBoldDelivery: '收货地址',
    differentDeliveryPart2: '是否与',
    differentDeliveryBoldBilling: '账单地址',
    differentDeliveryPart3: '不同？',
    selectCountyPlaceholder: '选择县 / 省',
    selectCityPlaceholder: '选择城市',
    selectCityPlaceholderNeedCounty: '请先选择县 / 省',
    btnContinueStep2: '继续',
    btnContinueStep3: '继续',
    btnContinueStep4: '继续',
    btnBackStep1: '返回商品',
    btnBackStep2: '返回联系信息',
    btnBackStep3: '返回收货地址与发票信息',
    orderProductLabel: '商品',
    orderQtyLabel: '数量',
    orderTotalLabel: '预估合计',
    orderBackToProduct: '返回商品页',
    orderShippingLabel: '配送',
    orderShippingTitle: 'Baterino 免费配送',
    orderShippingSubtitle:
      '无论您在罗马尼亚何处，我们都能快速送达。Baterino 全国网络让我们能够迅速发货与回收产品。',
    orderShippingAmountLabel: '运费',
    fieldNume: '姓',
    fieldPrenume: '名',
    fieldPhone: '电话',
    fieldEmail: '邮箱',
    fieldAddress: '地址（街道、门牌）',
    fieldCity: '城市',
    fieldCounty: '省/县',
    fieldPostal: '邮编',
    placeholderNume: '如：张',
    placeholderPrenume: '如：伟',
    placeholderPhone: '7XX XXX XXX',
    placeholderEmail: 'name@example.com',
    placeholderAddress: '街道、门牌号',
    placeholderCity: '如：布加勒斯特',
    placeholderCounty: '县 / 区',
    placeholderPostal: '123456',
    fieldErrorRequired: '请填写所有必填项。',
    fieldErrorEmpty: '此项为必填。',
    fieldErrorEmail: '请输入有效的电子邮箱。',
    fieldErrorPhone: '手机号须为 9 位数字（不含 +40）。',
    finalizeStep1: '您将在上面填写的电子邮箱收到形式发票（proforma）。',
    finalizeStep2: '我们会通过电话与您联系，相互了解并确认产品是否符合您的需求。',
    finalizeStep3: '支付形式发票所列款项。',
    finalizeStep4: '确认收款后，我们会在最长 24 小时内安排发货。',
    btnPlaceOrder: '提交订单',
    orderPlaceLoading: '提交中…',
    placeOrderErrorGeneric: '订单未能提交，请重试。',
    orderNumberLabel: '订单编号',
    orderTrackHint: '如需跟进，请提供订单编号与您使用的邮箱：{email}。',
    orderSuccessTitle: '订单已提交',
    orderSuccessBody:
      '感谢您的信任！形式发票将很快发送至您填写的邮箱，我们也会按上述步骤与您电话联系。',
    authTitle: '注册客户账户',
    authSubline: '注册后可保存信息并使用折扣计划。',
    authEmail: '邮箱',
    authPassword: '密码',
    authSubmit: '创建账户',
    authLoading: '正在创建账户…',
    authPasswordTooShort: '密码至少 8 位。',
    authErrorGeneric: '注册失败。',
    authSignupPrompt: '已有账户？',
    authSignupLink: '登录',
    authDividerOr: '或',
    authGoogleSignup: '使用 Google 注册',
    missingSlugTitle: '缺少商品',
    missingSlugBody: '无法识别要下单的商品，请从目录中选择。',
    browseProducts: '浏览商品',
    loadErrorTitle: '未找到商品',
    loadErrorBody: '无法加载该商品，请检查链接或从商品页重新进入。',
    notAvailableTitle: '无法在此流程下单',
    notAvailableBody: '该商品不适合公开访客流程（价格、库存或商品类型）。',
    breadcrumbHome: '首页',
    breadcrumbCheckout: '下单',
    guestBadge: '访客 — 公开价',
    loadingProduct: '正在加载商品…',
    paymentCalloutTitle: '接下来',
    stepsAriaLabel: '下单步骤',
  },
}

export function getGuestCheckoutTranslations(lang: LangCode): GuestCheckoutTranslations {
  return translations[lang] ?? translations.ro
}
