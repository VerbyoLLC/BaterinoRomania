-- Partner verified only when discount and support agent are both assigned.
UPDATE "Partner" SET "isApproved" = false;

UPDATE "Partner"
SET "isApproved" = true
WHERE "partnerDiscountPercent" IS NOT NULL
  AND "partnerDiscountPercent" > 0
  AND "assignedSalesAgentId" IS NOT NULL;

ALTER TABLE "Partner" ALTER COLUMN "isApproved" SET DEFAULT false;
