-- CreateTable
CREATE TABLE "retur" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "submitSource" TEXT NOT NULL DEFAULT 'guest',
    "lastName" TEXT NOT NULL DEFAULT '',
    "firstName" TEXT NOT NULL DEFAULT '',
    "street" TEXT NOT NULL DEFAULT '',
    "county" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "postal" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "orderNumber" TEXT NOT NULL,
    "receiptDate" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "productBrand" TEXT NOT NULL,
    "productModel" TEXT NOT NULL,
    "returnReason" TEXT NOT NULL,
    "returnReasonOther" TEXT NOT NULL DEFAULT '',
    "condUninstalled" BOOLEAN NOT NULL,
    "condSeals" BOOLEAN NOT NULL,
    "condPackaging" BOOLEAN NOT NULL,
    "pickupStreet" TEXT NOT NULL DEFAULT '',
    "pickupCounty" TEXT NOT NULL DEFAULT '',
    "pickupCity" TEXT NOT NULL DEFAULT '',
    "pickupPostal" TEXT NOT NULL DEFAULT '',
    "refundTitular" TEXT NOT NULL DEFAULT '',
    "refundIban" TEXT NOT NULL DEFAULT '',
    "policyAccepted" BOOLEAN NOT NULL,
    "declarationAccepted" BOOLEAN NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ro',
    "conditionPhotoUrls" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "retur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "retur_userId_idx" ON "retur"("userId");
CREATE INDEX "retur_orderNumber_idx" ON "retur"("orderNumber");
CREATE INDEX "retur_createdAt_idx" ON "retur"("createdAt");
CREATE INDEX "retur_email_idx" ON "retur"("email");

-- AddForeignKey
ALTER TABLE "retur" ADD CONSTRAINT "retur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
