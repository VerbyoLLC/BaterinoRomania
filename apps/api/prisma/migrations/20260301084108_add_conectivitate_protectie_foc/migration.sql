-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "conectivitateBluetooth" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "conectivitateWifi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "protectieFoc" TEXT;
