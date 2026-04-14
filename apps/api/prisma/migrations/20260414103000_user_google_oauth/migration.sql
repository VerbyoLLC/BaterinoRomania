-- Google Sign-In: optional password (OAuth-only users), optional google subject
ALTER TABLE "User" ADD COLUMN "googleSub" TEXT;
CREATE UNIQUE INDEX "User_googleSub_key" ON "User"("googleSub");
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
