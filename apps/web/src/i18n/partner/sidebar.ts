import type { LangCode } from '../menu'

export type PartnerSidebarAdvantageRow = { label: string; sub: string }

export type PartnerSidebarSupportItem = { id: string; label: string; sub: string }

export type PartnerSidebarTranslations = {
  reducereEyebrow: string
  reducereTitle: string
  reducereBenefit: string
  reducereNoDiscount: string
  reducereContact: string
  inverterTitle: string
  inverterBody: string
  inverterOpenLabel: string
  partnerAdvantagesTitle: string
  partnerAdvantageRows: PartnerSidebarAdvantageRow[]
  sigurantaTitle: string
  sigurantaItems: PartnerSidebarAdvantageRow[]
  suportTitle: string
  suportItems: PartnerSidebarSupportItem[]
  suportCta: string
}

const ro: PartnerSidebarTranslations = {
  reducereEyebrow: 'Reducere partener',
  reducereTitle: 'Reducere',
  reducereBenefit: 'Beneficiezi de o reducere de {pct}% la toate produsele.',
  reducereNoDiscount: 'Nicio reducere configurată momentan.',
  reducereContact: 'Contactați-ne pentru a stabili condițiile de parteneriat.',
  inverterTitle: 'Compatibilitate invertoare',
  inverterBody: 'Verifică dacă bateriile noastre sunt compatibile cu invertoarele clienților tăi.',
  inverterOpenLabel: 'Deschide căutarea de compatibilitate invertoare',
  partnerAdvantagesTitle: 'Avantaje Partener',
  partnerAdvantageRows: [
    {
      label: 'Reduceri parteneri',
      sub: 'Prețuri preferențiale și condiții clare dedicate partenerilor Baterino.',
    },
    {
      label: 'Promovare afacere',
      sub: 'Vizibilitate pe platformă și acces la clienți din zona ta care caută instalatori.',
    },
    {
      label: 'Prețuri predictibile',
      sub: 'Structură stabilă și marje ușor de anticipat pentru fiecare proiect.',
    },
    {
      label: 'Produse de calitate',
      sub: 'Baterii certificate, verificate tehnic și acoperite de garanție extinsă.',
    },
  ],
  sigurantaTitle: 'Siguranța Clientului Tău',
  sigurantaItems: [
    { label: '', sub: 'Produsele sunt acoperite de garanție extinsă de 10 ani.' },
    { label: '', sub: 'Compatibile cu 99% dintre invertoarele de pe piață.' },
    { label: '', sub: 'Retur gratuit în primele 15 zile de la achiziție.' },
    { label: '', sub: 'Înlocuire rapidă a bateriei în caz de defecțiune.' },
  ],
  suportTitle: 'Suport Tehnic',
  suportItems: [
    {
      id: 'service',
      label: 'Suport & Service',
      sub: 'Echipă dedicată pentru întrebări tehnice și service în România.',
    },
    {
      id: 'install',
      label: 'Asistență instalare',
      sub: 'Sprijin la montaj, verificarea conexiunilor și punerea în funcțiune pentru fiecare proiect.',
    },
    {
      id: 'docs',
      label: 'Documentație tehnică',
      sub: 'Fișe de montaj, datasheet-uri și proceduri actualizate, disponibile la cerere.',
    },
  ],
  suportCta: 'Contactează suportul →',
}

const en: PartnerSidebarTranslations = {
  reducereEyebrow: 'Partner discount',
  reducereTitle: 'Discount',
  reducereBenefit: 'You benefit from a {pct}% discount on all products.',
  reducereNoDiscount: 'No discount configured at the moment.',
  reducereContact: 'Contact us to set up partnership terms.',
  inverterTitle: 'Inverter compatibility',
  inverterBody: "Check whether our batteries are compatible with your customers' inverters.",
  inverterOpenLabel: 'Open inverter compatibility search',
  partnerAdvantagesTitle: 'Partner advantages',
  partnerAdvantageRows: [
    {
      label: 'Partner discounts',
      sub: 'Preferential pricing and transparent terms for Baterino partners.',
    },
    {
      label: 'Business promotion',
      sub: 'Platform visibility and homeowner demand in your service area.',
    },
    {
      label: 'Predictable pricing',
      sub: 'Stable structures and margins you can plan around on every job.',
    },
    {
      label: 'Quality products',
      sub: 'Certified batteries, technically validated with strong warranty backing.',
    },
  ],
  sigurantaTitle: 'Your customer safety',
  sigurantaItems: [
    { label: '', sub: 'Products are covered by an extended 10-year warranty.' },
    { label: '', sub: 'Compatible with 99% of inverters on the market.' },
    { label: '', sub: 'Free returns within the first 15 days after purchase.' },
    { label: '', sub: 'Fast battery replacement in case of a defect.' },
  ],
  suportTitle: 'Technical support',
  suportItems: [
    {
      id: 'service',
      label: 'Support & service',
      sub: 'Dedicated team for technical questions and servicing in Romania.',
    },
    {
      id: 'install',
      label: 'Installation assistance',
      sub: 'Help with mounting, connection checks and commissioning on every installation.',
    },
    {
      id: 'docs',
      label: 'Technical documentation',
      sub: 'Mounting guides, datasheets and up-to-date procedures available on request.',
    },
  ],
  suportCta: 'Contact support →',
}

const zh: PartnerSidebarTranslations = {
  reducereEyebrow: '合作伙伴折扣',
  reducereTitle: '折扣',
  reducereBenefit: '您可享受全场 {pct}% 的合作伙伴折扣。',
  reducereNoDiscount: '当前尚未配置折扣。',
  reducereContact: '请联系我们商定合作条件。',
  inverterTitle: '逆变器兼容性',
  inverterBody: '核对我们的储能电池是否与您的客户使用的逆变器匹配。',
  inverterOpenLabel: '打开逆变器兼容性搜索',
  partnerAdvantagesTitle: '合作优势',
  partnerAdvantageRows: [
    { label: '合作伙伴折扣', sub: 'Baterino 合作伙伴享受更优拿货价与清晰条款。' },
    { label: '业务推广', sub: '在平台获得曝光并触达附近有需求的终端用户。' },
    { label: '可预期的价格体系', sub: '价格与利润空间稳定，便于项目核算与备货。' },
    { label: '优质产品', sub: '产品通过认证与技术验证，并享有扎实的质保。' },
  ],
  sigurantaTitle: '客户保障',
  sigurantaItems: [
    { label: '', sub: '产品享有 10 年延长质保。' },
    { label: '', sub: '兼容市场上 99% 的逆变器。' },
    { label: '', sub: '购买后 15 天内可免费退货。' },
    { label: '', sub: '故障时快速更换电池。' },
  ],
  suportTitle: '技术支持',
  suportItems: [
    { id: 'service', label: '支持与服务', sub: '专属团队为您解答技术问题并提供罗马尼亚本地的售后支持。' },
    { id: 'install', label: '安装协助', sub: '提供安装布线检查与上电调试等现场级协助，适配每个项目。' },
    { id: 'docs', label: '技术资料', sub: '可按需提供安装手册、规格书及最新操作规程。' },
  ],
  suportCta: '联系技术支持 →',
}

const translations: Record<LangCode, PartnerSidebarTranslations> = { ro, en, zh }

export function getPartnerSidebarTranslations(lang: LangCode): PartnerSidebarTranslations {
  return translations[lang] ?? translations.ro
}
