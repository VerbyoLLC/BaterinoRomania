-- Optional display fields for account details (admin + other roles).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT NOT NULL DEFAULT '';
