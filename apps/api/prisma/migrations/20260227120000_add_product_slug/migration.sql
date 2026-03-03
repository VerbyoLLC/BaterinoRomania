-- AlterTable
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

-- CreateIndex (PostgreSQL allows multiple NULLs in unique index)
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
