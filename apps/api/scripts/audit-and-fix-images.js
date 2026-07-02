/**
 * Audit product image URLs in Prisma and optionally consolidate mismatched R2 folders.
 *
 * Usage:
 *   node scripts/audit-and-fix-images.js              # read-only audit (HEAD each URL)
 *   node scripts/audit-and-fix-images.js --migrate     # dry-run: show planned R2 copies + DB updates
 *   node scripts/audit-and-fix-images.js --migrate --execute   # copy in R2 + update product rows
 *
 * Env: DATABASE_URL, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *      R2_PUBLIC_URL (default https://media.baterino.ro),
 *      R2_ENDPOINT or R2_ACCOUNT_ID (for S3 API endpoint).
 *
 * Old R2 objects are never deleted — indexed URLs keep resolving during transition.
 */
require('dotenv/config')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('../generated/prisma')
const {
  S3Client,
  CopyObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3')
const { urlToKey, r2ObjectExists } = require('../lib/r2.js')

const PUBLIC_BASE = (process.env.R2_PUBLIC_URL || 'https://media.baterino.ro').replace(/\/$/, '')

// Old folder prefix (under products/) → canonical folder prefix.
// Add pairs here when the audit surfaces duplicate folders for one product.
const MIGRATIONS = {
  'products/EcoHome5Kwh': 'products/EcoHome5-5kWh',
  'products/BESS-Cabinet-Baterii-LiFePo4-204kWh-241-kWh':
    'products/BESS-Cabinet-204kWh-Racire-prin-Ventilatie',
}

const args = new Set(process.argv.slice(2))
const doMigrate = args.has('--migrate')
const doExecute = args.has('--execute')

function parseImagesField(raw) {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean)
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t) return []
    try {
      const p = JSON.parse(t)
      return Array.isArray(p) ? p.map((x) => String(x).trim()).filter(Boolean) : []
    } catch {
      return []
    }
  }
  return []
}

function isR2MediaUrl(url) {
  return typeof url === 'string' && url.startsWith(`${PUBLIC_BASE}/`)
}

function urlFolderPrefix(key) {
  if (!key || !key.includes('/')) return key
  const parts = key.split('/')
  parts.pop()
  return parts.join('/')
}

function migrateUrl(url) {
  if (!isR2MediaUrl(url)) return { url, changed: false }
  const key = urlToKey(url)
  if (!key) return { url, changed: false }
  for (const [fromPrefix, toPrefix] of Object.entries(MIGRATIONS)) {
    if (key === fromPrefix || key.startsWith(`${fromPrefix}/`)) {
      const filename = key.slice(fromPrefix.length).replace(/^\//, '')
      const newKey = filename ? `${toPrefix}/${filename}` : toPrefix
      return { url: `${PUBLIC_BASE}/${newKey}`, changed: true, oldKey: key, newKey }
    }
  }
  return { url, changed: false, key }
}

async function headUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return { url, status: res.status, ok: res.ok }
  } catch (err) {
    return { url, status: 0, ok: false, error: err?.message || String(err) }
  }
}

function getR2Endpoint() {
  if (process.env.R2_ENDPOINT) return process.env.R2_ENDPOINT
  const accountId = process.env.R2_ACCOUNT_ID
  if (!accountId) return null
  const region = process.env.R2_REGION || 'auto'
  if (region === 'auto' || region === 'eu') {
    return `https://${accountId}.eu.r2.cloudflarestorage.com`
  }
  return `https://${accountId}.r2.cloudflarestorage.com`
}

function getS3Client() {
  const endpoint = getR2Endpoint()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials missing. Set R2_ENDPOINT (or R2_ACCOUNT_ID), R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.')
  }
  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  })
}

async function copyR2Object(client, bucket, sourceKey, destKey) {
  const exists = await r2ObjectExists(destKey)
  if (exists) {
    return { destKey, skipped: true, reason: 'target already exists' }
  }
  const sourceExists = await r2ObjectExists(sourceKey)
  if (!sourceExists) {
    return { destKey, skipped: true, reason: 'source missing' }
  }
  await client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${sourceKey}`,
      Key: destKey,
    })
  )
  return { destKey, skipped: false }
}

/** @returns {Map<string, { productId: string, field: 'cardImage' | 'images', index?: number, url: string }[]>} */
function collectImageRefs(products) {
  /** @type {Map<string, { productId: string, field: string, index?: number, url: string }[]>} */
  const byUrl = new Map()

  const add = (productId, field, url, index) => {
    const u = String(url || '').trim()
    if (!u || !isR2MediaUrl(u)) return
    if (!byUrl.has(u)) byUrl.set(u, [])
    byUrl.get(u).push({ productId, field, index, url: u })
  }

  for (const p of products) {
    add(p.id, 'cardImage', p.cardImage)
    const imgs = parseImagesField(p.images)
    imgs.forEach((url, index) => add(p.id, 'images', url, index))
  }

  return byUrl
}

async function auditUrls(urls) {
  const unique = [...urls].sort()
  console.log(`\nAuditing ${unique.length} unique R2 image URL(s) against ${PUBLIC_BASE}…\n`)

  const results = []
  for (const url of unique) {
    const r = await headUrl(url)
    results.push(r)
    const mark = r.ok ? 'OK' : 'FAIL'
    console.log(`  [${mark}] ${r.status || 'ERR'}  ${url}${r.error ? ` (${r.error})` : ''}`)
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\nSummary: ${results.length - failed.length} OK, ${failed.length} non-200.`)

  const folders = new Set()
  for (const url of unique) {
    const key = urlToKey(url)
    if (key) folders.add(urlFolderPrefix(key))
  }
  console.log(`\nDistinct R2 folder prefixes (${folders.size}):`)
  ;[...folders].sort().forEach((f) => console.log(`  ${f}`))

  return { results, failed }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required.')
    process.exit(1)
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const products = await prisma.product.findMany({
      select: { id: true, title: true, slug: true, cardImage: true, images: true },
      orderBy: { title: 'asc' },
    })

    const byUrl = collectImageRefs(products)
    const urls = [...byUrl.keys()]

    if (urls.length === 0) {
      console.log('No media.baterino.ro image URLs found on products.')
      return
    }

    const { failed } = await auditUrls(urls)

    if (!doMigrate) {
      if (failed.length === 0) {
        console.log('\nAll URLs return 200. Folder names may be untidy but nothing is broken.')
        console.log('Re-run with --migrate for a dry-run consolidation plan, or stop here.')
      } else {
        console.log('\nFix 404s first (or add MIGRATIONS entries), then re-run with --migrate.')
      }
      return
    }

    console.log('\n── Migration plan (dry-run unless --execute) ──\n')

    /** @type {Array<{ productId: string, field: string, index?: number, from: string, to: string, oldKey: string, newKey: string }>} */
    const plannedDbUpdates = []
    /** @type {Map<string, { oldKey: string, newKey: string }>} */
    const plannedCopies = new Map()

    for (const p of products) {
      const card = String(p.cardImage || '').trim()
      if (card && isR2MediaUrl(card)) {
        const m = migrateUrl(card)
        if (m.changed) {
          plannedDbUpdates.push({
            productId: p.id,
            field: 'cardImage',
            from: card,
            to: m.url,
            oldKey: m.oldKey,
            newKey: m.newKey,
          })
          plannedCopies.set(m.oldKey, { oldKey: m.oldKey, newKey: m.newKey })
        }
      }

      const imgs = parseImagesField(p.images)
      imgs.forEach((url, index) => {
        if (!isR2MediaUrl(url)) return
        const m = migrateUrl(url)
        if (m.changed) {
          plannedDbUpdates.push({
            productId: p.id,
            field: 'images',
            index,
            from: url,
            to: m.url,
            oldKey: m.oldKey,
            newKey: m.newKey,
          })
          plannedCopies.set(m.oldKey, { oldKey: m.oldKey, newKey: m.newKey })
        }
      })
    }

    if (plannedCopies.size === 0) {
      console.log('No URLs match MIGRATIONS — nothing to consolidate.')
      return
    }

    for (const { oldKey, newKey } of plannedCopies.values()) {
      console.log(`  COPY  ${oldKey}\n     →  ${newKey}`)
    }
    console.log(`\n${plannedCopies.size} R2 object(s) to copy, ${plannedDbUpdates.length} product field reference(s) to update.`)

    if (!doExecute) {
      console.log('\nDry run only. Pass --migrate --execute to apply.')
      return
    }

    const bucket = process.env.R2_BUCKET
    if (!bucket) throw new Error('R2_BUCKET is required for --execute')

    const client = getS3Client()
    let copied = 0
    let copySkipped = 0

    for (const { oldKey, newKey } of plannedCopies.values()) {
      const result = await copyR2Object(client, bucket, oldKey, newKey)
      if (result.skipped) {
        copySkipped++
        console.log(`  SKIP copy ${oldKey} → ${newKey} (${result.reason})`)
      } else {
        copied++
        console.log(`  COPIED ${oldKey} → ${newKey}`)
      }
    }

    const updatesByProduct = new Map()
    for (const row of plannedDbUpdates) {
      if (!updatesByProduct.has(row.productId)) {
        const product = products.find((p) => p.id === row.productId)
        updatesByProduct.set(row.productId, {
          product,
          cardImage: String(product?.cardImage || '').trim(),
          images: [...parseImagesField(product?.images)],
        })
      }
      const state = updatesByProduct.get(row.productId)
      if (row.field === 'cardImage') {
        state.cardImage = row.to
      } else if (row.field === 'images' && row.index != null) {
        state.images[row.index] = row.to
      }
    }

    let dbUpdated = 0
    for (const [productId, state] of updatesByProduct) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          cardImage: state.cardImage || null,
          images: state.images,
        },
      })
      dbUpdated++
      console.log(`  DB updated product ${state.product?.slug || productId}`)
    }

    console.log(`\nDone: ${copied} copied, ${copySkipped} copy skipped, ${dbUpdated} product row(s) updated.`)
    console.log('Old R2 objects were NOT deleted.\nRe-run audit to confirm zero non-200s:')
    console.log('  node scripts/audit-and-fix-images.js\n')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
