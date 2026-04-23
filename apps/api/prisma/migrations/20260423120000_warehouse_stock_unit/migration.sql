-- Unități depozit: SN + produs catalog, dată intrare automată
CREATE TABLE "WarehouseStockUnit" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "warehouseReceivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryMethod" TEXT NOT NULL,
    "rawQrPayload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WarehouseStockUnit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WarehouseStockUnit_serialNumber_key" ON "WarehouseStockUnit"("serialNumber");

CREATE INDEX "WarehouseStockUnit_productId_idx" ON "WarehouseStockUnit"("productId");

CREATE INDEX "WarehouseStockUnit_warehouseReceivedAt_idx" ON "WarehouseStockUnit"("warehouseReceivedAt");

ALTER TABLE "WarehouseStockUnit" ADD CONSTRAINT "WarehouseStockUnit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
