-- AlterTable
ALTER TABLE "Product" ADD COLUMN "subtitle" TEXT;
ALTER TABLE "Product" ADD COLUMN "overview" TEXT;
ALTER TABLE "Product" ADD COLUMN "keyAdvantages" JSONB NOT NULL DEFAULT '[]';
