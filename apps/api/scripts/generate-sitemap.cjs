/**
 * Optional local snapshot of the dynamic sitemap (production is served from Railway).
 * Run: node scripts/generate-sitemap.cjs [output-path]
 *
 * Do NOT write to apps/web/public/ — Vercel would serve that static file instead of
 * the live rewrite to https://baterino.ro/sitemap.xml.
 */
require('dotenv/config')
const fs = require('fs')
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('../generated/prisma')
const { buildSitemapXml } = require('../routes/sitemap.route.js')

const defaultOut = path.join(__dirname, '../tmp/sitemap.xml')

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required.')
    process.exit(1)
  }

  const outPath = path.resolve(process.argv[2] || defaultOut)
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const xml = await buildSitemapXml(prisma)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, xml, 'utf8')
    const urlCount = (xml.match(/<url>/g) || []).length
    console.log(`Wrote ${outPath}`)
    console.log(`URLs: ${urlCount} (${xml.length} bytes)`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
