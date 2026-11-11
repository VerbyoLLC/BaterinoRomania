/**
 * LithTech LT261-H — Liquid Cooling Cabinet 261kWh-H (all-in-one, integrated hybrid inverter).
 * Upserts the model in product_models (Inventar → Modele) and the industrial catalog product,
 * and uploads the manufacturer datasheet as the model brochure / product technical document.
 *
 * Run from apps/api: node scripts/populate-lt261-h-all-in-one.cjs [path/to/datasheet.pdf]
 * New products are created as draft; re-runs keep status, prices and images untouched.
 */
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))
const { isR2Configured, uploadToR2, productTechnicalBrochurePdfKey } = require('../lib/r2.js')

const MODEL_NUMBER = 'LT261-H'
const BRAND = 'LithTech'
const SERIES = 'Liquid Cooling Cabinet 261kWh-H (All-in-One)'
const MODEL_NAME = 'LT261-H (261.248 kWh)'
const SKU = 'LTC-ESS-LT261-H'
const SLUG = 'bess-cabinet-all-in-one-lifepo4-261kwh-invertor-hibrid'
const SISTEME_BESS_CATEGORY_SLUG = 'sisteme-bess'

const SPEC_FIELDS = [
  { key: 'energySystem', label: 'Energy System' },
  { key: 'nominalVoltage', label: 'Nominal Voltage' },
  { key: 'nominalCapacity', label: 'Nominal Capacity' },
  { key: 'nominalEnergy', label: 'Nominal Energy' },
  { key: 'systemConfiguration', label: 'System Configuration' },
  { key: 'cellType', label: 'Cell Type' },
  { key: 'chemistry', label: 'Chemistry' },
  { key: 'cycleLife', label: 'Cycle Life' },
  { key: 'maxContinuousCurrent', label: 'Max Continuous Operating DC Current' },
  { key: 'maxOutputPower', label: 'Nominal Power' },
  { key: 'acAccessMethod', label: 'Wiring' },
  { key: 'pvMaxInputPower', label: 'Max. PV Input Power' },
  { key: 'mpptVoltageRange', label: 'MPPT Voltage Range' },
  { key: 'pvMaxInputCurrent', label: 'Max. PV Input Current' },
  { key: 'pvMaxInputVoltage', label: 'Max. PV Input Voltage' },
  { key: 'mpptCount', label: 'MPPT Number / Max. Inputs' },
  { key: 'coolingMethod', label: 'Cooling Method' },
  { key: 'communication', label: 'Communication' },
  { key: 'waterproof', label: 'Waterproof' },
  { key: 'corrosionLevel', label: 'Corrosion Level' },
  { key: 'noiseLevel', label: 'Noise Level' },
  { key: 'fireProtection', label: 'Fire Protection System' },
  { key: 'chargeTemperature', label: 'Charge Temperature' },
  { key: 'dischargeTemperature', label: 'Discharge Temperature' },
  { key: 'storageTemperature', label: 'Storage Temperature' },
  { key: 'altitude', label: 'Altitude' },
  { key: 'certification', label: 'Certification' },
  { key: 'warranty', label: 'Warranty' },
  { key: 'dimensions', label: 'Dimensions (W×D×H)' },
  { key: 'weight', label: 'Weight' },
]

const SPECS = {
  energySystem: '0.5C',
  nominalVoltage: '832V',
  nominalCapacity: '314Ah',
  nominalEnergy: '261.248kWh',
  systemConfiguration: '260S1P',
  cellType: '314Ah',
  chemistry: 'LiFePO4',
  cycleLife: '8,000 Times (70% SOH)',
  maxContinuousCurrent: '157A / 0.5C',
  maxOutputPower: '125kW',
  acAccessMethod: '3P+N+PE',
  pvMaxInputPower: '250kW',
  mpptVoltageRange: '150–950V',
  pvMaxInputCurrent: '10 × 42A',
  pvMaxInputVoltage: '1000V',
  mpptCount: '10 / 20',
  coolingMethod: 'Liquid Cooling',
  communication: 'CAN / RS485 / Ethernet (support IEC61850, IEC104) / WIFI / 4G',
  waterproof: 'IP54 (System) / IP65 (Module)',
  corrosionLevel: 'C4',
  noiseLevel: '≤75dB',
  fireProtection: 'Pack + System (Aerosol, heat & smoke detector)',
  chargeTemperature: '0°C to 55°C (32°F to 131°F)',
  dischargeTemperature: '-20°C to 55°C (-4°F to 131°F)',
  storageTemperature: '0°C to 35°C (32°F to 95°F)',
  altitude: '≤2000m (>2000m derate)',
  certification: 'CE-EMC, CE-LVD, IEC62619, UN3480 (System); CE-EMC, IEC62619, UN38.3 (Module)',
  warranty: '5 Years / 10 Years (Extension)',
  dimensions: '960×1350×2100mm (without inverter)',
  weight: '2750kg ±5% (incl. battery & liquid)',
}

const OVERVIEW = [
  'Sistem de stocare all-in-one LiFePO₄ de 261kWh, cu invertor hibrid integrat de 125kW și răcire lichidă de înaltă precizie. Bateria, invertorul, PDU-ul, tabloul AC, BMS-ul și protecția la incendiu sunt montate într-un singur cabinet, livrat ca soluție turnkey.',
  'Invertorul acceptă până la 250kW putere fotovoltaică pe 10 MPPT-uri (150–950V), astfel încât cabinetul poate prelua direct producția panourilor și o poate stoca sau livra consumatorilor. Răspuns rapid pentru FFR și FCR, peak shaving și suport pentru rețea.',
  'Celule LiFePO₄ de 314Ah, 8.000 de cicluri (70% SOH) și o durată de viață proiectată de 20 de ani. Managementul termic cu lichid menține diferența de temperatură sub 1°C pe pachet și sub 3°C pe cluster, cu încărcare între 0°C și 55°C și descărcare de la -20°C.',
  'Protecție multi-nivel: detecție de căldură și fum, stingere cu aerosoli la nivel de pachet și de sistem, buton de oprire de urgență, IP54 pentru sistem și IP65 pentru module, rezistență la coroziune C4. Monitorizare de la distanță prin aplicație mobilă (WiFi / 4G) și integrare SCADA prin IEC61850 și IEC104.',
  'Potrivit pentru peak shaving comercial, logistică, hoteluri, microrețele industriale, ferme, insule energetice, stații de cercetare și hub-uri de încărcare rapidă. Baterino asigură livrarea, instalarea, punerea în funcțiune și suportul tehnic.',
].join('\n\n')

const FAQ = [
  {
    q: 'Ce înseamnă „all-in-one” la LT261-H?',
    a: 'Cabinetul include bateria LiFePO₄ de 261kWh, invertorul hibrid de 125kW, PDU-ul, tabloul de distribuție AC, BMS-ul, răcirea lichidă și protecția la incendiu. Nu este nevoie de un dulap PCS separat.',
  },
  {
    q: 'Pot conecta panouri fotovoltaice direct la cabinet?',
    a: 'Da. Invertorul integrat acceptă până la 250kW putere PV, pe 10 MPPT-uri cu 20 de intrări, în intervalul 150–950V (maxim 1000V). Puterea și marca invertorului pot fi adaptate proiectului.',
  },
  {
    q: 'Cât durează bateria?',
    a: 'Celulele sunt garantate pentru 8.000 de cicluri până la 70% SOH, iar sistemul este proiectat pentru 20 de ani de funcționare. Garanția standard este de 5 ani, cu extensie la 10 ani.',
  },
  {
    q: 'Poate fi instalat în exterior?',
    a: 'Da. Cabinetul are IP54 la nivel de sistem, IP65 la nivel de modul și protecție anticorozivă C4. Funcționează la încărcare între 0°C și 55°C și la descărcare între -20°C și 55°C, până la 2000m altitudine.',
  },
  {
    q: 'Se pot lega mai multe cabinete în paralel?',
    a: 'Da. Arhitectura modulară permite extinderea capacității pe măsură ce crește consumul. Echipa Baterino dimensionează configurația în funcție de profilul de consum și de racordul la rețea.',
  },
]

function buildTechnicalDescription(specs) {
  const lines = []
  for (const { key, label } of SPEC_FIELDS) {
    const val = specs?.[key]
    if (val != null && String(val).trim()) lines.push(`${label}: ${String(val).trim()}`)
  }
  return lines.join('\n')
}

async function uploadDatasheet(pdfPath) {
  if (!pdfPath) return null
  if (!fs.existsSync(pdfPath)) throw new Error(`Datasheet not found: ${pdfPath}`)
  if (!isR2Configured()) throw new Error('R2 is not configured in .env; cannot upload the datasheet.')
  const key = productTechnicalBrochurePdfKey(MODEL_NUMBER, MODEL_NAME)
  const url = await uploadToR2(fs.readFileSync(pdfPath), key, 'application/pdf', {
    contentDisposition: `inline; filename="LithTech-${MODEL_NUMBER}-datasheet.pdf"`,
  })
  return encodeURI(url)
}

async function upsertModel(prisma) {
  const data = {
    name: MODEL_NAME,
    brand: BRAND,
    series: SERIES,
    usageType: 'industrial',
    productType: 'ESS',
    sku: SKU,
    technicalDescription: buildTechnicalDescription(SPECS),
    availableForStock: true,
  }
  const existing = await prisma.productModel.findUnique({ where: { modelNumber: MODEL_NUMBER }, select: { id: true } })
  if (existing) {
    await prisma.productModel.update({ where: { modelNumber: MODEL_NUMBER }, data })
    return 'updated'
  }
  const agg = await prisma.productModel.aggregate({ _max: { sortOrder: true } })
  await prisma.productModel.create({
    data: { ...data, modelNumber: MODEL_NUMBER, sortOrder: (agg._max.sortOrder ?? 0) + 1 },
  })
  return 'created'
}

async function upsertProduct(prisma, datasheetUrl) {
  const category = await prisma.productCategory.findUnique({ where: { slug: SISTEME_BESS_CATEGORY_SLUG } })
  const content = {
    brand: BRAND,
    title: 'BESS Cabinet All-in-One LiFePO₄ 261kWh | Invertor Hibrid 125kW Integrat',
    subtitle: '261kWh | 125kW | 832V | 8.000 Cicluri (70% SOH) | LiFePO₄ | Invertor Hibrid Integrat | Răcire cu Lichid',
    description: OVERVIEW,
    overview: OVERVIEW,
    seoTitle: 'BESS All-in-One 261kWh cu invertor hibrid | LithTech',
    seoDescription:
      'Cabinet BESS LithTech LT261-H: 261kWh LiFePO₄, invertor hibrid 125kW, 250kW intrare PV, răcire lichidă, 8.000 cicluri, IP54. Livrare și instalare Baterino.',
    tipProdus: 'industrial',
    categorie: 'industrial,micro_grid,high_voltage,outdoor',
    categoryId: category?.id ?? null,
    catalogInstallBadge: 'baterino',
    faq: FAQ,
    technicalSpecsModels: { entries: [{ modelName: MODEL_NUMBER, specs: SPECS }] },
    ...(datasheetUrl
      ? { documenteTehnice: [{ descriere: `Fișă tehnică LithTech ${MODEL_NUMBER}`, url: datasheetUrl }] }
      : {}),
  }

  const existing = await prisma.product.findUnique({ where: { sku: SKU }, select: { id: true } })
  if (existing) {
    await prisma.product.update({ where: { sku: SKU }, data: content })
    return { action: 'updated', id: existing.id }
  }
  const created = await prisma.product.create({
    data: {
      ...content,
      sku: SKU,
      slug: SLUG,
      status: 'draft',
      landedPrice: 0,
      salePrice: 0,
      mapPrice: 0,
      vat: 21,
      priceVisibility: 'public',
      pricePresentation: 'detailed',
      images: [],
      keyAdvantages: [],
      caseStudyExamples: [],
    },
    select: { id: true },
  })
  return { action: 'created', id: created.id }
}

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
  try {
    const datasheetUrl = await uploadDatasheet(process.argv[2])
    if (datasheetUrl) console.log(`Datasheet uploaded: ${datasheetUrl}`)
    console.log(`product_models ${MODEL_NUMBER}: ${await upsertModel(prisma)}`)
    const product = await upsertProduct(prisma, datasheetUrl)
    console.log(`product ${SKU}: ${product.action} (${product.id})`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
