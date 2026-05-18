-- Adresă publică /companii/{publicSlug} — implicit din denumirea companiei, unică global.
ALTER TABLE "Partner" ADD COLUMN "publicSlug" TEXT;

CREATE UNIQUE INDEX "Partner_publicSlug_key" ON "Partner"("publicSlug");
