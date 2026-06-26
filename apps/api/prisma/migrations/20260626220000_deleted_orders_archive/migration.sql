-- Arhivă comenzi conturi șterse. Comanda este mutată aici (cu datele complete, pentru
-- păstrare fiscală) și ștearsă din "ResidentialOrder", ca să nu poată fi re-asociată unui
-- cont nou creat cu același email.

-- CreateTable
CREATE TABLE "DeletedOrder" (
    "id" TEXT NOT NULL,
    "originalOrderId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "orderSource" TEXT NOT NULL DEFAULT 'guest',
    "originalUserId" TEXT,
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
    "buyerType" TEXT NOT NULL DEFAULT 'person',
    "companyName" TEXT,
    "companyCui" TEXT,
    "companyAddress" TEXT,
    "companyCounty" TEXT,
    "companyCity" TEXT,
    "companyPostal" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'RON',
    "fulfillmentStatus" TEXT NOT NULL DEFAULT 'de_platit',
    "clientInvoiceUrl" TEXT,
    "proformaUrl" TEXT,
    "orderCreatedAt" TIMESTAMP(3) NOT NULL,
    "deletionReason" TEXT NOT NULL DEFAULT 'account_deleted',
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletedOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletedOrderLine" (
    "id" TEXT NOT NULL,
    "deletedOrderId" TEXT NOT NULL,
    "originalLineId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productSlug" TEXT,
    "productTitle" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceInclVat" DECIMAL(14,2),
    "lineTotalInclVat" DECIMAL(14,2),
    "listUnitPriceInclVat" DECIMAL(14,2),
    "listLineTotalInclVat" DECIMAL(14,2),
    "vatPercent" DECIMAL(5,2),

    CONSTRAINT "DeletedOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeletedOrder_orderNumber_key" ON "DeletedOrder"("orderNumber");
CREATE INDEX "DeletedOrder_originalUserId_idx" ON "DeletedOrder"("originalUserId");
CREATE INDEX "DeletedOrder_email_idx" ON "DeletedOrder"("email");
CREATE INDEX "DeletedOrder_orderSource_idx" ON "DeletedOrder"("orderSource");
CREATE INDEX "DeletedOrder_archivedAt_idx" ON "DeletedOrder"("archivedAt");

-- CreateIndex
CREATE INDEX "DeletedOrderLine_deletedOrderId_idx" ON "DeletedOrderLine"("deletedOrderId");

-- AddForeignKey
ALTER TABLE "DeletedOrderLine" ADD CONSTRAINT "DeletedOrderLine_deletedOrderId_fkey" FOREIGN KEY ("deletedOrderId") REFERENCES "DeletedOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
