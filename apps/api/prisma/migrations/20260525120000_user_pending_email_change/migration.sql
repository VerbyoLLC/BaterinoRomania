-- Pending email change for Google accounts (4-digit verification to current email)
ALTER TABLE "User" ADD COLUMN "pendingEmailChange" TEXT;
