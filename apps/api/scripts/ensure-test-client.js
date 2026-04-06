/**
 * Dev / staging: ensure one client account exists for manual testing before the
 * full registration flow is shipped. Idempotent (safe to run many times).
 *
 * Usage (from apps/api):
 *   node scripts/ensure-test-client.js
 *   TEST_CLIENT_EMAIL=a@b.ro TEST_CLIENT_PASSWORD='YourLongPass1' node scripts/ensure-test-client.js
 *
 * Defaults are for local use only — use env vars in shared environments.
 */
require('dotenv').config()
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('../generated/prisma')
const bcrypt = require('bcryptjs')

const email = String(process.env.TEST_CLIENT_EMAIL || 'client-test@baterino.local').trim().toLowerCase()
const password = process.env.TEST_CLIENT_PASSWORD || 'BaterinoTestClient1!'

if (password.length < 8) {
  console.error('Password must be at least 8 characters.')
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
    if (existing && existing.role !== 'client') {
      console.error('User exists with a different role:', email, existing.role)
      process.exit(1)
    }

    let userId
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: hashedPassword,
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      })
      userId = existing.id
      console.log('Updated test client (password reset, email verified):', email)
    } else {
      const created = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'client',
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      })
      userId = created.id
      console.log('Created test client:', email)
    }

    try {
      await prisma.clientProfile.upsert({
        where: { userId },
        create: { userId },
        update: {},
      })
      console.log('ClientProfile OK for:', email)
    } catch (e) {
      if (e?.code === 'P2021') {
        console.warn(
          'ClientProfile table missing — run: npx prisma migrate deploy (from apps/api). Login still works; settings profile saves after migrate.',
        )
      } else {
        throw e
      }
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
