/**
 * One-off repair if partner channel migrations failed mid-way.
 * Run only when prisma migrate deploy reports a failed migration.
 *
 * Usage (from apps/api, with DATABASE_URL set):
 *   node scripts/repair-partner-migrations.js
 */
require('dotenv').config()
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('../generated/prisma')
const pg = require('pg')

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is not set.')
    process.exit(1)
  }
  const pool = new pg.Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" DROP COLUMN IF EXISTS "partnerSalePrice";
    `)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Partner" ADD COLUMN IF NOT EXISTS "partnerChannelType" TEXT NOT NULL DEFAULT 'installer';
    `)
    await prisma.$executeRawUnsafe(`
      UPDATE "Partner"
      SET "partnerChannelType" = CASE
        WHEN LOWER("activityTypes") LIKE '%instalator%' AND LOWER("activityTypes") LIKE '%distribuitor%' THEN 'hybrid'
        WHEN LOWER("activityTypes") LIKE '%distribuitor%' THEN 'distributor'
        ELSE 'installer'
      END;
    `)
    console.log('Repair SQL applied successfully.')
    console.log('If migrate still fails, mark migrations as applied:')
    console.log('  npx prisma migrate resolve --applied 20260627120000_drop_product_partner_sale_price')
    console.log('  npx prisma migrate resolve --applied 20260627140000_partner_channel_type')
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
