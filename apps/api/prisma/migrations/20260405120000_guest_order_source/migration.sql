-- AlterTable
ALTER TABLE "GuestResidentialOrder" ADD COLUMN "orderSource" TEXT NOT NULL DEFAULT 'guest';

-- CreateIndex
CREATE INDEX "GuestResidentialOrder_orderSource_idx" ON "GuestResidentialOrder"("orderSource");
