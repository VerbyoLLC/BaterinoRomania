/**
 * Populate ProductModel entries for LTS1331314L series (4 models: 3340–5015 kWh).
 * Run from apps/api: node scripts/populate-lts1331314l-models.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'client.js'))

const BRAND = 'LithTech'
const SERIES = 'LTS1331314L'

const SHARED = {
  energySystem:         '0.5C',
  nominalVoltage:       '1331.2V',
  nominalCapacity:      '3140Ah',
  cellType:             '3.2V 314Ah',
  chemistry:            'LiFePO₄',
  cycleLife:            '8,000 Times (70% SOH)',
  batteryModule:        '166.4V (1P52S)',
  batteryCluster:       '1331.2V (1P416S)',
  ratedOutputVoltage:   '690V',
  acAccessMethod:       '3-Phase 3-Wire',
  ratedGridFrequency:   '50Hz/60Hz',
  conversionEfficiency: '≥98.5%',
  coolingMethod:        'Liquid',
  communication:        'RS485, Ethernet, CAN',
  waterproof:           'IP54 (System) / IP65 (Module)',
  corrosionLevel:       'C4/C5 (Optional)',
  noiseLevel:           '<80dB',
  chargeTemperature:    '0°C to 60°C (32°F to 140°F)',
  dischargeTemperature: '-30°C to 60°C (-22°F to 140°F)',
  storageTemperature:   '0°C to 35°C (32°F to 95°F)',
  altitude:             '≤4000m',
  certification:        'IEC 61000-6-2/61000-6-4/62477-1/62619/UN3536',
  warranty:             '5 Years/10 Years (Optional)',
  dimensions:           '6058×2438×2896mm',
}

const CONFIGURATIONS = [
  {
    modelNumber:   'LTS1331314L-01',
    nominalEnergy: '3340kWh',
    systemConfig:  '8P416S',
    maxOutputPow:  '1670kW',
    weight:        '~31.1T',
  },
  {
    modelNumber:   'LTS1331314L-02',
    nominalEnergy: '3760kWh',
    systemConfig:  '9P416S',
    maxOutputPow:  '1880kW',
    weight:        '~34.3T',
  },
  {
    modelNumber:   'LTS1331314L-03',
    nominalEnergy: '4180kWh',
    systemConfig:  '10P416S',
    maxOutputPow:  '2090kW',
    weight:        '~37.5T',
  },
  {
    modelNumber:   'LTS1331314L-04',
    nominalEnergy: '5015kWh',
    systemConfig:  '12P416S',
    maxOutputPow:  '2507.5kW',
    weight:        '~43.9T',
  },
]

function buildDescription(cfg) {
  return [
    `Nominal Energy: ${cfg.nominalEnergy}`,
    `Energy System: ${SHARED.energySystem}`,
    `Nominal Voltage: ${SHARED.nominalVoltage}`,
    `Nominal Capacity: ${SHARED.nominalCapacity}`,
    `System Configuration: ${cfg.systemConfig}`,
    `Cell Type: ${SHARED.cellType}`,
    `Chemistry: ${SHARED.chemistry}`,
    `Cycle Life: ${SHARED.cycleLife}`,
    `Battery Module: ${SHARED.batteryModule}`,
    `Battery Cluster: ${SHARED.batteryCluster}`,
    `Max Output Power: ${cfg.maxOutputPow}`,
    `Rated Output Voltage: ${SHARED.ratedOutputVoltage}`,
    `AC Access Method: ${SHARED.acAccessMethod}`,
    `Rated Grid Frequency: ${SHARED.ratedGridFrequency}`,
    `Conversion Efficiency: ${SHARED.conversionEfficiency}`,
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
    `Dimensions (L×W×H): ${SHARED.dimensions}`,
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

  console.log(`\nDone. ${CONFIGURATIONS.length} LTS1331314L models added to Inventar → Modele.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e.message); process.exit(1) })
