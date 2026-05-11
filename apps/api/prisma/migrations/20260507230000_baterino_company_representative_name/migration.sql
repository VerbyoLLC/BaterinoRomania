-- Adaugă numele reprezentantului companiei (afişat pe certificatul de garanţie).
ALTER TABLE "BaterinoCompany" ADD COLUMN "representativeName" TEXT NOT NULL DEFAULT '';

-- Pre-populare cu reprezentantul curent declarat de admin.
UPDATE "BaterinoCompany"
SET "representativeName" = 'RAZVAN NECHIFOR'
WHERE "id" = 'default' AND "representativeName" = '';
