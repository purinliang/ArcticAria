DROP TABLE IF EXISTS todos;

CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  recurrence_rule TEXT,
  next_due_date TEXT NOT NULL,
  reminder_days_before INTEGER DEFAULT 0,
  category TEXT
);
