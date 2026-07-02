-- Likes on replies (not in the original FUS spec; requested feature).
CREATE TABLE reply_likes (
    id BIGSERIAL PRIMARY KEY,
    reply_id BIGINT NOT NULL REFERENCES replies (id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_reply_likes UNIQUE (reply_id, user_id)
);

CREATE INDEX idx_reply_likes_reply_id ON reply_likes (reply_id);
