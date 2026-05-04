-- AlterTable
ALTER TABLE "SalesAgent" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SalesAgent_userId_key" ON "SalesAgent"("userId");

-- AddForeignKey
ALTER TABLE "SalesAgent" ADD CONSTRAINT "SalesAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
