-- CreateTable (idempotent — table may already exist from a partial run)
CREATE TABLE IF NOT EXISTS "product_category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "product_category_slug_key" ON "product_category"("slug");

-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");

-- AddForeignKey (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Product_categoryId_fkey'
  ) THEN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "product_category"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
