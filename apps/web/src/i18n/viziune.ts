import type { LangCode } from './menu'

export type ViziuneTranslations = {
  heroTitle: string
  capitolu1: string
  capitolu2: string
  capitolu3: string
  capitolu4: string
  viziune: string
  misiune: string
  implementare: string
  echipa: string
  viziuneP1: string
  viziuneP2: string
  misiuneP1: string
  misiuneP2: string
  misiuneP3: string
  misiuneP4: string
  implementareP1: string
  implementareP2: string
  implementareP3: string
  implementareP4: string
  echipaP1: string
  echipaP2: string
  echipaP3: string
  discutaCuNoi: string
}

const translations: Record<LangCode, ViziuneTranslations> = {
  ro: {
    heroTitle: 'DESPRE NOI',
    capitolu1: 'CAPITOLUL 1',
    capitolu2: 'CAPITOLUL 2',
    capitolu3: 'CAPITOLUL 3',
    capitolu4: 'CAPITOLUL 4',
    viziune: 'VIZIUNE',
    misiune: 'MISIUNE',
    implementare: 'IMPLEMENTARE',
    echipa: 'ECHIPĂ',
    viziuneP1:
      'Imaginează-ți o locuință complet independentă energetic — o casă care nu depinde de rețelele tradiționale, ci produce energie prin panouri solare, o stochează și o folosește inteligent pentru viața de zi cu zi. Îți încarci mașina acasă. Copiii studiază online fără întreruperi. Gătești, te încălzești iarna și reduci drastic dependența de gaz. Îți poți cultiva hrana în propria micro-fermă alimentată cu energie curată. Ai acces la internet prin infrastructuri alternative, inclusiv prin satelit.',
    viziuneP2:
      'Aceasta este direcția în care credem: atunci când nu există o viziune colectivă, viziunea individuală trebuie să primeze. Rolul nostru este să te ajutăm să obții independența energetică — eficient, durabil și pe termen lung.',
    misiuneP1:
      'Să participăm activ la tranziția fiecărei gospodării din România către independența energetică. Să oferim soluții de stocare energetică de calitate, durabile și sustenabile, care permit utilizarea eficientă a energiei produse local și reduc dependența de rețelele tradiționale. Să facem acest lucru corect și transparent, punând interesul comunităților înaintea interesului personal, oferind prețuri corecte și accesibile.',
    misiuneP2:
      'Să sprijinim companiile din România să își reducă costurile energetice, pentru ca produsele românești să devină mai accesibile pe piața internă și mai competitive pe piețele externe; să oferim siguranța mediului medical și să sprijinim independența serviciilor esențiale pentru comunitățile în care locuim.',
    misiuneP3:
      'Să creăm capacități de producție a sistemelor de stocare local, pentru a reduce dependența de importuri, a scurta lanțurile de aprovizionare, a crea locuri de muncă și a ne proteja consumatorii finali și producătorii locali.',
    misiuneP4:
      'Și, poate cel mai important lucru pe care îl facem: să ne asumăm responsabilitatea pentru produsele pe care le comercializăm — pe termen lung.',
    implementareP1:
      'Pentru a transforma viziunea în realitate și pentru a ne îndeplini misiunea, am ales să ne specializăm într-un singur domeniu: stocarea energiei electrice. Ne concentrăm pe excelență, nu pe diversificare superficială.',
    implementareP2:
      'Am selectat un singur producător strategic, pentru care am devenit importator direct, construind un parteneriat tehnologic solid și pe termen lung. Am format o echipă de ingineri care înțelege în detaliu tehnologia partenerului nostru și care poate asigura integrarea corectă, sigură și eficientă a sistemelor de stocare.',
    implementareP3:
      'Controlăm și monitorizăm întregul flux — de la fabrică până la consumatorul final — și rămânem implicați pe toată durata de viață a bateriei. Am dezvoltat o rețea națională de distribuitori și centre de mentenanță, pentru a asigura suport rapid și local.',
    implementareP4:
      'Am adus echipamente de diagnoză și componente de rezervă direct de la producător, astfel încât intervențiile și reparațiile să poată fi realizate în România, reducând semnificativ timpul de așteptare pentru client. Implementarea noastră este construită pe control, responsabilitate și suport pe termen lung.',
    echipaP1:
      'Suntem o companie cu capital 100% românesc, prezentă pe piața din România din 2025, cu o dezvoltare accelerată la nivel european și internațional. Ne concentrăm pe implementarea proiectelor care îmbunătățesc viața comunităților și performanța mediului industrial, prin selectarea și integrarea celor mai potrivite tehnologii.',
    echipaP2:
      'Baterino este definită prin dinamism și profesionalism. Am adus împreună o echipă multidisciplinară, formată din specialiști în logistică, energie, media și relații internaționale — profesioniști cu o înțelegere profundă a pieței și a contextului economic actual.',
    echipaP3:
      'Echipa noastră nu este construită în jurul unui singur individ, ci în jurul unui obiectiv comun: să oferim produse și servicii de calitate, cu impact real în viața de zi cu zi și în dezvoltarea mediului industrial din România. Credem în responsabilitate, colaborare și rezultate măsurabile.',
    discutaCuNoi: 'DISCUTĂ CU NOI',
  },
  en: {
    heroTitle: 'ABOUT US',
    capitolu1: 'CHAPTER 1',
    capitolu2: 'CHAPTER 2',
    capitolu3: 'CHAPTER 3',
    capitolu4: 'CHAPTER 4',
    viziune: 'VISION',
    misiune: 'MISSION',
    implementare: 'IMPLEMENTATION',
    echipa: 'TEAM',
    viziuneP1:
      'Imagine a home that is fully energy independent — a house that does not depend on traditional grids but produces energy through solar panels, stores it and uses it intelligently for everyday life. You charge your car at home. Children study online without interruption. You cook, heat in winter and drastically reduce dependence on gas. You can grow your food in your own micro-farm powered by clean energy. You have access to the internet through alternative infrastructure, including satellite.',
    viziuneP2:
      'This is the direction we believe in: when there is no collective vision, the individual vision must take precedence. Our role is to help you achieve energy independence — efficiently, sustainably and for the long term.',
    misiuneP1:
      'To actively participate in the transition of every household in Romania towards energy independence. To offer quality, durable and sustainable energy storage solutions that enable the efficient use of locally produced energy and reduce dependence on traditional grids. To do this fairly and transparently, putting the interest of communities before personal interest, offering fair and affordable prices.',
    misiuneP2:
      'To support companies in Romania in reducing their energy costs, so that Romanian products become more accessible on the domestic market and more competitive on external markets; to provide security for the medical environment and support the independence of essential services for the communities in which we live.',
    misiuneP3:
      'To create local production capacity for storage systems, in order to reduce dependence on imports, shorten supply chains, create jobs and protect end consumers and local producers.',
    misiuneP4:
      'And, perhaps the most important thing we do: to assume responsibility for the products we sell — in the long term.',
    implementareP1:
      'To turn our vision into reality and to fulfil our mission, we chose to specialise in a single domain: electrical energy storage. We focus on excellence, not superficial diversification.',
    implementareP2:
      'We selected a single strategic manufacturer, for which we became a direct importer, building a solid long-term technological partnership. We formed a team of engineers who understand our partner’s technology in detail and can ensure the correct, safe and efficient integration of storage systems.',
    implementareP3:
      'We control and monitor the entire flow — from factory to end consumer — and remain involved throughout the life of the battery. We have developed a national network of distributors and maintenance centres to ensure fast, local support.',
    implementareP4:
      'We have brought diagnostic equipment and spare components directly from the manufacturer, so that interventions and repairs can be carried out in Romania, significantly reducing waiting time for the customer. Our implementation is built on control, responsibility and long-term support.',
    echipaP1:
      'We are a company with 100% Romanian capital, present on the Romanian market since 2025, with accelerated development at European and international level. We focus on implementing projects that improve the lives of communities and the performance of the industrial environment, by selecting and integrating the most suitable technologies.',
    echipaP2:
      'Baterino is defined by dynamism and professionalism. We have brought together a multidisciplinary team of specialists in logistics, energy, media and international relations — professionals with a deep understanding of the market and the current economic context.',
    echipaP3:
      'Our team is not built around a single individual, but around a common goal: to offer quality products and services with real impact on daily life and on the development of the industrial environment in Romania. We believe in responsibility, collaboration and measurable results.',
    discutaCuNoi: 'TALK TO US',
  },
}

export function getViziuneTranslations(lang: LangCode): ViziuneTranslations {
  return translations[lang] ?? translations.ro
}
