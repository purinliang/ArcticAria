
DROP TABLE IF EXISTS recommendation_feedbacks;

CREATE TABLE recommendation_feedbacks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  recommendation_id TEXT NOT NULL,
  comment TEXT,
  interaction_weight REAL DEFAULT 0.0,
  reminder_countdown_hours REAL DEFAULT 24.0, -- Initial countdown in hours
  last_interaction_type TEXT NOT NULL,
  last_recalculated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(recommendation_id) REFERENCES recommendations(id)
  UNIQUE(user_id, recommendation_id)
);