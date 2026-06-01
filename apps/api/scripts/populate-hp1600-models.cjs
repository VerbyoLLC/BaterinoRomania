/**
 * Populate ProductModel entries for HP1600 series (6 stack configurations).
 * Run from apps/api: node scripts/populate-hp1600-models.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'client.js'))

const BRAND = 'LithTech'
const SERIES = 'HP1600'

const SHARED = {
  nominalCapacity:        '314Ah',
  chargeDischarge:        '157A / 157A',
  chemistry:              'LFP',
  cycleLife:              '>8000 (DOD 80% @ 25°C)',
  communication:          'CAN / WIFI / Bluetooth',
  waterproof:             'IP20',
  bms:                    'Have (Passive Equilibrium)',
  chargeTemperature:      '0°C to 55°C (32°F to 131°F)',
  dischargeTemperature:   '-20°C to 60°C (68°F to 140°F)',
  storageTemperature:     'within 1 month: -20~45°C / within 6 months: 0~35°C',
  altitude:               '≤2000m',
  warranty:               '5 Years / 10 Years (optional)',
  certification:          'IEC62619 (Cell), UN38.3, MSDS',
}

const CONFIGURATIONS = [
  {
    modelNumber:     'HP1600-4S',
    nominalVoltage:  '204.8V',
    voltageRange:    '179.2~233.6V',
    energy:          '64307.2Wh (64.3 kWh)',
    stackQty:        '4',
    ratedInputPow:   '34.15kW',
    ratedOutputPow:  '32.15kW',
    dimensions:      '48.2×80×131cm',
    weight:          '≈506kg',
  },
  {
    modelNumber:     'HP1600-5S',
    nominalVoltage:  '256V',
    voltageRange:    '224~292V',
    energy:          '80384Wh (80.4 kWh)',
    stackQty:        '5',
    ratedInputPow:   '40.19kW',
    ratedOutputPow:  '40.19kW',
    dimensions:      '106.4×80×90cm',
    weight:          '≈626kg',
  },
  {
    modelNumber:     'HP1600-6S',
    nominalVoltage:  '307.2V',
    voltageRange:    '268.8~350.4V',
    energy:          '96460.8Wh (96.5 kWh)',
    stackQty:        '6',
    ratedInputPow:   '48.23kW',
    ratedOutputPow:  '48.23kW',
    dimensions:      '106.4×80×107cm',
    weight:          '≈747kg',
  },
  {
    modelNumber:     'HP1600-7S',
    nominalVoltage:  '358.4V',
    voltageRange:    '313.6~408.6V',
    energy:          '112537.6Wh (112.5 kWh)',
    stackQty:        '7',
    ratedInputPow:   '56.2kW',
    ratedOutputPow:  '56.2kW',
    dimensions:      '106.4×80×114cm',
    weight:          '≈867.5kg',
  },
  {
    modelNumber:     'HP1600-8S',
    nominalVoltage:  '409.6V',
    voltageRange:    '358.4~467.2V',
    energy:          '128614.4Wh (128.6 kWh)',
    stackQty:        '8',
    ratedInputPow:   '64.3kW',
    ratedOutputPow:  '64.3kW',
    dimensions:      '164.6×80×90cm',
    weight:          '≈988kg',
  },
  {
    modelNumber:     'HP1600-15S',
    nominalVoltage:  '768V',
    voltageRange:    '672~876V',
    energy:          '241152Wh (241.2 kWh)',
    stackQty:        '15',
    ratedInputPow:   '120.57kW',
    ratedOutputPow:  '120.57kW',
    dimensions:      '222.8×80×114cm',
    weight:          '≈1831.5kg',
  },
]

function buildDescription(cfg) {
  return [
    `Nominal Voltage: ${cfg.nominalVoltage}`,
    `Operating Voltage Range: ${cfg.voltageRange}`,
    `Nominal Capacity: ${SHARED.nominalCapacity}`,
    `Charge & Discharge Current: ${SHARED.chargeDischarge}`,
    `Energy: ${cfg.energy}`,
    `Stack Quantity: ${cfg.stackQty}`,
    `Chemistry: ${SHARED.chemistry}`,
    `Cycle Life: ${SHARED.cycleLife}`,
    `Rated Input Power: ${cfg.ratedInputPow}`,
    `Rated Output Power: ${cfg.ratedOutputPow}`,
    `Communication: ${SHARED.communication}`,
    `Waterproof: ${SHARED.waterproof}`,
    `BMS Passive Balancing: ${SHARED.bms}`,
    `Charge Temperature: ${SHARED.chargeTemperature}`,
    `Discharge Temperature: ${SHARED.dischargeTemperature}`,
    `Storage Temperature: ${SHARED.storageTemperature}`,
    `Altitude: ${SHARED.altitude}`,
    `Warranty: ${SHARED.warranty}`,
    `Certification: ${SHARED.certification}`,
    `Dimensions (W×D×H): ${cfg.dimensions}`,
    `Weight: ${cfg.weight}`,
  ].join('\n')
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const agg = await prisma.productModel.aggregate({ _max: { sortOrder: true } })
  let sortOrder = (agg._max.sortOrder ?? 0) + 1

  for (const cfg of CONFIGURATIONS) {
    const name = `${cfg.modelNumber} (${cfg.energy.split(' ')[0]})`
    const technicalDescription = buildDescription(cfg)

    const existing = await prisma.productModel.findUnique({
      where: { modelNumber: cfg.modelNumber },
      select: { id: true },
    })

    if (existing) {
      await prisma.productModel.update({
        where: { modelNumber: cfg.modelNumber },
        data: { name, brand: BRAND, series: SERIES, usageType: 'industrial', technicalDescription, availableForStock: true },
      })
      console.log(`  updated: ${cfg.modelNumber}`)
    } else {
      await prisma.productModel.create({
        data: { name, brand: BRAND, modelNumber: cfg.modelNumber, series: SERIES, usageType: 'industrial', technicalDescription, availableForStock: true, sortOrder: sortOrder++ },
      })
      console.log(`  created: ${cfg.modelNumber}`)
    }
  }

  console.log(`\nDone. ${CONFIGURATIONS.length} HP1600 models in Inventar → Modele.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e.message); process.exit(1) })
