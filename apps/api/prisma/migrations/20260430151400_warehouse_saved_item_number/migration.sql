-- Add sequential warehouse item number (0001, 0002, ...) for saved stock rows.
CREATE SEQUENCE IF NOT EXISTS "WarehouseSavedItem_itemNumber_seq";

ALTER TABLE "WarehouseSavedItem"
ADD COLUMN IF NOT EXISTS "itemNumber" INTEGER;

ALTER TABLE "WarehouseSavedItem"
ALTER COLUMN "itemNumber" SET DEFAULT nextval('"WarehouseSavedItem_itemNumber_seq"');

UPDATE "WarehouseSavedItem"
SET "itemNumber" = nextval('"WarehouseSavedItem_itemNumber_seq"')
WHERE "itemNumber" IS NULL;

ALTER TABLE "WarehouseSavedItem"
ALTER COLUMN "itemNumber" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseSavedItem_itemNumber_key"
ON "WarehouseSavedItem"("itemNumber");

SELECT setval(
  '"WarehouseSavedItem_itemNumber_seq"',
  GREATEST(
    COALESCE((SELECT MAX("itemNumber") FROM "WarehouseSavedItem"), 0),
    COALESCE((SELECT last_value FROM "WarehouseSavedItem_itemNumber_seq"), 0)
  ),
  true
);
