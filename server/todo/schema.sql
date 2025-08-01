DROP TABLE IF EXISTS todos;

CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  recurrence_rule TEXT,            -- '7d', '14d', '1m', or 'one-time'
  next_due_date TEXT NOT NULL,    -- ISO date string, must be passed from frontend
  reminder_days_before INTEGER DEFAULT 0
);

ALTER TABLE todos ADD COLUMN category TEXT;