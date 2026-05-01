-- CreateTable
CREATE TABLE IF NOT EXISTS "WarehouseSavedItem" (
  "id" TEXT NOT NULL,
  "warehouseStockUnitId" TEXT NOT NULL,
  "modelNumber" TEXT NOT NULL,
  "serialNumber" TEXT NOT NULL,
  "producedOn" TEXT NOT NULL DEFAULT '',
  "warehouseIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "distributor" TEXT,
  "client" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WarehouseSavedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseSavedItem_warehouseStockUnitId_key" ON "WarehouseSavedItem"("warehouseStockUnitId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseSavedItem_serialNumber_key" ON "WarehouseSavedItem"("serialNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WarehouseSavedItem_warehouseIn_idx" ON "WarehouseSavedItem"("warehouseIn");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'WarehouseSavedItem_warehouseStockUnitId_fkey'
  ) THEN
    ALTER TABLE "WarehouseSavedItem"
    ADD CONSTRAINT "WarehouseSavedItem_warehouseStockUnitId_fkey"
    FOREIGN KEY ("warehouseStockUnitId")
    REFERENCES "WarehouseStockUnit"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill: one saved row per existing warehouse unit (model number from catalog SKU).
INSERT INTO "WarehouseSavedItem" (
  "id",
  "warehouseStockUnitId",
  "modelNumber",
  "serialNumber",
  "producedOn",
  "warehouseIn",
  "distributor",
  "client",
  "createdAt",
  "updatedAt"
)
SELECT
  substr(md5(random()::text || clock_timestamp()::text || w.id), 1, 25),
  w.id,
  COALESCE(NULLIF(trim(p.sku), ''), ''),
  w."serialNumber",
  CASE
    WHEN length(regexp_replace(substring(w."serialNumber" from 4), '[^0-9]', '', 'g')) >= 10 THEN
      concat(
        substr(regexp_replace(substring(w."serialNumber" from 4), '[^0-9]', '', 'g'), 7, 2),
        '/20',
        substr(regexp_replace(substring(w."serialNumber" from 4), '[^0-9]', '', 'g'), 9, 2)
      )
    ELSE ''
  END,
  w."warehouseReceivedAt",
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "WarehouseStockUnit" w
JOIN "Product" p ON p.id = w."productId"
WHERE NOT EXISTS (
  SELECT 1 FROM "WarehouseSavedItem" s WHERE s."warehouseStockUnitId" = w.id
)
ON CONFLICT ("serialNumber") DO NOTHING;
