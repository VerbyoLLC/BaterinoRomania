/**
 * Populate technicalSpecsModels for 20ft BESS container (656.64–1446.912 kWh, six models).
 * Data from datasheet photos (LT1300 through LT900 columns).
 * Run from apps/api: npm run populate:bess-20ft-656-1446
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))

const SLUG = 'bess-20ft-container-baterii-lifepo4-656kwh-1446912kwh'

const SHARED = {
  nominalVoltage: '768V',
  chemistry: 'LiFePO4',
  batteryModule: '51.2V(16S)',
  batteryCluster: '768V(16S*15)',
  ratedOutputVoltage: '400V',
  acAccessMethod: '3-Phase 3-Wire',
  ratedGridFrequency: '50Hz/60Hz',
  coolingMethod: 'Force Air Cooling',
  communication: 'RS485, Ethernet, CAN',
  waterproof: 'IP54/IP55 (Optional)',
  corrosionLevel: 'C4/C5 (Optional)',
  noiseLevel: '<65dB',
  chargeTemperature: '0°C to 55°C (32°F to 131°F)',
  dischargeTemperature: '-30°C to 60°C (-4°F to 140°F)',
  storageTemperature: '0°C to 35°C (32°F to 95°F)',
  altitude: '≤3000m',
  certification:
    'IEC61000, IEC62619, IEC62477, UL1973(Cell), UL9540(Cell), UL9540A(Cell), UN38.3, CE',
  warranty: '5 Years/10 Years(Optional)',
  dimensions: '6058×2438×2896mm',
  conversionEfficiency: '',
}

const technicalSpecsModels = {
  entries: [
    {
      modelName: 'LT1300-1000K-A',
      specs: {
        ...SHARED,
        energySystem: '1C',
        nominalCapacity: '1710Ah',
        nominalEnergy: '1313.28kWh',
        systemConfiguration: '6P16S*15',
        cellType: '285Ah',
        cycleLife: '9,000 Times (70% SOH)',
        maxOutputPower: '1000kW',
        pcsCabinetCount: '2',
        weight: '~20T',
      },
    },
    {
      modelName: 'LT800-750K-A',
      specs: {
        ...SHARED,
        energySystem: '1C',
        nominalCapacity: '1140Ah',
        nominalEnergy: '875.52kWh',
        systemConfiguration: '4P16S*15',
        cellType: '285Ah',
        cycleLife: '9,000 Times (70% SOH)',
        maxOutputPower: '750kW',
        pcsCabinetCount: '2',
        weight: '~17T',
      },
    },
    {
      modelName: 'LT600-500K-A',
      specs: {
        ...SHARED,
        energySystem: '1C',
        nominalCapacity: '855Ah',
        nominalEnergy: '656.64kWh',
        systemConfiguration: '3P16S*15',
        cellType: '285Ah',
        cycleLife: '9,000 Times (70% SOH)',
        maxOutputPower: '500kW',
        pcsCabinetCount: '1',
        weight: '~15T',
      },
    },
    {
      modelName: 'LT1400-750K-A',
      specs: {
        ...SHARED,
        energySystem: '0.5C',
        nominalCapacity: '1884Ah',
        nominalEnergy: '1446.912kWh',
        systemConfiguration: '6P16S*15',
        cellType: '314Ah',
        cycleLife: '8,000 Times (70% SOH)',
        maxOutputPower: '750kW',
        pcsCabinetCount: '2',
        weight: '~20T',
      },
    },
    {
      modelName: 'LT1200-500K-A',
      specs: {
        ...SHARED,
        energySystem: '0.5C',
        nominalCapacity: '1570Ah',
        nominalEnergy: '1205.76kWh',
        systemConfiguration: '5P16S*15',
        cellType: '314Ah',
        cycleLife: '8,000 Times (70% SOH)',
        maxOutputPower: '500kW',
        pcsCabinetCount: '1',
        weight: '~18T',
      },
    },
    {
      modelName: 'LT900-500K-A',
      specs: {
        ...SHARED,
        energySystem: '0.5C',
        nominalCapacity: '1256Ah',
        nominalEnergy: '964.608kWh',
        systemConfiguration: '4P16S*15',
        cellType: '314Ah',
        cycleLife: '8,000 Times (70% SOH)',
        maxOutputPower: '500kW',
        pcsCabinetCount: '1',
        weight: '~17T',
      },
    },
  ],
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  const product = await prisma.product.findFirst({
    where: { slug: SLUG },
    select: { id: true, title: true, slug: true },
  })
  if (!product) {
    console.error(`No product with slug "${SLUG}".`)
    process.exit(1)
  }
  await prisma.product.update({
    where: { id: product.id },
    data: { technicalSpecsModels },
  })
  console.log(
    `Updated technicalSpecsModels for ${product.slug} (${product.title}) — ${technicalSpecsModels.entries.length} models.`,
  )
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
