/**
 * Dev / staging: ensure admin@baterino.ro exists (or update password). Idempotent.
 *
 * Usage (from apps/api):
 *   npm run test-admin
 *   TEST_ADMIN_EMAIL=you@x.ro TEST_ADMIN_PASSWORD='Secret1' node scripts/ensure-test-admin.js
 *
 * Defaults are for local use only — use env vars in shared environments.
 */
require('dotenv').config()
const path = require('path')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require(path.join(__dirname, '..', 'generated', 'prisma', 'index.js'))
const bcrypt = require('bcryptjs')

const email = String(process.env.TEST_ADMIN_EMAIL || 'admin@baterino.ro').trim().toLowerCase()
const password = process.env.TEST_ADMIN_PASSWORD || '123123'

if (password.length < 6) {
  console.error('Password must be at least 6 characters.')
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
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing && existing.role !== 'admin') {
      console.error('User exists with a different role:', email, existing.role)
      process.exit(1)
    }

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { password: hashedPassword },
      })
      console.log('Updated admin password:', email)
    } else {
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'admin',
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      })
      console.log('Created admin user:', email)
    }

    console.log('')
    console.log('Log in with:')
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
