-- Add sku column to product_models
ALTER TABLE "product_models" ADD COLUMN "sku" TEXT NOT NULL DEFAULT '';

-- Populate existing rows: Brand-Type-ModelNumber
UPDATE "product_models"
SET "sku" = brand || '-' || "productType" || '-' || "modelNumber";
