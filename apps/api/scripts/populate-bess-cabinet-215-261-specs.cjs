/**
 * Populate technicalSpecsModels for BESS cabinet 215–261 kWh (4 models)
 * and upsert each configuration as a row in product_models (Inventar → Modele).
 *
 * Run from apps/api: npm run populate:bess-cabinet-215-261
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))

const SLUG = 'bess-cabinet-baterii-lifepo4-215-kwh-261-kwh'
const SERIES = 'BESS Cabinet 215–261 kWh'

const SPEC_FIELDS = [
  { key: 'energySystem', label: 'Energy System' },
  { key: 'nominalVoltage', label: 'Nominal Voltage' },
  { key: 'nominalCapacity', label: 'Nominal Capacity' },
  { key: 'nominalEnergy', label: 'Nominal Energy' },
  { key: 'systemConfiguration', label: 'System Configuration' },
  { key: 'cellType', label: 'Cell Type' },
  { key: 'chemistry', label: 'Chemistry' },
  { key: 'cycleLife', label: 'Cycle life' },
  { key: 'batteryModule', label: 'Battery Module' },
  { key: 'batteryCluster', label: 'Battery Cluster' },
  { key: 'maxOutputPower', label: 'Max Output Power' },
  { key: 'ratedOutputVoltage', label: 'Rated Output Voltage' },
  { key: 'acAccessMethod', label: 'AC Access Method' },
  { key: 'ratedGridFrequency', label: 'Rated Grid Frequency' },
  { key: 'pcsCabinetCount', label: 'Number of PCS cabinets' },
  { key: 'conversionEfficiency', label: 'Conversion Efficiency' },
  { key: 'coolingMethod', label: 'Cooling Method' },
  { key: 'communication', label: 'Communication' },
  { key: 'waterproof', label: 'Waterproof' },
  { key: 'corrosionLevel', label: 'Corrosion Level' },
  { key: 'noiseLevel', label: 'Noise Level' },
  { key: 'chargeTemperature', label: 'Charge Temperature' },
  { key: 'dischargeTemperature', label: 'Discharge Temperature' },
  { key: 'storageTemperature', label: 'Storage Temperature' },
  { key: 'altitude', label: 'Altitude' },
  { key: 'certification', label: 'Certification' },
  { key: 'warranty', label: 'Warranty' },
  { key: 'dimensions', label: 'Dimensions [L×W×H]' },
  { key: 'weight', label: 'Weight' },
]

const COMM =
  'CAN/RS485/Ethernet (support IEC61850, IEC104) /WIFI/4G'

/** Shared rows — same for all four models */
const SHARED = {
  energySystem: '0.5C',
  chemistry: 'LiFePO4',
  cycleLife: '8,000 Times (70% SOH)',
  acAccessMethod: '3-Phase 4-Wire',
  ratedGridFrequency: '50Hz/60Hz',
  conversionEfficiency: '≥99%',
  coolingMethod: 'Liquid Cooling',
  communication: COMM,
  waterproof: 'IP54 (System) / IP65 (Module)',
  corrosionLevel: 'C4/C5(Optional)',
  noiseLevel: '<75dB',
  chargeTemperature: '0°C to 60°C (32°F to 140°F)',
  dischargeTemperature: '-30°C to 60°C (-22°F to 140°F)',
  storageTemperature: '0°C to 35°C (32°F to 95°F)',
  altitude: '≤3000m',
  certification: 'IEC 61000-6-2/61000-6-4/62477-1/62619/UN3536',
  warranty: '5 Years/10 Years(Optional)',
}

const technicalSpecsModels = {
  entries: [
    {
      modelName: 'LT215-L',
      specs: {
        ...SHARED,
        nominalVoltage: '768V',
        nominalCapacity: '280Ah',
        nominalEnergy: '215.04kWh',
        systemConfiguration: '1P48S*5',
        cellType: '280Ah',
        batteryModule: '153.6V(48S)',
        batteryCluster: '768V(48S*5)',
        maxOutputPower: '100kW',
        ratedOutputVoltage: '400V',
        dimensions: '1300×1000×2386mm',
        weight: '~2.7T',
      },
    },
    {
      modelName: 'LT241-L',
      specs: {
        ...SHARED,
        nominalVoltage: '768V',
        nominalCapacity: '314Ah',
        nominalEnergy: '241.152kWh',
        systemConfiguration: '1P48S*5',
        cellType: '314Ah',
        batteryModule: '153.6V(48S)',
        batteryCluster: '768V(48S*5)',
        maxOutputPower: '115kW',
        ratedOutputVoltage: '400V',
        dimensions: '1000×1400×2350mm',
        weight: '~2.75T',
      },
    },
    {
      modelName: 'LT232-L',
      specs: {
        ...SHARED,
        nominalVoltage: '832V',
        nominalCapacity: '280Ah',
        nominalEnergy: '232.96kWh',
        systemConfiguration: '1P52S*5',
        cellType: '280Ah',
        batteryModule: '166.4V(52S)',
        batteryCluster: '832V(52S*5)',
        maxOutputPower: '115kW',
        ratedOutputVoltage: '400V',
        dimensions: '1300×1000×2386mm',
        weight: '~2.7T',
      },
    },
    {
      modelName: 'LT261-L',
      specs: {
        ...SHARED,
        nominalVoltage: '832V',
        nominalCapacity: '314Ah',
        nominalEnergy: '261.248kWh',
        systemConfiguration: '1P52S*5',
        cellType: '314Ah',
        batteryModule: '166.4V(52S)',
        batteryCluster: '832V(52S*5)',
        maxOutputPower: '125kW',
        ratedOutputVoltage: '400V',
        dimensions: '1000×1400×2350mm',
        weight: '~2.75T',
      },
    },
  ],
}

function buildTechnicalDescription(specs) {
  const lines = ['Model-specific:']
  for (const { key, label } of SPEC_FIELDS) {
    const val = specs?.[key]
    if (val != null && String(val).trim()) lines.push(`${label}: ${String(val).trim()}`)
  }
  return lines.join('\n')
}

function normalizeEntries(raw) {
  if (!raw || typeof raw !== 'object') return technicalSpecsModels.entries
  const entries = Array.isArray(raw.entries) ? raw.entries : []
  if (entries.length === 0) return technicalSpecsModels.entries
  return entries
    .map((e) => ({
      modelName: String(e?.modelName ?? '').trim(),
      specs: e?.specs && typeof e.specs === 'object' ? e.specs : {},
    }))
    .filter((e) => e.modelName)
}

async function syncProductModels(prisma, entries, { brand }) {
  const agg = await prisma.productModel.aggregate({ _max: { sortOrder: true } })
  let sortOrder = (agg._max.sortOrder ?? 0) + 1
  const results = []

  for (const entry of entries) {
    const modelNumber = entry.modelName
    const energy = String(entry.specs?.nominalEnergy ?? '').trim()
    const displayName = energy ? `${modelNumber} (${energy})` : modelNumber
    const technicalDescription = buildTechnicalDescription(entry.specs)

    const existing = await prisma.productModel.findUnique({
      where: { modelNumber },
      select: { id: true, modelNumber: true },
    })

    if (existing) {
      await prisma.productModel.update({
        where: { modelNumber },
        data: {
          name: displayName,
          brand: brand || 'LithTech',
          series: SERIES,
          usageType: 'industrial',
          technicalDescription,
          availableForStock: true,
        },
      })
      results.push({ modelNumber, action: 'updated' })
    } else {
      await prisma.productModel.create({
        data: {
          name: displayName,
          brand: brand || 'LithTech',
          modelNumber,
          series: SERIES,
          usageType: 'industrial',
          technicalDescription,
          availableForStock: true,
          sortOrder: sortOrder++,
        },
      })
      results.push({ modelNumber, action: 'created' })
    }
  }

  return results
}

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
  const product = await prisma.product.findFirst({
    where: { slug: SLUG },
    select: { id: true, title: true, slug: true, brand: true, technicalSpecsModels: true },
  })
  if (!product) {
    console.error(`No product with slug "${SLUG}".`)
    process.exit(1)
  }

  const entries = normalizeEntries(product.technicalSpecsModels)
  const payload = { entries }

  await prisma.product.update({
    where: { id: product.id },
    data: { technicalSpecsModels: payload },
  })
  console.log(
    `Updated technicalSpecsModels for ${product.slug} (${product.title}) — ${entries.length} models.`,
  )

  const brand = String(product.brand || 'LithTech').trim() || 'LithTech'
  const modelResults = await syncProductModels(prisma, entries, { brand })
  for (const r of modelResults) {
    console.log(`  product_models: ${r.modelNumber} — ${r.action}`)
  }
  console.log(`Done. ${modelResults.length} individual models in Inventar → Modele.`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
