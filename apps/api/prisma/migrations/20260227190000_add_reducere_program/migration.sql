-- CreateTable
CREATE TABLE "ReducereProgram" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "programLabel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "descriereScurta" TEXT,
    "description" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL DEFAULT 'CREEAZĂ CONT',
    "ctaTo" TEXT NOT NULL DEFAULT '/login',
    "termsLabel" TEXT NOT NULL,
    "topIcon" TEXT,
    "stiaiCaTitle" TEXT,
    "stiaiCaText" TEXT,
    "durataProgram" TEXT,
    "discountPercent" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReducereProgram_pkey" PRIMARY KEY ("id")
);
