-- Evolve theme_customization: seed becomes a UUID (was bigint), plus new knobs
-- for density, sizing and colour accents that drive the client-side renderer.

-- seed: int -> UUID string. Existing rows get a fresh random UUID.
ALTER TABLE theme_customization DROP COLUMN seed;
ALTER TABLE theme_customization
    ADD COLUMN seed VARCHAR(36) NOT NULL DEFAULT gen_random_uuid()::text;
ALTER TABLE theme_customization ALTER COLUMN seed DROP DEFAULT;

ALTER TABLE theme_customization
    ADD COLUMN density          INTEGER NOT NULL DEFAULT 63,   -- how many icons
    ADD COLUMN base_size        INTEGER NOT NULL DEFAULT 34,   -- general icon size (px)
    ADD COLUMN size_variation   REAL    NOT NULL DEFAULT 0.35, -- 0..1: how often icons come out bigger
    ADD COLUMN accent_color     VARCHAR(32) NOT NULL DEFAULT '#111111', -- icon colour
    ADD COLUMN accent_variation REAL    NOT NULL DEFAULT 0.25; -- 0..1: fraction rendered as darker shades

-- Showcase the accent feature on the main page with an orange palette.
UPDATE theme_customization
SET accent_color = '#f97316', accent_variation = 0.3, density = 70
WHERE page_key = 'home';
