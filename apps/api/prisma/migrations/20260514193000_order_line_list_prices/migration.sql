-- Snapshot catalog/list totals (incl. VAT) before programme or partner discount — for client order UI.

ALTER TABLE "ResidentialOrderLine"
ADD COLUMN IF NOT EXISTS "listUnitPriceInclVat" DECIMAL(14, 2),
ADD COLUMN IF NOT EXISTS "listLineTotalInclVat" DECIMAL(14, 2);

ALTER TABLE "GuestResidentialOrder"
ADD COLUMN IF NOT EXISTS "listUnitPriceInclVat" DECIMAL(14, 2),
ADD COLUMN IF NOT EXISTS "listLineTotalInclVat" DECIMAL(14, 2);
