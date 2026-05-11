import type { LangCode } from './menu'

export type ClientBenefitsTranslations = {
  pageTitle: string
  pageSubtitle: string
  /** Card 1 */
  c1Title: string
  c1Desc: string
  c1Btn: string
  /** Card 2 */
  c2Title: string
  c2Desc: string
  c2Btn: string
  /** Card 3 */
  c3Title: string
  c3Desc: string
  c3Btn: string
  /** Card 4 */
  c4Title: string
  c4Desc: string
  c4Btn: string
  /** Card 5 */
  c5Title: string
  c5Desc: string
  c5Btn: string
  /** Card 6 */
  c6Title: string
  c6Desc: string
  c6Btn: string
  waSupportPrefill: string
  waReturnPrefill: string
  /** Întrebare garanție (link WA când site-ul e mod instalatori-only). */
  waWarrantyPrefill: string
}

const ro: ClientBenefitsTranslations = {
  pageTitle: 'Beneficii pentru clienți',
  pageSubtitle:
    'Accesezi rapid reducerile, verifici compatibilitatea invertorului, garanția și suportul — totul din contul tău Baterino.',
  c1Title: 'Program de reduceri',
  c1Desc:
    'Reduceri pentru seniori, zone rurale, recomandări între clienți și alte programe active — conform termenilor fiecărui program.',
  c1Btn: 'Vezi reduceri',
  c2Title: 'Compatibilitate invertor 99%',
  c2Desc:
    'Caută marca invertorului tău în lista noastră; peste 99% din invertorele comune din România sunt compatibile cu bateriile noastre.',
  c2Btn: 'Verifică compatibilitate invertor',
  c3Title: 'Service și support în România',
  c3Desc:
    'Echipă locală pentru întrebări tehnice și comerciale, disponibilă pe canalul tău preferat de comunicare.',
  c3Btn: 'Solicită asistență',
  c4Title: 'Garanție 10 ani',
  c4Desc:
    'Protecție extinsă pentru produsele rezidențiale eligibile, conform documentației și termenilor comerciali Baterino.',
  c4Btn: 'Vezi condiții garanție',
  c5Title: 'Serviciul swap',
  c5Desc:
    'Înlocuire în condițiile programului de swap Baterino — întreabă echipa pentru pașii și eligibilitatea.',
  c5Btn: 'Asistență și suport',
  c6Title: 'Retur în 15 zile',
  c6Desc:
    'Politica de retur pentru clienți, în limitele și condițiile comunicate la comandă și în documentația legală.',
  c6Btn: 'Solicită retur',
  waSupportPrefill:
    'Bună ziua, sunt client Baterino înregistrat și aș dori asistență (service / suport).',
  waReturnPrefill:
    'Bună ziua, sunt client Baterino înregistrat și doresc să solicit retur conform politicii de 15 zile.',
  waWarrantyPrefill:
    'Bună ziua, sunt client Baterino și aș dori informații despre condițiile de garanție (10 ani).',
}

const en: ClientBenefitsTranslations = {
  pageTitle: 'Benefits for clients',
  pageSubtitle:
    'Quick access to discounts, inverter compatibility, warranty info and support — from your Baterino account.',
  c1Title: 'Discount programs',
  c1Desc:
    'Discounts for seniors, rural areas, referrals and other active programs — subject to each program’s terms.',
  c1Btn: 'View discounts',
  c2Title: '99% inverter compatibility',
  c2Desc:
    'Search your inverter brand in our list; over 99% of common inverters in Romania work with our batteries.',
  c2Btn: 'Check inverter compatibility',
  c3Title: 'Service & support in Romania',
  c3Desc:
    'Local team for technical and commercial questions, on your preferred channel.',
  c3Btn: 'Request assistance',
  c4Title: '10-year warranty',
  c4Desc:
    'Extended coverage for eligible residential products, per Baterino documentation and commercial terms.',
  c4Btn: 'View warranty terms',
  c5Title: 'Swap service',
  c5Desc:
    'Replacement under Baterino’s swap program — contact us for steps and eligibility.',
  c5Btn: 'Help & support',
  c6Title: '15-day returns',
  c6Desc:
    'Return policy for clients, within the limits and conditions stated at purchase and in legal documents.',
  c6Btn: 'Request a return',
  waSupportPrefill:
    'Hello, I am a registered Baterino client and would like assistance (service / support).',
  waReturnPrefill:
    'Hello, I am a registered Baterino client and would like to request a return under the 15-day policy.',
  waWarrantyPrefill:
    'Hello, I am a Baterino client and would like information about the warranty terms (10 years).',
}

const zh: ClientBenefitsTranslations = {
  pageTitle: '客户专属权益',
  pageSubtitle: '在账户中快速查看折扣、逆变器兼容性、保修与支持。',
  c1Title: '折扣计划',
  c1Desc: '老年人、乡村地区、推荐等活跃计划——以各计划条款为准。',
  c1Btn: '查看折扣',
  c2Title: '逆变器兼容率 99%',
  c2Desc: '在列表中搜索您的逆变器品牌；罗马尼亚常见逆变器绝大多数可与我们的产品兼容。',
  c2Btn: '检查逆变器兼容性',
  c3Title: '罗马尼亚本地服务与支持',
  c3Desc: '本地团队解答技术与商务问题，可通过您偏好的渠道联系。',
  c3Btn: '请求协助',
  c4Title: '10 年保修',
  c4Desc: '符合条件的家用产品可享受延长保障，以 Baterino 文件与商业条款为准。',
  c4Btn: '查看保修条款',
  c5Title: '换新（swap）服务',
  c5Desc: '在 Baterino 换新计划条件下更换——请联系团队了解流程与资格。',
  c5Btn: '帮助与支持',
  c6Title: '15 天退货',
  c6Desc: '客户退货政策，以下单时及法律文件中的限制与条件为准。',
  c6Btn: '申请退货',
  waSupportPrefill: '您好，我是已注册的 Baterino 客户，需要协助（服务/支持）。',
  waReturnPrefill: '您好，我是已注册的 Baterino 客户，希望根据15天政策申请退货。',
  waWarrantyPrefill: '您好，我是 Baterino 客户，想了解保修条款（10年）相关信息。',
}

export function getClientBenefitsTranslations(lang: LangCode): ClientBenefitsTranslations {
  if (lang === 'en') return en
  if (lang === 'zh') return zh
  return ro
}
