-- CreateEnum
CREATE TYPE "WarehouseSavedItemLocation" AS ENUM ('depozit', 'distribuitor', 'client_final', 'service');

-- AlterTable
ALTER TABLE "WarehouseSavedItem" ADD COLUMN "location" "WarehouseSavedItemLocation" NOT NULL DEFAULT 'depozit';

-- CreateIndex
CREATE INDEX "WarehouseSavedItem_location_idx" ON "WarehouseSavedItem"("location");
