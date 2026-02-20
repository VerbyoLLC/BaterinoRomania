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
  },
  zh: {
    heroTitle: '关于我们',
    capitolu1: '第一章',
    capitolu2: '第二章',
    capitolu3: '第三章',
    capitolu4: '第四章',
    viziune: '愿景',
    misiune: '使命',
    implementare: '实施',
    echipa: '团队',
    viziuneP1:
      '想象一个完全能源独立的家——不依赖传统电网，而是通过太阳能板发电、储存并智能地用于日常生活。您在家为汽车充电。孩子们在线学习不受干扰。您做饭、冬季取暖，大幅减少对燃气的依赖。您可以在自己的微农场中用清洁能源种植食物。您通过替代基础设施（包括卫星）接入互联网。',
    viziuneP2:
      '这是我们坚信的方向：当没有集体愿景时，个人愿景必须优先。我们的角色是帮助您实现能源独立——高效、可持续且长期。',
    misiuneP1:
      '积极参与罗马尼亚每个家庭向能源独立的转型。提供优质、耐用、可持续的储能解决方案，使当地生产的能源得到高效利用并减少对传统电网的依赖。以公正透明的方式行事，将社区利益置于个人利益之上，提供公平且可负担的价格。',
    misiuneP2:
      '支持罗马尼亚企业降低能源成本，使罗马尼亚产品在国内市场更易获得、在国际市场上更具竞争力；为医疗环境提供保障，并支持我们所居住社区的基本服务独立。',
    misiuneP3:
      '建立本地储能系统生产能力，以减少对进口的依赖、缩短供应链、创造就业并保护终端消费者和本地生产商。',
    misiuneP4:
      '也许我们所做最重要的一件事：对我们所销售的产品承担长期责任。',
    implementareP1:
      '为了将愿景变为现实并履行使命，我们选择专注于单一领域：电能储存。我们专注于卓越，而非表面多元化。',
    implementareP2:
      '我们选择了一家战略制造商，成为其直接进口商，建立了稳固的长期技术合作。我们组建了一支深入了解合作伙伴技术的工程师团队，能够确保储能系统的正确、安全、高效集成。',
    implementareP3:
      '我们控制并监控从工厂到终端用户的整个流程，并在电池的整个生命周期内保持参与。我们建立了全国性的经销商和维护中心网络，以提供快速、本地化的支持。',
    implementareP4:
      '我们从制造商直接引进了诊断设备和备用部件，使干预和维修能够在罗马尼亚完成，显著缩短客户等待时间。我们的实施建立在控制、责任和长期支持之上。',
    echipaP1:
      '我们是一家100%罗马尼亚资本的公司，自2025年起进入罗马尼亚市场，在欧洲和国际层面快速发展。我们专注于实施改善社区生活和工业环境绩效的项目，通过选择和整合最合适的技术。',
    echipaP2:
      'Baterino 以活力和专业精神为特点。我们汇聚了一支多学科团队，包括物流、能源、媒体和国际关系领域的专家——对市场和当前经济背景有深刻理解的专业人士。',
    echipaP3:
      '我们的团队不是围绕某一个人，而是围绕一个共同目标：提供高质量的产品和服务，对日常生活和罗马尼亚工业环境的发展产生实际影响。我们相信责任、协作和可衡量的成果。',
  },
}

export function getViziuneTranslations(lang: LangCode): ViziuneTranslations {
  return translations[lang] ?? translations.ro
}
