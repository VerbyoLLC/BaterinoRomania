/**
 * Nightly cron: hard-erases users soft-deleted more than 30 days ago.
 *
 * Railway: Cron Schedule → `0 3 * * *` (03:00 UTC daily)
 * Start command: node scripts/purge-soft-deleted-users.js
 * (Root Directory: apps/api, same env as API service)
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))
const {
  findUsersReadyForHardErasure,
  eraseUserAccount,
  SOFT_DELETE_RETENTION_DAYS,
} = require('../lib/account-erasure.js')

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set.')
    process.exit(1)
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const due = await findUsersReadyForHardErasure(prisma)
    console.log(
      `[purge-soft-deleted-users] Found ${due.length} account(s) past ${SOFT_DELETE_RETENTION_DAYS}-day retention.`,
    )

    for (const { id, email } of due) {
      try {
        await eraseUserAccount(prisma, id)
        console.log(`[purge-soft-deleted-users] Erased user ${id} (${email})`)
      } catch (err) {
        console.error(`[purge-soft-deleted-users] Failed user ${id}:`, err?.message || err)
      }
    }

    console.log('[purge-soft-deleted-users] Done.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('[purge-soft-deleted-users] Fatal:', err)
  process.exit(1)
})
