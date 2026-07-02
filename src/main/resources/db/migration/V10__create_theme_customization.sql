-- Background customization per page / per user (requested feature, not in FUS spec).
-- A row is either PAGE-scoped (page_key set, e.g. 'home') or USER-scoped
-- (user_id set, applied when viewing/replying to that user's posts).
-- `figures` is a CSV of Font Awesome icon names; `seed` drives the deterministic
-- placement + rotation of the doodle background on the client.
CREATE TABLE theme_customization (
    id         BIGSERIAL PRIMARY KEY,
    scope      VARCHAR(16) NOT NULL CHECK (scope IN ('PAGE', 'USER')),
    page_key   VARCHAR(64),
    user_id    BIGINT REFERENCES users (id) ON DELETE CASCADE,
    seed       BIGINT       NOT NULL,
    figures    TEXT         NOT NULL,
    bg_color   VARCHAR(32)  NOT NULL DEFAULT '#ffffff',
    opacity    REAL         NOT NULL DEFAULT 0.08,
    blur       INTEGER      NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ  NOT NULL,
    updated_at TIMESTAMPTZ  NOT NULL,
    -- exactly one target must be set, matching the scope
    CONSTRAINT ck_theme_target CHECK (
        (scope = 'PAGE' AND page_key IS NOT NULL AND user_id IS NULL) OR
        (scope = 'USER' AND user_id IS NOT NULL AND page_key IS NULL)
    )
);

-- at most one row per page / per user
CREATE UNIQUE INDEX uq_theme_page ON theme_customization (page_key) WHERE page_key IS NOT NULL;
CREATE UNIQUE INDEX uq_theme_user ON theme_customization (user_id) WHERE user_id IS NOT NULL;

-- Seed: the main page theme.
INSERT INTO theme_customization (scope, page_key, seed, figures, bg_color, opacity, blur, created_at, updated_at)
VALUES (
    'PAGE', 'home', 1780817081,
    'gift,star,heart,comment,arrow-right,cloud,bolt,wand-magic-sparkles',
    '#ffffff', 0.08, 0,
    now(), now()
);

-- Seed: a default theme for every existing user, with a per-user seed so each
-- person's blog background looks distinct out of the box.
INSERT INTO theme_customization (scope, user_id, seed, figures, bg_color, opacity, blur, created_at, updated_at)
SELECT 'USER', u.id, (u.id * 2654435761) % 2147483647,
       'star,heart,comment,bolt,feather,music',
       '#ffffff', 0.08, 0, now(), now()
FROM users u;
