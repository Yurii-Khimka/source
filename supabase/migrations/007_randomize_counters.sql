-- ============================================
-- 007: randomize_article_counters(p_min, p_max)
-- ============================================
-- Called by scripts/fetcher.py on every run. Sets like_count and
-- bookmark_count on every visible article to a random integer in
-- [p_min, p_max]. Returns the number of rows updated.
--
-- Non-destructive for user data: rows in likes / bookmarks are not touched.
-- The real like counts can be recomputed at any time with:
--   UPDATE articles a SET like_count =
--     (SELECT count(*) FROM likes l WHERE l.article_id = a.id);
--
-- Safe to apply: only creates a function, no table or column changes.

CREATE OR REPLACE FUNCTION randomize_article_counters(p_min integer, p_max integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated integer;
BEGIN
  IF p_min IS NULL OR p_max IS NULL OR p_min < 0 OR p_min > p_max THEN
    RAISE EXCEPTION 'invalid range [%, %]', p_min, p_max;
  END IF;

  UPDATE articles
  SET like_count     = p_min + floor(random() * (p_max - p_min + 1))::integer,
      bookmark_count = p_min + floor(random() * (p_max - p_min + 1))::integer
  WHERE is_hidden = false;

  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated;
END;
$$;

-- Only the service role (the fetcher) may call it — not site visitors.
REVOKE EXECUTE ON FUNCTION randomize_article_counters(integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION randomize_article_counters(integer, integer) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION randomize_article_counters(integer, integer) TO service_role;
