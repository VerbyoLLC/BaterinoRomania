-- AlterTable
ALTER TABLE "SalesAgent" ADD COLUMN "agentKind" TEXT NOT NULL DEFAULT 'human';
ALTER TABLE "SalesAgent" ADD COLUMN "isSuspended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SalesAgent" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "SalesAgent_deletedAt_idx" ON "SalesAgent"("deletedAt");
