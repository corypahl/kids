CREATE TABLE IF NOT EXISTS naughty_nice_answers (
  child TEXT NOT NULL CHECK (child IN ('emma', 'sophie', 'adam')),
  year INTEGER NOT NULL CHECK (year BETWEEN 2026 AND 2100),
  value INTEGER NOT NULL CHECK (value BETWEEN 0 AND 100),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (child, year)
);
