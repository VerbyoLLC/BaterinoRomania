-- AlterTable
ALTER TABLE "Product" ADD COLUMN "priceVisibility" TEXT NOT NULL DEFAULT 'public';
ALTER TABLE "Product" ADD COLUMN "pricePresentation" TEXT NOT NULL DEFAULT 'simple';
