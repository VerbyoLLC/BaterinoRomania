-- CreateTable
CREATE TABLE "DepartmentPhone" (
    "department" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepartmentPhone_pkey" PRIMARY KEY ("department")
);
