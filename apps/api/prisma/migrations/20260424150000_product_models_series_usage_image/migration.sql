-- Extend product_models with admin-editable series, usage type and image
ALTER TABLE "product_models"
ADD COLUMN IF NOT EXISTS "series" TEXT NOT NULL DEFAULT '';

ALTER TABLE "product_models"
ADD COLUMN IF NOT EXISTS "usageType" TEXT NOT NULL DEFAULT 'industrial';

ALTER TABLE "product_models"
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'product_models_usageType_check'
  ) THEN
    ALTER TABLE "product_models"
    ADD CONSTRAINT "product_models_usageType_check"
    CHECK ("usageType" IN ('industrial', 'residential'));
  END IF;
END $$;
