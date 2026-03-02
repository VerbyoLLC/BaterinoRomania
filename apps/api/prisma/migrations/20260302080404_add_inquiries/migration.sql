-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_registrationNumber_key" ON "Inquiry"("registrationNumber");
