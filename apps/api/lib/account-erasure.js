/**
 * Account deletion: soft-delete (grace period) then hard GDPR erasure via cron.
 * Orders are anonymized, not deleted (fiscal retention).
 */
const { isR2Configured, urlToKey, deleteFromR2 } = require('./r2.js')

const ANONYMIZED_EMAIL_DOMAIN = 'accounts.erased.baterino.local'
const DELETED_USER_LABEL = '[deleted user]'
const SOFT_DELETE_RETENTION_DAYS = 30

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
 * Marks account for deletion; blocks login via deletedAt. Data kept until cron hard-erases.
 * @param {import('../generated/prisma').PrismaClient} prisma
 * @param {string} userId
 */
async function softDeleteUserAccount(prisma, userId) {
  await prisma.user.update({
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

async function anonymizeUserOrders(tx, userId, userEmail) {
  const orClauses = [{ userId }]
  const emailNorm = String(userEmail || '').trim().toLowerCase()
  if (emailNorm) orClauses.push({ email: emailNorm })

  await tx.residentialOrder.updateMany({
    where: { OR: orClauses },
    data: {
      userId: null,
      email: DELETED_USER_LABEL,
      phone: '',
      firstName: DELETED_USER_LABEL,
      lastName: '',
      billAddress: '',
      billCounty: '',
      billCity: '',
      billPostal: '',
      deliveryDifferent: false,
      delAddress: null,
      delCounty: null,
      delCity: null,
      delPostal: null,
      companyName: null,
      companyCui: null,
      companyAddress: null,
      companyCounty: null,
      companyCity: null,
      companyPostal: null,
    },
  })
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
    select: { logoUrl: true, workPhotos: true },
  })

  const savedItems = await prisma.warehouseSavedItem.findMany({
    where: { client: userId },
    select: { id: true, warrantyCertificateUrl: true },
  })

  if (partner) await purgePartnerPublicProfileR2(partner)
  for (const item of savedItems) {
    await purgeWarrantyCertificateR2(item)
  }

  const anonEmail = anonymizedEmailForUserId(userId)

  await prisma.$transaction(async (tx) => {
    await anonymizeUserOrders(tx, userId, user.email)

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
  })
}

module.exports = {
  SOFT_DELETE_RETENTION_DAYS,
  DELETED_USER_LABEL,
  softDeleteUserAccount,
  findUsersReadyForHardErasure,
  eraseUserAccount,
  anonymizedEmailForUserId,
  purgePartnerPublicProfileR2,
}
