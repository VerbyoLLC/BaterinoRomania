/**
 * Add LT Ultra 100-Air (112.5kWh) model to the LT Ultra Air series.
 * Run from apps/api: node scripts/add-lt-ultra-100-air-112kwh.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))

const MODEL = {
  modelNumber: 'LT-Ultra-100-Air-112kWh',
  name: 'LT Ultra 100-Air (112.5kWh)',
  series: 'LT Ultra Air',
  brand: 'Lithtech',
  usageType: 'industrial',
  sortOrder: 37,
  technicalDescription: [
    'Nominal Energy: 112.5kWh',
    'Nominal Voltage: 358.4V',
    'Nominal Capacity: 314Ah',
    'System Configuration: 112S1P',
    'Cell Type: 3.2V 314Ah',
    'Battery Module: 51.2V (16S)',
    'Chemistry: LiFePO₄',
    'Cycle Life: 8000 Times (70% SOH)',
    'Max. AC Output Power: 50kW',
    'Cooling Method: Smart Air Cooling',
    'Communication: RS485, Ethernet, CAN',
    'Waterproof: IP54 (System) / IP20 (Module)',
    'Corrosion Level: C4',
    'Noise Level: ≤65dB',
    'Charge Temperature: 0°C to 55°C (32°F to 131°F)',
    'Discharge Temperature: -20°C to 55°C (-4°F to 131°F)',
    'Storage Temperature: 0°C to 35°C (32°F to 95°F)',
    'Altitude: 2000m (>2000 de-rate)',
    'Certification: CE-EMC / CE-LVD / IEC62619 / UN38.3 / RoHs',
    'Warranty: 5 Years / 10 Years (Optional)',
    'Dimensions (W×D×H): 900×1250×2100mm',
    'Weight: ~1.3T',
    'Inverter',
    'Max. PV Input Power: 100000W',
    'MPPT Range: 150–850V',
    'PV Input Current: 40A+40A+40A+40A (8 string)',
    'MPPT Efficiency: 99.90%',
    'Grid Regulation: EN50549, AS4777.2:2015, VDE0126-1-1, IEC61727, VDEN4105-2018, G99',
  ].join('\n'),
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const existing = await prisma.productModel.findFirst({ where: { modelNumber: MODEL.modelNumber } })
    if (existing) {
      console.log(`Model ${MODEL.modelNumber} already exists (id: ${existing.id}). Updating technicalDescription…`)
      const updated = await prisma.productModel.update({
        where: { id: existing.id },
        data: { technicalDescription: MODEL.technicalDescription, name: MODEL.name, sortOrder: MODEL.sortOrder },
      })
      console.log('Updated:', updated.name)
    } else {
      const created = await prisma.productModel.create({ data: MODEL })
      console.log('Created:', created.name, '| id:', created.id)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => { console.error(e.message); process.exit(1) })
