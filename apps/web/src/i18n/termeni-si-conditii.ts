import type { LangCode } from './menu'

export type TermeniSiConditiiTranslations = {
  seoTitle: string
  seoDesc: string
  pageTitle: string
  intro: string
  /** Ancoră pagină: #politica-retur */
  returnPolicyTitle: string
  returnPolicyParagraphs: string[]
}

const translations: Record<LangCode, TermeniSiConditiiTranslations> = {
  ro: {
    seoTitle: 'Termeni și Condiții – Baterino România',
    seoDesc:
      'Termenii și condițiile generale de utilizare a site-ului și serviciilor Baterino România, inclusiv politica de retur.',
    pageTitle: 'Termeni și Condiții',
    intro: 'Prin accesarea și utilizarea site-ului Baterino România, acceptați următorii termeni și condiții. Vă rugăm să citiți cu atenție acest document înainte de a utiliza serviciile noastre.',
    returnPolicyTitle: 'Politica de retur',
    returnPolicyParagraphs: [
      'Pentru consumatorii persoane fizice care achiziționează online, dreptul de retragere din contractul la distanță este reglementat de legislația aplicabilă în România (inclusiv OUG nr. 34/2014 privind drepturile consumatorilor în contractele la distanță).',
      'Baterino permite solicitarea returului produsului în termen de 15 zile calendaristice de la data primirii produsului de către dumneavoastră (sau de o terță parte desemnată de dumneavoastră), în limitele prevăzute de lege și în conformitate cu politica comercială afișată pe site.',
      'Produsele returnate trebuie să respecte condițiile legale și comerciale privind starea produsului, ambalajului și accesoriilor. La primire, Baterino poate verifica conformitatea cu aceste condiții. Detalii și documentație (ex. fotografii) pot fi solicitate prin formularul de retur.',
      'După recepționarea coletului de retur și confirmarea conformității cu politica de retur, rambursarea contravalorii produsului se realizează, de regulă, în maximum 5 zile lucrătoare de la această confirmare, prin aceeași metodă de plată folosită la comandă sau prin transfer bancar către un cont indicat de dumneavoastră, după caz.',
      'Pentru a iniția un retur, utilizați pagina „Returnare produse” din site, completați pașii indicați și transmiteți cererea. Echipa Baterino vă poate confirma primirea cererii și pașii următori (inclusiv adresa de expediere pentru retur, dacă este cazul).',
    ],
  },
  en: {
    seoTitle: 'Terms and Conditions – Baterino Romania',
    seoDesc: 'General terms and conditions for using the Baterino Romania website and services, including the return policy.',
    pageTitle: 'Terms and Conditions',
    intro: 'By accessing and using the Baterino Romania website, you accept the following terms and conditions. Please read this document carefully before using our services.',
    returnPolicyTitle: 'Return policy',
    returnPolicyParagraphs: [
      'For individual consumers who purchase online, the right of withdrawal from distance contracts is governed by applicable Romanian law (including Government Emergency Ordinance no. 34/2014 on consumer rights in distance contracts).',
      'Baterino allows you to request a return within 15 calendar days from the date you (or a third party designated by you) physically receive the product, within the limits set by law and in line with the commercial policy published on the website.',
      'Returned products must meet the legal and commercial requirements regarding product condition, packaging and accessories. On receipt, Baterino may verify compliance. Details and documentation (e.g. photos) may be requested via the return form.',
      'After we receive the return parcel and confirm compliance with the return policy, we will refund the product value, as a rule within 5 business days from that confirmation, using the same payment method as the original order or by bank transfer to an account you provide, as applicable.',
      'To start a return, use the “Product returns” page on the website, follow the steps and submit your request. The Baterino team may confirm receipt and next steps (including a return shipping address where applicable).',
    ],
  },
  zh: {
    seoTitle: '条款与条件 – Baterino 罗马尼亚',
    seoDesc: 'Baterino罗马尼亚网站及服务使用的一般条款与条件，含退货政策摘要。',
    pageTitle: '条款与条件',
    intro: '访问和使用Baterino罗马尼亚网站即表示您接受以下条款和条件。请在使用我们的服务前仔细阅读本文件。',
    returnPolicyTitle: '退货政策',
    returnPolicyParagraphs: [
      '对于在线购买的个人消费者，远程合同的撤回权受罗马尼亚适用法律管辖（包括关于远程合同中消费者权利的政府紧急条例第34/2014号）。',
      '自您（或您指定的第三方）实际签收商品之日起15个自然日内，您可在法律允许范围内并按网站公布的商业政策向Baterino申请退货。',
      '退回商品须符合法律及我方对商品状态、包装与配件的要求。收到退货后，Baterino可核验是否符合条件；可通过退货表单要求您补充说明或材料（例如照片）。',
      '在收到退货包裹并确认符合退货政策后，原则上将在确认之日起5个工作日内退款；退款方式一般为原支付路径，或按您提供的银行账户转账（如适用）。',
      '如需发起退货，请使用网站上的「产品退货」页面，按步骤填写并提交申请。Baterino团队可确认收到申请并告知后续步骤（如适用，包括退货运送地址）。',
    ],
  },
}

export function getTermeniSiConditiiTranslations(lang: LangCode): TermeniSiConditiiTranslations {
  return translations[lang] ?? translations.ro
}
