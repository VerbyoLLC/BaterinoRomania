import type { LangCode } from './menu'

export type TermeniProgrameReducereBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'h3'; text: string }

export type TermeniProgrameReducereSection = {
  title: string
  blocks: TermeniProgrameReducereBlock[]
}

export type TermeniProgrameReducereTranslations = {
  seoTitle: string
  seoDesc: string
  pageTitle: string
  intro: string
  tocTitle: string
  lastUpdated: string
  sections: TermeniProgrameReducereSection[]
  disclaimer: string
}

const translations: Record<LangCode, TermeniProgrameReducereTranslations> = {
  ro: {
    seoTitle: 'Termeni și Condiții – Programe de Reducere – Baterino România',
    seoDesc:
      'Termenii și condițiile pentru programele de reducere Baterino: TVA 9%, Energie pentru părinți, Știu de la vecinu, Viața la țară.',
    pageTitle: 'Termeni și Condiții — Programele de Reducere Baterino',
    intro:
      'Acești termeni reglementează acordarea și aplicarea reducerilor comerciale Baterino. Beneficierea oricărei reduceri necesită cont activ, o singură reducere per produs, fără cumulare între programe.',
    tocTitle: 'Cuprins',
    lastUpdated: 'Ultima actualizare: 25 iunie 2026',
    sections: [
      {
        title: '1. Dispoziții generale',
        blocks: [
          {
            kind: 'p',
            text: `**1.1.** Prezentul document stabilește termenii și condițiile în care se acordă reducerile comerciale (denumite în continuare „**Reducerile**" sau, individual, „**Reducerea**") oferite de **Baterino Energy SRL**, CUI 42707733, cu sediul în Str. 23 August Nr. 244-43A, Camera 1, Oraș Otopeni, Jud. Ilfov (denumită în continuare „**Baterino**"), în cadrul programelor sale promoționale.`,
          },
          {
            kind: 'p',
            text: '**1.2.** Reducerile fac parte integrantă din Termenii și Condițiile generale ale Baterino. În măsura în care prezentul document conține prevederi specifice privind Reducerile, acestea prevalează față de prevederile generale, exclusiv cu privire la acordarea și aplicarea Reducerilor.',
          },
          {
            kind: 'p',
            text: '**1.3.** Prin plasarea unei comenzi care include o Reducere, Clientul declară că a citit, a înțeles și acceptă în integralitate prezentii termeni.',
          },
        ],
      },
      {
        title: '2. Cine acordă și aplică Reducerile',
        blocks: [
          {
            kind: 'p',
            text: '**2.1.** Reducerile sunt acordate, validate și aplicate **exclusiv de Baterino**. Niciun partener, distribuitor, agent sau terț nu este autorizat să acorde, să promită, să modifice sau să interpreteze o Reducere fără acordul scris prealabil al Baterino.',
          },
          {
            kind: 'p',
            text: '**2.2.** Reducerea este aplicată de Baterino la momentul emiterii ofertei, a facturii proforme sau a facturii fiscale și se reflectă în prețul final comunicat Clientului. O reducere comunicată verbal sau informal, fără a fi inclusă în oferta/proforma/factura emisă de Baterino, nu produce efecte.',
          },
          {
            kind: 'p',
            text: '**2.3.** Baterino își rezervă dreptul de a verifica eligibilitatea Clientului și de a solicita documentele justificative prevăzute pentru fiecare program **înainte** de aplicarea Reducerii.',
          },
        ],
      },
      {
        title: '3. Reguli generale de aplicare',
        blocks: [
          {
            kind: 'p',
            text: 'Următoarele reguli se aplică tuturor programelor de reducere, indiferent de programul în cadrul căruia este acordată Reducerea.',
          },
          {
            kind: 'p',
            text: '**3.1. Cont activ obligatoriu.** Beneficierea de orice Reducere este condiționată de existența unui **cont de utilizator activ** al Clientului în platforma baterino.ro, înregistrat și valid la momentul plasării comenzii. Reducerea se acordă exclusiv comenzilor asociate unui astfel de cont. Clienții fără cont activ nu beneficiază de Reduceri.',
          },
          {
            kind: 'p',
            text: '**3.2. O singură Reducere per produs.** Fiecărui produs i se poate aplica **o singură Reducere**. Reducerea se calculează și se aplică la nivel de produs, individual.',
          },
          {
            kind: 'p',
            text: '**3.3. Reducerile nu se cumulează.** O Reducere **nu poate fi combinată sau cumulată** cu nicio altă Reducere, ofertă, campanie, voucher sau cod promoțional aplicabil aceluiași produs. Este exclusă aplicarea simultană a două sau mai multe reduceri asupra aceluiași produs.',
          },
          {
            kind: 'p',
            text: '**3.4. Eligibilitate multiplă.** În cazul în care un Client îndeplinește condițiile pentru mai multe programe în același timp, se aplică **o singură Reducere**, respectiv cea mai avantajoasă pentru Client, dacă acesta nu optează expres pentru alta. Programele rămase nu se adaugă.',
          },
          {
            kind: 'p',
            text: '**3.5. Baza de calcul.** Reducerile se calculează din **prețul cu TVA** (prețul final afișat) al produsului, dacă în descrierea programului nu se prevede expres altfel.',
          },
          {
            kind: 'p',
            text: '**3.6. Dovada eligibilității.** Anumite programe sunt condiționate de prezentarea unor documente justificative (de exemplu: dovada pensionării, actul de identitate care atestă domiciliul, codul de recomandare al unui client existent). Baterino poate refuza acordarea Reducerii dacă eligibilitatea nu este dovedită cu documente valabile.',
          },
          {
            kind: 'p',
            text: '**3.7. Aplicare prospectivă.** Reducerile se aplică exclusiv comenzilor noi, la momentul emiterii ofertei/facturii. Reducerile **nu se aplică retroactiv** comenzilor deja confirmate, facturate sau finalizate.',
          },
          {
            kind: 'p',
            text: '**3.8. Caracter netransmisibil.** Reducerea este personală, se acordă în considerarea calității Clientului beneficiar și nu poate fi cedată unei alte persoane, cu excepția codului de recomandare descris la pct. 4.3.',
          },
        ],
      },
      {
        title: '4. Programele de reducere',
        blocks: [
          { kind: 'h3', text: `4.1. Programul „TVA-ul de 9%" — 12% reducere` },
          {
            kind: 'ul',
            items: [
              '**Cui se adresează:** tuturor clienților Baterino.',
              '**Reducere:** 12% din prețul cu TVA, la orice produs.',
              '**Condiții:** nu necesită documente justificative.',
            ],
          },
          { kind: 'h3', text: `4.2. Programul „Energie pentru părinți" — 15% reducere pentru pensionari` },
          {
            kind: 'ul',
            items: [
              '**Cui se adresează:** persoanelor aflate la pensie.',
              '**Reducere:** 15% din prețul cu TVA, la orice produs Baterino.',
              '**Condiții:** Clientul trebuie să facă **dovada pensionării** (de exemplu: cupon de pensie sau decizie de pensionare) și să fie **beneficiarul produsului** — factura se emite pe numele său.',
            ],
          },
          { kind: 'h3', text: `4.3. Programul „Știu de la vecinu'" — 5% reducere` },
          {
            kind: 'ul',
            items: [
              '**Cui se adresează:** clienților **noi** care folosesc un cod de recomandare oferit de un client existent.',
              '**Reducere:** 5%.',
              '**Condiții:** codul de recomandare este disponibil în contul fiecărui client Baterino și poate fi oferit unui client nou. Reducerea se aplică la **prima comandă** a clientului nou.',
            ],
          },
          { kind: 'h3', text: `4.4. Programul „Viața la țară" — 7% reducere` },
          {
            kind: 'ul',
            items: [
              '**Cui se adresează:** persoanelor cu domiciliul în mediul rural (comună sau sat).',
              '**Reducere:** 7% din prețul cu TVA.',
              '**Condiții:** factura trebuie emisă pe numele **beneficiarului final**, iar în actul de identitate al acestuia domiciliul trebuie să fie într-o comună sau sat.',
            ],
          },
        ],
      },
      {
        title: '5. Excluderi și limitări',
        blocks: [
          {
            kind: 'p',
            text: '**5.1.** Dacă în descrierea programului nu se prevede altfel, Reducerile **nu se aplică** asupra: costurilor de transport, montaj, punere în funcțiune și a altor servicii conexe.',
          },
          {
            kind: 'p',
            text: '**5.2.** Reducerile **nu pot fi convertite în bani**, nu pot fi rambursate și nu pot fi acordate sub formă de credit ulterior achiziției.',
          },
          {
            kind: 'p',
            text: '**5.3.** O Reducere acordată în baza unor informații sau documente false, inexacte ori incomplete poate fi **anulată retroactiv**, iar Baterino poate factura diferența de preț corespunzătoare.',
          },
          {
            kind: 'p',
            text: '**5.4.** Reducerile se aplică sub rezerva disponibilității stocului și a confirmării comenzii de către Baterino.',
          },
        ],
      },
      {
        title: '6. Modificarea și încetarea programelor',
        blocks: [
          {
            kind: 'p',
            text: '**6.1.** Baterino își rezervă dreptul de a modifica, suspenda sau înceta oricare dintre programele de reducere, în orice moment, fără notificare prealabilă.',
          },
          {
            kind: 'p',
            text: '**6.2.** Comenzile deja confirmate sau facturate înainte de modificarea/încetarea unui program **nu sunt afectate** și beneficiază de Reducerea aplicată la momentul confirmării.',
          },
        ],
      },
      {
        title: '7. Dispoziții finale',
        blocks: [
          {
            kind: 'p',
            text: '**7.1.** Prezentii termeni sunt guvernați de legea română. Orice litigiu se soluționează pe cale amiabilă sau, în lipsă, de instanțele competente de la sediul Baterino, fără a aduce atingere drepturilor consumatorului prevăzute de legislația în vigoare.',
          },
          {
            kind: 'p',
            text: '**7.2.** Pentru întrebări privind programele de reducere, Clientul poate contacta Baterino la: contact@baterino.ro sau la numerele de telefon afișate pe pagina Contact.',
          },
        ],
      },
    ],
    disclaimer:
      'Acest document are caracter informativ și comercial. Drepturile consumatorilor prevăzute de OUG 34/2014 și de celelalte dispoziții legale aplicabile rămân neafectate.',
  },
  en: {
    seoTitle: 'Terms and Conditions – Discount Programs – Baterino Romania',
    seoDesc:
      'Terms and conditions for Baterino discount programs: 9% VAT, Energy for parents, Word from the neighbour, Country life.',
    pageTitle: 'Terms and Conditions — Baterino Discount Programs',
    intro:
      'These terms govern how Baterino commercial discounts are granted and applied. Any discount requires an active account, one discount per product, and no stacking between programs.',
    tocTitle: 'Table of contents',
    lastUpdated: 'Last updated: 25 June 2026',
    sections: [
      {
        title: '1. General provisions',
        blocks: [
          {
            kind: 'p',
            text: `**1.1.** This document sets out the terms and conditions under which commercial discounts (hereinafter "**Discounts**" or, individually, "**Discount**") offered by **Baterino Energy SRL**, Tax ID 42707733, headquartered at Str. 23 August Nr. 244-43A, Camera 1, Otopeni, Ilfov County (hereinafter "**Baterino**"), are granted within its promotional programs.`,
          },
          {
            kind: 'p',
            text: '**1.2.** Discounts form an integral part of Baterino\'s general Terms and Conditions. Where this document contains specific provisions regarding Discounts, those provisions prevail over the general terms, solely with respect to granting and applying Discounts.',
          },
          {
            kind: 'p',
            text: '**1.3.** By placing an order that includes a Discount, the Customer declares that they have read, understood and fully accept these terms.',
          },
        ],
      },
      {
        title: '2. Who grants and applies Discounts',
        blocks: [
          {
            kind: 'p',
            text: '**2.1.** Discounts are granted, validated and applied **exclusively by Baterino**. No partner, distributor, agent or third party is authorised to grant, promise, modify or interpret a Discount without Baterino\'s prior written consent.',
          },
          {
            kind: 'p',
            text: '**2.2.** The Discount is applied by Baterino when issuing the quote, proforma invoice or tax invoice and is reflected in the final price communicated to the Customer. A discount communicated verbally or informally, without being included in the quote/proforma/invoice issued by Baterino, has no effect.',
          },
          {
            kind: 'p',
            text: '**2.3.** Baterino reserves the right to verify the Customer\'s eligibility and to request supporting documents required for each program **before** applying the Discount.',
          },
        ],
      },
      {
        title: '3. General application rules',
        blocks: [
          {
            kind: 'p',
            text: 'The following rules apply to all discount programs, regardless of the program under which the Discount is granted.',
          },
          {
            kind: 'p',
            text: '**3.1. Active account required.** Benefiting from any Discount is conditional on the Customer having an **active user account** on the baterino.ro platform, registered and valid at the time the order is placed. The Discount applies exclusively to orders linked to such an account. Customers without an active account are not eligible for Discounts.',
          },
          {
            kind: 'p',
            text: '**3.2. One Discount per product.** Each product may have **only one Discount** applied. The Discount is calculated and applied at product level, individually.',
          },
          {
            kind: 'p',
            text: '**3.3. Discounts are not cumulative.** A Discount **may not be combined or stacked** with any other Discount, offer, campaign, voucher or promotional code applicable to the same product. Simultaneous application of two or more discounts on the same product is excluded.',
          },
          {
            kind: 'p',
            text: '**3.4. Multiple eligibility.** If a Customer meets the conditions for more than one program at the same time, **only one Discount** applies — the most advantageous for the Customer, unless they expressly choose another. Remaining programs are not added.',
          },
          {
            kind: 'p',
            text: '**3.5. Calculation basis.** Discounts are calculated from the **VAT-inclusive price** (final displayed price) of the product, unless the program description expressly provides otherwise.',
          },
          {
            kind: 'p',
            text: '**3.6. Proof of eligibility.** Certain programs require supporting documents (e.g. proof of retirement, ID showing domicile, referral code from an existing customer). Baterino may refuse to grant the Discount if eligibility is not proven with valid documents.',
          },
          {
            kind: 'p',
            text: '**3.7. Prospective application.** Discounts apply exclusively to new orders, at the time the quote/invoice is issued. Discounts **do not apply retroactively** to orders already confirmed, invoiced or completed.',
          },
          {
            kind: 'p',
            text: '**3.8. Non-transferable nature.** The Discount is personal, granted in consideration of the beneficiary Customer\'s status, and may not be assigned to another person, except for the referral code described in section 4.3.',
          },
        ],
      },
      {
        title: '4. Discount programs',
        blocks: [
          { kind: 'h3', text: `4.1. "9% VAT" program — 12% discount` },
          {
            kind: 'ul',
            items: [
              '**Who it is for:** all Baterino customers.',
              '**Discount:** 12% of the VAT-inclusive price, on any product.',
              '**Conditions:** no supporting documents required.',
            ],
          },
          { kind: 'h3', text: `4.2. "Energy for parents" program — 15% discount for retirees` },
          {
            kind: 'ul',
            items: [
              '**Who it is for:** persons receiving a pension.',
              '**Discount:** 15% of the VAT-inclusive price, on any Baterino product.',
              '**Conditions:** the Customer must **prove retirement status** (e.g. pension slip or retirement decision) and be the **product beneficiary** — the invoice is issued in their name.',
            ],
          },
          { kind: 'h3', text: `4.3. "Word from the neighbour" program — 5% discount` },
          {
            kind: 'ul',
            items: [
              '**Who it is for:** **new** customers using a referral code provided by an existing customer.',
              '**Discount:** 5%.',
              '**Conditions:** the referral code is available in each Baterino customer account and may be given to a new customer. The Discount applies to the new customer\'s **first order**.',
            ],
          },
          { kind: 'h3', text: `4.4. "Country life" program — 7% discount` },
          {
            kind: 'ul',
            items: [
              '**Who it is for:** persons domiciled in rural areas (commune or village).',
              '**Discount:** 7% of the VAT-inclusive price.',
              '**Conditions:** the invoice must be issued in the name of the **final beneficiary**, and their ID must show domicile in a commune or village.',
            ],
          },
        ],
      },
      {
        title: '5. Exclusions and limitations',
        blocks: [
          {
            kind: 'p',
            text: '**5.1.** Unless otherwise stated in the program description, Discounts **do not apply** to: shipping costs, installation, commissioning and other related services.',
          },
          {
            kind: 'p',
            text: '**5.2.** Discounts **cannot be converted to cash**, refunded or granted as credit after purchase.',
          },
          {
            kind: 'p',
            text: '**5.3.** A Discount granted based on false, inaccurate or incomplete information or documents may be **cancelled retroactively**, and Baterino may invoice the corresponding price difference.',
          },
          {
            kind: 'p',
            text: '**5.4.** Discounts apply subject to stock availability and order confirmation by Baterino.',
          },
        ],
      },
      {
        title: '6. Modification and termination of programs',
        blocks: [
          {
            kind: 'p',
            text: '**6.1.** Baterino reserves the right to modify, suspend or terminate any discount program at any time, without prior notice.',
          },
          {
            kind: 'p',
            text: '**6.2.** Orders already confirmed or invoiced before modification/termination of a program **are not affected** and benefit from the Discount applied at confirmation.',
          },
        ],
      },
      {
        title: '7. Final provisions',
        blocks: [
          {
            kind: 'p',
            text: '**7.1.** These terms are governed by Romanian law. Any dispute shall be resolved amicably or, failing that, by the competent courts at Baterino\'s registered office, without prejudice to consumer rights under applicable legislation.',
          },
          {
            kind: 'p',
            text: '**7.2.** For questions about discount programs, the Customer may contact Baterino at: contact@baterino.ro or at the phone numbers shown on the Contact page.',
          },
        ],
      },
    ],
    disclaimer:
      'This document is for information and commercial purposes. Consumer rights under Government Emergency Ordinance 34/2014 and other applicable legal provisions remain unaffected.',
  },
}

export function getTermeniProgrameReducereTranslations(lang: LangCode): TermeniProgrameReducereTranslations {
  return translations[lang] ?? translations.ro
}
