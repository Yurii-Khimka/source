-- Add tag_id to follows and mutes tables for tag follow/mute support
-- source_id becomes nullable (exactly one of source_id/tag_id must be set)

ALTER TABLE follows ADD COLUMN tag_id UUID REFERENCES tags(id) ON DELETE CASCADE;
ALTER TABLE follows ALTER COLUMN source_id DROP NOT NULL;
ALTER TABLE follows ADD CONSTRAINT follows_one_target CHECK (
  (source_id IS NOT NULL AND tag_id IS NULL) OR
  (source_id IS NULL AND tag_id IS NOT NULL)
);
CREATE UNIQUE INDEX idx_follows_user_tag ON follows(follower_id, tag_id) WHERE tag_id IS NOT NULL;

ALTER TABLE mutes ADD COLUMN tag_id UUID REFERENCES tags(id) ON DELETE CASCADE;
ALTER TABLE mutes ALTER COLUMN source_id DROP NOT NULL;
ALTER TABLE mutes ADD CONSTRAINT mutes_one_target CHECK (
  (source_id IS NOT NULL AND tag_id IS NULL) OR
  (source_id IS NULL AND tag_id IS NOT NULL)
);
CREATE UNIQUE INDEX idx_mutes_user_tag ON mutes(user_id, tag_id) WHERE tag_id IS NOT NULL;
