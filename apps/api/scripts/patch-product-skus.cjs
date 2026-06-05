/**
 * Re-patches product SKUs to match model.sku format (LTC-ESS-ModelNumber).
 * Matches products whose SKU equals either the model's modelNumber OR model's sku.
 * Run: node apps/api/scripts/patch-product-skus.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'client.js'))
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function main() {
  const models = await prisma.productModel.findMany({
    select: { id: true, modelNumber: true, sku: true, brand: true, productType: true },
  })

  let updated = 0
  for (const m of models) {
    if (!m.sku || m.sku === m.modelNumber) continue
    // Find products whose current SKU matches the OLD modelNumber format
    const result = await prisma.product.updateMany({
      where: { sku: m.modelNumber },
      data: { sku: m.sku },
    })
    if (result.count > 0) {
      console.log(`Updated ${result.count} product(s): ${m.modelNumber} → ${m.sku}`)
      updated += result.count
    }
  }

  // Also report current state
  const products = await prisma.product.findMany({ select: { sku: true, title: true } })
  console.log('\n--- Current product SKUs ---')
  for (const p of products) {
    console.log(`  ${p.sku}  "${p.title}"`)
  }

  console.log(`\nTotal updated: ${updated}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
