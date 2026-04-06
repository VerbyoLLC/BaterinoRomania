-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "billAddress" TEXT NOT NULL DEFAULT '',
    "billCounty" TEXT NOT NULL DEFAULT '',
    "billCity" TEXT NOT NULL DEFAULT '',
    "billPostal" TEXT NOT NULL DEFAULT '',
    "deliveryDifferent" BOOLEAN NOT NULL DEFAULT false,
    "delAddress" TEXT,
    "delCounty" TEXT,
    "delCity" TEXT,
    "delPostal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidentialOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "orderSource" TEXT NOT NULL DEFAULT 'guest',
    "userId" TEXT,
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
    "currency" TEXT NOT NULL DEFAULT 'RON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResidentialOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidentialOrderLine" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productSlug" TEXT,
    "productTitle" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceInclVat" DECIMAL(14,2),
    "lineTotalInclVat" DECIMAL(14,2),
    "vatPercent" DECIMAL(5,2),

    CONSTRAINT "ResidentialOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResidentialOrder_orderNumber_key" ON "ResidentialOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "ResidentialOrder_email_idx" ON "ResidentialOrder"("email");

-- CreateIndex
CREATE INDEX "ResidentialOrder_userId_idx" ON "ResidentialOrder"("userId");

-- CreateIndex
CREATE INDEX "ResidentialOrder_orderSource_idx" ON "ResidentialOrder"("orderSource");

-- CreateIndex
CREATE INDEX "ResidentialOrder_createdAt_idx" ON "ResidentialOrder"("createdAt");

-- CreateIndex
CREATE INDEX "ResidentialOrderLine_orderId_idx" ON "ResidentialOrderLine"("orderId");

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialOrder" ADD CONSTRAINT "ResidentialOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialOrderLine" ADD CONSTRAINT "ResidentialOrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ResidentialOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
