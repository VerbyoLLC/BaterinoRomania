-- Update product SKUs: where product.sku = model.modelNumber, replace with model.sku (Brand code-Type-Model)
UPDATE "Product"
SET sku = pm.sku
FROM "product_models" pm
WHERE "Product".sku = pm."modelNumber"
  AND pm.sku <> ''
  AND pm.sku <> pm."modelNumber";
