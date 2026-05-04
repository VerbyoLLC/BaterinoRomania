ALTER TABLE "ResidentialOrder" ADD COLUMN IF NOT EXISTS "proformaUrl" TEXT;
ALTER TABLE "GuestResidentialOrder" ADD COLUMN IF NOT EXISTS "proformaUrl" TEXT;
