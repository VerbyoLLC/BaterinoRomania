/**
 * Populate ProductModel entries for LT 204-218-225-241 Air series (4 models).
 * Run from apps/api: node scripts/populate-lt-204-218-225-241-air-models.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'client.js'))

const BRAND = 'LithTech'
const SERIES = 'LT 204 - 218 - 225 - 241 Air'

const SHARED = {
  batteryModule:          '51.2V (16S)',
  chemistry:              'LiFePO₄',
  impedance:              '<200MΩ',
  insulationResistance:   '≥50MΩ',
  fireProtection:         'Aerosol',
  humidity:               '10%~90% RH',
  coolingMethod:          'Force Air Cooling',
  communication:          'RS485, Ethernet, CAN',
  waterproof:             'IP54/IP55 (Optional)',
  corrosionLevel:         'C4/C5 (Optional)',
  noiseLevel:             '<70dB',
  chargeTemperature:      '0°C to 55°C (32°F to 131°F)',
  dischargeTemperature:   '-20°C to 60°C (-4°F to 140°F)',
  storageTemperature:     '0°C to 35°C (32°F to 95°F)',
  altitude:               '≤3000m',
  certification:          'IEC 61000-6-2/61000-6-4/62477-1/62619/UN38.3',
  warranty:               '5 Years/10 Years (Optional)',
  dimensions:             '1780×1100(1286)×2100mm',
}

const CONFIGURATIONS = [
  {
    modelNumber:     'LT218-A',
    energySystem:    '1C',
    nominalVoltage:  '768V',
    nominalCapacity: '285Ah',
    nominalEnergy:   '218.88kWh',
    systemConfig:    '1P16S*15',
    cellType:        '285Ah',
    cycleLife:       '9,000 Times (70% SOH)',
    batteryRack:     '768V (16S*15)',
    maxOutputPower:  '218.88kW',
    weight:          '~2.8T',
  },
  {
    modelNumber:     'LT204-A',
    energySystem:    '1C',
    nominalVoltage:  '716.8V',
    nominalCapacity: '285Ah',
    nominalEnergy:   '204.288kWh',
    systemConfig:    '1P16S*14',
    cellType:        '285Ah',
    cycleLife:       '9,000 Times (70% SOH)',
    batteryRack:     '716.8V (16S*14)',
    maxOutputPower:  '204.288kW',
    weight:          '~2.7T',
  },
  {
    modelNumber:     'LT241-A',
    energySystem:    '0.5C',
    nominalVoltage:  '768V',
    nominalCapacity: '314Ah',
    nominalEnergy:   '241.152kWh',
    systemConfig:    '1P16S*15',
    cellType:        '314Ah',
    cycleLife:       '8,000 Times (70% SOH)',
    batteryRack:     '768V (16S*15)',
    maxOutputPower:  '120.576kW',
    weight:          '~2.9T',
  },
  {
    modelNumber:     'LT225-A',
    energySystem:    '0.5C',
    nominalVoltage:  '716.8V',
    nominalCapacity: '314Ah',
    nominalEnergy:   '225.075kWh',
    systemConfig:    '1P16S*14',
    cellType:        '314Ah',
    cycleLife:       '8,000 Times (70% SOH)',
    batteryRack:     '716.8V (16S*14)',
    maxOutputPower:  '112.537kW',
    weight:          '~2.8T',
  },
]

function buildDescription(cfg) {
  return [
    `Nominal Energy: ${cfg.nominalEnergy}`,
    `Energy System: ${cfg.energySystem}`,
    `Nominal Voltage: ${cfg.nominalVoltage}`,
    `Nominal Capacity: ${cfg.nominalCapacity}`,
    `Nominal Energy: ${cfg.nominalEnergy}`,
    `System Configuration: ${cfg.systemConfig}`,
    `Cell Type: ${cfg.cellType}`,
    `Chemistry: ${SHARED.chemistry}`,
    `Cycle Life: ${cfg.cycleLife}`,
    `Battery Module: ${SHARED.batteryModule}`,
    `Battery Rack: ${cfg.batteryRack}`,
    `Max Output Power: ${cfg.maxOutputPower}`,
    `Impedance: ${SHARED.impedance}`,
    `Insulation Resistance: ${SHARED.insulationResistance}`,
    `Fire Protection System: ${SHARED.fireProtection}`,
    `Humidity: ${SHARED.humidity}`,
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
    `Dimensions (W×D×H): ${SHARED.dimensions}`,
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
