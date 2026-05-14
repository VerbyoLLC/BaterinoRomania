/**
 * One-shot script: set listUnitPriceInclVat / listLineTotalInclVat on a
 * ResidentialOrderLine so the discount UI can be previewed.
 *
 * Usage:
 *   node scripts/patch-order-list-price.js BTO-20260514-2C0A882C 12
 *
 * Args:
 *   1 – orderNumber
 *   2 – discountPercent (e.g. 12)
 */

require('dotenv').config()
const { PrismaClient } = require('../generated/prisma')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const orderNumber = process.argv[2]
  const discountPct = parseFloat(process.argv[3] || '12')

  if (!orderNumber) {
    console.error('Usage: node patch-order-list-price.js <orderNumber> [discountPercent]')
    process.exit(1)
  }

  const order = await prisma.residentialOrder.findUnique({
    where: { orderNumber },
    include: { lines: true },
  })

  if (!order) {
    console.error(`Order not found: ${orderNumber}`)
    process.exit(1)
  }

  console.log(`Found order ${orderNumber} with ${order.lines.length} line(s).`)

  const factor = 1 - discountPct / 100

  for (const L of order.lines) {
    const paid = parseFloat(String(L.lineTotalInclVat || '0'))
    const paidUnit = parseFloat(String(L.unitPriceInclVat || '0'))
    if (!paid || factor <= 0 || factor >= 1) continue

    const listLineTotal = +(paid / factor).toFixed(2)
    const listUnitPrice = +(paidUnit / factor).toFixed(2)

    await prisma.residentialOrderLine.update({
      where: { id: L.id },
      data: {
        listLineTotalInclVat: listLineTotal,
        listUnitPriceInclVat: listUnitPrice,
      },
    })

    console.log(
      `  Line ${L.id}: paid ${paid} → listLine ${listLineTotal} (−${discountPct}%)`,
    )
  }

  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
