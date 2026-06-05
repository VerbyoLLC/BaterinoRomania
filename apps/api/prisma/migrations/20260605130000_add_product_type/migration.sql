-- AlterTable: add productType column, default ESS for all existing rows
ALTER TABLE "product_models" ADD COLUMN "productType" TEXT NOT NULL DEFAULT 'ESS';
