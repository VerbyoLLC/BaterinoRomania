-- Sediu social — adresă structurată (legal)
ALTER TABLE "Partner" ADD COLUMN "companyStreet" TEXT;
ALTER TABLE "Partner" ADD COLUMN "companyCity" TEXT;
ALTER TABLE "Partner" ADD COLUMN "companyCounty" TEXT;
ALTER TABLE "Partner" ADD COLUMN "companyPostalCode" TEXT;
