-- Residential catalog: badge on product card image (in_stock | out_of_stock | coming_soon)
ALTER TABLE "Product" ADD COLUMN "catalogStockStatus" TEXT;
