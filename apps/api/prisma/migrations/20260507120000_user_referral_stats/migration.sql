-- Referral dashboard stats (Coduri reducere).
ALTER TABLE "User" ADD COLUMN "referralInviteEmailsSent" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "referralCodeRedemptionsCount" INTEGER NOT NULL DEFAULT 0;
