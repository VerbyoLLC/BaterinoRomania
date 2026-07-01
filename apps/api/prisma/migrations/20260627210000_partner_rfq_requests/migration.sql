-- Partner quote requests (RFQ) before personalized discount is approved.
CREATE TABLE "PartnerRfqRequest" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "currency" TEXT NOT NULL DEFAULT 'RON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerRfqRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PartnerRfqRequestLine" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productSlug" TEXT,
    "productTitle" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "PartnerRfqRequestLine_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PartnerRfqRequest_referenceNumber_key" ON "PartnerRfqRequest"("referenceNumber");
CREATE INDEX "PartnerRfqRequest_partnerId_idx" ON "PartnerRfqRequest"("partnerId");
CREATE INDEX "PartnerRfqRequest_createdAt_idx" ON "PartnerRfqRequest"("createdAt");
CREATE INDEX "PartnerRfqRequest_status_idx" ON "PartnerRfqRequest"("status");
CREATE INDEX "PartnerRfqRequestLine_requestId_idx" ON "PartnerRfqRequestLine"("requestId");

ALTER TABLE "PartnerRfqRequest" ADD CONSTRAINT "PartnerRfqRequest_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerRfqRequestLine" ADD CONSTRAINT "PartnerRfqRequestLine_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PartnerRfqRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
