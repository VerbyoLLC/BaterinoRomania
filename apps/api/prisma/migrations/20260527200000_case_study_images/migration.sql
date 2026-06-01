-- AlterTable
ALTER TABLE "CaseStudy" ADD COLUMN "images" JSONB NOT NULL DEFAULT '[]';

-- Backfill gallery from legacy single image + count
UPDATE "CaseStudy"
SET "images" = CASE
  WHEN "image" IS NOT NULL AND TRIM("image") <> '' THEN jsonb_build_array("image")
  ELSE '[]'::jsonb
END
WHERE "images" = '[]'::jsonb OR "images" IS NULL;
