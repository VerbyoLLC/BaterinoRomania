-- Track one-time partner discount approved email.
ALTER TABLE "Partner" ADD COLUMN "discountApprovedEmailSentAt" TIMESTAMP(3);
