/**
 * Copy LT261-L technicalSpecsModels from multi-model BESS cabinet
 * to single-model bess-cabinet-261-kwh-racire-lichida.
 *
 * Run: node scripts/copy-lt261-specs-to-racire-lichida.cjs
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))

const SOURCE_SLUG = 'bess-cabinet-baterii-lifepo4-215-kwh-261-kwh'
const TARGET_SLUG = 'bess-cabinet-261-kwh-racire-lichida'
const MODEL_NAME = 'LT261-L'

function findLt261Entry(technicalSpecsModels) {
  const entries = Array.isArray(technicalSpecsModels?.entries) ? technicalSpecsModels.entries : []
  return entries.find((e) => String(e?.modelName ?? '').trim() === MODEL_NAME)
}

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

  const source = await prisma.product.findFirst({
    where: { slug: SOURCE_SLUG },
    select: { id: true, title: true, slug: true, brand: true, technicalSpecsModels: true },
  })
  if (!source) {
    console.error(`Source product not found: ${SOURCE_SLUG}`)
    process.exit(1)
  }

  const lt261 = findLt261Entry(source.technicalSpecsModels)
  if (!lt261?.specs || typeof lt261.specs !== 'object') {
    console.error(`No ${MODEL_NAME} entry on source product. Run populate:bess-cabinet-215-261 first.`)
    process.exit(1)
  }

  const target = await prisma.product.findFirst({
    where: { slug: TARGET_SLUG },
    select: { id: true, title: true, slug: true, brand: true, technicalSpecsModels: true },
  })
  if (!target) {
    console.error(`Target product not found: ${TARGET_SLUG}`)
    process.exit(1)
  }

  const payload = {
    entries: [
      {
        modelName: MODEL_NAME,
        specs: { ...lt261.specs },
      },
    ],
  }

  await prisma.product.update({
    where: { id: target.id },
    data: { technicalSpecsModels: payload },
  })
  console.log(`Updated technicalSpecsModels on ${target.slug} (${target.title}) — 1 model (${MODEL_NAME}).`)

  await prisma.$disconnect()
  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
