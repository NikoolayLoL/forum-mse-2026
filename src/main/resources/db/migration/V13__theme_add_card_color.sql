-- Themeable background for post/reply/list cards (separate from the page bg).
ALTER TABLE theme_customization
    ADD COLUMN card_color   VARCHAR(32) NOT NULL DEFAULT '#ffffff',
    ADD COLUMN card_opacity REAL        NOT NULL DEFAULT 1.0;
