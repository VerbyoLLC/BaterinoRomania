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
}

export function getReturnareProduseTranslations(lang: LangCode): ReturnareProduseTranslations {
  return translations[lang] ?? translations.ro
}
