import type { LangCode } from './menu'

export type TermeniSiConditiiBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'h3'; text: string }

export type TermeniSiConditiiSection = {
  title: string
  blocks: TermeniSiConditiiBlock[]
}

export type TermeniSiConditiiTranslations = {
  seoTitle: string
  seoDesc: string
  pageTitle: string
  intro: string
  tocTitle: string
  lastUpdated: string
  sections: TermeniSiConditiiSection[]
}

const translations: Record<LangCode, TermeniSiConditiiTranslations> = {
  ro: {
    seoTitle: 'Termeni și Condiții – Baterino România',
    seoDesc:
      'Termenii și condițiile generale de utilizare a site-ului baterino.ro și serviciilor Baterino Energy SRL.',
    pageTitle: 'Termeni și Condiții',
    intro:
      'Vă rugăm să citiți cu atenție acești Termeni și Condiții înainte de a utiliza site-ul **baterino.ro** și serviciile Baterino. Prin accesarea Site-ului, crearea unui cont sau plasarea unei Comenzi, confirmați că ați citit, ați înțeles și acceptați în integralitate prezentii termeni.',
    tocTitle: 'Cuprins',
    lastUpdated: 'Ultima actualizare: 29 iunie 2026',
    sections: [
      {
        title: '1. Definiții',
        blocks: [
          {
            kind: 'p',
            text: 'În cuprinsul prezentului document, termenii de mai jos au următoarea semnificație:',
          },
          {
            kind: 'ul',
            items: [
              '**Baterino / Vânzătorul / noi** — societatea Baterino Energy SRL, identificată la Articolul 2.',
              '**Site / Platforma** — site-ul web disponibil la adresa baterino.ro, inclusiv subdomeniile și aplicațiile aferente.',
              '**Client / Utilizator / dumneavoastră** — orice persoană fizică sau juridică ce accesează Site-ul, își creează un cont sau plasează o Comandă.',
              '**Consumator** — orice persoană fizică care acționează în scopuri din afara activității sale comerciale, industriale sau profesionale.',
              '**Partener** — persoană juridică ce acționează în calitate de Distribuitor sau Instalator, conform Articolului 12.',
              '**Produse** — bunurile comercializate prin intermediul Site-ului (sisteme de stocare a energiei / BESS, baterii LiFePO₄, accesorii și echipamente conexe).',
              '**Servicii** — serviciile oferite de Baterino, inclusiv consultanță, proiectare, livrare, instalare, punere în funcțiune și service.',
              '**Comandă** — manifestarea de voință a Clientului de a achiziționa Produse și/sau Servicii.',
              '**Contract** — contractul la distanță încheiat între Baterino și Client cu privire la Produse și/sau Servicii.',
            ],
          },
        ],
      },
      {
        title: '2. Informații despre Vânzător',
        blocks: [
          {
            kind: 'ul',
            items: [
              '**Denumire:** Baterino Energy SRL',
              '**CUI:** 42707733',
              '**Sediu social:** Str. 23 August Nr. 244-43A, Camera 1, Oraș Otopeni, Jud. Ilfov, România',
            ],
          },
        ],
      },
      {
        title: '3. Obiectul și acceptarea Termenilor',
        blocks: [
          {
            kind: 'p',
            text: '**3.1.** Prezentul document reglementează condițiile de utilizare a Site-ului și condițiile contractuale de vânzare a Produselor și Serviciilor Baterino.',
          },
          {
            kind: 'p',
            text: '**3.2.** Termenii se aplică tuturor Clienților. Utilizarea Site-ului echivalează cu acceptarea lor. Dacă nu sunteți de acord cu acești termeni, vă rugăm să nu utilizați Site-ul.',
          },
          {
            kind: 'p',
            text: '**3.3.** Baterino își rezervă dreptul de a modifica prezentii Termeni în condițiile Articolului 18. Versiunea aplicabilă unei Comenzi este cea în vigoare la momentul plasării Comenzii.',
          },
        ],
      },
      {
        title: '4. Utilizarea Site-ului și contul de Utilizator',
        blocks: [
          {
            kind: 'p',
            text: '**4.1.** Clientul se obligă să utilizeze Site-ul cu bună-credință, în conformitate cu legea, cu prezentii Termeni și cu scopul pentru care Site-ul a fost creat.',
          },
          {
            kind: 'p',
            text: '**4.2.** Pentru anumite funcționalități (plasarea de Comenzi, accesul la programele de reducere, generarea certificatelor de garanție), este necesară crearea unui cont. Clientul răspunde pentru exactitatea datelor furnizate și pentru confidențialitatea credențialelor de acces.',
          },
          {
            kind: 'p',
            text: '**4.3.** Clientul este responsabil pentru toate activitățile desfășurate prin contul său. Orice utilizare neautorizată a contului trebuie notificată Baterino fără întârziere nejustificată.',
          },
          {
            kind: 'p',
            text: '**4.4.** Baterino își rezervă dreptul de a suspenda sau închide conturile utilizate abuziv, fraudulos sau cu încălcarea prezentilor Termeni.',
          },
        ],
      },
      {
        title: '5. Produse, prețuri și disponibilitate',
        blocks: [
          {
            kind: 'p',
            text: '**5.1.** Caracteristicile Produselor (capacitate, putere, chimie, certificări, condiții de garanție) sunt prezentate pe paginile de produs și în fișele tehnice aferente. Imaginile au caracter ilustrativ.',
          },
          {
            kind: 'p',
            text: '**5.2.** Prețurile sunt exprimate în lei (RON) și includ TVA, dacă nu se specifică altfel. Pentru Parteneri, se pot aplica prețuri și condiții comerciale distincte, conform Articolului 12.',
          },
          {
            kind: 'p',
            text: '**5.3.** Baterino își rezervă dreptul de a modifica prețurile în orice moment. Prețul aplicabil unei Comenzi este cel afișat sau comunicat prin ofertă/proformă la momentul plasării Comenzii.',
          },
          {
            kind: 'p',
            text: '**5.4.** Disponibilitatea Produselor este orientativă. În cazul indisponibilității unui Produs comandat, Baterino va informa Clientul și va propune o alternativă, un termen de livrare sau restituirea sumelor încasate.',
          },
          {
            kind: 'p',
            text: '**5.5.** În cazul unei erori vădite de preț sau de descriere, Baterino are dreptul de a anula Comanda afectată și de a restitui orice sumă încasată, fără alte obligații.',
          },
        ],
      },
      {
        title: '6. Proprietate intelectuală',
        blocks: [
          {
            kind: 'p',
            text: '**6.1.** Întregul conținut al Site-ului (texte, imagini, grafică, logo-uri, mărci, structura și codul Platformei) este proprietatea Baterino sau a partenerilor săi și este protejat de legislația privind proprietatea intelectuală.',
          },
          {
            kind: 'p',
            text: '**6.2.** Este interzisă reproducerea, distribuirea, modificarea sau utilizarea conținutului în scopuri comerciale fără acordul scris prealabil al Baterino.',
          },
        ],
      },
      {
        title: '7. Plasarea și acceptarea Comenzii',
        blocks: [
          {
            kind: 'p',
            text: '**7.1.** Comanda se plasează prin Site sau, după caz, în baza unei oferte/proforme emise de Baterino.',
          },
          {
            kind: 'p',
            text: '**7.2.** După plasarea Comenzii, Clientul primește o confirmare de primire și/sau o factură proformă. Această confirmare nu reprezintă acceptarea automată a Comenzii.',
          },
          {
            kind: 'p',
            text: '**7.3.** Contractul se consideră încheiat în momentul în care Baterino confirmă expres acceptarea Comenzii și/sau emite factura fiscală, respectiv la momentul expedierii Produselor.',
          },
          {
            kind: 'p',
            text: '**7.4.** Baterino își rezervă dreptul de a refuza sau anula o Comandă în cazuri justificate (date incorecte, suspiciune de fraudă, indisponibilitate, eroare de preț), cu restituirea sumelor eventual încasate.',
          },
        ],
      },
      {
        title: '8. Plata',
        blocks: [
          {
            kind: 'p',
            text: '**8.1.** Plata Produselor și Serviciilor se efectuează conform condițiilor indicate în ofertă, proformă sau factură (transfer bancar, plată online sau alte metode agreate).',
          },
          {
            kind: 'p',
            text: '**8.2.** Pentru anumite Produse (în special sisteme BESS comerciale și industriale realizate la comandă), Baterino poate solicita un avans la momentul confirmării Comenzii.',
          },
          {
            kind: 'p',
            text: '**8.3.** Proprietatea asupra Produselor se transferă Clientului la momentul plății integrale, cu excepția cazului în care părțile convin altfel în scris.',
          },
          {
            kind: 'p',
            text: '**8.4.** Facturile se emit și se transmit în format electronic, dacă nu se solicită expres altă modalitate.',
          },
        ],
      },
      {
        title: '9. Livrare',
        blocks: [
          {
            kind: 'p',
            text: '**9.1.** Livrarea se efectuează la adresa indicată de Client, prin curier sau transportator specializat, în funcție de natura și dimensiunea Produselor.',
          },
          {
            kind: 'p',
            text: '**9.2.** Termenele de livrare sunt orientative și pot varia în funcție de disponibilitate, localizare și particularitățile logistice ale transportului bateriilor (clasificate ca mărfuri periculoase — ADR Clasa 9).',
          },
          {
            kind: 'p',
            text: '**9.3.** La recepție, Clientul are obligația de a verifica integritatea coletelor și conformitatea Produselor. Orice deteriorare vizibilă trebuie consemnată la momentul livrării și notificată Baterino fără întârziere.',
          },
          {
            kind: 'p',
            text: '**9.4.** Riscul pieirii sau deteriorării Produselor se transferă Clientului la momentul predării către acesta sau către un transportator desemnat de Client.',
          },
        ],
      },
      {
        title: '10. Dreptul de retragere și politica de retur',
        blocks: [
          {
            kind: 'p',
            text: '**10.1.** Consumatorul beneficiază de dreptul de a se retrage din Contract, fără invocarea vreunui motiv, în termen de **14 zile**, în condițiile [OUG nr. 34/2014](https://legislatie.just.ro/Public/DetaliiDocument/158913). Termenul curge de la data la care Consumatorul intră în posesia fizică a Produselor.',
          },
          {
            kind: 'p',
            text: '**10.2.** Pentru exercitarea dreptului de retragere, Consumatorul informează Baterino printr-o declarație neechivocă, la datele de contact indicate pe Site, sau accesând linkul: [returnare-produse](/returnare-produse). Consumatorul poate utiliza și formularul-tip de retragere pus la dispoziție.',
          },
          {
            kind: 'p',
            text: '**10.3.** Costurile returnării Produselor sunt suportate de Consumator, dacă nu se convine altfel. Având în vedere natura Produselor (baterii — mărfuri periculoase ADR Clasa 9), returul se realizează cu respectarea regulilor de ambalare și transport aplicabile.',
          },
          {
            kind: 'p',
            text: '**10.4.** Baterino restituie sumele încasate în termen de cel mult **14 zile** de la data la care a fost informat cu privire la decizia de retragere, putând amâna restituirea până la primirea Produselor sau a dovezii expedierii lor.',
          },
          {
            kind: 'p',
            text: '**10.5.** Dreptul de retragere nu se aplică Produselor confecționate sau configurate la comandă, conform specificațiilor Clientului (de exemplu, sisteme BESS comerciale/industriale personalizate), în condițiile legii.',
          },
          {
            kind: 'p',
            text: '**10.6.** Condițiile complete privind returul, ambalarea, transportul (inclusiv reglementările aplicabile bateriilor — ADR Clasa 9) și rambursarea sunt prevăzute în [Politica de Retur](/returnare-produse), disponibilă pe Site.',
          },
        ],
      },
      {
        title: '11. Garanții',
        blocks: [
          {
            kind: 'p',
            text: '**11.1.** Produsele beneficiază de garanția legală de conformitate, conform Legii nr. 449/2003 și OG nr. 9/2016, precum și de garanția comercială oferită de Baterino și/sau de producător, în condițiile comunicate pe pagina de produs și în certificatul de garanție.',
          },
          {
            kind: 'p',
            text: '**11.2.** Certificatul de garanție se generează prin contul Clientului din Platformă, secțiunea „Produsele mele", prin adăugarea Produsului pe baza seriei (SN) sau a codului QR.',
          },
          {
            kind: 'p',
            text: '**11.3.** Garanția se aplică în condițiile instalării, utilizării și întreținerii corecte a Produselor, conform documentației tehnice. Garanția nu acoperă defecțiunile rezultate din utilizare necorespunzătoare, intervenții neautorizate, instalare neconformă sau cauze externe.',
          },
          {
            kind: 'p',
            text: '**11.4.** Sesizarea unei defecțiuni se realizează prin contactarea Baterino telefonic sau prin Site, urmată de evaluarea tehnică. Acolo unde se aplică, serviciul **SWAP** Baterino poate pune la dispoziție o baterie de înlocuire temporară pe durata reparației.',
          },
        ],
      },
      {
        title: '12. Distribuitori și Instalatori',
        blocks: [
          {
            kind: 'p',
            text: '**12.1.** Persoanele juridice pot colabora cu Baterino în calitate de **Distribuitor** sau **Instalator**, în baza unei autorizări prealabile și a acceptării condițiilor comerciale specifice.',
          },
          {
            kind: 'p',
            text: '**12.2. Calitatea de Partener.** Calitatea de Distribuitor sau Instalator se dobândește exclusiv în baza unui acord de parteneriat scris sau semnat digital pe platforma baterino.ro și/sau a aprobării contului de partener în platforma dedicată, în urma unui proces de evaluare (verificare KYC și acordarea unui nivel comercial). Prezentii termeni se completează cu prevederile acelui acord, care prevalează în relația dintre Baterino și Partener. Baterino își rezervă dreptul de a accepta sau respinge orice cerere de parteneriat.',
          },
          {
            kind: 'p',
            text: '**12.3.** Partenerul se obligă să comercializeze, instaleze și promoveze Produsele cu respectarea standardelor de calitate și siguranță, a documentației tehnice și a identității de brand Baterino, fără a aduce atingere reputației Vânzătorului.',
          },
          {
            kind: 'p',
            text: '**12.4.** Instalatorii se obligă să efectueze lucrările de instalare și punere în funcțiune prin personal calificat, cu respectarea normelor tehnice și de securitate aplicabile sistemelor de stocare a energiei.',
          },
          {
            kind: 'p',
            text: '**12.5.** Partenerul nu este autorizat să acorde, să promită sau să modifice reduceri, garanții sau condiții comerciale în numele Baterino fără acordul scris prealabil al acestuia.',
          },
          {
            kind: 'p',
            text: '**12.6.** Prețurile, nivelurile de discount și condițiile comerciale aplicabile Partenerilor sunt confidențiale și se comunică prin canalele dedicate (portalul de parteneri).',
          },
        ],
      },
      {
        title: '13. Reduceri',
        blocks: [
          {
            kind: 'p',
            text: '**13.1.** Baterino poate oferi, periodic, programe de reducere comercială adresate Clienților, în condițiile stabilite într-un document separat.',
          },
          {
            kind: 'p',
            text: '**13.2.** Regulile de eligibilitate, modul de acordare, regula privind o singură reducere per produs și interdicția cumulării reducerilor sunt detaliate în documentul **Termeni și Condiții — Programele de Reducere**, disponibil [aici](/termeni-si-conditii-programe-de-reducere).',
          },
          {
            kind: 'p',
            text: '**13.3.** Reducerile sunt acordate, validate și aplicate exclusiv de Baterino. Accesul la orice reducere presupune existența unui cont activ pe baterino.ro.',
          },
        ],
      },
      {
        title: '14. Răspundere',
        blocks: [
          {
            kind: 'p',
            text: '**14.1.** Baterino își îndeplinește obligațiile cu diligență profesională. Răspunderea Baterino se limitează, în măsura permisă de lege, la valoarea Produselor sau Serviciilor care fac obiectul Contractului.',
          },
          {
            kind: 'p',
            text: '**14.2.** Baterino nu răspunde pentru prejudicii indirecte, pierderi de profit sau de date rezultate din utilizarea sau imposibilitatea utilizării Site-ului, cu excepția cazurilor prevăzute imperativ de lege.',
          },
          {
            kind: 'p',
            text: '**14.3.** Prevederile prezentului articol nu limitează drepturile legale ale Consumatorului și nu exclud răspunderea care nu poate fi exclusă conform legii.',
          },
        ],
      },
      {
        title: '15. Forță majoră',
        blocks: [
          {
            kind: 'p',
            text: '**15.1.** Niciuna dintre părți nu răspunde pentru neexecutarea obligațiilor cauzată de un eveniment de forță majoră sau caz fortuit, în condițiile legii.',
          },
          {
            kind: 'p',
            text: '**15.2.** Partea afectată notifică cealaltă parte cu privire la apariția și încetarea evenimentului. Dacă evenimentul persistă mai mult de o perioadă rezonabilă, oricare parte poate solicita încetarea Contractului, fără daune-interese.',
          },
        ],
      },
      {
        title: '16. Protecția datelor cu caracter personal',
        blocks: [
          {
            kind: 'p',
            text: '**16.1.** Baterino prelucrează datele cu caracter personal ale Clienților în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și legislația națională aplicabilă.',
          },
          {
            kind: 'p',
            text: '**16.2.** Detaliile privind categoriile de date prelucrate, scopurile, temeiurile legale, perioadele de stocare și drepturile persoanelor vizate sunt prezentate în **Politica de Confidențialitate**, parte integrantă a prezentilor Termeni.',
          },
        ],
      },
      {
        title: '17. Soluționarea litigiilor',
        blocks: [
          {
            kind: 'p',
            text: '**17.1.** Eventualele neînțelegeri se soluționează pe cale amiabilă. În caz contrar, litigiile sunt de competența instanțelor române.',
          },
          {
            kind: 'p',
            text: '**17.2.** Consumatorii se pot adresa Autorității Naționale pentru Protecția Consumatorilor (ANPC), [www.anpc.ro](https://anpc.ro), și pot recurge la mecanismele de soluționare alternativă a litigiilor (SAL) prin entitățile SAL competente. Lista entităților de soluționare a litigiilor de consum din Uniunea Europeană este disponibilă pe pagina [Consumer Redress](https://consumer-redress.ec.europa.eu/dispute-resolution-bodies_en) a Comisiei Europene.',
          },
          {
            kind: 'p',
            text: '**17.3.** Prezentul Contract este guvernat de legea română.',
          },
        ],
      },
      {
        title: '18. Modificarea Termenilor',
        blocks: [
          {
            kind: 'p',
            text: '**18.1.** Baterino își rezervă dreptul de a modifica oricând prezentii Termeni, prin publicarea versiunii actualizate pe Site, cu indicarea datei ultimei actualizări.',
          },
          {
            kind: 'p',
            text: '**18.2.** Modificările produc efecte de la data publicării. Comenzilor plasate anterior li se aplică versiunea în vigoare la momentul plasării.',
          },
          {
            kind: 'p',
            text: '**18.3.** În cazul modificării prezentilor Termeni și Condiții, a Politicii de Retur, a Termenilor și Condițiilor Programelor de Reducere sau a Politicii de Confidențialitate, Baterino va informa Clienții, respectiv Partenerii, prin e-mail, la adresa asociată contului acestora, cu privire la actualizarea documentelor și data intrării în vigoare a modificărilor.',
          },
        ],
      },
      {
        title: '19. Dispoziții finale',
        blocks: [
          {
            kind: 'p',
            text: '**19.1.** Dacă o clauză a prezentilor Termeni este declarată nulă sau inaplicabilă, celelalte clauze rămân valabile și produc efecte.',
          },
          {
            kind: 'p',
            text: '**19.2.** Neexercitarea de către Baterino a unui drept prevăzut în prezentii Termeni nu reprezintă o renunțare la acel drept.',
          },
          {
            kind: 'p',
            text: '**19.3.** Prezentii Termeni, împreună cu Politica de Confidențialitate, Politica de Retur și Termenii și Condițiile Programelor de Reducere, constituie întregul acord dintre părți cu privire la utilizarea Site-ului și achiziția Produselor și Serviciilor Baterino.',
          },
        ],
      },
    ],
  },
  en: {
    seoTitle: 'Terms and Conditions – Baterino Romania',
    seoDesc: 'General terms and conditions for using the baterino.ro website and Baterino Energy SRL services.',
    pageTitle: 'Terms and Conditions',
    intro:
      'Please read these Terms and Conditions carefully before using **baterino.ro** and Baterino services. By accessing the Site, creating an account or placing an Order, you confirm that you have read, understood and fully accept these terms.',
    tocTitle: 'Contents',
    lastUpdated: 'Last updated: 29 June 2026',
    sections: [
      {
        title: '1. Definitions',
        blocks: [
          {
            kind: 'p',
            text: 'In this document, the following terms have the meanings below:',
          },
          {
            kind: 'ul',
            items: [
              '**Baterino / Seller / we** — Baterino Energy SRL, identified in Article 2.',
              '**Site / Platform** — the website at baterino.ro, including related subdomains and applications.',
              '**Customer / User / you** — any natural or legal person accessing the Site, creating an account or placing an Order.',
              '**Consumer** — any natural person acting for purposes outside their trade, business, craft or profession.',
              '**Partner** — legal entity acting as Distributor or Installer, under Article 12.',
              '**Products** — goods sold through the Site (energy storage systems / BESS, LiFePO₄ batteries, accessories and related equipment).',
              '**Services** — services offered by Baterino, including consulting, design, delivery, installation, commissioning and service.',
              '**Order** — the Customer\'s statement of intent to purchase Products and/or Services.',
              '**Contract** — the distance contract concluded between Baterino and the Customer regarding Products and/or Services.',
            ],
          },
        ],
      },
      {
        title: '2. Seller information',
        blocks: [
          {
            kind: 'ul',
            items: [
              '**Company name:** Baterino Energy SRL',
              '**Tax ID (CUI):** 42707733',
              '**Registered office:** Str. 23 August Nr. 244-43A, Camera 1, Otopeni, Ilfov County, Romania',
            ],
          },
        ],
      },
      {
        title: '3. Purpose and acceptance of the Terms',
        blocks: [
          {
            kind: 'p',
            text: '**3.1.** This document governs the conditions for using the Site and the contractual terms for the sale of Baterino Products and Services.',
          },
          {
            kind: 'p',
            text: '**3.2.** The Terms apply to all Customers. Use of the Site equals acceptance. If you do not agree, please do not use the Site.',
          },
          {
            kind: 'p',
            text: '**3.3.** Baterino may amend these Terms under Article 18. The version applicable to an Order is the one in force when the Order is placed.',
          },
        ],
      },
      {
        title: '4. Use of the Site and User account',
        blocks: [
          {
            kind: 'p',
            text: '**4.1.** The Customer shall use the Site in good faith, in compliance with the law, these Terms and the purpose for which the Site was created.',
          },
          {
            kind: 'p',
            text: '**4.2.** Certain features (placing Orders, access to discount programmes, warranty certificate generation) require an account. The Customer is responsible for the accuracy of data provided and confidentiality of login credentials.',
          },
          {
            kind: 'p',
            text: '**4.3.** The Customer is responsible for all activity through their account. Any unauthorised use must be reported to Baterino without undue delay.',
          },
          {
            kind: 'p',
            text: '**4.4.** Baterino may suspend or close accounts used abusively, fraudulently or in breach of these Terms.',
          },
        ],
      },
      {
        title: '5. Products, prices and availability',
        blocks: [
          {
            kind: 'p',
            text: '**5.1.** Product characteristics are shown on product pages and technical datasheets. Images are illustrative.',
          },
          {
            kind: 'p',
            text: '**5.2.** Prices are in RON and include VAT unless stated otherwise. Partners may have distinct prices and commercial terms under Article 12.',
          },
          {
            kind: 'p',
            text: '**5.3.** Baterino may change prices at any time. The price applicable to an Order is that displayed or communicated via quote/proforma when the Order is placed.',
          },
          {
            kind: 'p',
            text: '**5.4.** Product availability is indicative. If a Product is unavailable, Baterino will inform the Customer and propose an alternative, delivery date or refund.',
          },
          {
            kind: 'p',
            text: '**5.5.** In case of obvious price or description error, Baterino may cancel the affected Order and refund any amount received, without further liability.',
          },
        ],
      },
      {
        title: '6. Intellectual property',
        blocks: [
          {
            kind: 'p',
            text: '**6.1.** All Site content is owned by Baterino or its partners and protected by intellectual property law.',
          },
          {
            kind: 'p',
            text: '**6.2.** Reproduction, distribution, modification or commercial use of content without prior written consent from Baterino is prohibited.',
          },
        ],
      },
      {
        title: '7. Placing and acceptance of Orders',
        blocks: [
          {
            kind: 'p',
            text: '**7.1.** Orders are placed through the Site or, where applicable, based on a quote/proforma issued by Baterino.',
          },
          {
            kind: 'p',
            text: '**7.2.** After placing an Order, the Customer receives an acknowledgement and/or proforma invoice. This does not constitute automatic acceptance.',
          },
          {
            kind: 'p',
            text: '**7.3.** The Contract is deemed concluded when Baterino expressly confirms acceptance and/or issues the tax invoice, or when Products are shipped.',
          },
          {
            kind: 'p',
            text: '**7.4.** Baterino may refuse or cancel an Order for justified reasons (incorrect data, suspected fraud, unavailability, price error), with refund of any amounts received.',
          },
        ],
      },
      {
        title: '8. Payment',
        blocks: [
          {
            kind: 'p',
            text: '**8.1.** Payment is made as indicated in the quote, proforma or invoice (bank transfer, online payment or other agreed methods).',
          },
          {
            kind: 'p',
            text: '**8.2.** For certain Products (especially custom commercial/industrial BESS systems), Baterino may require an advance upon Order confirmation.',
          },
          {
            kind: 'p',
            text: '**8.3.** Title to Products passes to the Customer upon full payment, unless otherwise agreed in writing.',
          },
          {
            kind: 'p',
            text: '**8.4.** Invoices are issued and sent electronically unless another method is expressly requested.',
          },
        ],
      },
      {
        title: '9. Delivery',
        blocks: [
          {
            kind: 'p',
            text: '**9.1.** Delivery is made to the address indicated by the Customer, by courier or specialised carrier depending on Product nature and size.',
          },
          {
            kind: 'p',
            text: '**9.2.** Delivery times are indicative and may vary depending on availability, location and logistics for battery transport (hazardous goods — ADR Class 9).',
          },
          {
            kind: 'p',
            text: '**9.3.** On receipt, the Customer must check package integrity and Product conformity. Any visible damage must be noted at delivery and reported to Baterino promptly.',
          },
          {
            kind: 'p',
            text: '**9.4.** Risk of loss or damage passes to the Customer upon handover to them or a carrier designated by the Customer.',
          },
        ],
      },
      {
        title: '10. Right of withdrawal and return policy',
        blocks: [
          {
            kind: 'p',
            text: '**10.1.** Consumers may withdraw from the Contract without giving reasons within **14 days**, under [GEO 34/2014](https://legislatie.just.ro/Public/DetaliiDocument/158913). The period runs from when the Consumer takes physical possession of the Products.',
          },
          {
            kind: 'p',
            text: '**10.2.** To exercise withdrawal, the Consumer notifies Baterino by unequivocal statement via Site contact details or at: [returnare-produse](/returnare-produse). The standard withdrawal form may also be used.',
          },
          {
            kind: 'p',
            text: '**10.3.** Return shipping costs are borne by the Consumer unless otherwise agreed. Given Product nature (batteries — ADR Class 9 hazardous goods), returns must comply with applicable packaging and transport rules.',
          },
          {
            kind: 'p',
            text: '**10.4.** Baterino refunds amounts received within **14 days** of being informed of withdrawal, and may defer refund until Products are received or proof of dispatch is provided.',
          },
          {
            kind: 'p',
            text: '**10.5.** Withdrawal does not apply to Products made or configured to Customer specifications (e.g. custom commercial/industrial BESS), as permitted by law.',
          },
          {
            kind: 'p',
            text: '**10.6.** Full return, packaging, transport (including battery regulations — ADR Class 9) and refund conditions are set out in the [Return Policy](/returnare-produse) on the Site.',
          },
        ],
      },
      {
        title: '11. Warranties',
        blocks: [
          {
            kind: 'p',
            text: '**11.1.** Products benefit from legal conformity warranty under Law 449/2003 and GO 9/2016, and commercial warranty from Baterino and/or the manufacturer as stated on the product page and warranty certificate.',
          },
          {
            kind: 'p',
            text: '**11.2.** The warranty certificate is generated via the Customer account on the Platform, “My Products” section, by adding the Product using serial number (SN) or QR code.',
          },
          {
            kind: 'p',
            text: '**11.3.** Warranty applies subject to correct installation, use and maintenance per technical documentation. It does not cover defects from misuse, unauthorised intervention, non-compliant installation or external causes.',
          },
          {
            kind: 'p',
            text: '**11.4.** Defects are reported by contacting Baterino by phone or via the Site, followed by technical assessment. Where applicable, Baterino **SWAP** service may provide a temporary replacement battery during repair.',
          },
        ],
      },
      {
        title: '12. Distributors and Installers',
        blocks: [
          {
            kind: 'p',
            text: '**12.1.** Legal entities may collaborate with Baterino as **Distributor** or **Installer**, subject to prior authorisation and acceptance of specific commercial terms.',
          },
          {
            kind: 'p',
            text: '**12.2. Partner status.** Distributor or Installer status is acquired only under a written or digitally signed partnership agreement on baterino.ro and/or approval of the partner account after evaluation (KYC and commercial tier). These terms are supplemented by that agreement, which prevails between Baterino and the Partner. Baterino may accept or reject any partnership request.',
          },
          {
            kind: 'p',
            text: '**12.3.** The Partner shall market, install and promote Products in compliance with quality and safety standards, technical documentation and Baterino brand identity, without harming the Seller\'s reputation.',
          },
          {
            kind: 'p',
            text: '**12.4.** Installers shall perform installation and commissioning through qualified personnel, complying with technical and safety rules for energy storage systems.',
          },
          {
            kind: 'p',
            text: '**12.5.** The Partner is not authorised to grant, promise or modify discounts, warranties or commercial terms on behalf of Baterino without prior written consent.',
          },
          {
            kind: 'p',
            text: '**12.6.** Prices, discount levels and commercial terms for Partners are confidential and communicated through dedicated channels (partner portal).',
          },
        ],
      },
      {
        title: '13. Discounts',
        blocks: [
          {
            kind: 'p',
            text: '**13.1.** Baterino may periodically offer commercial discount programmes to Customers under a separate document.',
          },
          {
            kind: 'p',
            text: '**13.2.** Eligibility rules, granting, one discount per product and non-cumulation are detailed in **Terms and Conditions — Discount Programmes**, available [here](/termeni-si-conditii-programe-de-reducere).',
          },
          {
            kind: 'p',
            text: '**13.3.** Discounts are granted, validated and applied exclusively by Baterino. Access to any discount requires an active account on baterino.ro.',
          },
        ],
      },
      {
        title: '14. Liability',
        blocks: [
          {
            kind: 'p',
            text: '**14.1.** Baterino performs its obligations with professional diligence. Baterino\'s liability is limited, to the extent permitted by law, to the value of Products or Services subject to the Contract.',
          },
          {
            kind: 'p',
            text: '**14.2.** Baterino is not liable for indirect damage, loss of profit or data from use or inability to use the Site, except where imperatively required by law.',
          },
          {
            kind: 'p',
            text: '**14.3.** This article does not limit Consumers\' legal rights or exclude liability that cannot be excluded by law.',
          },
        ],
      },
      {
        title: '15. Force majeure',
        blocks: [
          {
            kind: 'p',
            text: '**15.1.** Neither party is liable for non-performance caused by force majeure or fortuitous event under applicable law.',
          },
          {
            kind: 'p',
            text: '**15.2.** The affected party notifies the other of occurrence and end of the event. If it persists beyond a reasonable period, either party may request termination without damages.',
          },
        ],
      },
      {
        title: '16. Personal data protection',
        blocks: [
          {
            kind: 'p',
            text: '**16.1.** Baterino processes Customers\' personal data in accordance with Regulation (EU) 2016/679 (GDPR) and applicable national law.',
          },
          {
            kind: 'p',
            text: '**16.2.** Details on data categories, purposes, legal bases, retention and data subject rights are in the **Privacy Policy**, an integral part of these Terms.',
          },
        ],
      },
      {
        title: '17. Dispute resolution',
        blocks: [
          {
            kind: 'p',
            text: '**17.1.** Disputes shall be resolved amicably where possible; otherwise Romanian courts have jurisdiction.',
          },
          {
            kind: 'p',
            text: '**17.2.** Consumers may contact ANPC at [www.anpc.ro](https://anpc.ro) and use alternative dispute resolution (ADR) through competent ADR entities. The list of EU consumer dispute resolution bodies is on the European Commission [Consumer Redress](https://consumer-redress.ec.europa.eu/dispute-resolution-bodies_en) page.',
          },
          {
            kind: 'p',
            text: '**17.3.** This Contract is governed by Romanian law.',
          },
        ],
      },
      {
        title: '18. Amendment of the Terms',
        blocks: [
          {
            kind: 'p',
            text: '**18.1.** Baterino may amend these Terms at any time by publishing the updated version on the Site with the last update date.',
          },
          {
            kind: 'p',
            text: '**18.2.** Amendments take effect from publication. Orders placed earlier are governed by the version in force at placement.',
          },
          {
            kind: 'p',
            text: '**18.3.** When these Terms, Return Policy, Discount Programme Terms or Privacy Policy are amended, Baterino will inform Customers and Partners by email at the account address about the update and effective date.',
          },
        ],
      },
      {
        title: '19. Final provisions',
        blocks: [
          {
            kind: 'p',
            text: '**19.1.** If any clause is void or unenforceable, the remaining clauses remain valid.',
          },
          {
            kind: 'p',
            text: '**19.2.** Failure by Baterino to exercise a right under these Terms is not a waiver of that right.',
          },
          {
            kind: 'p',
            text: '**19.3.** These Terms, together with the Privacy Policy, Return Policy and Discount Programme Terms, constitute the entire agreement on use of the Site and purchase of Baterino Products and Services.',
          },
        ],
      },
    ],
  },
}

export function getTermeniSiConditiiTranslations(lang: LangCode): TermeniSiConditiiTranslations {
  return translations[lang] ?? translations.ro
}
