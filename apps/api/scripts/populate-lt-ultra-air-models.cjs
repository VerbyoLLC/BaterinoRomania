/**
 * Populate ProductModel entries for LT Ultra Air series (60-Air and 100-Air).
 * Run from apps/api: node scripts/populate-lt-ultra-air-models.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'client.js'))

const BRAND = 'LithTech'
const SERIES = 'LT Ultra Air'

const SHARED = {
  batteryModule:          '51.2V (16S)',
  chemistry:              'LiFePO₄',
  cycleLife:              '6000 Times (70% SOH)',
  coolingMethod:          'Smart Air Cooling',
  communication:          'RS485, Ethernet, CAN',
  waterproof:             'IP54 (System) / IP20 (Module)',
  corrosionLevel:         'C4/C5 (Optional)',
  noiseLevel:             '≤65dB',
  chargeTemperature:      '0°C to 55°C (32°F to 131°F)',
  dischargeTemperature:   '-20°C to 55°C (-4°F to 131°F)',
  storageTemperature:     '0°C to 35°C (32°F to 95°F)',
  altitude:               '3000m',
  certification:          'CE-EMC / CE-LVD / IEC62619 / UN38.3 / RoHs',
  warranty:               '5 Years / 10 Years (Optional)',
  mpptRange:              '150–850V',
  mpptEfficiency:         '99.90%',
  gridRegulation:         'EN50549, AS4777.2:2015, VDE0126-1-1, IEC61727, VDEN4105-2018, G99',
}

const CONFIGURATIONS = [
  {
    modelNumber:       'LT-Ultra-60-Air',
    nominalVoltage:    '614.4V',
    nominalCapacity:   '102Ah',
    nominalEnergy:     '62kWh',
    systemConfig:      '1P192S',
    cellType:          '3.2V 102Ah',
    maxAcOutputPower:  '30kW',
    dimensions:        '700×900×2250mm',
    weight:            '~0.982T',
    maxDcInputPower:   '39000W (39kW)',
    pvInputCurrent:    '36A+36A+36A',
  },
  {
    modelNumber:       'LT-Ultra-100-Air',
    nominalVoltage:    '512V',
    nominalCapacity:   '206Ah',
    nominalEnergy:     '105kWh',
    systemConfig:      '1P160S',
    cellType:          '3.2V 206Ah',
    maxAcOutputPower:  '50kW',
    dimensions:        '1164×1006×1980mm',
    weight:            '~1.45T',
    maxDcInputPower:   '65000W (65kW)',
    pvInputCurrent:    '36A+36A+36A+36A',
  },
]

function buildDescription(cfg) {
  return [
    `Nominal Energy: ${cfg.nominalEnergy}`,
    `Nominal Voltage: ${cfg.nominalVoltage}`,
    `Nominal Capacity: ${cfg.nominalCapacity}`,
    `System Configuration: ${cfg.systemConfig}`,
    `Cell Type: ${cfg.cellType}`,
    `Battery Module: ${SHARED.batteryModule}`,
    `Chemistry: ${SHARED.chemistry}`,
    `Cycle Life: ${SHARED.cycleLife}`,
    `Max. AC Output Power: ${cfg.maxAcOutputPower}`,
    `Cooling Method: ${SHARED.coolingMethod}`,
    `Communication: ${SHARED.communication}`,
    `Waterproof: ${SHARED.waterproof}`,
    `Corrosion Level: ${SHARED.corrosionLevel}`,
    `Noise Level: ${SHARED.noiseLevel}`,
    `Charge Temperature: ${SHARED.chargeTemperature}`,
    `Discharge Temperature: ${SHARED.dischargeTemperature}`,
    `Storage Temperature: ${SHARED.storageTemperature}`,
    `Altitude: ${SHARED.altitude}`,
    `Certification: ${SHARED.certification}`,
    `Warranty: ${SHARED.warranty}`,
    `Dimensions (W×D×H): ${cfg.dimensions}`,
    `Weight: ${cfg.weight}`,
    `Max. DC Input Power: ${cfg.maxDcInputPower}`,
    `MPPT Range: ${SHARED.mpptRange}`,
    `PV Input Current: ${cfg.pvInputCurrent}`,
    `MPPT Efficiency: ${SHARED.mpptEfficiency}`,
    `Grid Regulation: ${SHARED.gridRegulation}`,
  ].join('\n')
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const agg = await prisma.productModel.aggregate({ _max: { sortOrder: true } })
  let sortOrder = (agg._max.sortOrder ?? 0) + 1

  for (const cfg of CONFIGURATIONS) {
    const name = `${cfg.modelNumber} (${cfg.nominalEnergy})`
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

  console.log(`\nDone. ${CONFIGURATIONS.length} LT Ultra Air models in Inventar → Modele.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e.message); process.exit(1) })
