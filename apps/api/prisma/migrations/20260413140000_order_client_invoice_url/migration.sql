-- Factură client (PDF) încărcată din admin la trecerea în „în pregătire”.
ALTER TABLE "ResidentialOrder" ADD COLUMN "clientInvoiceUrl" TEXT;
ALTER TABLE "GuestResidentialOrder" ADD COLUMN "clientInvoiceUrl" TEXT;
