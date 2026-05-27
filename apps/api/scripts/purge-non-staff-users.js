/**
 * One-off cleanup: delete all users except admin + sales_agent, and data linked to them.
 * Does NOT touch products, warehouse stock, inquiries, site settings, sales leads, etc.
 *
 * Usage (from apps/api):
 *   node scripts/purge-non-staff-users.js --confirm
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))
const { isR2Configured, urlToKey, deleteFromR2 } = require('../lib/r2.js')
const { purgePartnerPublicProfileR2 } = require('../lib/account-erasure.js')

const KEEP_ROLES = new Set(['admin', 'sales_agent'])

async function deleteR2Url(urlString) {
  if (!urlString || !isR2Configured()) return
  const key = urlToKey(urlString)
  if (!key) return
  try {
    await deleteFromR2(key)
  } catch (e) {
    console.warn('[purge-non-staff-users] R2 delete failed:', key, e?.message || e)
  }
}

async function purgeReturPhotos(retur) {
  let urls = []
  try {
    const raw = retur.conditionPhotoUrls
    urls = Array.isArray(raw) ? raw : JSON.parse(raw || '[]')
  } catch {
    urls = []
  }
  for (const url of urls) {
    if (typeof url === 'string' && url.trim()) await deleteR2Url(url.trim())
  }
}

async function purgeOrderDocuments(order) {
  await deleteR2Url(order.clientInvoiceUrl)
  await deleteR2Url(order.proformaUrl)
}

async function main() {
  if (!process.argv.includes('--confirm')) {
    console.error('Refusing to run without --confirm (destructive operation).')
    console.error('Usage: node scripts/purge-non-staff-users.js --confirm')
    process.exit(1)
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set.')
    process.exit(1)
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const keepUsers = await prisma.user.findMany({
      where: { role: { in: [...KEEP_ROLES] } },
      select: { id: true, email: true, role: true },
    })
    const removeUsers = await prisma.user.findMany({
      where: { role: { notIn: [...KEEP_ROLES] } },
      select: { id: true, email: true, role: true },
    })

    console.log(`[purge-non-staff-users] Keeping ${keepUsers.length} staff account(s):`)
    for (const u of keepUsers) console.log(`  - ${u.email} (${u.role})`)
    console.log(`[purge-non-staff-users] Removing ${removeUsers.length} user account(s).`)

    if (removeUsers.length === 0) {
      console.log('[purge-non-staff-users] Nothing to delete.')
      return
    }

    const removeIds = removeUsers.map((u) => u.id)
    const removeEmails = removeUsers
      .map((u) => String(u.email || '').trim().toLowerCase())
      .filter(Boolean)

    const partners = await prisma.partner.findMany({
      where: { userId: { in: removeIds } },
    })
    for (const partner of partners) {
      await purgePartnerPublicProfileR2(partner)
    }

    const orders = await prisma.residentialOrder.findMany({
      where: { userId: { in: removeIds } },
      select: {
        id: true,
        clientInvoiceUrl: true,
        proformaUrl: true,
      },
    })
    for (const order of orders) {
      await purgeOrderDocuments(order)
    }

    const returs = await prisma.retur.findMany({
      where: { userId: { in: removeIds } },
    })
    for (const retur of returs) {
      await purgeReturPhotos(retur)
    }

    const counts = await prisma.$transaction(async (tx) => {
      const ordersDeleted = await tx.residentialOrder.deleteMany({
        where: { userId: { in: removeIds } },
      })
      const serviceRequests = await tx.serviceRequest.deleteMany({
        where: { userId: { in: removeIds } },
      })
      const retursDeleted = await tx.retur.deleteMany({
        where: { userId: { in: removeIds } },
      })
      const consentLogs = await tx.consentLog.deleteMany({
        where: { userId: { in: removeIds } },
      })
      const warehouseItems = await tx.warehouseSavedItem.updateMany({
        where: { client: { in: removeIds } },
        data: {
          client: null,
          location: 'depozit',
          warrantyCertificateUrl: null,
          warrantyCertificateGeneratedAt: null,
          clientReceiptDate: null,
        },
      })
      const usersDeleted = await tx.user.deleteMany({
        where: { id: { in: removeIds } },
      })
      return {
        orders: ordersDeleted.count,
        serviceRequests: serviceRequests.count,
        returs: retursDeleted.count,
        consentLogs: consentLogs.count,
        warehouseItems: warehouseItems.count,
        users: usersDeleted.count,
      }
    })

    console.log('[purge-non-staff-users] Deleted:')
    console.log(`  users: ${counts.users}`)
    console.log(`  residential orders: ${counts.orders}`)
    console.log(`  service requests: ${counts.serviceRequests}`)
    console.log(`  retur: ${counts.returs}`)
    console.log(`  consent logs: ${counts.consentLogs}`)
    console.log(`  warehouse items unlinked: ${counts.warehouseItems}`)
    console.log(
      `[purge-non-staff-users] Left untouched: products, guest orders, inquiries, sales leads, warehouse stock.`,
    )
    if (removeEmails.length) {
      console.log(
        `[purge-non-staff-users] Note: guest ResidentialOrder / GuestResidentialOrder rows (no userId) were not removed.`,
      )
    }
    console.log('[purge-non-staff-users] Done.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('[purge-non-staff-users] Fatal:', err)
  process.exit(1)
})
