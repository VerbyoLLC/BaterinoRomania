-- CreateTable
CREATE TABLE "sales_lead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'Manual',
    "status" TEXT NOT NULL DEFAULT 'nou',
    "salesAgentId" TEXT,
    "createdByUserId" TEXT,

    CONSTRAINT "sales_lead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sales_lead_createdAt_idx" ON "sales_lead"("createdAt");
CREATE INDEX "sales_lead_salesAgentId_idx" ON "sales_lead"("salesAgentId");
CREATE INDEX "sales_lead_status_idx" ON "sales_lead"("status");

ALTER TABLE "sales_lead" ADD CONSTRAINT "sales_lead_salesAgentId_fkey" FOREIGN KEY ("salesAgentId") REFERENCES "SalesAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sales_lead" ADD CONSTRAINT "sales_lead_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
