-- Adresă livrare implicită partener (distinctă de sediu social).
ALTER TABLE "Partner" ADD COLUMN "deliveryStreet" TEXT;
ALTER TABLE "Partner" ADD COLUMN "deliveryCounty" TEXT;
ALTER TABLE "Partner" ADD COLUMN "deliveryCity" TEXT;
ALTER TABLE "Partner" ADD COLUMN "deliveryPostalCode" TEXT;
