-- Partners are active immediately after signup (no admin approval gate).
UPDATE "Partner" SET "isApproved" = true WHERE "isApproved" = false;
ALTER TABLE "Partner" ALTER COLUMN "isApproved" SET DEFAULT true;
