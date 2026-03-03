/**
 * Set alimentaModalContent for ecohome10 product.
 * Run: node scripts/set-ecohome10-alimenta.cjs
 */
require('dotenv/config')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('../generated/prisma')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const ECOHOME10_ALIMENTA = {
  title: 'Ce se poate alimenta cu o baterie de 10kWh?',
  intro: 'Capacitatea utilă reală este aproximativ 9–10 kWh (în funcție de setările sistemului).',
  sections: [
    {
      label: '⏳ Autonomie estimativă în funcție de consum',
      items: [
        '🔌 300W consum constant → ~30 ore',
        '🔌 500W consum constant → ~18–20 ore',
        '🔌 1kW consum constant → ~9–10 ore',
        '🔌 2kW consum constant → ~4–5 ore',
      ],
    },
    {
      label: 'Exemple concrete',
      items: [
        '🧊 Frigider (150W medie) → 50–60 ore',
        '🏠 Consum mediu seară (800W) → 10–12 ore',
        '🔥 Centrală + iluminat + electrocasnice ușoare (1.2kW) → 7–8 ore',
        '🏡 Casă eficientă energetic (consum zilnic 8–10 kWh) → acoperă aproape o zi întreagă',
      ],
    },
  ],
}

async function main() {
  const slug = 'ecohome10'
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug }, { slug: { contains: 'ecohome', mode: 'insensitive' } }] },
  })
  if (!product) {
    console.log('Product with slug ecohome10 (or containing "ecohome") not found.')
    console.log('Available products:')
    const all = await prisma.product.findMany({ select: { id: true, slug: true, title: true } })
    all.forEach((p) => console.log(`  - ${p.slug || p.id}: ${p.title}`))
    process.exit(1)
  }
  await prisma.product.update({
    where: { id: product.id },
    data: { alimentaModalContent: ECOHOME10_ALIMENTA },
  })
  console.log(`Updated alimentaModalContent for product: ${product.title} (${product.slug || product.id})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
