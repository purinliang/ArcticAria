DROP TABLE IF EXISTS users;

CREATE TABLE users (
   id            TEXT PRIMARY KEY,
   username      TEXT UNIQUE NOT NULL,
   password_hash TEXT NOT NULL,
   email         TEXT UNIQUE,
   avatar_url    TEXT,
   created_at    TEXT DEFAULT CURRENT_TIMESTAMP
); 
