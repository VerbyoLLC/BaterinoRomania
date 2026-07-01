-- Câmpuri suplimentare pentru cereri service deschise de parteneri.
ALTER TABLE "ServiceRequest" ADD COLUMN "endClientName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ServiceRequest" ADD COLUMN "productLocation" TEXT NOT NULL DEFAULT '';
