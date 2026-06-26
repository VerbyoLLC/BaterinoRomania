/**
 * Duplicate a ProductModel by modelNumber.
 * Usage: node scripts/duplicate-product-model.cjs HP1600-4S
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'client.js'))

const sourceModelNumber = String(process.argv[2] || '').trim()
if (!sourceModelNumber) {
  console.error('Usage: node scripts/duplicate-product-model.cjs <modelNumber>')
  process.exit(1)
}

function buildModelSku(brand, productType, modelNumber) {
  const brandCode = String(brand || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'MDL'
  const type = String(productType || 'ESS').toUpperCase()
  return `${brandCode}-${type}-${modelNumber}`
}

async function nextCopyModelNumber(prisma, base) {
  const candidates = [`${base}-COPY`, `${base}-copy`, `${base}-2`, `${base}-3`]
  for (const modelNumber of candidates) {
    const exists = await prisma.productModel.findUnique({ where: { modelNumber }, select: { id: true } })
    if (!exists) return modelNumber
  }
  let i = 2
  while (i < 1000) {
    const modelNumber = `${base}-${i}`
    const exists = await prisma.productModel.findUnique({ where: { modelNumber }, select: { id: true } })
    if (!exists) return modelNumber
    i += 1
  }
  throw new Error(`Could not find available model number suffix for ${base}`)
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const source = await prisma.productModel.findUnique({ where: { modelNumber: sourceModelNumber } })
  if (!source) {
    console.error(`Model not found: ${sourceModelNumber}`)
    process.exit(1)
  }

  const newModelNumber = await nextCopyModelNumber(prisma, source.modelNumber)
  const agg = await prisma.productModel.aggregate({ _max: { sortOrder: true } })
  const sortOrder = (agg._max.sortOrder ?? 0) + 1
  const productType = source.productType || 'ESS'
  const sku = buildModelSku(source.brand, productType, newModelNumber)
  const name = source.name.includes('(copy)')
    ? source.name
    : `${source.name} (copy)`

  const created = await prisma.productModel.create({
    data: {
      name,
      brand: source.brand,
      series: source.series || '',
      modelNumber: newModelNumber,
      technicalDescription: source.technicalDescription,
      usageType: source.usageType,
      productType,
      sku,
      imageUrl: source.imageUrl,
      productImageUrl: source.productImageUrl,
      availableForStock: source.availableForStock !== false,
      sortOrder,
    },
  })

  console.log(`Duplicated ${source.modelNumber} -> ${created.modelNumber} (id: ${created.id})`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
