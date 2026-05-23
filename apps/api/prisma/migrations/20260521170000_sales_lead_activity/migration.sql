-- CreateTable
CREATE TABLE "sales_lead_activity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "fromStatus" TEXT NOT NULL DEFAULT '',
    "toStatus" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "sales_lead_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sales_lead_activity_leadId_idx" ON "sales_lead_activity"("leadId");
CREATE INDEX "sales_lead_activity_userId_idx" ON "sales_lead_activity"("userId");
CREATE INDEX "sales_lead_activity_type_idx" ON "sales_lead_activity"("type");
CREATE INDEX "sales_lead_createdByUserId_idx" ON "sales_lead"("createdByUserId");

-- AddForeignKey
ALTER TABLE "sales_lead_activity" ADD CONSTRAINT "sales_lead_activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "sales_lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sales_lead_activity" ADD CONSTRAINT "sales_lead_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
