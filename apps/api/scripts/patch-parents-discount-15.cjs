/**
 * One-time: Energie pentru părinți — 20% → 15% in ReducereProgram (all locales).
 * Run: node scripts/patch-parents-discount-15.cjs
 */
require('dotenv/config')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('../generated/prisma')

function pct20to15(text) {
  if (text == null || text === '') return text
  return String(text).replace(/20\s*%/g, '15%')
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const rows = await prisma.reducereProgram.findMany({
      where: { photo: { contains: 'energie-pentru-parinti' } },
    })

    if (rows.length === 0) {
      console.log('No Energie pentru părinți rows found.')
      return
    }

    for (const row of rows) {
      const data = {
        title: pct20to15(row.title),
        descriereScurta: row.descriereScurta ? pct20to15(row.descriereScurta) : row.descriereScurta,
        description: pct20to15(row.description),
        discountPercent: 15,
      }
      await prisma.reducereProgram.update({ where: { id: row.id }, data })
      console.log(`Updated [${row.locale}] ${row.programLabel}`)
      if (row.discountPercent !== 15) console.log(`  discountPercent: ${row.discountPercent} → 15`)
    }

    console.log(`\n${rows.length} row(s) updated.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
