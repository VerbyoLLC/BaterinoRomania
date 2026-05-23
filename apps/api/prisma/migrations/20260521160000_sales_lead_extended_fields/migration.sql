-- AlterTable
ALTER TABLE "sales_lead" ADD COLUMN "customerType" TEXT NOT NULL DEFAULT '';
ALTER TABLE "sales_lead" ADD COLUMN "productLine" TEXT NOT NULL DEFAULT '';
ALTER TABLE "sales_lead" ADD COLUMN "monthlyVolume" TEXT NOT NULL DEFAULT '';
ALTER TABLE "sales_lead" ADD COLUMN "whatsapp" TEXT NOT NULL DEFAULT '';
ALTER TABLE "sales_lead" ADD COLUMN "message" TEXT NOT NULL DEFAULT '';
ALTER TABLE "sales_lead" ADD COLUMN "companyName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "sales_lead" ADD COLUMN "workEmail" TEXT NOT NULL DEFAULT '';
ALTER TABLE "sales_lead" ADD COLUMN "jobTitle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "sales_lead" ADD COLUMN "country" TEXT NOT NULL DEFAULT '';
ALTER TABLE "sales_lead" ADD COLUMN "website" TEXT NOT NULL DEFAULT '';
