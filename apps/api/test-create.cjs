require('dotenv').config()
const bcrypt = require('bcryptjs')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('./generated/prisma/index.js')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'direct-test@test.com'
  const hashedPassword = await bcrypt.hash('password123', 10)

  console.log('Creating user...')
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role: 'partener' },
  })
  console.log('Created:', user.id, user.email)

  const all = await prisma.user.findMany()
  console.log('Total users:', all.length)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
