-- CreateTable
CREATE TABLE "admin_commercial_offer_note" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "offerId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,

    CONSTRAINT "admin_commercial_offer_note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_commercial_offer_note_offerId_idx" ON "admin_commercial_offer_note"("offerId");

-- CreateIndex
CREATE INDEX "admin_commercial_offer_note_createdAt_idx" ON "admin_commercial_offer_note"("createdAt");

-- AddForeignKey
ALTER TABLE "admin_commercial_offer_note" ADD CONSTRAINT "admin_commercial_offer_note_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "admin_commercial_offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_commercial_offer_note" ADD CONSTRAINT "admin_commercial_offer_note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
