-- Date companie (facturare PJ) pe profilul client B2C
ALTER TABLE "ClientProfile" ADD COLUMN "companyName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ClientProfile" ADD COLUMN "companyCui" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ClientProfile" ADD COLUMN "companyAddress" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ClientProfile" ADD COLUMN "companyCounty" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ClientProfile" ADD COLUMN "companyCity" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ClientProfile" ADD COLUMN "companyPostal" TEXT NOT NULL DEFAULT '';
