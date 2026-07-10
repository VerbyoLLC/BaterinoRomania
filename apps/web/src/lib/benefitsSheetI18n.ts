import type { CommercialOfferLanguage } from './commercialOfferDraft'

/** Textele foilor A4 „Beneficii” atașate ofertelor comerciale (client / partener). */

export type BenefitsSheetBenefit = {
  title: string
  desc: string
  tag: string
}

export type BenefitsSheetStrings = {
  docTitle: string
  docSub: string
  introEyebrow: string
  /** Titlul e „{introTitlePre}<span>Baterino</span>{introTitlePost}”. */
  introTitlePre: string
  introTitlePost: string
  introBody: string
  /** Exact 8, în ordinea iconițelor din foaie. */
  benefits: BenefitsSheetBenefit[]
  ctaTitle: string
  ctaSub: string
  footerCompanyLabel: string
  footerAddressLabel: string
  footerAddressTitle: string
}

const CLIENT: Record<CommercialOfferLanguage, BenefitsSheetStrings> = {
  ro: {
    docTitle: 'Beneficiile Clienților',
    docSub: 'De ce să alegi Baterino',
    introEyebrow: 'De ce să alegi Baterino',
    introTitlePre: 'Beneficiile de a fi client ',
    introTitlePost: '',
    introBody:
      'Mai mult decât o baterie — o relație pe termen lung. Cumperi o dată și ai acoperire completă, suport real și o echipă locală care răspunde mereu. Fiecare client Baterino beneficiază de servicii și garanții care nu se regăsesc la alți distribuitori.',
    benefits: [
      {
        title: 'Garanție oficială 10 ani',
        desc: 'Certificat oficial de garanție la fiecare produs. Piese și manoperă acoperite complet — verificabil oricând online.',
        tag: 'Cea mai bună garanție din România',
      },
      {
        title: 'Suport tehnic în România',
        desc: 'O echipă reală, în română, disponibilă 24/7. Indiferent că ai o întrebare sau o problemă — cineva îți răspunde imediat.',
        tag: '24/7 disponibil',
      },
      {
        title: 'Baterino SWAP',
        desc: 'Dacă bateria ta are o problemă în garanție, nu rămâi fără curent. Îți punem un echipament de schimb pe toată perioada reparației.',
        tag: 'Fără întreruperi',
      },
      {
        title: 'Retur în 15 zile',
        desc: 'Nu ești sigur? Testezi și dacă nu e ce te așteptai — returnezi în 15 zile, fără discuții complicate sau costuri ascunse.',
        tag: 'Fără stres',
      },
      {
        title: '99% compatibilitate invertoare',
        desc: 'Funcționează cu aproape orice invertor din România. Verifică marca ta pe baterino.ro — cel mai probabil ești deja acoperit.',
        tag: 'Verificat pre-livrare',
      },
      {
        title: 'Importatori oficiali LithTech',
        desc: 'Cumperi direct de la sursa autorizată. Fără intermediari, fără produse gri — trasabilitate completă de la fabrică până la tine.',
        tag: 'Produs autentic',
      },
      {
        title: 'Produse verificate înainte de livrare',
        desc: 'Fiecare baterie trece printr-un proces de verificare tehnică înainte să ajungă la tine. Zero surprize.',
        tag: 'Testat și certificat',
      },
      {
        title: 'Program de reduceri active',
        desc: 'Reduceri pentru seniori, zone rurale și recomandări între clienți. Înregistrează-te pe platformă pentru ofertele active.',
        tag: 'Economii suplimentare',
      },
    ],
    ctaTitle: 'Creează-ți un cont pe platforma Baterino',
    ctaSub:
      'Gestionezi garanțiile, comenzile și programele de reduceri — totul într-un singur loc, de pe orice dispozitiv.',
    footerCompanyLabel: 'Companie',
    footerAddressLabel: 'Adresă',
    footerAddressTitle: 'Adresa Baterino România',
  },
  en: {
    docTitle: 'Client Benefits',
    docSub: 'Why choose Baterino',
    introEyebrow: 'Why choose Baterino',
    introTitlePre: 'The benefits of being a ',
    introTitlePost: ' client',
    introBody:
      'More than a battery — a long-term relationship. You buy once and get full coverage, real support and a local team that always answers. Every Baterino client benefits from services and warranties you will not find at other distributors.',
    benefits: [
      {
        title: 'Official 10-year warranty',
        desc: 'An official warranty certificate with every product. Parts and labour fully covered — verifiable online at any time.',
        tag: 'The best warranty in Romania',
      },
      {
        title: 'Technical support in Romania',
        desc: 'A real local team, available 24/7. Whether you have a question or a problem — someone answers right away.',
        tag: 'Available 24/7',
      },
      {
        title: 'Baterino SWAP',
        desc: 'If your battery has a warranty issue, you are never left without power. We provide replacement equipment for the entire repair period.',
        tag: 'No interruptions',
      },
      {
        title: '15-day returns',
        desc: 'Not sure? Test it, and if it is not what you expected — return it within 15 days, with no complicated discussions or hidden costs.',
        tag: 'Stress-free',
      },
      {
        title: '99% inverter compatibility',
        desc: 'Works with almost any inverter in Romania. Check your brand on baterino.ro — you are most likely already covered.',
        tag: 'Verified before delivery',
      },
      {
        title: 'Official LithTech importers',
        desc: 'You buy directly from the authorized source. No intermediaries, no grey-market products — full traceability from the factory to you.',
        tag: 'Authentic product',
      },
      {
        title: 'Products verified before delivery',
        desc: 'Every battery goes through a technical inspection before it reaches you. Zero surprises.',
        tag: 'Tested and certified',
      },
      {
        title: 'Active discount programs',
        desc: 'Discounts for seniors, rural areas and client referrals. Register on the platform for the active offers.',
        tag: 'Extra savings',
      },
    ],
    ctaTitle: 'Create your account on the Baterino platform',
    ctaSub: 'Manage warranties, orders and discount programs — all in one place, from any device.',
    footerCompanyLabel: 'Company',
    footerAddressLabel: 'Address',
    footerAddressTitle: 'Baterino Romania address',
  },
  de: {
    docTitle: 'Kundenvorteile',
    docSub: 'Warum Baterino',
    introEyebrow: 'Warum Baterino',
    introTitlePre: 'Ihre Vorteile als ',
    introTitlePost: '-Kunde',
    introBody:
      'Mehr als eine Batterie — eine langfristige Beziehung. Sie kaufen einmal und erhalten volle Abdeckung, echten Support und ein lokales Team, das immer antwortet. Jeder Baterino-Kunde profitiert von Leistungen und Garantien, die es bei anderen Distributoren nicht gibt.',
    benefits: [
      {
        title: 'Offizielle 10-Jahres-Garantie',
        desc: 'Offizielles Garantiezertifikat für jedes Produkt. Teile und Arbeit vollständig abgedeckt — jederzeit online überprüfbar.',
        tag: 'Die beste Garantie in Rumänien',
      },
      {
        title: 'Technischer Support in Rumänien',
        desc: 'Ein echtes lokales Team, rund um die Uhr erreichbar. Ob Frage oder Problem — Sie erhalten sofort eine Antwort.',
        tag: '24/7 erreichbar',
      },
      {
        title: 'Baterino SWAP',
        desc: 'Bei einem Garantiefall bleiben Sie nie ohne Strom. Wir stellen Ihnen für die gesamte Reparaturdauer ein Ersatzgerät zur Verfügung.',
        tag: 'Ohne Unterbrechungen',
      },
      {
        title: 'Rückgabe innerhalb von 15 Tagen',
        desc: 'Nicht sicher? Testen Sie das Produkt — und wenn es nicht Ihren Erwartungen entspricht, geben Sie es innerhalb von 15 Tagen zurück. Ohne komplizierte Diskussionen oder versteckte Kosten.',
        tag: 'Stressfrei',
      },
      {
        title: '99 % Wechselrichter-Kompatibilität',
        desc: 'Funktioniert mit nahezu jedem Wechselrichter in Rumänien. Prüfen Sie Ihre Marke auf baterino.ro — höchstwahrscheinlich sind Sie bereits abgedeckt.',
        tag: 'Vor Lieferung geprüft',
      },
      {
        title: 'Offizieller LithTech-Importeur',
        desc: 'Sie kaufen direkt an der autorisierten Quelle. Keine Zwischenhändler, keine Grauimporte — volle Rückverfolgbarkeit vom Werk bis zu Ihnen.',
        tag: 'Authentisches Produkt',
      },
      {
        title: 'Produkte vor Lieferung geprüft',
        desc: 'Jede Batterie durchläuft vor der Auslieferung eine technische Prüfung. Null Überraschungen.',
        tag: 'Getestet und zertifiziert',
      },
      {
        title: 'Aktive Rabattprogramme',
        desc: 'Rabatte für Senioren, ländliche Regionen und Kundenempfehlungen. Registrieren Sie sich auf der Plattform für die aktuellen Angebote.',
        tag: 'Zusätzliche Ersparnisse',
      },
    ],
    ctaTitle: 'Erstellen Sie Ihr Konto auf der Baterino-Plattform',
    ctaSub:
      'Verwalten Sie Garantien, Bestellungen und Rabattprogramme — alles an einem Ort, von jedem Gerät.',
    footerCompanyLabel: 'Unternehmen',
    footerAddressLabel: 'Adresse',
    footerAddressTitle: 'Adresse Baterino Rumänien',
  },
}

const PARTNER: Record<CommercialOfferLanguage, BenefitsSheetStrings> = {
  ro: {
    docTitle: 'Beneficiile Partenerilor',
    docSub: 'De ce să devii partener',
    introEyebrow: 'De ce să devii partener Baterino',
    introTitlePre: 'Beneficiile de a fi partener ',
    introTitlePost: '',
    introBody:
      'Mai mult decât o distribuție — un parteneriat strategic pe termen lung. Împreună construim o rețea solidă, cu prețuri corecte, suport real și instrumentele necesare să îți crești afacerea sustenabil.',
    benefits: [
      {
        title: 'Structură de preț stabilă și predictibilă',
        desc: 'Prețuri transparente și stabile pe termen lung — fără surprize, fără fluctuații. Știi mereu cu ce marjă lucrezi.',
        tag: 'Transparență totală',
      },
      {
        title: 'Marje competitive și reduceri pentru volum',
        desc: 'Structura noastră de prețuri este construită în jurul succesului partenerilor. Cu cât vinzi mai mult, cu atât marja ta crește.',
        tag: 'Model scalabil',
      },
      {
        title: 'Strategie de prețuri comună',
        desc: 'Stabilim împreună strategia de prețuri pentru piața din România, astfel încât să maximizăm vânzările și să protejăm pozițiile comerciale.',
        tag: 'Protecție teritorială',
      },
      {
        title: 'Garanție 10 ani gestionată de Baterino',
        desc: 'Nu depinzi de producător și nu lași clientul singur. Preluăm responsabilitatea completă față de clientul final — 10 ani garanție.',
        tag: 'Zero risc pentru tine',
      },
      {
        title: 'Sistem SWAP — Zero întreruperi pentru clientul tău',
        desc: 'În cazul unei defecțiuni, înlocuim bateria imediat pe durata diagnozei. Clientul tău nu simte nicio întrerupere, iar tu îți protejezi reputația.',
        tag: 'Fidelizare clienți',
      },
      {
        title: 'Service local și suport tehnic 24/7',
        desc: 'Echipă de service în România, disponibilă non-stop. Niciun timp mort, nicio dependență de distanța față de producător — rezolvăm rapid, local.',
        tag: 'Suport non-stop',
      },
      {
        title: 'Generare activă de lead-uri și clienți',
        desc: 'Nu ești singur pe piață — Baterino direcționează activ comenzi și clienți către partenerii din rețea, în funcție de zona ta de activitate.',
        tag: 'Clienți din rețea',
      },
      {
        title: 'Vizibilitate în platforma și aplicația Baterino',
        desc: 'Compania ta apare direct în ecosistemul Baterino, în fața clienților finali care caută instalatori și parteneri locali — expunere națională.',
        tag: 'Expunere națională',
      },
    ],
    ctaTitle: 'Creează-ți un cont de partener în platforma Baterino',
    ctaSub:
      'Gestionezi prețurile, comenzile și suportul de partener — totul într-un singur loc, de pe orice dispozitiv.',
    footerCompanyLabel: 'Companie',
    footerAddressLabel: 'Adresă',
    footerAddressTitle: 'Adresa Baterino România',
  },
  en: {
    docTitle: 'Partner Benefits',
    docSub: 'Why become a partner',
    introEyebrow: 'Why become a Baterino partner',
    introTitlePre: 'The benefits of being a ',
    introTitlePost: ' partner',
    introBody:
      'More than distribution — a long-term strategic partnership. Together we build a solid network with fair prices, real support and the tools you need to grow your business sustainably.',
    benefits: [
      {
        title: 'Stable, predictable pricing structure',
        desc: 'Transparent, long-term stable prices — no surprises, no fluctuations. You always know the margin you are working with.',
        tag: 'Full transparency',
      },
      {
        title: 'Competitive margins and volume discounts',
        desc: 'Our pricing structure is built around our partners’ success. The more you sell, the higher your margin.',
        tag: 'Scalable model',
      },
      {
        title: 'Joint pricing strategy',
        desc: 'We define the pricing strategy for the Romanian market together, so we maximize sales and protect commercial positions.',
        tag: 'Territorial protection',
      },
      {
        title: '10-year warranty managed by Baterino',
        desc: 'You do not depend on the manufacturer and never leave your client alone. We take full responsibility towards the end client — 10-year warranty.',
        tag: 'Zero risk for you',
      },
      {
        title: 'SWAP system — zero downtime for your client',
        desc: 'In case of a fault, we replace the battery immediately for the duration of the diagnosis. Your client feels no interruption, and you protect your reputation.',
        tag: 'Client loyalty',
      },
      {
        title: 'Local service and 24/7 technical support',
        desc: 'A service team in Romania, available non-stop. No dead time, no dependency on the manufacturer’s distance — we solve it fast, locally.',
        tag: 'Non-stop support',
      },
      {
        title: 'Active lead and client generation',
        desc: 'You are not alone on the market — Baterino actively routes orders and clients to network partners, based on your area of activity.',
        tag: 'Clients from the network',
      },
      {
        title: 'Visibility in the Baterino platform and app',
        desc: 'Your company appears directly in the Baterino ecosystem, in front of end clients looking for local installers and partners — national exposure.',
        tag: 'National exposure',
      },
    ],
    ctaTitle: 'Create your partner account on the Baterino platform',
    ctaSub: 'Manage prices, orders and partner support — all in one place, from any device.',
    footerCompanyLabel: 'Company',
    footerAddressLabel: 'Address',
    footerAddressTitle: 'Baterino Romania address',
  },
  de: {
    docTitle: 'Partnervorteile',
    docSub: 'Warum Partner werden',
    introEyebrow: 'Warum Baterino-Partner werden',
    introTitlePre: 'Ihre Vorteile als ',
    introTitlePost: '-Partner',
    introBody:
      'Mehr als Distribution — eine langfristige strategische Partnerschaft. Gemeinsam bauen wir ein solides Netzwerk auf, mit fairen Preisen, echtem Support und den Werkzeugen, um Ihr Geschäft nachhaltig auszubauen.',
    benefits: [
      {
        title: 'Stabile und planbare Preisstruktur',
        desc: 'Transparente, langfristig stabile Preise — keine Überraschungen, keine Schwankungen. Sie wissen immer, mit welcher Marge Sie arbeiten.',
        tag: 'Volle Transparenz',
      },
      {
        title: 'Wettbewerbsfähige Margen und Mengenrabatte',
        desc: 'Unsere Preisstruktur ist auf den Erfolg unserer Partner ausgerichtet. Je mehr Sie verkaufen, desto höher Ihre Marge.',
        tag: 'Skalierbares Modell',
      },
      {
        title: 'Gemeinsame Preisstrategie',
        desc: 'Wir legen die Preisstrategie für den rumänischen Markt gemeinsam fest, um den Verkauf zu maximieren und kommerzielle Positionen zu schützen.',
        tag: 'Gebietsschutz',
      },
      {
        title: '10 Jahre Garantie, verwaltet von Baterino',
        desc: 'Sie sind nicht vom Hersteller abhängig und lassen Ihren Kunden nie allein. Wir übernehmen die volle Verantwortung gegenüber dem Endkunden — 10 Jahre Garantie.',
        tag: 'Null Risiko für Sie',
      },
      {
        title: 'SWAP-System — keine Ausfallzeit für Ihren Kunden',
        desc: 'Im Störungsfall tauschen wir die Batterie für die Dauer der Diagnose sofort aus. Ihr Kunde spürt keine Unterbrechung, und Sie schützen Ihren Ruf.',
        tag: 'Kundenbindung',
      },
      {
        title: 'Lokaler Service und Support rund um die Uhr',
        desc: 'Ein Serviceteam in Rumänien, non-stop verfügbar. Keine Totzeiten, keine Abhängigkeit von der Entfernung zum Hersteller — wir lösen es schnell und lokal.',
        tag: 'Non-Stop-Support',
      },
      {
        title: 'Aktive Lead- und Kundengenerierung',
        desc: 'Sie sind nicht allein am Markt — Baterino leitet Bestellungen und Kunden aktiv an Netzwerkpartner weiter, abhängig von Ihrem Einzugsgebiet.',
        tag: 'Kunden aus dem Netzwerk',
      },
      {
        title: 'Sichtbarkeit in der Baterino-Plattform und App',
        desc: 'Ihr Unternehmen erscheint direkt im Baterino-Ökosystem — vor Endkunden, die lokale Installateure und Partner suchen.',
        tag: 'Landesweite Präsenz',
      },
    ],
    ctaTitle: 'Erstellen Sie Ihr Partnerkonto auf der Baterino-Plattform',
    ctaSub:
      'Verwalten Sie Preise, Bestellungen und Partner-Support — alles an einem Ort, von jedem Gerät.',
    footerCompanyLabel: 'Unternehmen',
    footerAddressLabel: 'Adresse',
    footerAddressTitle: 'Adresse Baterino Rumänien',
  },
}

export function getClientBenefitsSheetStrings(lang: CommercialOfferLanguage): BenefitsSheetStrings {
  return CLIENT[lang] ?? CLIENT.ro
}

export function getPartnerBenefitsSheetStrings(lang: CommercialOfferLanguage): BenefitsSheetStrings {
  return PARTNER[lang] ?? PARTNER.ro
}
