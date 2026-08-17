-- Seed the admin-owned starter taxonomy so a new database is not empty.
-- Duplicate slugs are left unchanged (same philosophy as the Plan seed, plus
-- ON CONFLICT so replaying this insert cannot create a second row).
INSERT INTO "Category" ("name", "slug", "categoryWeight", "createdAt", "updatedAt")
VALUES
  ('Picture Books', 'picture-books', 1.0000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Children''s', 'children-s', 1.0000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Fiction', 'fiction', 1.0000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Nonfiction', 'nonfiction', 1.0000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Young Adult', 'young-adult', 1.0000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
