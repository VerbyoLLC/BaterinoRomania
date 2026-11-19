-- CreateTable
CREATE TABLE "WarehouseItemEvent" (
    "id" TEXT NOT NULL,
    "warehouseSavedItemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "name" TEXT,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarehouseItemEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WarehouseItemEvent_warehouseSavedItemId_createdAt_idx" ON "WarehouseItemEvent"("warehouseSavedItemId", "createdAt");

-- AddForeignKey
ALTER TABLE "WarehouseItemEvent" ADD CONSTRAINT "WarehouseItemEvent_warehouseSavedItemId_fkey" FOREIGN KEY ("warehouseSavedItemId") REFERENCES "WarehouseSavedItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill history from the dates already stored on each unit
INSERT INTO "WarehouseItemEvent" ("id", "warehouseSavedItemId", "type", "location", "createdAt")
SELECT gen_random_uuid()::text, "id", 'warehouse_in', 'depozit', "warehouseIn"
FROM "WarehouseSavedItem";

INSERT INTO "WarehouseItemEvent" ("id", "warehouseSavedItemId", "type", "location", "name", "createdAt")
SELECT gen_random_uuid()::text, "id", 'moved', "location"::text,
       CASE WHEN "location"::text = 'distribuitor' THEN "distributor" ELSE "clientName" END,
       "warehouseOut"
FROM "WarehouseSavedItem"
WHERE "warehouseOut" IS NOT NULL;

INSERT INTO "WarehouseItemEvent" ("id", "warehouseSavedItemId", "type", "createdAt")
SELECT gen_random_uuid()::text, "id", 'warranty_generated', "warrantyCertificateGeneratedAt"
FROM "WarehouseSavedItem"
WHERE "warrantyCertificateGeneratedAt" IS NOT NULL;
