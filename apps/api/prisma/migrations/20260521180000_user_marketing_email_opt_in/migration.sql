-- AlterTable
ALTER TABLE "User" ADD COLUMN "marketingEmailOptIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "marketingEmailOptInAt" TIMESTAMP(3);
