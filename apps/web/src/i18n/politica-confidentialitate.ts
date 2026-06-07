import type { LangCode } from './menu'

export type PoliticaConfidentialitateTranslations = {
  seoTitle: string
  seoDesc: string
  pageTitle: string
  lastUpdated: string
  sections: {
    title: string
    content: string | string[]
  }[]
}

const translations: Record<LangCode, PoliticaConfidentialitateTranslations> = {
  ro: {
    seoTitle: 'Politica de Confidențialitate – Baterino România',
    seoDesc:
      'Politica de confidențialitate Baterino România – cum colectăm, utilizăm și protejăm datele dumneavoastră personale conform GDPR.',
    pageTitle: 'Politica de Confidențialitate',
    lastUpdated: 'Ultima actualizare: mai 2025',
    sections: [
      {
        title: '1. Cine suntem',
        content:
          'Baterino Energy SRL (CUI 42707733), cu sediul în Str. 23 August Nr. 244-43A, Camera 1, Oraș Otopeni, Jud. Ilfov, România, este operatorul datelor cu caracter personal colectate prin intermediul site-ului baterino.ro. Ne puteți contacta la adresa de e-mail contact@baterino.ro sau telefonic la numărul afișat pe site.',
      },
      {
        title: '2. Ce date colectăm',
        content: [
          'Date de identificare: nume, prenume, adresă de e-mail, număr de telefon.',
          'Date de facturare: adresă, cod fiscal / CUI, denumire firmă (după caz).',
          'Date de cont: credențiale de autentificare (parolă criptată), preferințe cont.',
          'Date de utilizare: adresa IP, tipul de browser, paginile vizitate, durata sesiunii.',
          'Date de comunicare: mesajele trimise prin formularul de contact sau prin WhatsApp.',
        ],
      },
      {
        title: '3. De ce colectăm datele',
        content: [
          'Procesarea comenzilor și emiterea documentelor fiscale (bază legală: executarea unui contract).',
          'Gestionarea contului de client sau partener (bază legală: executarea unui contract).',
          'Răspuns la solicitările dvs. de informații sau asistență (bază legală: interes legitim).',
          'Trimiterea de comunicări comerciale, numai cu acordul dvs. explicit (bază legală: consimțământ).',
          'Îmbunătățirea serviciilor și securității site-ului (bază legală: interes legitim).',
          'Respectarea obligațiilor legale (bază legală: obligație legală).',
        ],
      },
      {
        title: '4. Cât timp păstrăm datele',
        content:
          'Datele aferente comenzilor și documentelor fiscale sunt păstrate minimum 10 ani conform legislației fiscale române. Datele de cont sunt păstrate pe durata existenței contului, plus 30 de zile după ștergere. Datele de marketing sunt păstrate până la retragerea consimțământului. Datele de utilizare anonimizate pot fi păstrate pe termen nelimitat.',
      },
      {
        title: '5. Cu cine partajăm datele',
        content: [
          'Furnizori de servicii de plată (procesatori de plăți autorizați).',
          'Furnizori de servicii de livrare și logistică.',
          'Autorități publice, când suntem obligați prin lege.',
        ],
      },
      {
        title: '6. Drepturile dvs.',
        content: [
          'Dreptul de acces – puteți solicita o copie a datelor pe care le deținem despre dvs.',
          'Dreptul la rectificare – puteți cere corectarea datelor inexacte.',
          'Dreptul la ștergere – puteți solicita ștergerea datelor, în limitele obligațiilor legale.',
          'Dreptul la restricționarea prelucrării – puteți cere limitarea utilizării datelor dvs.',
          'Dreptul la portabilitate – puteți primi datele într-un format structurat, lizibil automat.',
          'Dreptul de opoziție – vă puteți opune prelucrării bazate pe interesul legitim.',
          'Dreptul de a retrage consimțământul – în orice moment, fără a afecta legalitatea prelucrărilor anterioare.',
        ],
      },
      {
        title: '7. Cum vă exercitați drepturile',
        content:
          'Trimiteți o solicitare scrisă la contact@baterino.ro cu subiectul „Cerere GDPR". Vom răspunde în termen de maximum 30 de zile. Aveți, de asemenea, dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), www.dataprotection.ro.',
      },
      {
        title: '8. Cookie-uri',
        content:
          'Site-ul utilizează cookie-uri strict necesare pentru funcționarea acestuia (autentificare, coș de cumpărături) și cookie-uri analitice pentru îmbunătățirea experienței (cu consimțământul dvs.). Puteți gestiona preferințele de cookie-uri din setările browserului.',
      },
      {
        title: '9. Securitatea datelor',
        content:
          'Aplicăm măsuri tehnice și organizatorice adecvate pentru protejarea datelor dvs.: conexiuni criptate HTTPS, parole stocate prin hashing, acces restricționat la sisteme, backup regulat al datelor și monitorizarea continuă a securității.',
      },
      {
        title: '10. Modificări ale politicii',
        content:
          'Ne rezervăm dreptul de a actualiza această politică periodic. Versiunea actualizată va fi publicată pe această pagină cu data ultimei modificări. Utilizarea continuă a site-ului după publicarea modificărilor constituie acceptarea noii versiuni.',
      },
    ],
  },
  en: {
    seoTitle: 'Privacy Policy – Baterino Romania',
    seoDesc:
      'Baterino Romania privacy policy – how we collect, use and protect your personal data in accordance with GDPR.',
    pageTitle: 'Privacy Policy',
    lastUpdated: 'Last updated: May 2025',
    sections: [
      {
        title: '1. Who We Are',
        content:
          'Baterino Energy SRL (Tax ID 42707733), headquartered at Str. 23 August Nr. 244-43A, Camera 1, Otopeni, Ilfov County, Romania, is the controller of personal data collected through the baterino.ro website. You can contact us at contact@baterino.ro or by phone at the number shown on the website.',
      },
      {
        title: '2. Data We Collect',
        content: [
          'Identification data: name, email address, phone number.',
          'Billing data: address, tax ID / VAT number, company name (if applicable).',
          'Account data: login credentials (encrypted password), account preferences.',
          'Usage data: IP address, browser type, pages visited, session duration.',
          'Communication data: messages sent via the contact form or WhatsApp.',
        ],
      },
      {
        title: '3. Why We Collect Data',
        content: [
          'Processing orders and issuing fiscal documents (legal basis: performance of a contract).',
          'Managing your client or partner account (legal basis: performance of a contract).',
          'Responding to your inquiries and support requests (legal basis: legitimate interest).',
          'Sending commercial communications, only with your explicit consent (legal basis: consent).',
          'Improving our services and website security (legal basis: legitimate interest).',
          'Compliance with legal obligations (legal basis: legal obligation).',
        ],
      },
      {
        title: '4. How Long We Keep Data',
        content:
          'Order and fiscal document data is retained for a minimum of 10 years under Romanian tax law. Account data is retained for the duration of the account, plus 30 days after deletion. Marketing data is retained until consent is withdrawn. Anonymised usage data may be retained indefinitely.',
      },
      {
        title: '5. Who We Share Data With',
        content: [
          'Payment service providers (authorised payment processors).',
          'Delivery and logistics service providers.',
          'Public authorities, when required by law.',
        ],
      },
      {
        title: '6. Your Rights',
        content: [
          'Right of access – you may request a copy of the data we hold about you.',
          'Right to rectification – you may request correction of inaccurate data.',
          'Right to erasure – you may request deletion of your data, subject to legal obligations.',
          'Right to restriction – you may request that we limit the processing of your data.',
          'Right to portability – you may receive your data in a structured, machine-readable format.',
          'Right to object – you may object to processing based on legitimate interest.',
          'Right to withdraw consent – at any time, without affecting the lawfulness of prior processing.',
        ],
      },
      {
        title: '7. How to Exercise Your Rights',
        content:
          'Send a written request to contact@baterino.ro with the subject "GDPR Request". We will respond within 30 days. You also have the right to lodge a complaint with the Romanian National Supervisory Authority for Personal Data Processing (ANSPDCP) at www.dataprotection.ro.',
      },
      {
        title: '8. Cookies',
        content:
          'The website uses strictly necessary cookies for its operation (authentication, shopping cart) and analytical cookies to improve the experience (with your consent). You can manage cookie preferences in your browser settings.',
      },
      {
        title: '9. Data Security',
        content:
          'We apply appropriate technical and organisational measures to protect your data: HTTPS encrypted connections, hashed password storage, restricted system access, regular data backups, and continuous security monitoring.',
      },
      {
        title: '10. Changes to This Policy',
        content:
          'We reserve the right to update this policy periodically. The updated version will be published on this page with the date of the last change. Continued use of the website after changes are published constitutes acceptance of the new version.',
      },
    ],
  },
}

export function getPoliticaConfidentialitateTranslations(
  lang: LangCode,
): PoliticaConfidentialitateTranslations {
  return translations[lang] ?? translations.ro
}
