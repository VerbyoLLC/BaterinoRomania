/**
 * Populate slug for products that don't have one.
 * Run from apps/api: node scripts/populate-product-slugs.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

function slugify(title) {
  if (!title || typeof title !== 'string') return ''
  return title
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100) || 'produs'
}

async function main() {
  const prisma = new PrismaClient({ adapter })
  const existing = await prisma.product.findMany({ where: { slug: { not: null } }, select: { slug: true } })
  const used = new Set(existing.map((p) => p.slug))
  const products = await prisma.product.findMany({ where: { slug: null }, select: { id: true, title: true } })
  for (const p of products) {
    let baseSlug = slugify(p.title)
    let slug = baseSlug
    let suffix = 0
    while (used.has(slug)) {
      slug = `${baseSlug}-${++suffix}`
    }
    used.add(slug)
    await prisma.product.update({ where: { id: p.id }, data: { slug } })
    console.log(`Updated ${p.id}: ${p.title} -> ${slug}`)
  }
  console.log(`Done. Updated ${products.length} products.`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
