DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  balance REAL DEFAULT 0.0,
  created_at INTEGER DEFAULT (unixepoch())
);

DROP TABLE IF EXISTS api_keys;
CREATE TABLE api_keys (
  hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, revoked
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
