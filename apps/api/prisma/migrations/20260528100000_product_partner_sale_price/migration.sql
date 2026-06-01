-- AlterTable
ALTER TABLE "Product" ADD COLUMN "partnerSalePrice" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Existing catalog: copy client sale price as initial partner price until set in admin
UPDATE "Product" SET "partnerSalePrice" = "salePrice" WHERE "partnerSalePrice" = 0 AND "salePrice" > 0;
