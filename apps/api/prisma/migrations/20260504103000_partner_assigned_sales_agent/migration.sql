-- AlterTable
ALTER TABLE "Partner" ADD COLUMN "assignedSalesAgentId" TEXT;

-- CreateIndex
CREATE INDEX "Partner_assignedSalesAgentId_idx" ON "Partner"("assignedSalesAgentId");

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_assignedSalesAgentId_fkey" FOREIGN KEY ("assignedSalesAgentId") REFERENCES "SalesAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
