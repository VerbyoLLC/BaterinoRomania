/**
 * One-off maintenance: archive residential orders left orphaned by older raw account deletes.
 *
 * Older admin deletes removed the User row directly, so the DB set order.userId = null
 * (onDelete: SetNull) but left the original email/PII on the order in the active table. That
 * allowed a new account reusing the same email to re-inherit those orders. This MOVES such
 * orders into the DeletedOrder archive (full data kept for fiscal retention) and removes them
 * from the active "ResidentialOrder" table.
 *
 * Run: node scripts/archive-orphaned-orders.js
 * (Root Directory: apps/api, same env as API service)
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))
const {
  archiveOrphanedAccountOrders,
  archiveSoftDeletedUsersOrders,
} = require('../lib/account-erasure.js')

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set.')
    process.exit(1)
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const softDeleted = await archiveSoftDeletedUsersOrders(prisma)
    console.log(`[archive-orphaned-orders] Archived ${softDeleted} order(s) from already soft-deleted accounts.`)
    const orphaned = await archiveOrphanedAccountOrders(prisma)
    console.log(`[archive-orphaned-orders] Archived ${orphaned} orphaned order(s) into DeletedOrder.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('[archive-orphaned-orders] Fatal:', err)
  process.exit(1)
})
