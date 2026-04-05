-- CreateTable
CREATE TABLE "GuestResidentialOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "billAddress" TEXT NOT NULL,
    "billCounty" TEXT NOT NULL,
    "billCity" TEXT NOT NULL,
    "billPostal" TEXT NOT NULL,
    "deliveryDifferent" BOOLEAN NOT NULL DEFAULT false,
    "delAddress" TEXT,
    "delCounty" TEXT,
    "delCity" TEXT,
    "delPostal" TEXT,
    "productId" TEXT NOT NULL,
    "productSlug" TEXT,
    "productTitle" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RON',
    "unitPriceInclVat" DECIMAL(14,2),
    "lineTotalInclVat" DECIMAL(14,2),
    "vatPercent" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestResidentialOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestResidentialOrder_orderNumber_key" ON "GuestResidentialOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "GuestResidentialOrder_email_idx" ON "GuestResidentialOrder"("email");

-- CreateIndex
CREATE INDEX "GuestResidentialOrder_createdAt_idx" ON "GuestResidentialOrder"("createdAt");
