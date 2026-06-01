/**
 * Populate ProductModel entries for 20Ft Air BESS Container series (6 models).
 * Run from apps/api: node scripts/populate-20ft-air-bess-container-models.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'client.js'))

const BRAND = 'LithTech'
const SERIES = '20Ft Air BESS Container'

const SHARED = {
  nominalVoltage:       '768V',
  chemistry:            'LiFePO₄',
  batteryModule:        '51.2V (16S)',
  batteryCluster:       '768V (16S*15)',
  ratedOutputVoltage:   '400V',
  acAccessMethod:       '3-Phase 3-Wire',
  ratedGridFrequency:   '50Hz/60Hz',
  coolingMethod:        'Force Air Cooling',
  communication:        'RS485, Ethernet, CAN',
  waterproof:           'IP54/IP55 (Optional)',
  corrosionLevel:       'C4/C5 (Optional)',
  noiseLevel:           '<65dB',
  chargeTemperature:    '0°C to 55°C (32°F to 131°F)',
  dischargeTemperature: '-30°C to 60°C (-4°F to 140°F)',
  storageTemperature:   '0°C to 35°C (32°F to 95°F)',
  altitude:             '≤3000m',
  certification:        'IEC61000, IEC62619, IEC62477, UL1973(Cell), UL9540(Cell), UL9540A(Cell), UN38.3, CE',
  warranty:             '5 Years/10 Years (Optional)',
  dimensions:           '6058×2438×2896mm',
}

const CONFIGURATIONS = [
  {
    modelNumber:   'LT1300-1000K-A',
    energySystem:  '1C',
    nominalCap:    '1710Ah',
    nominalEnergy: '1313.28kWh',
    systemConfig:  '6P16S*15',
    cellType:      '285Ah',
    cycleLife:     '9,000 Times (70% SOH)',
    ratedOutput:   '1000kW',
    pcsCabinets:   '2',
    weight:        '~20T',
  },
  {
    modelNumber:   'LT800-750K-A',
    energySystem:  '1C',
    nominalCap:    '1140Ah',
    nominalEnergy: '875.52kWh',
    systemConfig:  '4P16S*15',
    cellType:      '285Ah',
    cycleLife:     '9,000 Times (70% SOH)',
    ratedOutput:   '750kW',
    pcsCabinets:   '2',
    weight:        '~17T',
  },
  {
    modelNumber:   'LT600-500K-A',
    energySystem:  '1C',
    nominalCap:    '855Ah',
    nominalEnergy: '656.64kWh',
    systemConfig:  '3P16S*15',
    cellType:      '285Ah',
    cycleLife:     '9,000 Times (70% SOH)',
    ratedOutput:   '500kW',
    pcsCabinets:   '1',
    weight:        '~15T',
  },
  {
    modelNumber:   'LT1400-750K-A',
    energySystem:  '0.5C',
    nominalCap:    '1884Ah',
    nominalEnergy: '1446.912kWh',
    systemConfig:  '6P16S*15',
    cellType:      '314Ah',
    cycleLife:     '8,000 Times (70% SOH)',
    ratedOutput:   '750kW',
    pcsCabinets:   '2',
    weight:        '~20T',
  },
  {
    modelNumber:   'LT1200-500K-A',
    energySystem:  '0.5C',
    nominalCap:    '1570Ah',
    nominalEnergy: '1205.76kWh',
    systemConfig:  '5P16S*15',
    cellType:      '314Ah',
    cycleLife:     '8,000 Times (70% SOH)',
    ratedOutput:   '500kW',
    pcsCabinets:   '1',
    weight:        '~18T',
  },
  {
    modelNumber:   'LT900-500K-A',
    energySystem:  '0.5C',
    nominalCap:    '1256Ah',
    nominalEnergy: '964.608kWh',
    systemConfig:  '4P16S*15',
    cellType:      '314Ah',
    cycleLife:     '8,000 Times (70% SOH)',
    ratedOutput:   '500kW',
    pcsCabinets:   '1',
    weight:        '~17T',
  },
]

function buildDescription(cfg) {
  return [
    `Nominal Energy: ${cfg.nominalEnergy}`,
    `Energy System: ${cfg.energySystem}`,
    `Nominal Voltage: ${SHARED.nominalVoltage}`,
    `Nominal Capacity: ${cfg.nominalCap}`,
    `System Configuration: ${cfg.systemConfig}`,
    `Cell Type: ${cfg.cellType}`,
    `Chemistry: ${SHARED.chemistry}`,
    `Cycle Life: ${cfg.cycleLife}`,
    `Battery Module: ${SHARED.batteryModule}`,
    `Battery Cluster: ${SHARED.batteryCluster}`,
    `Rated Output Power: ${cfg.ratedOutput}`,
    `Rated Output Voltage: ${SHARED.ratedOutputVoltage}`,
    `AC Access Method: ${SHARED.acAccessMethod}`,
    `Rated Grid Frequency: ${SHARED.ratedGridFrequency}`,
    `Number of PCS Cabinets: ${cfg.pcsCabinets}`,
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

  console.log(`\nDone. ${CONFIGURATIONS.length} models added to Inventar → Modele.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e.message); process.exit(1) })
