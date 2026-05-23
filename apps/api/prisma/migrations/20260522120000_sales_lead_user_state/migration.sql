-- CreateTable
CREATE TABLE "sales_lead_user_state" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3),
    "commentsSeenAt" TIMESTAMP(3),

    CONSTRAINT "sales_lead_user_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sales_lead_user_state_userId_idx" ON "sales_lead_user_state"("userId");

-- CreateIndex
CREATE INDEX "sales_lead_user_state_leadId_idx" ON "sales_lead_user_state"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_lead_user_state_userId_leadId_key" ON "sales_lead_user_state"("userId", "leadId");

-- AddForeignKey
ALTER TABLE "sales_lead_user_state" ADD CONSTRAINT "sales_lead_user_state_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_lead_user_state" ADD CONSTRAINT "sales_lead_user_state_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "sales_lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
