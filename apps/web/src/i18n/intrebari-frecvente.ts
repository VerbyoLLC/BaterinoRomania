import type { LangCode } from './menu'

export type FaqItem = { q: string; a: string }

export type FaqSection = {
  id: string
  title: string
  items: FaqItem[]
}

export type IntrebariFrecventeTranslations = {
  pageTitle: string
  pageDescription: string
  heroSubtitle: string
  searchPlaceholder: string
  noResults: string
  contactCta: string
  contactLink: string
  sections: FaqSection[]
}

const translations: Record<LangCode, IntrebariFrecventeTranslations> = {
  ro: {
    pageTitle: 'Întrebări frecvente',
    pageDescription:
      'Răspunsuri la cele mai frecvente întrebări despre produsele Baterino, comenzi, garanție, retururi și programul de parteneri.',
    heroSubtitle: 'Găsește rapid răspunsuri despre produse, comenzi, garanție și parteneriat.',
    searchPlaceholder: 'Caută o întrebare…',
    noResults: 'Niciun rezultat pentru căutarea ta. Încearcă alte cuvinte sau contactează-ne.',
    contactCta: 'Nu găsești răspunsul? Scrie-ne la',
    contactLink: 'pagina de contact',
    sections: [
      {
        id: 'general',
        title: 'Despre Baterino',
        items: [
          {
            q: 'Ce este Baterino România?',
            a: 'Baterino România este distribuitorul oficial de sisteme de stocare a energiei (baterii LiFePO₄) pentru segmentele rezidențial, industrial, medical și maritim. Oferim produse testate, suport local și garanție extinsă.',
          },
          {
            q: 'Unde pot vedea produsele disponibile?',
            a: 'Catalogul complet este pe pagina Produse, iar soluțiile sunt organizate pe divizii: rezidențial, industrial, medical și maritim. Pentru proiecte complexe, echipa noastră comercială te poate ajuta cu o ofertă personalizată.',
          },
          {
            q: 'Pot cumpăra direct de pe site?',
            a: 'Da. Clienții rezidențiali pot comanda online; partenerii (instalatori, distribuitori) au acces la prețuri și condiții dedicate în panoul de partener. Poți plasa o comandă ca invitat sau cu cont client.',
          },
        ],
      },
      {
        id: 'orders',
        title: 'Comenzi și livrare',
        items: [
          {
            q: 'Cum urmăresc statusul comenzii?',
            a: 'Dacă ai cont client, comenzile apar în secțiunea Comenzi din panoul tău. Vei primi actualizări pe email la schimbarea statusului (de plătit, în pregătire, livrată etc.).',
          },
          {
            q: 'Care sunt termenele de livrare?',
            a: 'Termenele depind de produs și stoc. Echipa comercială confirmă data estimată la plasarea comenzii. Pentru proiecte urgente, contactează-ne înainte de comandă.',
          },
          {
            q: 'Pot modifica sau anula o comandă?',
            a: 'Comenzile în status „de plătit” pot fi modificate sau anulate contactând suportul cât mai repede. După trecerea în pregătire sau livrare, modificările depind de stadiul procesării.',
          },
        ],
      },
      {
        id: 'warranty',
        title: 'Garanție și service',
        items: [
          {
            q: 'Cum verific garanția unui produs?',
            a: 'Folosește pagina Verificare garanție și introdu numărul de serie (SN) de pe eticheta bateriei sau codul QR de pe certificatul de garanție.',
          },
          {
            q: 'Cum obțin certificatul de garanție?',
            a: 'Dacă ai cumpărat o baterie LithTech direct de la noi sau de la unul din distribuitorii noștri, tot ce trebuie să faci este să îți creezi un cont pe platforma baterino.ro, să mergi la secțiunea „Produsele mele”, să înregistrezi produsul (scanând codul QR de pe baterie sau introducând manual numărul de serie). Odată ce produsul a fost înregistrat în contul tău, poți genera certificatul de garanție. Nu uita să îți completezi profilul cu datele reale înainte de a genera certificatul de garanție.',
          },
          {
            q: 'Care este perioada de garanție?',
            a: 'Perioada exactă depinde de model și este menționată în documentația produsului și pe certificatul de garanție. Multe produse Baterino beneficiază de garanție extinsă de până la 10 ani.',
          },
          {
            q: 'Ce fac dacă am o problemă tehnică?',
            a: 'Deschide o cerere de service din contul tău (client sau partener) sau contactează suportul. Pentru defecțiuni acoperite de garanție, echipa noastră te ghidează prin pașii de diagnostic și, dacă e cazul, prin procedura SWAP.',
          },
          {
            q: 'Ce acoperă garanția? Capacitate reziduală sau doar defecte?',
            a: 'Garanția acoperă atât defecte de fabricație, cât și degradarea capacității sub pragul declarat în certificatul de garanție și documentația modelului (SOH / capacitate reziduală), în condițiile de utilizare și instalare prevăzute de producător. Detaliile exacte — perioadă, praguri și excluderi — sunt pe certificatul de garanție și în fișa tehnică a produsului.',
          },
          {
            q: 'Cum fac o reclamație dacă bateria nu mai ține capacitatea promisă?',
            a: 'Contactează suportul Baterino cu numărul de serie (SN), data instalării și, dacă există, raportul de la invertor/BMS. Echipa noastră verifică eligibilitatea în garanție, poate solicita măsurători suplimentare și deschide dosar de service. Dacă situația este confirmată, urmează procedura de remediere sau înlocuire (inclusiv SWAP, unde este aplicabil).',
          },
          {
            q: 'Cine face service-ul după instalare?',
            a: 'Primul punct de contact este Baterino România: suport tehnic, diagnostic la distanță și coordonarea intervenției. Pentru parteneri autorizați, cererile pot fi gestionate și prin panoul de partener. Intervențiile la fața locului sunt realizate de rețeaua noastră de parteneri instalați sau de echipe desemnate de Baterino, în funcție de tipul problemei și de locație.',
          },
          {
            q: 'Ce se întâmplă dacă producătorul chinez dispare de pe piață?',
            a: 'Baterino acționează ca distribuitor local cu stoc de piese de schimb, documentație și suport în România. Garanția comercială este onorată prin entitatea locală și parteneriatele noastre (inclusiv cu producători și centre de testare), nu depinde exclusiv de prezența directă a fabricii în țară. Pentru modelele din portofoliu, menținem trasabilitatea prin SN și certificat de garanție emis la livrare.',
          },
        ],
      },
      {
        id: 'returns',
        title: 'Retururi',
        items: [
          {
            q: 'Pot returna un produs?',
            a: 'Da, conform legislației și termenilor noștri. Procedura completă este descrisă pe pagina Returnare produse, unde poți iniția o cerere de retur online.',
          },
          {
            q: 'În cât timp pot solicita returul?',
            a: 'Pentru retragere din contract (fără motiv), termenul legal este de 14 zile de la primire. Pentru produse defecte sau livrate greșit, termenele și condițiile sunt detaliate în formularul de retur.',
          },
        ],
      },
      {
        id: 'partners',
        title: 'Parteneri și instalatori',
        items: [
          {
            q: 'Cum devin partener Baterino?',
            a: 'Accesează pagina Instalatori și completează formularul de înscriere. După finalizare, intri direct în panoul de partener pentru alocarea prețului și semnarea contractului.',
          },
          {
            q: 'Ce beneficii au partenerii?',
            a: 'Partenerii au acces la prețuri dedicate, resurse tehnice, suport comercial, profil public pe platformă și instrumente pentru comenzi și service.',
          },
          {
            q: 'Există programe de reducere pentru clienți finali?',
            a: 'Da. Clienții pot beneficia de programe promoționale și coduri de reducere, în funcție de campaniile active. Detaliile sunt pe pagina Reduceri și în contul client.',
          },
        ],
      },
      {
        id: 'account',
        title: 'Cont și date personale',
        items: [
          {
            q: 'Cum îmi creez un cont client?',
            a: 'Din pagina de autentificare, alege înregistrarea pentru clienți și confirmă adresa de email. Poți folosi și cont Google, dacă este activat.',
          },
          {
            q: 'Unde găsesc politica de confidențialitate?',
            a: 'Politica de confidențialitate descrie cum prelucrăm datele tale și este disponibilă în footer, la linkul Politica de confidențialitate.',
          },
          {
            q: 'Cum vă contactez pentru alte întrebări?',
            a: 'Ne poți scrie prin formularul de contact, email la suport@baterino.ro sau telefon/WhatsApp — datele sunt pe pagina Contact.',
          },
        ],
      },
    ],
  },
  en: {
    pageTitle: 'Frequently asked questions',
    pageDescription:
      'Answers to common questions about Baterino products, orders, warranty, returns, and the partner program.',
    heroSubtitle: 'Quick answers about products, orders, warranty, and partnership.',
    searchPlaceholder: 'Search a question…',
    noResults: 'No results for your search. Try different keywords or contact us.',
    contactCta: "Can't find your answer? Reach us via the",
    contactLink: 'contact page',
    sections: [
      {
        id: 'general',
        title: 'About Baterino',
        items: [
          {
            q: 'What is Baterino Romania?',
            a: 'Baterino Romania is the official distributor of energy storage systems (LiFePO₄ batteries) for residential, industrial, medical, and maritime segments. We offer tested products, local support, and extended warranty.',
          },
          {
            q: 'Where can I see available products?',
            a: 'The full catalog is on the Products page, organized by division: residential, industrial, medical, and maritime. For complex projects, our sales team can prepare a tailored quote.',
          },
          {
            q: 'Can I buy directly on the website?',
            a: 'Yes. Residential customers can order online; partners (installers, distributors) have dedicated pricing and terms in the partner panel. You can checkout as a guest or with a client account.',
          },
        ],
      },
      {
        id: 'orders',
        title: 'Orders & delivery',
        items: [
          {
            q: 'How do I track my order?',
            a: 'If you have a client account, orders appear under Orders in your dashboard. You will receive email updates when the status changes (awaiting payment, in preparation, delivered, etc.).',
          },
          {
            q: 'What are the delivery times?',
            a: 'Lead times depend on product and stock. Our team confirms the estimated date when the order is placed. For urgent projects, contact us before ordering.',
          },
          {
            q: 'Can I change or cancel an order?',
            a: 'Orders in “awaiting payment” status can often be changed or cancelled by contacting support quickly. After preparation or shipment starts, changes depend on processing stage.',
          },
        ],
      },
      {
        id: 'warranty',
        title: 'Warranty & service',
        items: [
          {
            q: 'How do I check product warranty?',
            a: 'Use the Warranty check page and enter the serial number (SN) on the battery label or the QR code on the warranty certificate.',
          },
          {
            q: 'How do I get the warranty certificate?',
            a: 'If you bought a LithTech battery directly from us or from one of our distributors, create an account on baterino.ro, go to “My products”, and register the product (by scanning the QR code on the battery or entering the serial number manually). Once the product is registered in your account, you can generate the warranty certificate. Remember to complete your profile with accurate details before generating the certificate.',
          },
          {
            q: 'What is the warranty period?',
            a: 'The exact period depends on the model and is stated in product documentation and on the warranty certificate. Many Baterino products include extended warranty of up to 10 years.',
          },
          {
            q: 'What if I have a technical issue?',
            a: 'Open a service request from your account (client or partner) or contact support. For warranty-covered faults, our team guides you through diagnostics and, when applicable, the SWAP procedure.',
          },
          {
            q: 'What does the warranty cover? Residual capacity or defects only?',
            a: 'The warranty covers both manufacturing defects and capacity degradation below the threshold stated on the warranty certificate and model documentation (SOH / residual capacity), when the product is used and installed as specified. Exact terms — period, thresholds, and exclusions — are on the warranty certificate and product datasheet.',
          },
          {
            q: 'How do I file a claim if the battery no longer holds the promised capacity?',
            a: 'Contact Baterino support with the serial number (SN), installation date, and inverter/BMS report if available. Our team checks warranty eligibility, may request additional measurements, and opens a service case. If confirmed, remediation or replacement follows (including SWAP where applicable).',
          },
          {
            q: 'Who handles service after installation?',
            a: 'Your first point of contact is Baterino Romania: technical support, remote diagnostics, and coordination of the intervention. Authorized partners can also manage requests via the partner panel. On-site work is carried out by our installer network or teams appointed by Baterino, depending on the issue and location.',
          },
          {
            q: 'What happens if the Chinese manufacturer leaves the market?',
            a: 'Baterino acts as a local distributor with spare parts stock, documentation, and support in Romania. The commercial warranty is honored through the local entity and our partnerships (including manufacturers and testing centres), not solely on the factory having a direct presence in the country. For portfolio models, we maintain traceability via SN and the warranty certificate issued at delivery.',
          },
        ],
      },
      {
        id: 'returns',
        title: 'Returns',
        items: [
          {
            q: 'Can I return a product?',
            a: 'Yes, according to applicable law and our terms. The full process is on the Product returns page, where you can start an online return request.',
          },
          {
            q: 'How long do I have to request a return?',
            a: 'For withdrawal without reason, the legal period is 14 days from receipt. For defective or misdelivered products, deadlines and conditions are detailed in the return form.',
          },
        ],
      },
      {
        id: 'partners',
        title: 'Partners & installers',
        items: [
          {
            q: 'How do I become a Baterino partner?',
            a: 'Visit the Installers page and complete the registration form. When finished, you go straight to the partner panel for price allocation and contract signing.',
          },
          {
            q: 'What benefits do partners get?',
            a: 'Partners receive dedicated pricing, technical resources, sales support, a public profile on the platform, and tools for orders and service.',
          },
          {
            q: 'Are there discount programs for end customers?',
            a: 'Yes. Customers may benefit from promotional programs and discount codes depending on active campaigns. See the Discounts page and your client account.',
          },
        ],
      },
      {
        id: 'account',
        title: 'Account & privacy',
        items: [
          {
            q: 'How do I create a client account?',
            a: 'From the login page, choose client registration and confirm your email. Google sign-in may also be available.',
          },
          {
            q: 'Where is the privacy policy?',
            a: 'The privacy policy explains how we process your data and is linked in the site footer.',
          },
          {
            q: 'How can I contact you for other questions?',
            a: 'Use the contact form, email support@baterino.ro, or phone/WhatsApp — details are on the Contact page.',
          },
        ],
      },
    ],
  },
}

export function getIntrebariFrecventeTranslations(lang: LangCode): IntrebariFrecventeTranslations {
  return translations[lang] ?? translations.ro
}
