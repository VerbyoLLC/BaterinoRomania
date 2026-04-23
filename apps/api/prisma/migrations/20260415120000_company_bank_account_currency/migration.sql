-- Monedă per cont bancar (admin Date companie)
ALTER TABLE "CompanyBankAccount" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'RON';
