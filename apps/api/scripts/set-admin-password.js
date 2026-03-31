/**
 * One-off: set password for a user by email (bcrypt rounds = 10, same as index.js).
 * Usage:
 *   ADMIN_NEW_PASSWORD='yourSecret' node scripts/set-admin-password.js AdminTest
 * Or:
 *   node scripts/set-admin-password.js AdminTest 'yourSecret'
 * If the user does not exist, add --create to create an admin user (role: admin).
 */
require('dotenv').config()
const path = require('path')
const bcrypt = require('bcryptjs')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))

const args = process.argv.slice(2).filter((a) => a !== '--create')
const createIfMissing = process.argv.includes('--create')
const email = String(args[0] || '').trim().toLowerCase()
const password = process.env.ADMIN_NEW_PASSWORD || args[1]

if (!email || !password) {
  console.error('Usage: ADMIN_NEW_PASSWORD=... node scripts/set-admin-password.js <email> [--create]')
  console.error('   or: node scripts/set-admin-password.js <email> <password> [--create]')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set (check apps/api/.env).')
  process.exit(1)
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })
  try {
    let user = await prisma.user.findUnique({ where: { email } })
    const hashedPassword = await bcrypt.hash(password, 10)
    if (!user) {
      if (!createIfMissing) {
        console.error('No user found with email:', email)
        console.error('Use --create to create an admin user with this email and password.')
        process.exit(1)
      }
      user = await prisma.user.create({
        data: { email, password: hashedPassword, role: 'admin' },
      })
      console.log('Admin user created:', email)
      return
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })
    console.log('Password updated for:', email, '(role:', user.role + ')')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
