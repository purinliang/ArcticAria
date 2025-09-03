DROP TABLE IF EXISTS recommendations;

CREATE TABLE recommendations (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_urls TEXT,
  is_public INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  overall_weight REAL DEFAULT 0.0
);
