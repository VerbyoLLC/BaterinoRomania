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
  /** Step 2 — radio group: natural person */
  buyerTypeNaturalPerson: string
  /** Step 2 — radio group: legal entity */
  buyerTypeLegalEntity: string
  /** Step 2 — aria-label for buyer type radios */
  buyerTypeGroupAria: string
  /** Step 2 — subtitle for contact fields when PJ */
  contactPersonSectionTitle: string
  /** Step 2 — company block heading when PJ */
  companyInvoiceSectionTitle: string
  fieldCompanyName: string
  fieldCompanyCui: string
  placeholderCompanyName: string
  placeholderCompanyCui: string
  addressIntro: string
  /** Variantă pentru PJ — adresa firmei este folosită la facturare, Pasul 3 este strict pentru livrare. */
  addressIntroCompany: string
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
  fieldErrorPostal: string
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
  /** Logged-in client: shown instead of `orderTrackHint` after a successful order. */
  orderTrackHintClient: string
  /** Logged-in client: primary CTA from checkout success → `/client/comenzi`. */
  orderSuccessViewOrders: string
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
  /** Checkbox before Google signup — fragments around `/termeni-si-conditii` and `/politica-confidentialitate`. */
  authTermsLead: string
  authTermsLinkTerms: string
  authTermsMiddle: string
  authTermsLinkPrivacy: string
  /** Shown if Google signup is attempted without accepting terms (defensive). */
  authTermsRequiredError: string
  /** Optional marketing email opt-in at signup (unchecked by default). */
  authMarketingOptInLabel: string
  missingSlugTitle: string
  missingSlugBody: string
  /** No slug and empty cart on `/comanda` */
  emptyCheckoutTitle: string
  emptyCheckoutBody: string
  /** Cart checkout step 1 — loading aggregated prices */
  cartLoadingTotals: string
  /** Link to `/cos` from checkout */
  cartEditInCos: string
  /** Cart checkout step 1: secondary button → catalogue (1/3 width vs continue) */
  btnEditProductsStep1: string
  /** Cart line list heading */
  cartItemsHeading: string
  /** Checkout step 1: cart line price header — `{pct}` = VAT % (e.g. 21), e.g. `Preț (include TVA {pct}%)`; use `cartLineTotalLabelNoVat` when no rate */
  cartLineTotalLabel: string
  /** Cart line header when product has no VAT % in data */
  cartLineTotalLabelNoVat: string
  /** `{pct}` = VAT % shown to customer (e.g. 21) */
  priceIncludesVatPercent: string
  /** Cart lines use different VAT rates */
  priceIncludesVatMixed: string
  /** Remove one line from cart on checkout step 1 */
  cartRemoveLine: string
  /** Mobile strip: `{n}` = number of distinct lines */
  cartOrderLineCount: string
  /** Step 2 back button when order is cart-based */
  btnBackToCart: string
  browseProducts: string
  loadErrorTitle: string
  loadErrorBody: string
  notAvailableTitle: string
  notAvailableBody: string
  breadcrumbHome: string
  breadcrumbCheckout: string
  guestBadge: string
  /** Logged-in client — badge next to headline (replaces guest-only badge) */
  clientBadge: string
  /** Logged-in client — intro under headline (no “create account on the right”) */
  sublineClient: string
  loadingProduct: string
  /** Heading above the numbered finalization steps */
  paymentCalloutTitle: string
  stepsAriaLabel: string
  /** Client: loading profile before contact step */
  profileLoadingAccount: string
  /** Client: autosave profile from checkout failed */
  profileSaveError: string
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
    navStep2: 'Persoană de contact și date de facturare',
    navStep3: 'Adresa de livrare',
    navStep4: 'Finalizare comandă',
    panelStep1: 'Pasul 1: Produs și preț',
    panelStep2: 'Pasul 2: Persoană de contact și date de facturare',
    panelStep3: 'Pasul 3: Adresa de livrare',
    panelStep4: 'Pasul 4: Finalizare comandă',
    buyerTypeNaturalPerson: 'Persoană fizică',
    buyerTypeLegalEntity: 'Persoană juridică',
    buyerTypeGroupAria: 'Tip cumpărător pentru facturare',
    contactPersonSectionTitle: 'Persoană de contact',
    companyInvoiceSectionTitle: 'Date firmă (factură pe persoană juridică)',
    fieldCompanyName: 'Nume companie',
    fieldCompanyCui: 'CUI',
    placeholderCompanyName: 'Ex.: S.C. Exemplu S.R.L.',
    placeholderCompanyCui: 'Ex.: RO12345678',
    addressIntro:
      'Adresa de mai jos este folosită atât pentru facturare, cât și pentru livrare. Dacă dorești să modifici adresa de livrare, o poți face în formularul de mai jos.',
    addressIntroCompany:
      'Factura va fi emisă pe firma introdusă mai sus. Completează mai jos adresa unde dorești să primești coletul.',
    selectCountyPlaceholder: 'Selectează județul',
    selectCityPlaceholder: 'Selectează localitatea',
    selectCityPlaceholderNeedCounty: 'Selectează mai întâi județul',
    btnContinueStep2: 'Continuă',
    btnContinueStep3: 'Continuă',
    btnContinueStep4: 'Continuă',
    btnBackStep1: 'Înapoi la produs',
    btnBackStep2: 'Înapoi la persoană de contact și date de facturare',
    btnBackStep3: 'Înapoi la adresa de livrare',
    orderProductLabel: 'Produs',
    orderQtyLabel: 'Cantitate',
    orderTotalLabel: 'Total final',
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
    fieldErrorPostal: 'Codul poștal trebuie să conțină exact 6 cifre.',
    finalizeStep1: 'Vei primi o factură proformă pe e-mailul pe care ni l-ai comunicat mai sus.',
    finalizeStep2: 'Te vom contacta pentru a confirma comanda.',
    finalizeStep3: 'Achită factura proformă și nu uita să menționezi numărul comenzii în detaliile transferului.',
    finalizeStep4: 'Produsul este trimis în maxim 24 de ore de la recepționarea plății.',
    btnPlaceOrder: 'Plasează comanda',
    orderPlaceLoading: 'Se trimite…',
    placeOrderErrorGeneric: 'Nu am putut înregistra comanda. Încearcă din nou.',
    orderNumberLabel: 'Număr comandă',
    orderTrackHint:
      'Pentru urmărire sau întrebări, menționează numărul de comandă și adresa de e-mail folosită: {email}.',
    orderTrackHintClient:
      'Comanda este salvată în contul tău. Pentru urmărire sau întrebări, menționează numărul de comandă de mai sus.',
    orderSuccessViewOrders: 'Vezi comenzile mele',
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
    authTermsLead: 'Sunt de acord cu ',
    authTermsLinkTerms: 'Termenii și Condițiile',
    authTermsMiddle: ' și ',
    authTermsLinkPrivacy: 'Politica de Confidențialitate',
    authTermsRequiredError:
      'Trebuie să accepți Termenii și Condițiile și Politica de Confidențialitate pentru a continua cu Google.',
    authMarketingOptInLabel:
      'Doresc să primesc comunicări comerciale și oferte de la Baterino prin email. (Opțional)',
    missingSlugTitle: 'Lipsește produsul',
    missingSlugBody: 'Nu s-a putut identifica produsul. Alege un produs din catalog.',
    emptyCheckoutTitle: 'Nu există produse de comandat',
    emptyCheckoutBody:
      'Coșul este gol și nu ai selectat un produs din link. Mergi la catalog sau adaugă produse în coș, apoi finalizează aici.',
    cartLoadingTotals: 'Se calculează totalul coșului…',
    cartEditInCos: 'Modifică coșul',
    btnEditProductsStep1: 'Modifică produsele',
    cartItemsHeading: 'Produse în comandă',
    cartLineTotalLabel: 'Preț (include TVA {pct}%)',
    cartLineTotalLabelNoVat: 'Total',
    priceIncludesVatPercent: 'Include TVA {pct}%',
    priceIncludesVatMixed: 'Prețurile includ TVA (procente diferite pe produs)',
    cartRemoveLine: 'Elimină',
    cartOrderLineCount: '{n} articole',
    btnBackToCart: 'Înapoi la coș',
    browseProducts: 'Vezi produsele',
    loadErrorTitle: 'Produs negăsit',
    loadErrorBody: 'Nu am putut încărca acest produs. Verifică linkul sau încearcă din pagina produsului.',
    notAvailableTitle: 'Comandă indisponibilă',
    notAvailableBody:
      'Acest produs nu poate fi comandat în fluxul public de invitat (preț nepublic, stoc sau tip produs).',
    breadcrumbHome: 'Acasă',
    breadcrumbCheckout: 'Comandă',
    guestBadge: 'Fără cont — preț public',
    clientBadge: 'Cont client',
    sublineClient:
      'Ești autentificat cu cont client. Am precompletat datele din profil; le poți modifica la fiecare pas. Continuă mai jos pentru a plasa comanda.',
    loadingProduct: 'Se încarcă produsul…',
    paymentCalloutTitle: 'Ce urmează',
    stepsAriaLabel: 'Pași comandă',
    profileLoadingAccount: 'Se încarcă datele din cont…',
    profileSaveError: 'Nu am putut salva datele în cont. Încearcă din nou.',
  },
  en: {
    pageTitle: 'Guest checkout',
    pageDescription:
      'Complete your residential battery order without an account, or create a client account on the right for the full experience.',
    headline: 'Your order',
    subline:
      'You can continue as a guest (no discount programme) or create a client account on the right for discounts and the full experience.',
    navStep1: 'Product and price',
    navStep2: 'Contact person & billing details',
    navStep3: 'Delivery address',
    navStep4: 'Complete order',
    panelStep1: 'Step 1: Product and price',
    panelStep2: 'Step 2: Contact person & billing details',
    panelStep3: 'Step 3: Delivery address',
    panelStep4: 'Step 4: Complete order',
    buyerTypeNaturalPerson: 'Natural person',
    buyerTypeLegalEntity: 'Legal entity',
    buyerTypeGroupAria: 'Buyer type for invoicing',
    contactPersonSectionTitle: 'Contact person',
    companyInvoiceSectionTitle: 'Company details (invoice to legal entity)',
    fieldCompanyName: 'Company name',
    fieldCompanyCui: 'Tax ID (CUI)',
    placeholderCompanyName: 'e.g. ACME SRL',
    placeholderCompanyCui: 'e.g. RO12345678',
    addressIntro:
      'The address below is used for both billing and delivery. If you want to change the delivery address, you can do so in the form below.',
    addressIntroCompany:
      'The invoice will be issued to the company entered above. Please fill in below the address where you would like to receive the package.',
    selectCountyPlaceholder: 'Select county',
    selectCityPlaceholder: 'Select city / locality',
    selectCityPlaceholderNeedCounty: 'Select county first',
    btnContinueStep2: 'Continue',
    btnContinueStep3: 'Continue',
    btnContinueStep4: 'Continue',
    btnBackStep1: 'Back to product',
    btnBackStep2: 'Back to contact person & billing details',
    btnBackStep3: 'Back to delivery address',
    orderProductLabel: 'Product',
    orderQtyLabel: 'Quantity',
    orderTotalLabel: 'Final total',
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
    fieldErrorPostal: 'The postal code must be exactly 6 digits.',
    finalizeStep1: 'You will receive a proforma invoice by email at the address you provided above.',
    finalizeStep2: 'We will contact you to confirm your order.',
    finalizeStep3: 'Pay the proforma invoice — remember to include your order number in the transfer details.',
    finalizeStep4: 'The product is shipped within 24 hours of payment being received.',
    btnPlaceOrder: 'Place order',
    orderPlaceLoading: 'Submitting…',
    placeOrderErrorGeneric: 'We could not submit your order. Please try again.',
    orderNumberLabel: 'Order number',
    orderTrackHint:
      'For follow-up, quote your order number and the email address you used: {email}.',
    orderTrackHintClient:
      'The order is saved on your account. For follow-up, quote your order number above.',
    orderSuccessViewOrders: 'View my orders',
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
    authTermsLead: 'I agree to the ',
    authTermsLinkTerms: 'Terms & Conditions',
    authTermsMiddle: ' and ',
    authTermsLinkPrivacy: 'Privacy Policy',
    authTermsRequiredError:
      'Please accept the Terms & Conditions and Privacy Policy to continue with Google.',
    authMarketingOptInLabel:
      'I would like to receive commercial communications and offers from Baterino by email. (Optional)',
    missingSlugTitle: 'Missing product',
    missingSlugBody: 'We could not tell which product to order. Pick one from the catalogue.',
    emptyCheckoutTitle: 'Nothing to checkout',
    emptyCheckoutBody:
      'Your cart is empty and no product was selected from a link. Browse the catalogue or add items to your cart, then continue here.',
    cartLoadingTotals: 'Calculating cart total…',
    cartEditInCos: 'Edit cart',
    btnEditProductsStep1: 'Edit products',
    cartItemsHeading: 'Items in this order',
    cartLineTotalLabel: 'Price (includes {pct}% VAT)',
    cartLineTotalLabelNoVat: 'Total',
    priceIncludesVatPercent: 'Includes {pct}% VAT',
    priceIncludesVatMixed: 'Prices include VAT (rate may differ by product)',
    cartRemoveLine: 'Remove',
    cartOrderLineCount: '{n} items',
    btnBackToCart: 'Back to cart',
    browseProducts: 'Browse products',
    loadErrorTitle: 'Product not found',
    loadErrorBody: 'We could not load this product. Check the link or start again from the product page.',
    notAvailableTitle: 'Checkout not available',
    notAvailableBody:
      'This product cannot be ordered in the public guest flow (pricing, stock, or product type).',
    breadcrumbHome: 'Home',
    breadcrumbCheckout: 'Checkout',
    guestBadge: 'Guest — public price',
    clientBadge: 'Client account',
    sublineClient:
      'You are signed in with a client account. We prefilled your details from your profile — you can edit them at each step below and place your order.',
    loadingProduct: 'Loading product…',
    paymentCalloutTitle: 'What happens next',
    stepsAriaLabel: 'Checkout steps',
    profileLoadingAccount: 'Loading your account details…',
    profileSaveError: 'We could not save your details to your account. Please try again.',
  },
}

export function getGuestCheckoutTranslations(lang: LangCode): GuestCheckoutTranslations {
  return translations[lang] ?? translations.ro
}
