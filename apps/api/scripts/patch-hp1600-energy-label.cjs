/**
 * Patch HP1600 product models: rename "Energy:" → "Nominal Energy:" in technicalDescription.
 * Also patch any products whose technicalSpecsModels has HP1600 entries with empty nominalEnergy.
 *
 * Run from apps/api: node scripts/patch-hp1600-energy-label.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'client.js'))

const HP1600_MODEL_NUMBERS = ['HP1600-4S', 'HP1600-5S', 'HP1600-6S', 'HP1600-7S', 'HP1600-8S', 'HP1600-15S']

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  // ── 1. Fix technicalDescription in product_models ──────────────────────────
  console.log('\n── Patching product_models technicalDescription ──')
  const models = await prisma.productModel.findMany({
    where: { modelNumber: { in: HP1600_MODEL_NUMBERS } },
    select: { id: true, modelNumber: true, technicalDescription: true },
  })

  for (const m of models) {
    const fixed = String(m.technicalDescription ?? '').replace(
      /^Energy:/gm,
      'Nominal Energy:'
    )
    if (fixed !== m.technicalDescription) {
      await prisma.productModel.update({
        where: { id: m.id },
        data: { technicalDescription: fixed },
      })
      console.log(`  fixed technicalDescription: ${m.modelNumber}`)
    } else {
      console.log(`  already correct: ${m.modelNumber}`)
    }
  }

  // ── 2. Fix technicalSpecsModels on products that contain HP1600 entries ─────
  console.log('\n── Patching products technicalSpecsModels ──')
  const products = await prisma.product.findMany({
    select: { id: true, title: true, technicalSpecsModels: true },
  })

  let productsPatched = 0
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
      const modelNum = String(entry.modelName ?? '').trim().toUpperCase()
      if (!HP1600_MODEL_NUMBERS.some(n => n.toUpperCase() === modelNum)) continue
      if (entry.specs && !entry.specs.nominalEnergy) {
        // Extract energy value from technicalDescription of the patched model
        const model = models.find(m => m.modelNumber.toUpperCase() === modelNum)
        if (!model) continue
        const match = String(model.technicalDescription ?? '').match(/^Nominal Energy:\s*(.+)$/m)
          || String(model.technicalDescription ?? '').match(/^Energy:\s*(.+)$/m)
        if (match?.[1]) {
          entry.specs.nominalEnergy = match[1].trim()
          changed = true
          console.log(`  patched nominalEnergy="${entry.specs.nominalEnergy}" for ${entry.modelName} in product "${p.title}"`)
        }
      }
    }

    if (changed) {
      await prisma.product.update({
        where: { id: p.id },
        data: { technicalSpecsModels: json },
      })
      productsPatched++
    }
  }

  console.log(`\nDone. ${productsPatched} product(s) patched.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e.message); process.exit(1) })
