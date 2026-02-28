-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "partnerDiscountPercent" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT,
    "tipProdus" TEXT NOT NULL,
    "landedPrice" DECIMAL(12,2) NOT NULL,
    "salePrice" DECIMAL(12,2) NOT NULL,
    "vat" DECIMAL(5,2) NOT NULL,
    "energieNominala" TEXT,
    "capacitate" TEXT,
    "curentMaxDescarcare" TEXT,
    "curentMaxIncarcare" TEXT,
    "cicluriDescarcare" TEXT,
    "adancimeDescarcare" TEXT,
    "greutate" TEXT,
    "dimensiuni" TEXT,
    "protectie" TEXT,
    "certificari" TEXT,
    "garantie" TEXT,
    "tensiuneNominala" TEXT,
    "eficientaCiclu" TEXT,
    "temperaturaFunctionare" TEXT,
    "temperaturaStocare" TEXT,
    "umiditate" TEXT,
    "images" JSONB NOT NULL DEFAULT '[]',
    "documenteTehnice" JSONB NOT NULL DEFAULT '[]',
    "faq" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
