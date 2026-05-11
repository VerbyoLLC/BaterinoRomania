-- URL public R2 către PDF-ul certificatului de garanţie generat şi data ultimei generări.
ALTER TABLE "WarehouseSavedItem" ADD COLUMN "warrantyCertificateUrl" TEXT;
ALTER TABLE "WarehouseSavedItem" ADD COLUMN "warrantyCertificateGeneratedAt" TIMESTAMP(3);
