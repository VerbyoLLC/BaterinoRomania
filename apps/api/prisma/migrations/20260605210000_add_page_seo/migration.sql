CREATE TABLE IF NOT EXISTS "page_seo" (
  "pageKey"     TEXT NOT NULL,
  "title"       TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "ogTitle"     TEXT NOT NULL DEFAULT '',
  "ogDescription" TEXT NOT NULL DEFAULT '',
  "ogImage"     TEXT NOT NULL DEFAULT '',
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "page_seo_pkey" PRIMARY KEY ("pageKey")
);
