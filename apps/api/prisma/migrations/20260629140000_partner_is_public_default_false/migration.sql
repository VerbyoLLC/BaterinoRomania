-- Partner public profiles start private; visibility requires a complete profile.
ALTER TABLE "Partner" ALTER COLUMN "isPublic" SET DEFAULT false;

-- Hide legacy default-public profiles that are still incomplete.
UPDATE "Partner"
SET "isPublic" = false
WHERE "isPublic" = true
  AND (
    "publicSlug" IS NULL OR btrim("publicSlug") = ''
    OR "logoUrl" IS NULL OR btrim("logoUrl") = ''
    OR "publicName" IS NULL OR btrim("publicName") = ''
    OR "street" IS NULL OR btrim("street") = ''
    OR "county" IS NULL OR btrim("county") = ''
    OR "city" IS NULL OR btrim("city") = ''
    OR "description" IS NULL OR btrim("description") = ''
    OR "publicPhone" IS NULL OR btrim("publicPhone") = ''
    OR "website" IS NULL OR btrim("website") = ''
    OR "workPhotos" IS NULL OR btrim("workPhotos") IN ('', '[]')
  );
