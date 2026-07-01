-- Partner commercial channel: installer | distributor | hybrid
ALTER TABLE "Partner" ADD COLUMN IF NOT EXISTS "partnerChannelType" TEXT NOT NULL DEFAULT 'installer';

UPDATE "Partner"
SET "partnerChannelType" = CASE
  WHEN LOWER("activityTypes") LIKE '%instalator%' AND LOWER("activityTypes") LIKE '%distribuitor%' THEN 'hybrid'
  WHEN LOWER("activityTypes") LIKE '%distribuitor%' THEN 'distributor'
  ELSE 'installer'
END;
