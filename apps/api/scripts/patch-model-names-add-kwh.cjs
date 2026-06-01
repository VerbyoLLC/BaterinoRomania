/**
 * Update ProductModel names: append (X kWh) where kWh is not already in the name.
 * Extracts kWh from the Nominal Energy line in technicalDescription.
 * Run from apps/api: node scripts/patch-model-names-add-kwh.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'client.js'))

/** Extract kWh value from technicalDescription or name. */
function extractKwh(technicalDescription, name) {
  const lines = String(technicalDescription ?? '').split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const label = line.slice(0, idx).trim().toLowerCase()
    if (label === 'nominal energy' || label === 'energy' || label === 'energie nominala') {
      const raw = line.slice(idx + 1).trim()

      // "64307.2Wh (64.3 kWh)" → "64.3 kWh"
      const kwhInParens = raw.match(/\(([\d.,]+\s*kwh)\)/i)
      if (kwhInParens?.[1]) return kwhInParens[1].trim()

      // "218.88kWh" → "218.88 kWh"
      const kwhDirect = raw.match(/^([\d.,]+)\s*kwh$/i)
      if (kwhDirect) return `${kwhDirect[1]} kWh`

      // "64307.2Wh" → convert
      const whOnly = raw.match(/^([\d.,]+)\s*wh$/i)
      if (whOnly) {
        const wh = parseFloat(whOnly[1].replace(',', '.'))
        if (!isNaN(wh) && wh > 0) return `${(wh / 1000).toFixed(1)} kWh`
      }
    }
  }

  // Fallback: check name for parenthesised kWh already there
  const fromName = String(name ?? '').match(/\(([\d.,]+\s*kwh)\)/i)
  if (fromName?.[1]) return fromName[1].trim()

  return null
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const all = await prisma.productModel.findMany({
    select: { id: true, name: true, modelNumber: true, technicalDescription: true },
    orderBy: { sortOrder: 'asc' },
  })

  const toUpdate = all.filter(m => !/kwh/i.test(m.name))
  console.log(`Found ${toUpdate.length} model(s) without kWh in name (out of ${all.length} total).\n`)

  let updated = 0
  let skipped = 0

  for (const model of toUpdate) {
    const kwh = extractKwh(model.technicalDescription, model.name)
    if (!kwh) {
      console.log(`  skip (no energy found): ${model.modelNumber} — "${model.name}"`)
      skipped++
      continue
    }

    // Remove any existing Wh parenthesis e.g. "(64307.2Wh)" before appending kWh
    const baseName = model.name.replace(/\s*\([^)]*wh\)/i, '').trim()
    const newName = `${baseName} (${kwh})`

    await prisma.productModel.update({
      where: { id: model.id },
      data: { name: newName },
    })
    console.log(`  updated: ${model.modelNumber}`)
    console.log(`    "${model.name}" → "${newName}"`)
    updated++
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e.message); process.exit(1) })
