require('dotenv').config()
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('./generated/prisma/index.js')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('DATABASE_URL (masked):', process.env.DATABASE_URL ? '***set***' : 'MISSING')
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } })
  console.log('Users count:', users.length)
  console.log(JSON.stringify(users, null, 2))
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
