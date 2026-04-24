-- SECURITY DEFINER function to safely update like_count
-- Bypasses RLS since articles UPDATE is restricted to service role
CREATE OR REPLACE FUNCTION increment_like_count(p_article_id uuid, delta integer)
RETURNS integer AS $$
  UPDATE articles
  SET like_count = GREATEST(0, like_count + delta)
  WHERE id = p_article_id
  RETURNING like_count;
$$ LANGUAGE sql SECURITY DEFINER;
