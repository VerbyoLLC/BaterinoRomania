import type { LangCode } from './menu'

export type PoliticaConfidentialitateBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }

export type PoliticaConfidentialitateSection = {
  title: string
  blocks: PoliticaConfidentialitateBlock[]
}

export type PoliticaConfidentialitateTranslations = {
  seoTitle: string
  seoDesc: string
  pageTitle: string
  intro: string
  tocTitle: string
  lastUpdated: string
  sections: PoliticaConfidentialitateSection[]
}

const translations: Record<LangCode, PoliticaConfidentialitateTranslations> = {
  ro: {
    seoTitle: 'Politica de Confidențialitate – Baterino România',
    seoDesc:
      'Politica de confidențialitate baterino.ro — cum colectăm, utilizăm și protejăm datele personale conform GDPR.',
    pageTitle: 'Politica de Confidențialitate — baterino.ro',
    intro:
      'Baterino Energy SRL respectă confidențialitatea vizitatorilor și clienților săi și prelucrează datele cu caracter personal în conformitate cu Regulamentul (UE) 2016/679 (**GDPR**) și legislația națională aplicabilă. Vă rugăm să citiți această politică pentru a înțelege ce date colectăm, de ce și care sunt drepturile dumneavoastră.',
    tocTitle: 'Cuprins',
    lastUpdated: 'Ultima actualizare: iunie 2026',
    sections: [
      {
        title: '1. Cine suntem (Operatorul)',
        blocks: [
          {
            kind: 'p',
            text: '**Baterino Energy SRL** (CUI 42707733), cu sediul în Str. 23 August Nr. 244-43A, Camera 1, Oraș Otopeni, Jud. Ilfov, România, este operatorul datelor cu caracter personal colectate prin intermediul site-ului **baterino.ro**.',
          },
          {
            kind: 'p',
            text: 'Pentru orice întrebare privind prelucrarea datelor sau exercitarea drepturilor, ne puteți contacta la **contact@baterino.ro** (subiect: „Cerere GDPR") sau telefonic, la numărul afișat pe site.',
          },
        ],
      },
      {
        title: '2. Ce date colectăm',
        blocks: [
          {
            kind: 'ul',
            items: [
              '**Date de identificare:** nume, prenume, adresă de e-mail, număr de telefon.',
              '**Date de facturare:** adresă, cod fiscal / CUI, denumire firmă (după caz).',
              '**Date de cont:** credențiale de autentificare (parolă stocată criptat), preferințe de cont.',
              '**Date privind comenzile:** produse achiziționate, istoricul comenzilor, statusul livrării.',
              '**Date de utilizare:** adresa IP, tipul de browser și dispozitiv, paginile vizitate, durata sesiunii.',
              '**Date de comunicare:** mesajele transmise prin formularul de contact, e-mail sau WhatsApp.',
            ],
          },
          {
            kind: 'p',
            text: 'Nu colectăm în mod intenționat categorii speciale de date (date sensibile). Vă rugăm să nu ne transmiteți astfel de date prin canalele noastre.',
          },
        ],
      },
      {
        title: '3. De ce colectăm datele (scopuri și temeiuri legale)',
        blocks: [
          {
            kind: 'ul',
            items: [
              '**Procesarea comenzilor și emiterea documentelor fiscale** — temei: executarea unui contract (art. 6 alin. 1 lit. b GDPR) și obligație legală (lit. c).',
              '**Gestionarea contului de client sau de partener** — temei: executarea unui contract (lit. b).',
              '**Răspuns la solicitările de informații sau asistență** — temei: interes legitim (lit. f) sau pași precontractuali (lit. b).',
              '**Trimiterea de comunicări comerciale** — exclusiv cu acordul dumneavoastră explicit (consimțământ, lit. a).',
              '**Îmbunătățirea serviciilor și securitatea site-ului** — temei: interes legitim (lit. f).',
              '**Respectarea obligațiilor legale** (fiscale, contabile, de protecție a consumatorului) — temei: obligație legală (lit. c).',
            ],
          },
        ],
      },
      {
        title: '4. Caracterul furnizării datelor',
        blocks: [
          {
            kind: 'p',
            text: 'Furnizarea datelor de identificare și de facturare este necesară pentru încheierea și executarea contractului și pentru emiterea documentelor fiscale. Fără aceste date, nu putem procesa comanda. Furnizarea datelor în scop de marketing este voluntară și nu condiționează achiziția.',
          },
        ],
      },
      {
        title: '5. Cât timp păstrăm datele',
        blocks: [
          {
            kind: 'ul',
            items: [
              '**Date aferente comenzilor și documentelor fiscale:** minimum 10 ani, conform legislației fiscale și contabile române.',
              '**Date de cont:** pe durata existenței contului, plus 30 de zile după ștergere.',
              '**Date de marketing:** până la retragerea consimțământului.',
              '**Date de comunicare (cereri/asistență):** pe durata necesară soluționării și pentru o perioadă rezonabilă ulterioară, în limita intereselor legitime.',
              '**Date de utilizare anonimizate:** pot fi păstrate pe termen nelimitat, întrucât nu mai permit identificarea.',
            ],
          },
        ],
      },
      {
        title: '6. Cu cine partajăm datele',
        blocks: [
          {
            kind: 'p',
            text: 'Putem divulga datele, strict în scopurile de mai sus, către următoarele categorii de destinatari, care acționează ca persoane împuternicite și prelucrează datele exclusiv conform instrucțiunilor noastre:',
          },
          {
            kind: 'ul',
            items: [
              'furnizori de servicii de plată (procesatori autorizați);',
              'furnizori de servicii de livrare și logistică;',
              'furnizori de servicii IT, găzduire și comunicații electronice care susțin funcționarea Platformei;',
              'autorități publice, atunci când suntem obligați prin lege.',
            ],
          },
          {
            kind: 'p',
            text: 'Toate persoanele împuternicite sunt obligate contractual să respecte GDPR și să asigure măsuri de securitate adecvate. Nu vindem datele dumneavoastră.',
          },
        ],
      },
      {
        title: '7. Localizarea și transferul datelor',
        blocks: [
          {
            kind: 'p',
            text: '**Toate datele clienților sunt stocate și prelucrate pe servere europene, neexistând schimburi de date — chiar și neidentificabile — cu țări din afara spațiului Uniunii Europene.**',
          },
        ],
      },
      {
        title: '8. Securitatea datelor',
        blocks: [
          {
            kind: 'p',
            text: 'Aplicăm măsuri tehnice și organizatorice adecvate pentru protejarea datelor: conexiuni criptate HTTPS, stocarea parolelor prin hashing, acces restricționat la sisteme pe bază de necesitate, copii de rezervă periodice și monitorizarea continuă a securității. În cazul unei breșe de securitate cu risc pentru drepturile dumneavoastră, vom notifica autoritatea competentă și, după caz, persoanele vizate, în condițiile legii.',
          },
        ],
      },
      {
        title: '9. Drepturile dumneavoastră',
        blocks: [
          {
            kind: 'ul',
            items: [
              '**Dreptul de acces** — puteți solicita o copie a datelor pe care le deținem despre dumneavoastră.',
              '**Dreptul la rectificare** — puteți cere corectarea datelor inexacte sau completarea celor incomplete.',
              '**Dreptul la ștergere** („dreptul de a fi uitat") — în limitele obligațiilor noastre legale.',
              '**Dreptul la restricționarea prelucrării** — puteți cere limitarea utilizării datelor.',
              '**Dreptul la portabilitate** — puteți primi datele într-un format structurat, utilizat în mod curent și care poate fi citit automat.',
              '**Dreptul de opoziție** — vă puteți opune prelucrărilor bazate pe interes legitim sau în scop de marketing.',
              '**Dreptul de a retrage consimțământul** — în orice moment, fără a afecta legalitatea prelucrărilor anterioare.',
              '**Dreptul de a nu fi supus unei decizii automate** — nu luăm decizii cu efecte juridice asupra dumneavoastră bazate exclusiv pe prelucrare automată, fără intervenție umană.',
            ],
          },
        ],
      },
      {
        title: '10. Cum vă exercitați drepturile',
        blocks: [
          {
            kind: 'p',
            text: 'Trimiteți o solicitare scrisă la **contact@baterino.ro**, cu subiectul „Cerere GDPR". Vom răspunde în termen de maximum 30 de zile. Pentru verificarea identității, putem solicita informații suplimentare.',
          },
          {
            kind: 'p',
            text: 'Aveți, de asemenea, dreptul de a depune o plângere la **Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)**, https://www.dataprotection.ro.',
          },
        ],
      },
      {
        title: '11. Cookie-uri',
        blocks: [
          {
            kind: 'p',
            text: 'Site-ul utilizează cookie-uri **strict necesare** pentru funcționarea sa (autentificare, coș de cumpărături) și cookie-uri **analitice**, folosite numai cu consimțământul dumneavoastră, pentru îmbunătățirea experienței. Vă puteți gestiona preferințele din bannerul de cookie-uri și din setările browserului. Detalii suplimentare pot fi furnizate într-o Politică de Cookie-uri dedicată.',
          },
        ],
      },
      {
        title: '12. Datele minorilor',
        blocks: [
          {
            kind: 'p',
            text: 'Site-ul și serviciile noastre se adresează persoanelor cu vârsta de cel puțin 18 ani. Nu colectăm cu bună știință date ale minorilor. Dacă luăm cunoștință de astfel de date colectate fără temei, le vom șterge.',
          },
        ],
      },
      {
        title: '13. Modificări ale politicii',
        blocks: [
          {
            kind: 'p',
            text: 'Ne rezervăm dreptul de a actualiza periodic această politică. Versiunea actualizată va fi publicată pe această pagină, cu indicarea datei ultimei modificări. Utilizarea continuă a site-ului după publicarea modificărilor constituie acceptarea noii versiuni.',
          },
        ],
      },
    ],
  },
  en: {
    seoTitle: 'Privacy Policy – Baterino Romania',
    seoDesc:
      'baterino.ro privacy policy — how we collect, use and protect personal data in accordance with GDPR.',
    pageTitle: 'Privacy Policy — baterino.ro',
    intro:
      'Baterino Energy SRL respects the privacy of its visitors and customers and processes personal data in accordance with Regulation (EU) 2016/679 (**GDPR**) and applicable national law. Please read this policy to understand what data we collect, why, and what your rights are.',
    tocTitle: 'Table of contents',
    lastUpdated: 'Last updated: June 2026',
    sections: [
      {
        title: '1. Who we are (Controller)',
        blocks: [
          {
            kind: 'p',
            text: '**Baterino Energy SRL** (Tax ID 42707733), headquartered at Str. 23 August Nr. 244-43A, Camera 1, Otopeni, Ilfov County, Romania, is the controller of personal data collected through the **baterino.ro** website.',
          },
          {
            kind: 'p',
            text: 'For any questions regarding data processing or exercising your rights, contact us at **contact@baterino.ro** (subject: "GDPR Request") or by phone at the number shown on the website.',
          },
        ],
      },
      {
        title: '2. What data we collect',
        blocks: [
          {
            kind: 'ul',
            items: [
              '**Identification data:** name, email address, phone number.',
              '**Billing data:** address, tax ID / VAT number, company name (if applicable).',
              '**Account data:** login credentials (password stored encrypted), account preferences.',
              '**Order data:** products purchased, order history, delivery status.',
              '**Usage data:** IP address, browser and device type, pages visited, session duration.',
              '**Communication data:** messages sent via the contact form, email or WhatsApp.',
            ],
          },
          {
            kind: 'p',
            text: 'We do not intentionally collect special categories of data (sensitive data). Please do not send us such data through our channels.',
          },
        ],
      },
      {
        title: '3. Why we collect data (purposes and legal bases)',
        blocks: [
          {
            kind: 'ul',
            items: [
              '**Processing orders and issuing fiscal documents** — basis: performance of a contract (Art. 6(1)(b) GDPR) and legal obligation (lit. c).',
              '**Managing client or partner accounts** — basis: performance of a contract (lit. b).',
              '**Responding to information or support requests** — basis: legitimate interest (lit. f) or pre-contractual steps (lit. b).',
              '**Sending commercial communications** — only with your explicit consent (consent, lit. a).',
              '**Improving services and website security** — basis: legitimate interest (lit. f).',
              '**Compliance with legal obligations** (tax, accounting, consumer protection) — basis: legal obligation (lit. c).',
            ],
          },
        ],
      },
      {
        title: '4. Whether providing data is mandatory',
        blocks: [
          {
            kind: 'p',
            text: 'Providing identification and billing data is necessary to conclude and perform the contract and to issue fiscal documents. Without this data, we cannot process your order. Providing data for marketing purposes is voluntary and does not condition a purchase.',
          },
        ],
      },
      {
        title: '5. How long we keep data',
        blocks: [
          {
            kind: 'ul',
            items: [
              '**Order and fiscal document data:** at least 10 years, under Romanian tax and accounting law.',
              '**Account data:** for the duration of the account, plus 30 days after deletion.',
              '**Marketing data:** until consent is withdrawn.',
              '**Communication data (requests/support):** for as long as needed to resolve the matter and for a reasonable period thereafter, within legitimate interests.',
              '**Anonymised usage data:** may be kept indefinitely, as it no longer allows identification.',
            ],
          },
        ],
      },
      {
        title: '6. Who we share data with',
        blocks: [
          {
            kind: 'p',
            text: 'We may disclose data, strictly for the purposes above, to the following categories of recipients acting as processors and processing data solely on our instructions:',
          },
          {
            kind: 'ul',
            items: [
              'payment service providers (authorised processors);',
              'delivery and logistics service providers;',
              'IT, hosting and electronic communications providers supporting the Platform;',
              'public authorities when required by law.',
            ],
          },
          {
            kind: 'p',
            text: 'All processors are contractually obliged to comply with GDPR and ensure adequate security measures. We do not sell your data.',
          },
        ],
      },
      {
        title: '7. Data location and transfers',
        blocks: [
          {
            kind: 'p',
            text: '**All customer data is stored and processed on European servers, with no data transfers — even non-identifiable — to countries outside the European Union.**',
          },
        ],
      },
      {
        title: '8. Data security',
        blocks: [
          {
            kind: 'p',
            text: 'We apply appropriate technical and organisational measures to protect data: HTTPS encrypted connections, password hashing, need-to-know restricted system access, periodic backups and continuous security monitoring. In the event of a security breach that poses a risk to your rights, we will notify the competent authority and, where applicable, data subjects, as required by law.',
          },
        ],
      },
      {
        title: '9. Your rights',
        blocks: [
          {
            kind: 'ul',
            items: [
              '**Right of access** — you may request a copy of the data we hold about you.',
              '**Right to rectification** — you may request correction of inaccurate or incomplete data.',
              '**Right to erasure** ("right to be forgotten") — subject to our legal obligations.',
              '**Right to restriction of processing** — you may request that we limit use of your data.',
              '**Right to data portability** — you may receive your data in a structured, commonly used, machine-readable format.',
              '**Right to object** — you may object to processing based on legitimate interest or for marketing.',
              '**Right to withdraw consent** — at any time, without affecting the lawfulness of prior processing.',
              '**Right not to be subject to automated decision-making** — we do not make decisions with legal effects on you based solely on automated processing without human involvement.',
            ],
          },
        ],
      },
      {
        title: '10. How to exercise your rights',
        blocks: [
          {
            kind: 'p',
            text: 'Send a written request to **contact@baterino.ro** with the subject "GDPR Request". We will respond within 30 days. We may request additional information to verify your identity.',
          },
          {
            kind: 'p',
            text: 'You also have the right to lodge a complaint with the **Romanian National Supervisory Authority for Personal Data Processing (ANSPDCP)**, https://www.dataprotection.ro.',
          },
        ],
      },
      {
        title: '11. Cookies',
        blocks: [
          {
            kind: 'p',
            text: 'The website uses **strictly necessary** cookies for its operation (authentication, shopping cart) and **analytics** cookies, used only with your consent, to improve the experience. You can manage preferences in the cookie banner and in your browser settings. Further details may be provided in a dedicated Cookie Policy.',
          },
        ],
      },
      {
        title: '12. Children\'s data',
        blocks: [
          {
            kind: 'p',
            text: 'Our website and services are intended for persons aged 18 or over. We do not knowingly collect data from minors. If we become aware of such data collected without a legal basis, we will delete it.',
          },
        ],
      },
      {
        title: '13. Changes to this policy',
        blocks: [
          {
            kind: 'p',
            text: 'We reserve the right to update this policy periodically. The updated version will be published on this page with the date of the last change. Continued use of the website after changes are published constitutes acceptance of the new version.',
          },
        ],
      },
    ],
  },
}

export function getPoliticaConfidentialitateTranslations(
  lang: LangCode,
): PoliticaConfidentialitateTranslations {
  return translations[lang] ?? translations.ro
}
