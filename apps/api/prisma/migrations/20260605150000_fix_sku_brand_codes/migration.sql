-- Recompute SKU using brand codes: Lithtech → LTC
UPDATE "product_models"
SET "sku" = CASE
  WHEN LOWER(brand) = 'lithtech' THEN 'LTC' || '-' || "productType" || '-' || "modelNumber"
  ELSE brand || '-' || "productType" || '-' || "modelNumber"
END;
