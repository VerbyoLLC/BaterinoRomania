/**
 * Populate technicalSpecsModels for BESS cabinet 215–261 kWh (4 models).
 * Run from apps/api: node scripts/populate-bess-cabinet-215-261-specs.cjs
 *
 * npm run populate:bess-cabinet-215-261
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))

const SLUG = 'bess-cabinet-baterii-lifepo4-215-kwh-261-kwh'

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

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
  const product = await prisma.product.findFirst({ where: { slug: SLUG }, select: { id: true, title: true, slug: true } })
  if (!product) {
    console.error(`No product with slug "${SLUG}".`)
    process.exit(1)
  }
  await prisma.product.update({
    where: { id: product.id },
    data: { technicalSpecsModels },
  })
  console.log(`Updated technicalSpecsModels for ${product.slug} (${product.title}) — ${technicalSpecsModels.entries.length} models.`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
