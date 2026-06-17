/**
 * Clean up HP1600 nominalEnergy values: remove stray trailing ) and set clean kWh values.
 * Run from apps/api: node scripts/patch-hp1600-energy-cleanup.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))

const CORRECT_ENERGY = {
  'HP1600-4S':  '64.3 kWh',
  'HP1600-5S':  '80.4 kWh',
  'HP1600-6S':  '96.5 kWh',
  'HP1600-7S':  '112.5 kWh',
  'HP1600-8S':  '128.6 kWh',
  'HP1600-15S': '241.2 kWh',
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const products = await prisma.product.findMany({
    select: { id: true, title: true, technicalSpecsModels: true },
  })

  let patched = 0
  for (const p of products) {
    if (!p.technicalSpecsModels) continue
    let json
    try {
      json = typeof p.technicalSpecsModels === 'string'
        ? JSON.parse(p.technicalSpecsModels)
        : p.technicalSpecsModels
    } catch { continue }
    if (!json?.entries || !Array.isArray(json.entries)) continue

    let changed = false
    for (const entry of json.entries) {
      const model = String(entry.modelName ?? '').trim().toUpperCase()
      const correct = CORRECT_ENERGY[model.toUpperCase()] ?? CORRECT_ENERGY[model]
      if (!correct) continue
      const current = (entry.specs?.nominalEnergy ?? '').trim()
      if (current !== correct) {
        entry.specs.nominalEnergy = correct
        changed = true
        console.log(`  ${entry.modelName}: "${current}" → "${correct}" in "${p.title}"`)
      }
    }
    if (changed) {
      await prisma.product.update({ where: { id: p.id }, data: { technicalSpecsModels: json } })
      patched++
    }
  }

  console.log(`\nDone. ${patched} product(s) cleaned up.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e.message); process.exit(1) })
