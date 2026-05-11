-- Recalculează producedOn din SN: în cele 16 cifre numerotate 1–16,
-- cifrele 9–10 = an (YY → afișare 20YY), 11–12 = lună (afișare MM/20YY).

UPDATE "WarehouseSavedItem" AS w
SET
  "producedOn" =
    SUBSTRING(calc.d FROM 11 FOR 2)
    || '/20'
    || SUBSTRING(calc.d FROM 9 FOR 2)
FROM (
  SELECT
    "id",
    RIGHT(REGEXP_REPLACE("serialNumber", '[^0-9]', '', 'g'), 16) AS d
  FROM "WarehouseSavedItem"
) AS calc
WHERE w."id" = calc."id"
  AND LENGTH(calc.d) = 16
  AND SUBSTRING(calc.d FROM 11 FOR 2) ~ '^[0-9]{2}$'
  AND SUBSTRING(calc.d FROM 9 FOR 2) ~ '^[0-9]{2}$'
  AND CAST(SUBSTRING(calc.d FROM 11 FOR 2) AS INTEGER) BETWEEN 1 AND 12;
