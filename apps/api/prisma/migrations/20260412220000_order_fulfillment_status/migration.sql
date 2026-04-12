-- Fulfillment pipeline for residential checkout orders (admin + client UI).

ALTER TABLE "ResidentialOrder" ADD COLUMN "fulfillmentStatus" TEXT NOT NULL DEFAULT 'de_platit';
ALTER TABLE "GuestResidentialOrder" ADD COLUMN "fulfillmentStatus" TEXT NOT NULL DEFAULT 'de_platit';

CREATE INDEX "ResidentialOrder_fulfillmentStatus_idx" ON "ResidentialOrder"("fulfillmentStatus");
CREATE INDEX "GuestResidentialOrder_fulfillmentStatus_idx" ON "GuestResidentialOrder"("fulfillmentStatus");
