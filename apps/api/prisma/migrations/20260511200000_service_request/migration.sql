-- Cereri de service trimise de clienți (și parteneri în viitor) pentru un produs înregistrat.
-- requestNumber este BTROS-YYYYMMDD-NNNN, calculat în backend la creare.

CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "serialNumber" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "savedItemId" TEXT,
    "problemDescription" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceRequest_requestNumber_key" ON "ServiceRequest"("requestNumber");
CREATE INDEX "ServiceRequest_userId_idx" ON "ServiceRequest"("userId");
CREATE INDEX "ServiceRequest_email_idx" ON "ServiceRequest"("email");
CREATE INDEX "ServiceRequest_serialNumber_idx" ON "ServiceRequest"("serialNumber");
CREATE INDEX "ServiceRequest_status_idx" ON "ServiceRequest"("status");
CREATE INDEX "ServiceRequest_createdAt_idx" ON "ServiceRequest"("createdAt");
