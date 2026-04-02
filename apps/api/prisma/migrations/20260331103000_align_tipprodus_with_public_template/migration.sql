-- Align stored tipProdus with public routing: industrial → carousel template, rezidential → classic product page.
-- Swap values so existing rows keep the same rendered page after the code change.
UPDATE "Product" SET "tipProdus" = CASE
  WHEN "tipProdus" = 'rezidential' THEN 'industrial'
  WHEN "tipProdus" = 'industrial' THEN 'rezidential'
  ELSE "tipProdus"
END;
