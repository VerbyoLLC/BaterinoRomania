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
  zh: {
    seoTitle: '隐私政策 – Baterino 罗马尼亚',
    seoDesc: 'Baterino罗马尼亚隐私政策 – 我们如何根据GDPR收集、使用和保护您的个人数据。',
    pageTitle: '隐私政策',
    lastUpdated: '最后更新：2025年5月',
    sections: [
      {
        title: '1. 关于我们',
        content:
          'Baterino Energy SRL（税务编号42707733），总部位于罗马尼亚伊尔福夫县奥托佩尼市23 August街244-43A号1室，是通过baterino.ro网站收集的个人数据的控制者。您可以通过contact@baterino.ro或网站上显示的电话号码与我们联系。',
      },
      {
        title: '2. 我们收集的数据',
        content: [
          '身份识别数据：姓名、电子邮件地址、电话号码。',
          '账单数据：地址、税务号码/增值税号、公司名称（如适用）。',
          '账户数据：登录凭据（加密密码）、账户偏好设置。',
          '使用数据：IP地址、浏览器类型、访问页面、会话时长。',
          '通信数据：通过联系表单或WhatsApp发送的消息。',
        ],
      },
      {
        title: '3. 我们为何收集数据',
        content: [
          '处理订单和开具财务文件（法律依据：履行合同）。',
          '管理您的客户或合作伙伴账户（法律依据：履行合同）。',
          '回应您的咨询和支持请求（法律依据：合法利益）。',
          '仅在您明确同意的情况下发送商业通讯（法律依据：同意）。',
          '改善我们的服务和网站安全性（法律依据：合法利益）。',
          '遵守法律义务（法律依据：法律义务）。',
        ],
      },
      {
        title: '4. 数据保留期限',
        content:
          '根据罗马尼亚税法，订单和财务文件数据至少保留10年。账户数据在账户存续期间保留，删除后再保留30天。营销数据在撤回同意前保留。匿名使用数据可无限期保留。',
      },
      {
        title: '5. 数据共享对象',
        content: [
          '支付服务提供商（授权支付处理商）。',
          '配送和物流服务提供商。',
          '法律要求时的公共机构。',
        ],
      },
      {
        title: '6. 您的权利',
        content: [
          '访问权 – 您可以请求我们持有的关于您的数据副本。',
          '更正权 – 您可以请求更正不准确的数据。',
          '删除权 – 您可以请求删除您的数据，但须遵守法律义务。',
          '限制处理权 – 您可以请求我们限制对您数据的处理。',
          '数据可携带权 – 您可以以结构化、机器可读格式接收您的数据。',
          '反对权 – 您可以反对基于合法利益的数据处理。',
          '撤回同意权 – 可随时撤回，不影响之前处理的合法性。',
        ],
      },
      {
        title: '7. 如何行使您的权利',
        content:
          '请发送书面请求至contact@baterino.ro，主题注明"GDPR请求"。我们将在30天内回复。您也有权向罗马尼亚个人数据处理监督局（ANSPDCP）提出投诉，网址：www.dataprotection.ro。',
      },
      {
        title: '8. Cookie',
        content:
          '网站使用严格必要的Cookie用于其运行（身份验证、购物车）和分析Cookie以改善体验（须获得您的同意）。您可以在浏览器设置中管理Cookie偏好设置。',
      },
      {
        title: '9. 数据安全',
        content:
          '我们采取适当的技术和组织措施保护您的数据：HTTPS加密连接、哈希密码存储、受限系统访问、定期数据备份和持续安全监控。',
      },
      {
        title: '10. 本政策的变更',
        content:
          '我们保留定期更新本政策的权利。更新版本将发布在本页面，并注明最后修改日期。在更改发布后继续使用本网站即表示接受新版本。',
      },
    ],
  },
}

export function getPoliticaConfidentialitateTranslations(
  lang: LangCode,
): PoliticaConfidentialitateTranslations {
  return translations[lang] ?? translations.ro
}
