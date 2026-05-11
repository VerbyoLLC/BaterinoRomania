-- ResidentialOrder: salvăm tipul cumpărătorului + datele firmei (factură PJ)
-- buyerType: 'person' (Persoană fizică) | 'company' (Persoană juridică)
-- Pentru 'company' bill* este copia adresei companiei (sediul/punctul de facturare),
-- iar del* este adresa de livrare distinctă completată în Pasul 3.
ALTER TABLE "ResidentialOrder" ADD COLUMN "buyerType" TEXT NOT NULL DEFAULT 'person';
ALTER TABLE "ResidentialOrder" ADD COLUMN "companyName" TEXT;
ALTER TABLE "ResidentialOrder" ADD COLUMN "companyCui" TEXT;
ALTER TABLE "ResidentialOrder" ADD COLUMN "companyAddress" TEXT;
ALTER TABLE "ResidentialOrder" ADD COLUMN "companyCounty" TEXT;
ALTER TABLE "ResidentialOrder" ADD COLUMN "companyCity" TEXT;
ALTER TABLE "ResidentialOrder" ADD COLUMN "companyPostal" TEXT;
CREATE INDEX "ResidentialOrder_buyerType_idx" ON "ResidentialOrder"("buyerType");

-- GuestResidentialOrder (tabela legacy, păstrată pentru comenzile vechi)
ALTER TABLE "GuestResidentialOrder" ADD COLUMN "buyerType" TEXT NOT NULL DEFAULT 'person';
ALTER TABLE "GuestResidentialOrder" ADD COLUMN "companyName" TEXT;
ALTER TABLE "GuestResidentialOrder" ADD COLUMN "companyCui" TEXT;
ALTER TABLE "GuestResidentialOrder" ADD COLUMN "companyAddress" TEXT;
ALTER TABLE "GuestResidentialOrder" ADD COLUMN "companyCounty" TEXT;
ALTER TABLE "GuestResidentialOrder" ADD COLUMN "companyCity" TEXT;
ALTER TABLE "GuestResidentialOrder" ADD COLUMN "companyPostal" TEXT;
CREATE INDEX "GuestResidentialOrder_buyerType_idx" ON "GuestResidentialOrder"("buyerType");
