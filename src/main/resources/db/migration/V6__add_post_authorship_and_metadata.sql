-- FUS1: a Topic must record its creator, last-modification date, and view count;
--       the title must be unique.

ALTER TABLE posts ADD COLUMN author_id BIGINT REFERENCES users (id);
ALTER TABLE posts ADD COLUMN updated_at TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN views BIGINT NOT NULL DEFAULT 0;

-- Backfill any pre-existing rows (none expected on a fresh environment).
UPDATE posts SET author_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
WHERE author_id IS NULL;
UPDATE posts SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE posts ALTER COLUMN author_id SET NOT NULL;
ALTER TABLE posts ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE posts ADD CONSTRAINT uq_posts_title UNIQUE (title);
CREATE INDEX idx_posts_author_id ON posts (author_id);
