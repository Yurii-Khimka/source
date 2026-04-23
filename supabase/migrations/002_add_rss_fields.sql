-- ============================================
-- Add columns needed for RSS fetcher
-- ============================================

-- sources: add handle, rss_url, site_url, language, verification_status
ALTER TABLE sources ADD COLUMN handle TEXT UNIQUE;
ALTER TABLE sources ADD COLUMN rss_url TEXT;
ALTER TABLE sources ADD COLUMN site_url TEXT;
ALTER TABLE sources ADD COLUMN language TEXT DEFAULT 'en';
ALTER TABLE sources ADD COLUMN verification_status TEXT DEFAULT 'pending'
  CHECK (verification_status IN ('pending', 'verified', 'rejected', 'system_aggregated'));

-- Make profile_id optional for system-aggregated sources (no user owns them)
ALTER TABLE sources ALTER COLUMN profile_id DROP NOT NULL;

-- articles: add url column for deduplication
ALTER TABLE articles ADD COLUMN url TEXT UNIQUE;

-- articles: make content optional (RSS items may only have a summary)
ALTER TABLE articles ALTER COLUMN content DROP NOT NULL;
