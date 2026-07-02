-- FUS2: a Reply must record its creator and last-modification date.

ALTER TABLE replies ADD COLUMN author_id BIGINT REFERENCES users (id);
ALTER TABLE replies ADD COLUMN updated_at TIMESTAMPTZ;

-- Backfill any pre-existing rows (none expected on a fresh environment).
UPDATE replies SET author_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
WHERE author_id IS NULL;
UPDATE replies SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE replies ALTER COLUMN author_id SET NOT NULL;
ALTER TABLE replies ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX idx_replies_author_id ON replies (author_id);
