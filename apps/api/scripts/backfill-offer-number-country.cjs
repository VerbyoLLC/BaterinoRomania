/**
 * Backfill offerNumber and country columns for existing AdminCommercialOffer rows.
 * Run from apps/api: node scripts/backfill-offer-number-country.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))

function buildOfferNumberFromGeneratedAt(generatedAt) {
  if (!generatedAt || typeof generatedAt !== 'string') return ''
  const t = new Date(generatedAt)
  if (isNaN(t.getTime())) return ''
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const day = String(t.getDate()).padStart(2, '0')
  const tail = generatedAt.replace(/\W/g, '').slice(-6) || String(t.getTime()).slice(-6)
  return `OC-${y}${m}${day}-${tail}`
}

function extractCountryFromSnapshot(snapshot, buyerType) {
  if (!snapshot || typeof snapshot !== 'object') return ''
  try {
    const form = snapshot.form || snapshot
    if (buyerType === 'person' && form.clientPerson?.tara) return form.clientPerson.tara
    if (buyerType === 'company' && form.clientCompany?.tara) return form.clientCompany.tara
  } catch (e) { /* ignore */ }
  return ''
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const rows = await prisma.adminCommercialOffer.findMany({
    where: {
      OR: [{ offerNumber: '' }, { country: '' }],
    },
    select: { id: true, buyerType: true, status: true, createdAt: true, offerNumber: true, country: true, draftSnapshot: true },
  })

  console.log(`Found ${rows.length} offers to backfill.`)

  let updated = 0

  for (const row of rows) {
    const snap = row.draftSnapshot
    const data = {}

    if (!row.offerNumber) {
      // Try snapshot generatedAt first, fall back to createdAt
      const ts = (snap && snap.generatedAt) ? snap.generatedAt : row.createdAt.toISOString()
      data.offerNumber = buildOfferNumberFromGeneratedAt(ts)
    }

    if (!row.country) {
      // Try snapshot tara first, fall back to 'România' (the form default)
      data.country = extractCountryFromSnapshot(snap, row.buyerType) || 'România'
    }

    if (Object.keys(data).length === 0) continue

    await prisma.adminCommercialOffer.update({ where: { id: row.id }, data })
    console.log(`  [${row.status}] ${row.id} → offerNumber="${data.offerNumber ?? row.offerNumber}" country="${data.country ?? row.country}"`)
    updated++
  }

  console.log(`\nDone. Updated: ${updated}`)
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
