/**
 * Create or update a sales agent User + linked SalesAgent row. Idempotent.
 *
 * Usage (from apps/api):
 *   SALES_AGENT_EMAIL=ming@baterino.ro SALES_AGENT_PASSWORD='...' node scripts/ensure-sales-agent.js
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))
const bcrypt = require('bcryptjs')

const email = String(process.env.SALES_AGENT_EMAIL || '').trim().toLowerCase()
const password = process.env.SALES_AGENT_PASSWORD || ''

const firstName = String(process.env.SALES_AGENT_FIRST_NAME || 'Ming').trim()
const lastName = String(process.env.SALES_AGENT_LAST_NAME || 'Agent').trim()
const phone = String(process.env.SALES_AGENT_PHONE || '40770106374').replace(/\D/g, '')
const whatsapp = String(process.env.SALES_AGENT_WHATSAPP || phone).replace(/\D/g, '')
const program = String(process.env.SALES_AGENT_PROGRAM || 'L–V 9–17').trim()
const county = String(process.env.SALES_AGENT_COUNTY || 'București').trim()
const city = String(process.env.SALES_AGENT_CITY || 'București').trim()
const sector = String(process.env.SALES_AGENT_SECTOR || 'Toate').trim()

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('SALES_AGENT_EMAIL is required and must be valid.')
  process.exit(1)
}
if (!password || password.length < 6) {
  console.error('SALES_AGENT_PASSWORD is required (min. 6 characters).')
  process.exit(1)
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set (apps/api/.env).')
  process.exit(1)
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    let user = await prisma.user.findUnique({ where: { email } })

    if (user && user.role !== 'sales_agent') {
      console.error('User exists with a different role:', email, user.role)
      process.exit(1)
    }

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: 'sales_agent',
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      })
      console.log('Updated sales agent user:', email)
    } else {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'sales_agent',
          firstName,
          lastName,
          phone,
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      })
      console.log('Created sales agent user:', email)
    }

    let agent = await prisma.salesAgent.findFirst({
      where: {
        deletedAt: null,
        OR: [{ userId: user.id }, { email }],
      },
    })

    const agentData = {
      lastName,
      firstName,
      phone,
      whatsapp,
      email,
      program,
      county,
      city,
      sector,
      agentKind: 'human',
      userId: user.id,
      isSuspended: false,
    }

    if (agent) {
      agent = await prisma.salesAgent.update({
        where: { id: agent.id },
        data: agentData,
      })
      console.log('Updated SalesAgent profile:', agent.id)
    } else {
      agent = await prisma.salesAgent.create({ data: agentData })
      console.log('Created SalesAgent profile:', agent.id)
    }

    console.log('')
    console.log('Log in at /login → redirects to /sales-agent')
    console.log('  Email:   ', email)
    console.log('  Password:', password)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
