-- Status ofertă: ciornă (draft) sau generată (generated)
ALTER TABLE "admin_commercial_offer" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'generated';
ALTER TABLE "admin_commercial_offer" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "admin_commercial_offer_status_idx" ON "admin_commercial_offer"("status");
