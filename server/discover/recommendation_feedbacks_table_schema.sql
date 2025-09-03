
DROP TABLE IF EXISTS recommendation_feedbacks;

CREATE TABLE recommendation_feedbacks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  recommendation_id TEXT NOT NULL,
  comment TEXT,
  interaction_weight REAL,
  next_reminder_at TEXT,
  last_interaction_type TEXT NOT NULL,
  last_interacted_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(recommendation_id) REFERENCES recommendations(id)
);