-- Populate slug for existing products (from title)
-- Slug: lowercase, hyphenated, basic ASCII
UPDATE "Product"
SET "slug" = lower(
  nullif(
    trim(both '-' from
      regexp_replace(
        regexp_replace(
          regexp_replace(COALESCE("title", ''), '[^a-zA-Z0-9\s-]', '', 'g'),
          '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
      )
    ),
    ''
  )
)
WHERE "slug" IS NULL AND trim(COALESCE("title", '')) != '';

-- Fallback: use id so URL still works (for empty slug or no title)
UPDATE "Product" SET "slug" = "id" WHERE "slug" IS NULL;
