/**
 * One-time repair: ReducereProgram.photo / topIcon .jpg → .webp in DB.
 * Run: node scripts/fix-reducere-program-photos.cjs
 */
require('dotenv/config')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('../generated/prisma')
const { normalizeReducereProgramAssetUrl } = require('../lib/reducere-program-assets.js')

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const rows = await prisma.reducereProgram.findMany({
      select: { id: true, photo: true, topIcon: true, programLabel: true },
    })

    let updated = 0
    for (const row of rows) {
      const photo = normalizeReducereProgramAssetUrl(row.photo)
      const topIcon = row.topIcon ? normalizeReducereProgramAssetUrl(row.topIcon) : row.topIcon
      if (photo !== row.photo || topIcon !== row.topIcon) {
        await prisma.reducereProgram.update({
          where: { id: row.id },
          data: { photo, topIcon },
        })
        console.log(`Updated ${row.programLabel}`)
        console.log(`  photo: ${row.photo} → ${photo}`)
        if (topIcon !== row.topIcon) console.log(`  topIcon: ${row.topIcon} → ${topIcon}`)
        updated++
      }
    }

    console.log(updated ? `\n${updated} row(s) updated.` : '\nNothing to update.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
