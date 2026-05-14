import type { LangCode } from './menu'

export type TimelineStep = {
  title: string
  description: string
}

export type ReturnDataDropdownStep = {
  title: string
  /** Paragraf informativ (pașii fără formular). */
  description?: string
  /** Primul pas: formular „Detalii comandă și produs” (randat în pagină). */
  orderProductForm?: boolean
  /** Pas „Motiv retur”: opțiuni radio + text liber pentru „alt motiv”. */
  returnReasonForm?: boolean
  /** Pas „Declarație privind starea produsului”: checklist + fotografii. */
  productConditionForm?: boolean
  /** Pas „Adresa preluare produs”: stradă, județ, oraș, cod poștal. */
  pickupAddressForm?: boolean
  /** Pas „Metoda de rambursare”: titular + IBAN. */
  refundMethodForm?: boolean
}

/** Etichete pentru adresa de preluare colet. */
export type PickupAddressFormTranslations = {
  helper: string
  street: string
  county: string
  city: string
  postal: string
  placeholderStreet: string
  placeholderPostal: string
  selectCountyPlaceholder: string
  selectCityPlaceholder: string
  selectCityNeedCounty: string
  fillRequired: string
  invalidPostal: string
  continue: string
}

/** Etichete pentru rambursare în cont (IBAN). */
export type RefundMethodFormTranslations = {
  helper: string
  accountHolder: string
  iban: string
  placeholderTitular: string
  placeholderIban: string
  fillRequired: string
  invalidTitular: string
  invalidIban: string
  continue: string
}

/** Etichete pentru declarația de stare produs + fotografii. */
export type ProductConditionFormTranslations = {
  helper: string
  chkUninstalled: string
  chkSeals: string
  chkPackaging: string
  photosSectionTitle: string
  photosLabel: string
  addPhotos: string
  /** Placeholders `{count}`, `{min}`, `{max}`. */
  photoCount: string
  fillCheckboxes: string
  /** Mesaj când numărul de fotografii nu e între min și max. */
  fillPhotosRange: string
  /** Fișiere care nu sunt .jpg / .jpeg. */
  fillPhotosWrongType: string
  removePhotoAria: string
  continue: string
}

/** Etichete pentru formularul „Motiv retur”. */
export type ReturnReasonFormTranslations = {
  helper: string
  withdrawal: string
  defective: string
  notAsDescribed: string
  damagedDelivery: string
  other: string
  otherDetailsLabel: string
  placeholderOther: string
  fillRequired: string
  fillOtherRequired: string
  continue: string
}

/** Etichete și mesaje pentru formularul comandă + produs (returnare). */
export type OrderProductFormTranslations = {
  helper: string
  sectionOrder: string
  sectionProduct: string
  orderNumber: string
  receiptDate: string
  serialNumber: string
  brand: string
  model: string
  placeholderOrderNumber: string
  /** Scurtă explicație sub câmpul cu prefix fix BTO-. */
  orderNumberBtoHint: string
  placeholderDate: string
  placeholderSerial: string
  placeholderBrand: string
  placeholderModel: string
  dateHint: string
  fillRequired: string
  invalidDate: string
  /** Data recepției depășește fereastra legală de retur (ex. 15 zile). */
  receiptDateTooOld: string
  continue: string
  /** Prefix fix LJC pentru SN. */
  serialNumberLjcHint: string
  selectBrandPlaceholder: string
  selectModelPlaceholder: string
  loadingModelsCatalog: string
  modelsListError: string
  modelsListRetry: string
  modelsEmptyCatalog: string
}

/** Sub accordioane: confirmări + trimitere cerere retur. */
export type ReturnSubmitPanelTranslations = {
  chkPolicyPrefix: string
  chkPolicyLinkLabel: string
  /** Text după linkul către politica de retur (ex. „ și le accept.”). */
  chkPolicySuffix: string
  chkDeclaration: string
  submitButton: string
  /** În timpul POST către server. */
  submitSubmitting: string
  fillRequired: string
  /** Mesaj succes; include placeholder `#{registrationNumber}` (ex. BTRT-000042). */
  submitSuccessWithId: string
  submitErrorNetwork: string
  submitErrorServer: string
}

export type ClientInfoFormTranslations = {
  title: string
  helper: string
  lastName: string
  firstName: string
  addressLegend: string
  street: string
  county: string
  city: string
  postal: string
  phone: string
  email: string
  continue: string
  fillRequired: string
  invalidNames: string
  invalidPostal: string
  invalidEmail: string
  placeholderLastName: string
  placeholderFirstName: string
  placeholderStreet: string
  placeholderPostal: string
  placeholderPhone: string
  placeholderEmail: string
  selectCountyPlaceholder: string
  selectCityPlaceholder: string
  selectCityNeedCounty: string
}

/** Secțiunea de verificare SN înainte de pașii detaliați (format LJC-####-####-####-####). */
export type SerialVerifyGateTranslations = {
  intro: string
  serialLabel: string
  verifyButton: string
  /** În timpul apelului server. */
  verifyingLabel: string
  errorNeed16Digits: string
  /** Mesaj după verificare reușită pe server (SN + data recepție în fereastră). */
  eligibleMessage: string
  /** Mesaj când SN lipsește din stocuri sau data recepție nu e în ultimele 15 zile. */
  ineligibleMessage: string
  /** Deschide pașii formularului de retur (după eligibilitate). */
  startButton: string
  /** Eroare rețea / server la apelul de eligibilitate. */
  eligibilityCheckError: string
}

export type ReturnareProduseTranslations = {
  seoTitle: string
  seoDesc: string
  pageTitle: string
  /** Primul paragraf; **text** = bold */
  introBody: string
  /** Înainte de link, ex. „Verifică ” */
  introTermsLead: string
  /** Eticheta linkului către Politica de Retur (ancoră pe pagina termenilor). */
  introTermsLinkLabel: string
  timelineTitle: string
  timelineSteps: TimelineStep[]
  /** Titlu deasupra pașilor formularului de retur */
  returnDataHeading: string
  /** Verificare număr de serie (LJC + 16 cifre) înainte de acordeon. */
  serialVerifyGate: SerialVerifyGateTranslations
  accordionStepLockedHint: string
  /** Pași fără formularul client (vizibil doar pentru utilizator neautentificat ca prim pas). */
  returnDataSteps: ReturnDataDropdownStep[]
  /** Formular „Detalii comandă și produs” (primul pas din `returnDataSteps` când `orderProductForm: true`). */
  orderProductForm: OrderProductFormTranslations
  /** Formular „Motiv retur” (pasul cu `returnReasonForm: true`). */
  returnReasonForm: ReturnReasonFormTranslations
  /** Declarație stare produs + fotografii (pasul cu `productConditionForm: true`). */
  productConditionForm: ProductConditionFormTranslations
  /** Adresă preluare produs (pasul cu `pickupAddressForm: true`). */
  pickupAddressForm: PickupAddressFormTranslations
  /** Rambursare: titular + IBAN (pasul cu `refundMethodForm: true`). */
  refundMethodForm: RefundMethodFormTranslations
  /** Sub pașii retur: confirmări legale + „Trimite cerere”. */
  submitPanel: ReturnSubmitPanelTranslations
  /** Formular „Informații client” — doar când nu ești autentificat ca și client. */
  clientInfoForm: ClientInfoFormTranslations
}

const translations: Record<LangCode, ReturnareProduseTranslations> = {
  ro: {
    seoTitle: 'Returnare produse | Baterino',
    seoDesc:
      'Retururi fără bătăi de cap: 15 zile de la primire, în conformitate cu legea și politica comercială. Vezi Politica de Retur.',
    pageTitle: 'Returnare produse',
    introBody:
      'La Baterino, retururile sunt fără bătăi de cap. Ai la dispoziție **15 zile** de la primirea produsului pentru a te răzgândi, în conformitate cu legislația în vigoare și politica noastră comercială.',
    introTermsLead: 'Verifică ',
    introTermsLinkLabel: 'Politica de Retur',
    timelineTitle: 'Proces Returnare',
    timelineSteps: [
      {
        title: 'Creează cerere',
        description:
          'Contactează-ne cu datele comenzii; îți confirmăm primirea și îți transmitem instrucțiunile (inclusiv adresă de expediere, dacă e cazul).',
      },
      {
        title: 'Trimite produsul',
        description: 'Ambalează corect produsul și predă-l curierului nostru.',
      },
      {
        title: 'Verificare la primire',
        description: 'După ce coletul ajunge la noi, verificăm conformitatea cu condițiile de returnare.',
      },
      {
        title: 'Returnarea banilor',
        description:
          'Dacă totul este în regulă, procesăm rambursarea prin aceeași metodă de plată ca la comandă, în termenele legale.',
      },
    ],
    returnDataHeading: 'Începe procedura de returnare',
    serialVerifyGate: {
      intro: 'Introdu numărul de serie al produsului pe care dorești să îl returnezi.',
      serialLabel: 'Număr de serie',
      verifyButton: 'Verifică',
      verifyingLabel: 'Se verifică…',
      errorNeed16Digits: 'Numărul de serie trebuie să conțină exact 16 cifre după LJC (patru grupe a câte 4 cifre).',
      eligibleMessage:
        'Produsul tău este eligibil pentru a fi returnat. Începe procedura de returnare.',
      ineligibleMessage:
        'Acest produs nu este eligibil pentru a fi returnat. Probabil nu a fost cumpărat de la noi. Dacă ai nevoie de ajutor în legătură cu acest produs, te rugăm să ne contactezi.',
      startButton: 'Start',
      eligibilityCheckError: 'Nu am putut verifica numărul de serie. Verifică conexiunea și încearcă din nou.',
    },
    accordionStepLockedHint: 'Completează mai întâi pasul anterior.',
    clientInfoForm: {
      title: 'Informații client',
      helper:
        'Completează datele tale. Nu ești autentificat în cont — avem nevoie de aceste informații pentru a prelucra cererea de retur.',
      lastName: 'Nume',
      firstName: 'Prenume',
      addressLegend: 'Adresă',
      street: 'Stradă și număr',
      county: 'Județ',
      city: 'Oraș',
      postal: 'Cod poștal',
      phone: 'Telefon',
      email: 'Email',
      continue: 'Continuă',
      fillRequired: 'Completează toate câmpurile obligatorii.',
      invalidNames: 'La Nume și Prenume sunt permise doar litere (inclusiv diacritice), spațiu, cratimă sau apostrof.',
      invalidPostal: 'Codul poștal trebuie să aibă exact 6 cifre.',
      invalidEmail: 'Introduceți o adresă de email validă (ex.: ana@email.com).',
      placeholderLastName: 'ex.: Popescu',
      placeholderFirstName: 'ex.: Ana-Maria',
      placeholderStreet: 'ex.: Str. Exemplu nr. 10, bl. A, ap. 4',
      placeholderPostal: '000000',
      placeholderPhone: 'ex.: 0721234567',
      placeholderEmail: 'ex.: ana@email.com',
      selectCountyPlaceholder: 'Selectează județul',
      selectCityPlaceholder: 'Selectează orașul',
      selectCityNeedCounty: 'Selectează mai întâi județul',
    },
    orderProductForm: {
      helper: 'Completează câmpurile despre comandă și despre produsul pe care îl returnezi.',
      sectionOrder: 'Date despre comandă',
      sectionProduct: 'Date despre produs',
      orderNumber: 'Numărul comenzii',
      receiptDate: 'Data recepției',
      serialNumber: 'Număr de serie',
      brand: 'Marca produs',
      model: 'Model produs',
      placeholderOrderNumber: 'ex.: 2025-00123',
      orderNumberBtoHint: 'Prefixul BTO- este inclus automat; introduceți restul numărului comenzii.',
      placeholderDate: 'zz-ll-aaaa',
      placeholderSerial: 'ex.: 123456789',
      placeholderBrand: 'ex.: Lithtech',
      placeholderModel: 'ex.: model / denumire',
      dateHint:
        'Pentru data recepției, tastați cifrele în ordinea zi–lună–an (zz-ll-aaaa); cratimele apar automat pe măsură ce scrieți.',
      fillRequired: 'Completează toate câmpurile obligatorii.',
      invalidDate: 'Data trebuie să fie validă, în format zz-ll-aaaa (ex. 05-11-2026).',
      receiptDateTooOld:
        'Serviciul de retur nu este disponibil pentru acest produs, pentru ca data receptiei este mai veche de 15 zile.',
      continue: 'Continuă',
      serialNumberLjcHint: 'Prefixul LJC este inclus automat; introduceți restul numărului de serie.',
      selectBrandPlaceholder: 'Selectează marca',
      selectModelPlaceholder: 'Selectează modelul',
      loadingModelsCatalog: 'Se încarcă lista de modele…',
      modelsListError: 'Nu am putut încărca lista de modele. Verifică conexiunea și încearcă din nou.',
      modelsListRetry: 'Reîncearcă',
      modelsEmptyCatalog: 'Nu există modele în catalog. Contactează suportul Baterino.',
    },
    returnReasonForm: {
      helper: 'Selectează motivul returului. Pentru „Alt motiv”, completează descrierea în câmpul de mai jos.',
      withdrawal: 'Drept de retragere (fără motiv)',
      defective: 'Produs defect',
      notAsDescribed: 'Produs neconform cu descrierea',
      damagedDelivery: 'Produs deteriorat la livrare',
      other: 'Alt motiv (câmp text liber)',
      otherDetailsLabel: 'Descriere motiv',
      placeholderOther: 'Descrie pe scurt situația…',
      fillRequired: 'Selectează un motiv pentru retur.',
      fillOtherRequired: 'Completează descrierea pentru opțiunea „Alt motiv”.',
      continue: 'Continuă',
    },
    productConditionForm: {
      helper:
        'Bifează afirmațiile care se aplică produsului (cel puțin una), apoi încarcă între 2 și 6 fotografii JPEG clare (.jpg sau .jpeg): produs, sigilii, ambalaj, accesorii.',
      chkUninstalled: 'Produsul este neinstalat și neconectat',
      chkSeals: 'Sigiliile sunt intacte',
      chkPackaging: 'Ambalajul și accesoriile sunt complete',
      photosSectionTitle: 'Fotografii',
      photosLabel: 'Încarcă între 2 și 6 fotografii JPEG (.jpg sau .jpeg); cel puțin două sunt obligatorii',
      addPhotos: 'Adaugă fotografii',
      photoCount: '{count} / {max} fotografii (JPEG) — minim {min}',
      fillCheckboxes: 'Bifează cel puțin o afirmație despre starea produsului.',
      fillPhotosRange: 'Încarcă între 2 și 6 fotografii JPEG (.jpg sau .jpeg).',
      fillPhotosWrongType: 'Sunt permise doar fișiere .jpg sau .jpeg (JPEG).',
      removePhotoAria: 'Elimină fotografia',
      continue: 'Continuă',
    },
    pickupAddressForm: {
      helper: 'Adresa de unde poate ridica curierul coletul pentru retur.',
      street: 'Stradă',
      county: 'Județ',
      city: 'Oraș',
      postal: 'Cod poștal',
      placeholderStreet: 'ex.: Str. Exemplu nr. 10',
      placeholderPostal: '000000',
      selectCountyPlaceholder: 'Selectează județul',
      selectCityPlaceholder: 'Selectează orașul',
      selectCityNeedCounty: 'Selectează mai întâi județul',
      fillRequired: 'Completează toate câmpurile obligatorii.',
      invalidPostal: 'Codul poștal trebuie să aibă exact 6 cifre.',
      continue: 'Continuă',
    },
    refundMethodForm: {
      helper:
        'Completează titularul contului și IBAN-ul pentru rambursare (virament bancar). IBAN-ul trebuie să fie românesc, valid.',
      accountHolder: 'Titular cont',
      iban: 'IBAN',
      placeholderTitular: 'Numele din contractul bancar / extras',
      placeholderIban: 'ex.: RO12 3456 7890 1234 5678 9012',
      fillRequired: 'Completează toate câmpurile obligatorii.',
      invalidTitular: 'Titularul contului conține caractere nepermise sau este prea scurt.',
      invalidIban: 'IBAN invalid. Pentru România folosiți formatul RO + 22 caractere (24 în total).',
      continue: 'Continuă',
    },
    returnDataSteps: [
      {
        title: 'Detalii comandă și produs',
        orderProductForm: true,
      },
      {
        title: 'Motiv retur',
        returnReasonForm: true,
      },
      {
        title: 'Declarație privind starea produsului',
        productConditionForm: true,
      },
      {
        title: 'Adresa preluare produs',
        pickupAddressForm: true,
      },
      {
        title: 'Metoda de rambursare a plății',
        refundMethodForm: true,
      },
    ],
    submitPanel: {
      chkPolicyPrefix: 'Confirm că am verificat condițiile din ',
      chkPolicyLinkLabel: 'Politica de Retur',
      chkPolicySuffix: ' și le accept.',
      chkDeclaration:
        'Declar pe propria răspundere că informațiile furnizate sunt corecte.',
      submitButton: 'Trimite cerere',
      submitSubmitting: 'Se trimite…',
      fillRequired: 'Bifează ambele confirmări pentru a trimite cererea.',
      submitSuccessWithId:
        'Cererea ta de retur a fost înregistrată cu seria **#{registrationNumber}**. Ți-am trimis un email de confirmare la adresa indicată. Te vom contacta în curând cu pașii următori.',
      submitErrorNetwork: 'Nu s-a putut contacta serverul. Verifică conexiunea și încearcă din nou.',
      submitErrorServer: 'Nu am putut înregistra cererea. Încearcă din nou sau contactează-ne.',
    },
  },
  en: {
    seoTitle: 'Product returns | Baterino',
    seoDesc:
      'Hassle-free returns: 15 days from delivery under applicable law and our policy. See the return policy.',
    pageTitle: 'Product returns',
    introBody:
      'At Baterino, returns are hassle-free. You have **15 days** from receiving the product to change your mind, in accordance with applicable law and our commercial policy.',
    introTermsLead: 'See ',
    introTermsLinkLabel: 'Return policy',
    timelineTitle: 'Return process',
    timelineSteps: [
      {
        title: 'Submit your request',
        description:
          'Contact us with your order details; we confirm receipt and send instructions (including a return shipping address if applicable).',
      },
      {
        title: 'Ship the product',
        description: 'Pack the product securely and send it by courier as instructed. Keep proof of shipment.',
      },
      {
        title: 'Receipt and inspection',
        description: 'Once the parcel arrives, we check that it meets the return conditions.',
      },
      {
        title: 'Refund',
        description:
          'If everything is in order, we process a refund using the same payment method as the original order, within statutory time limits.',
      },
    ],
    returnDataHeading: 'Start your return procedure',
    serialVerifyGate: {
      intro: 'Enter the serial number of the product you want to return.',
      serialLabel: 'Serial number',
      verifyButton: 'Verify',
      verifyingLabel: 'Verifying…',
      errorNeed16Digits: 'The serial number must contain exactly 16 digits after LJC (four groups of 4 digits).',
      eligibleMessage:
        'Your product is eligible to be returned. Start the return procedure.',
      ineligibleMessage:
        'This product is not eligible to be returned. It may not have been purchased from us. If you need help with this product, please contact us.',
      startButton: 'Start',
      eligibilityCheckError: 'We could not verify the serial number. Check your connection and try again.',
    },
    accordionStepLockedHint: 'Complete the previous step first.',
    clientInfoForm: {
      title: 'Customer information',
      helper:
        'You are not signed in to your account. Please provide your details so we can process your return request.',
      lastName: 'Last name',
      firstName: 'First name',
      addressLegend: 'Address',
      street: 'Street and number',
      county: 'County / region',
      city: 'City',
      postal: 'Postal code',
      phone: 'Phone',
      email: 'Email',
      continue: 'Continue',
      fillRequired: 'Please complete all required fields.',
      invalidNames: 'First and last name may only contain letters (including diacritics), spaces, hyphens or apostrophes.',
      invalidPostal: 'The postal code must be exactly 6 digits.',
      invalidEmail: 'Please enter a valid email address (e.g. name@email.com).',
      placeholderLastName: 'e.g. Popescu',
      placeholderFirstName: 'e.g. Ana-Maria',
      placeholderStreet: 'e.g. 10 Example Street, building A',
      placeholderPostal: '000000',
      placeholderPhone: 'e.g. 0721234567',
      placeholderEmail: 'e.g. name@email.com',
      selectCountyPlaceholder: 'Select county',
      selectCityPlaceholder: 'Select city',
      selectCityNeedCounty: 'Select county first',
    },
    orderProductForm: {
      helper: 'Fill in the fields about your order and the product you are returning.',
      sectionOrder: 'Order details',
      sectionProduct: 'Product details',
      orderNumber: 'Order number',
      receiptDate: 'Receipt date',
      serialNumber: 'Serial number',
      brand: 'Product brand',
      model: 'Product model',
      placeholderOrderNumber: 'e.g. 2025-00123',
      orderNumberBtoHint: 'The BTO- prefix is added automatically; enter the rest of your order number.',
      placeholderDate: 'dd-mm-yyyy',
      placeholderSerial: 'e.g. 123456789',
      placeholderBrand: 'e.g. Lithtech',
      placeholderModel: 'e.g. model name',
      dateHint: 'For the receipt date, type digits in day–month–year order (dd-mm-yyyy); hyphens are inserted automatically.',
      fillRequired: 'Please complete all required fields.',
      invalidDate: 'Enter a valid date as dd-mm-yyyy (e.g. 05-11-2026).',
      receiptDateTooOld:
        'Returns are not available for this product because the receipt date is more than 15 days ago.',
      continue: 'Continue',
      serialNumberLjcHint: 'The LJC prefix is added automatically; enter the rest of the serial number.',
      selectBrandPlaceholder: 'Select brand',
      selectModelPlaceholder: 'Select model',
      loadingModelsCatalog: 'Loading model list…',
      modelsListError: 'Could not load the model list. Check your connection and try again.',
      modelsListRetry: 'Retry',
      modelsEmptyCatalog: 'No models are configured in the catalog. Please contact Baterino support.',
    },
    returnReasonForm: {
      helper: 'Choose a return reason. If you pick “Other reason”, describe it briefly in the field below.',
      withdrawal: 'Right of withdrawal (no specific reason)',
      defective: 'Defective product',
      notAsDescribed: 'Product not as described',
      damagedDelivery: 'Product damaged on delivery',
      other: 'Other reason (free text)',
      otherDetailsLabel: 'Describe your reason',
      placeholderOther: 'Briefly describe the situation…',
      fillRequired: 'Please select a return reason.',
      fillOtherRequired: 'Please enter a description for “Other reason”.',
      continue: 'Continue',
    },
    productConditionForm: {
      helper:
        'Tick the statements that apply to your product (at least one), then upload between 2 and 6 clear JPEG photos (.jpg or .jpeg): product, seals, packaging, accessories.',
      chkUninstalled: 'The product is not installed and not connected',
      chkSeals: 'Seals are intact',
      chkPackaging: 'Packaging and accessories are complete',
      photosSectionTitle: 'Photos',
      photosLabel: 'Upload between 2 and 6 JPEG photos (.jpg or .jpeg); at least two are required',
      addPhotos: 'Add photos',
      photoCount: '{count} / {max} photos (JPEG) — minimum {min}',
      fillCheckboxes: 'Please tick at least one statement about the product condition.',
      fillPhotosRange: 'Please upload between 2 and 6 JPEG photos (.jpg or .jpeg).',
      fillPhotosWrongType: 'Only .jpg or .jpeg (JPEG) files are allowed.',
      removePhotoAria: 'Remove photo',
      continue: 'Continue',
    },
    pickupAddressForm: {
      helper: 'The address where the courier can pick up the return parcel.',
      street: 'Street',
      county: 'County / region',
      city: 'City',
      postal: 'Postal code',
      placeholderStreet: 'e.g. 10 Example Street',
      placeholderPostal: '000000',
      selectCountyPlaceholder: 'Select county',
      selectCityPlaceholder: 'Select city',
      selectCityNeedCounty: 'Select county first',
      fillRequired: 'Please complete all required fields.',
      invalidPostal: 'The postal code must be exactly 6 digits.',
      continue: 'Continue',
    },
    refundMethodForm: {
      helper:
        'Enter the account holder name and IBAN for your bank transfer refund. The IBAN must be a valid Romanian IBAN.',
      accountHolder: 'Account holder',
      iban: 'IBAN',
      placeholderTitular: 'Name as on the bank contract / statement',
      placeholderIban: 'e.g. RO12 3456 7890 1234 5678 9012',
      fillRequired: 'Please complete all required fields.',
      invalidTitular: 'The account holder field contains invalid characters or is too short.',
      invalidIban: 'Invalid IBAN. For Romania use RO followed by 22 characters (24 in total).',
      continue: 'Continue',
    },
    returnDataSteps: [
      {
        title: 'Order and product details',
        orderProductForm: true,
      },
      {
        title: 'Return reason',
        returnReasonForm: true,
      },
      {
        title: 'Declaration on product condition',
        productConditionForm: true,
      },
      {
        title: 'Product collection address',
        pickupAddressForm: true,
      },
      {
        title: 'Refund method',
        refundMethodForm: true,
      },
    ],
    submitPanel: {
      chkPolicyPrefix: 'I confirm that I have reviewed the ',
      chkPolicyLinkLabel: 'Return policy',
      chkPolicySuffix: ' and accept it.',
      chkDeclaration:
        'I declare on my own responsibility that the information provided is correct.',
      submitButton: 'Submit request',
      submitSubmitting: 'Submitting…',
      fillRequired: 'Please check both confirmations before submitting.',
      submitSuccessWithId:
        'Your return request has been registered under reference **#{registrationNumber}**. We sent a confirmation email to the address you provided. We will contact you shortly with next steps.',
      submitErrorNetwork: 'Could not reach the server. Check your connection and try again.',
      submitErrorServer: 'We could not save your request. Please try again or contact us.',
    },
  },
  zh: {
    seoTitle: '退货说明 | Baterino',
    seoDesc: '省心退货：签收后15日内，依法及商业政策；详见退货政策。',
    pageTitle: '产品退货',
    introBody:
      '在 Baterino，退货省心省力。自收到商品之日起 **15 日内**，您可依法及我方的商业政策行使撤回权。',
    introTermsLead: '请查看',
    introTermsLinkLabel: '退货政策',
    timelineTitle: '退货办理流程',
    timelineSteps: [
      {
        title: '提交申请',
        description: '联系我们并提供订单信息；确认后我们将发送指引（含退货运送地址等，如适用）。',
      },
      {
        title: '寄回商品',
        description: '妥善包装后按指引通过快递寄回，并保留寄送凭证。',
      },
      {
        title: '收货与检验',
        description: '包裹到达后，我们将核对是否符合退货条件。',
      },
      {
        title: '退款',
        description: '验收无误后，我们将在法定期限内按原支付方式办理退款。',
      },
    ],
    returnDataHeading: '开始办理退货',
    serialVerifyGate: {
      intro: '请输入您要退货的商品序列号。',
      serialLabel: '序列号',
      verifyButton: '验证',
      verifyingLabel: '正在验证…',
      errorNeed16Digits: '序列号在 LJC 之后必须恰好为 16 位数字（四组，每组 4 位）。',
      eligibleMessage: '您的商品符合退货条件。请开始办理退货流程。',
      ineligibleMessage:
        '该商品不符合在线退货条件，可能并非向我方购买。如需协助，请联系我们。',
      startButton: '开始',
      eligibilityCheckError: '无法验证序列号，请检查网络后重试。',
    },
    accordionStepLockedHint: '请先完成上一步。',
    clientInfoForm: {
      title: '客户信息',
      helper: '您尚未登录账户。请填写以下信息以便我们处理退货申请。',
      lastName: '姓',
      firstName: '名',
      addressLegend: '地址',
      street: '街道与门牌',
      county: '省/州/县',
      city: '城市',
      postal: '邮编',
      phone: '电话',
      email: '电子邮箱',
      continue: '继续',
      fillRequired: '请填写所有必填项。',
      invalidNames: '姓名仅可包含字母（含变音符号）、空格、连字符或撇号。',
      invalidPostal: '邮编须为 6 位数字。',
      invalidEmail: '请输入有效的电子邮箱地址（如 name@email.com）。',
      placeholderLastName: '如：Wang',
      placeholderFirstName: '如：Wei',
      placeholderStreet: '如：某某路 10 号',
      placeholderPostal: '000000',
      placeholderPhone: '如：0712345678',
      placeholderEmail: '如：name@email.com',
      selectCountyPlaceholder: '选择县/省',
      selectCityPlaceholder: '选择城市',
      selectCityNeedCounty: '请先选择县/省',
    },
    orderProductForm: {
      helper: '请填写订单信息及要退回的商品信息。',
      sectionOrder: '订单信息',
      sectionProduct: '商品信息',
      orderNumber: '订单号',
      receiptDate: '签收 / 收货日期',
      serialNumber: '序列号',
      brand: '品牌',
      model: '型号',
      placeholderOrderNumber: '如：2025-00123',
      orderNumberBtoHint: '「BTO-」前缀已自动添加；请填写订单号其余部分。',
      placeholderDate: '日-月-年',
      placeholderSerial: '如：123456789',
      placeholderBrand: '如：Lithtech',
      placeholderModel: '如：具体型号',
      dateHint: '收货日期：按日、月、年顺序输入数字，连字符会自动插入。',
      fillRequired: '请填写所有必填项。',
      invalidDate: '请输入有效日期，格式 日-月-年（如 05-11-2026）。',
      receiptDateTooOld: '签收日期已超过 15 天，本产品无法在线办理退货。',
      continue: '继续',
      serialNumberLjcHint: '「LJC」前缀已自动添加；请填写序列号其余部分。',
      selectBrandPlaceholder: '选择品牌',
      selectModelPlaceholder: '选择型号',
      loadingModelsCatalog: '正在加载型号列表…',
      modelsListError: '无法加载型号列表，请检查网络后重试。',
      modelsListRetry: '重试',
      modelsEmptyCatalog: '目录中暂无型号配置，请联系 Baterino 支持。',
    },
    returnReasonForm: {
      helper: '请选择退货原因。若选「其他原因」，请在下方填写说明。',
      withdrawal: '依法撤回（无理由）',
      defective: '商品缺陷',
      notAsDescribed: '与描述不符',
      damagedDelivery: '运输途中损坏',
      other: '其他原因（自由填写）',
      otherDetailsLabel: '原因说明',
      placeholderOther: '请简要说明…',
      fillRequired: '请选择一个退货原因。',
      fillOtherRequired: '选择「其他原因」时，请填写说明。',
      continue: '继续',
    },
    productConditionForm: {
      helper:
        '请勾选适用于您商品的声明（至少一项），并上传 2 至 6 张清晰的 JPEG 照片（.jpg 或 .jpeg）：商品、封条、包装与配件。',
      chkUninstalled: '产品未安装、未通电连接',
      chkSeals: '封条完好',
      chkPackaging: '包装与配件齐全',
      photosSectionTitle: '照片',
      photosLabel: '请上传 2 至 6 张 JPEG 照片（.jpg 或 .jpeg）；至少 2 张为必填',
      addPhotos: '添加照片',
      photoCount: '{count} / {max} 张（JPEG），最少 {min} 张',
      fillCheckboxes: '请至少勾选一项与商品状态相关的声明。',
      fillPhotosRange: '请上传 2 至 6 张 JPEG 照片（.jpg 或 .jpeg）。',
      fillPhotosWrongType: '仅支持 .jpg 或 .jpeg（JPEG）文件。',
      removePhotoAria: '删除此照片',
      continue: '继续',
    },
    pickupAddressForm: {
      helper: '快递员上门取件取回退货包裹的地址。',
      street: '街道',
      county: '县/省',
      city: '城市',
      postal: '邮编',
      placeholderStreet: '如：某某路 10 号',
      placeholderPostal: '000000',
      selectCountyPlaceholder: '选择县/省',
      selectCityPlaceholder: '选择城市',
      selectCityNeedCounty: '请先选择县/省',
      fillRequired: '请填写所有必填项。',
      invalidPostal: '邮编须为 6 位数字。',
      continue: '继续',
    },
    refundMethodForm: {
      helper: '请填写账户持有人姓名与 IBAN，以便银行转账退款。IBAN 须为有效的罗马尼亚格式。',
      accountHolder: '账户持有人',
      iban: 'IBAN',
      placeholderTitular: '与银行开户名一致',
      placeholderIban: '如：RO12 3456 7890 1234 5678 9012',
      fillRequired: '请填写所有必填项。',
      invalidTitular: '账户持有人信息含不允许的字符或过短。',
      invalidIban: 'IBAN 无效。罗马尼亚为 RO 后跟 22 位（共 24 位）。',
      continue: '继续',
    },
    returnDataSteps: [
      {
        title: '订单与商品详情',
        orderProductForm: true,
      },
      {
        title: '退货原因',
        returnReasonForm: true,
      },
      {
        title: '商品状态声明',
        productConditionForm: true,
      },
      {
        title: '取件地址',
        pickupAddressForm: true,
      },
      {
        title: '退款方式',
        refundMethodForm: true,
      },
    ],
    submitPanel: {
      chkPolicyPrefix: '本人已查阅',
      chkPolicyLinkLabel: '退货政策',
      chkPolicySuffix: '的全部条件并予以接受。',
      chkDeclaration: '本人声明对所提供信息的真实性负责。',
      submitButton: '提交申请',
      submitSubmitting: '提交中…',
      fillRequired: '提交前请勾选两项确认。',
      submitSuccessWithId:
        '您的退货申请已登记，受理编号为 **#{registrationNumber}**。我们已向您填写的邮箱发送确认邮件，并将尽快与您联系说明后续步骤。',
      submitErrorNetwork: '无法连接服务器，请检查网络后重试。',
      submitErrorServer: '未能保存申请，请稍后重试或联系我们。',
    },
  },
}

export function getReturnareProduseTranslations(lang: LangCode): ReturnareProduseTranslations {
  return translations[lang] ?? translations.ro
}
