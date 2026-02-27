require('dotenv').config()
const bcrypt = require('bcryptjs')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('./generated/prisma/index.js')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const ADMIN_EMAIL = 'alexander@baterino.ro'
const DEFAULT_PASSWORD = 'BaterinoAdmin2024!'

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (existing) {
    console.log('Admin user already exists:', existing.email, '(role:', existing.role + ')')
    await prisma.$disconnect()
    return
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  const user = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    },
  })
  console.log('Admin user created:', user.email)
  console.log('Temporary password:', DEFAULT_PASSWORD)
  console.log('Change this password after first login.')

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
