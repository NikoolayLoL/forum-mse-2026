-- Opacity of the background colour fill (separate from icon opacity).
ALTER TABLE theme_customization
    ADD COLUMN bg_opacity REAL NOT NULL DEFAULT 1.0;
