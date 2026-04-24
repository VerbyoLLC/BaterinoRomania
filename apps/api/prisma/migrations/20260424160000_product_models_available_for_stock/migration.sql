-- Stock visibility for Stocuri → Add Item dropdown (Modele table)
ALTER TABLE "product_models"
ADD COLUMN IF NOT EXISTS "availableForStock" BOOLEAN NOT NULL DEFAULT true;
