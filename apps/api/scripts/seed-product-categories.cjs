/**
 * Seed product categories and backfill existing products.
 * Run from apps/api: node scripts/seed-product-categories.cjs
 */
require('dotenv').config()
const { PrismaPg } = require('@prisma/adapter-pg')
const path = require('path')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))

const CATEGORIES = [
  { slug: 'baterii-solare', name: 'Baterii Solare', order: 1, tipProdus: 'rezidential' },
  { slug: 'sisteme-bess',   name: 'Sisteme BESS',   order: 2, tipProdus: 'industrial'  },
]

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  // Upsert categories
  for (const cat of CATEGORIES) {
    await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      create: { slug: cat.slug, name: cat.name, order: cat.order },
      update: { name: cat.name, order: cat.order },
    })
    console.log(`  category: ${cat.slug} (${cat.name})`)
  }

  // Fetch category IDs
  const categories = await prisma.productCategory.findMany()
  const byTip = {}
  for (const cat of CATEGORIES) {
    const row = categories.find((c) => c.slug === cat.slug)
    if (row) byTip[cat.tipProdus] = row.id
  }

  // Backfill products
  const products = await prisma.product.findMany({
    where: { categoryId: null },
    select: { id: true, tipProdus: true, title: true },
  })

  console.log(`\nBackfilling ${products.length} products...`)
  let updated = 0
  for (const p of products) {
    const categoryId = byTip[p.tipProdus] ?? null
    if (!categoryId) { console.log(`  SKIP "${p.title}" — unknown tipProdus "${p.tipProdus}"`); continue }
    await prisma.product.update({ where: { id: p.id }, data: { categoryId } })
    console.log(`  "${p.title}" → ${p.tipProdus === 'rezidential' ? 'baterii-solare' : 'sisteme-bess'}`)
    updated++
  }

  console.log(`\nDone. Categories: ${CATEGORIES.length}, Products backfilled: ${updated}`)
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
