-- Immutable GDPR consent audit trail
CREATE TABLE "consent_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "consentType" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "consent_log_userId_idx" ON "consent_log"("userId");
CREATE INDEX "consent_log_consentType_idx" ON "consent_log"("consentType");
CREATE INDEX "consent_log_createdAt_idx" ON "consent_log"("createdAt");
