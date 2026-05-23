-- CreateTable
CREATE TABLE "admin_commercial_offer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buyerType" TEXT NOT NULL,
    "clientLabel" TEXT NOT NULL,
    "amountGross" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "productCount" INTEGER NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "createdByUserId" TEXT,

    CONSTRAINT "admin_commercial_offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_commercial_offer_createdAt_idx" ON "admin_commercial_offer"("createdAt");

-- CreateIndex
CREATE INDEX "admin_commercial_offer_buyerType_idx" ON "admin_commercial_offer"("buyerType");

-- AddForeignKey
ALTER TABLE "admin_commercial_offer" ADD CONSTRAINT "admin_commercial_offer_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
