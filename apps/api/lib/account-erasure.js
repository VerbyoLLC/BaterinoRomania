/**
 * Account deletion: soft-delete (grace period) then hard GDPR erasure via cron.
 * Orders are anonymized, not deleted (fiscal retention).
 */
const { isR2Configured, urlToKey, deleteFromR2 } = require('./r2.js')

const ANONYMIZED_EMAIL_DOMAIN = 'accounts.erased.baterino.local'
const DELETED_USER_LABEL = '[deleted user]'
const SOFT_DELETE_RETENTION_DAYS = 30

/** Order archiving copies rows + lines one-by-one; allow headroom over remote DB latency. */
const ORDER_ARCHIVE_TX_OPTIONS = { timeout: 60000, maxWait: 20000 }

function anonymizedEmailForUserId(userId) {
  const safe = String(userId || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 32)
  return `erased+${safe || 'user'}@${ANONYMIZED_EMAIL_DOMAIN}`
}

async function deleteR2UrlWithPrefix(urlString, requiredPrefix) {
  if (!urlString || typeof urlString !== 'string') return
  if (!isR2Configured()) return
  const key = urlToKey(urlString)
  if (!key || !key.startsWith(requiredPrefix)) return
  try {
    await deleteFromR2(key)
  } catch (e) {
    console.warn('[Account erasure] R2 delete failed:', key, e?.message || e)
  }
}

function partnerPublicProfileR2Urls(partner) {
  if (!partner) return []
  const urls = []
  if (partner.logoUrl) urls.push(String(partner.logoUrl))
  if (partner.workPhotos) {
    try {
      const arr = JSON.parse(partner.workPhotos)
      if (Array.isArray(arr)) {
        for (const entry of arr) {
          if (typeof entry === 'string' && entry.trim()) urls.push(entry.trim())
          else if (entry && typeof entry.url === 'string' && entry.url.trim()) urls.push(entry.url.trim())
        }
      }
    } catch {
      /* ignore invalid JSON */
    }
  }
  return urls
}

async function purgePartnerPublicProfileR2(partner) {
  for (const url of partnerPublicProfileR2Urls(partner)) {
    await deleteR2UrlWithPrefix(url, 'PublicProfiles/')
  }
}

async function purgeWarrantyCertificateR2(savedItem) {
  if (!savedItem?.warrantyCertificateUrl) return
  await deleteR2UrlWithPrefix(String(savedItem.warrantyCertificateUrl), 'warranty-certificates/')
}

/**
 * Marks account for deletion; blocks login via deletedAt. Remaining account data is kept until the
 * cron hard-erases, but orders are archived + removed from the active table immediately so they
 * leave "comenzile mele" right away and can never be re-associated with a future account that
 * reuses the same email.
 * @param {import('../generated/prisma').PrismaClient} prisma
 * @param {string} userId
 */
async function softDeleteUserAccount(prisma, userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
  await prisma.$transaction(
    async (tx) => {
      await archiveAndRemoveOrdersInTx(tx, { userId, email: user?.email, reason: 'account_deleted' })
      await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          verificationCode: null,
          verificationCodeExpiresAt: null,
          passwordResetToken: null,
          passwordResetExpiresAt: null,
          clientCart: null,
        },
      })
    },
    ORDER_ARCHIVE_TX_OPTIONS,
  )
}

/**
 * @param {import('../generated/prisma').PrismaClient} prisma
 * @param {number} [retentionDays]
 */
async function findUsersReadyForHardErasure(prisma, retentionDays = SOFT_DELETE_RETENTION_DAYS) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
  return prisma.user.findMany({
    where: { deletedAt: { not: null, lte: cutoff } },
    select: { id: true, email: true },
  })
}

/** Build the DeletedOrder create payload (incl. nested lines) from a ResidentialOrder row. */
function buildDeletedOrderData(order, reason) {
  return {
    originalOrderId: order.id,
    orderNumber: order.orderNumber,
    orderSource: order.orderSource,
    originalUserId: order.userId,
    email: order.email,
    phone: order.phone,
    lastName: order.lastName,
    firstName: order.firstName,
    billAddress: order.billAddress,
    billCounty: order.billCounty,
    billCity: order.billCity,
    billPostal: order.billPostal,
    deliveryDifferent: order.deliveryDifferent,
    delAddress: order.delAddress,
    delCounty: order.delCounty,
    delCity: order.delCity,
    delPostal: order.delPostal,
    buyerType: order.buyerType,
    companyName: order.companyName,
    companyCui: order.companyCui,
    companyAddress: order.companyAddress,
    companyCounty: order.companyCounty,
    companyCity: order.companyCity,
    companyPostal: order.companyPostal,
    currency: order.currency,
    fulfillmentStatus: order.fulfillmentStatus,
    clientInvoiceUrl: order.clientInvoiceUrl,
    proformaUrl: order.proformaUrl,
    orderCreatedAt: order.createdAt,
    deletionReason: reason,
    lines: {
      create: (order.lines || []).map((L) => ({
        originalLineId: L.id,
        productId: L.productId,
        productSlug: L.productSlug,
        productTitle: L.productTitle,
        quantity: L.quantity,
        unitPriceInclVat: L.unitPriceInclVat,
        lineTotalInclVat: L.lineTotalInclVat,
        listUnitPriceInclVat: L.listUnitPriceInclVat,
        listLineTotalInclVat: L.listLineTotalInclVat,
        vatPercent: L.vatPercent,
      })),
    },
  }
}

/**
 * Within an existing transaction: copy the matching ResidentialOrders (+ lines) into the
 * DeletedOrder archive (full data kept for fiscal retention), then delete them from the active
 * table. Returns the number of orders archived. Orders matching DELETED_USER_LABEL are skipped.
 */
async function archiveAndRemoveOrdersInTx(tx, { userId = null, email = null, reason = 'account_deleted' }) {
  const orClauses = []
  if (userId) orClauses.push({ userId })
  const emailNorm = String(email || '').trim().toLowerCase()
  if (emailNorm && emailNorm !== DELETED_USER_LABEL.toLowerCase()) {
    orClauses.push({ email: emailNorm })
  }
  if (orClauses.length === 0) return 0

  const orders = await tx.residentialOrder.findMany({
    where: { OR: orClauses },
    include: { lines: true },
  })
  if (orders.length === 0) return 0

  for (const order of orders) {
    await tx.deletedOrder.create({ data: buildDeletedOrderData(order, reason) })
  }
  await tx.residentialOrder.deleteMany({ where: { id: { in: orders.map((o) => o.id) } } })
  return orders.length
}

/**
 * Maintenance cleanup for orders left orphaned by an older raw account delete (userId nulled via
 * onDelete: SetNull) that still carry real PII. Account-owned orders (orderSource client/partner)
 * with no owner can never belong to a live account, so they are moved to the DeletedOrder archive
 * and removed from the active table. Returns the number of orders archived.
 * @param {import('../generated/prisma').PrismaClient} prisma
 */
async function archiveOrphanedAccountOrders(prisma) {
  const orders = await prisma.residentialOrder.findMany({
    where: { userId: null, orderSource: { in: ['client', 'partner'] } },
    include: { lines: true },
  })
  if (orders.length === 0) return 0

  // Safety: never archive a legacy un-linked order whose email still belongs to an existing
  // account (it may legitimately be that account's order). Truly orphaned = no user with that email.
  const users = await prisma.user.findMany({ select: { email: true } })
  const existingEmails = new Set(users.map((u) => String(u.email || '').trim().toLowerCase()))
  const target = orders.filter(
    (o) => !existingEmails.has(String(o.email || '').trim().toLowerCase()),
  )
  if (target.length === 0) return 0

  await prisma.$transaction(async (tx) => {
    for (const order of target) {
      await tx.deletedOrder.create({ data: buildDeletedOrderData(order, 'orphaned_cleanup') })
    }
    await tx.residentialOrder.deleteMany({ where: { id: { in: target.map((o) => o.id) } } })
  }, ORDER_ARCHIVE_TX_OPTIONS)
  return target.length
}

/**
 * Backfill: archive + remove orders belonging to accounts that were already soft-deleted before
 * order archiving moved into the deletion flow. Matches by userId and by the account email.
 * Returns the number of orders archived.
 * @param {import('../generated/prisma').PrismaClient} prisma
 */
async function archiveSoftDeletedUsersOrders(prisma) {
  const users = await prisma.user.findMany({
    where: { deletedAt: { not: null } },
    select: { id: true, email: true },
  })
  let total = 0
  for (const u of users) {
    total += await prisma.$transaction(
      (tx) => archiveAndRemoveOrdersInTx(tx, { userId: u.id, email: u.email, reason: 'account_deleted' }),
      ORDER_ARCHIVE_TX_OPTIONS,
    )
  }
  return total
}

/**
 * Hard erasure after grace period: R2 cleanup, anonymize linked records, delete User.
 * @param {import('../generated/prisma').PrismaClient} prisma
 * @param {string} userId
 */
async function eraseUserAccount(prisma, userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, deletedAt: true },
  })
  if (!user) return

  const partner = await prisma.partner.findUnique({
    where: { userId },
    select: { logoUrl: true, workPhotos: true, partnerContractPdfUrl: true },
  })

  const savedItems = await prisma.warehouseSavedItem.findMany({
    where: { client: userId },
    select: { id: true, warrantyCertificateUrl: true },
  })

  if (partner) {
    await purgePartnerPublicProfileR2(partner)
    if (partner.partnerContractPdfUrl) {
      await deleteR2UrlWithPrefix(String(partner.partnerContractPdfUrl), 'partner-contracts/')
    }
  }
  for (const item of savedItems) {
    await purgeWarrantyCertificateR2(item)
  }

  const anonEmail = anonymizedEmailForUserId(userId)

  await prisma.$transaction(async (tx) => {
    await archiveAndRemoveOrdersInTx(tx, { userId, email: user.email, reason: 'account_deleted' })

    if (savedItems.length > 0) {
      await tx.warehouseSavedItem.updateMany({
        where: { client: userId },
        data: {
          client: null,
          location: 'depozit',
          warrantyCertificateUrl: null,
          warrantyCertificateGeneratedAt: null,
          clientReceiptDate: null,
        },
      })
    }

    await tx.serviceRequest.updateMany({
      where: { userId },
      data: {
        userId: null,
        firstName: '',
        lastName: '',
        email: anonEmail,
        phone: '',
        endClientName: '',
        productLocation: '',
      },
    })

    await tx.retur.updateMany({
      where: { userId },
      data: {
        firstName: '',
        lastName: '',
        street: '',
        county: '',
        city: '',
        postal: '',
        phone: '',
        email: anonEmail,
        pickupStreet: '',
        pickupCounty: '',
        pickupCity: '',
        pickupPostal: '',
        refundTitular: '',
        refundIban: '',
      },
    })

    if (partner) {
      await tx.partner.deleteMany({ where: { userId } })
    }

    await tx.user.delete({ where: { id: userId } })
  }, ORDER_ARCHIVE_TX_OPTIONS)
}

module.exports = {
  SOFT_DELETE_RETENTION_DAYS,
  DELETED_USER_LABEL,
  softDeleteUserAccount,
  findUsersReadyForHardErasure,
  eraseUserAccount,
  archiveOrphanedAccountOrders,
  archiveSoftDeletedUsersOrders,
  anonymizedEmailForUserId,
  purgePartnerPublicProfileR2,
}
