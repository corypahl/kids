CREATE TABLE IF NOT EXISTS wishes (
  id TEXT PRIMARY KEY,
  child TEXT NOT NULL CHECK (child IN ('emma', 'sophie', 'adam')),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  favorite INTEGER NOT NULL DEFAULT 0 CHECK (favorite IN (0,1)),
  purchased INTEGER NOT NULL DEFAULT 0 CHECK (purchased IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS wishes_by_child ON wishes(child, created_at);

CREATE TABLE IF NOT EXISTS activity_progress (
  child TEXT NOT NULL CHECK (child IN ('emma', 'sophie', 'adam')),
  activity_id INTEGER NOT NULL CHECK (activity_id BETWEEN 1 AND 24),
  PRIMARY KEY(child, activity_id)
);

CREATE TABLE IF NOT EXISTS advent_openings (
  child TEXT NOT NULL CHECK (child IN ('emma', 'sophie', 'adam')),
  year INTEGER NOT NULL,
  day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 24),
  opened_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(child, year, day)
);

CREATE TABLE IF NOT EXISTS glitter_diary (
  id TEXT PRIMARY KEY,
  child TEXT NOT NULL CHECK (child IN ('emma', 'sophie', 'adam')),
  year INTEGER NOT NULL,
  day TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  photo_key TEXT,
  photo_type TEXT,
  audio_key TEXT,
  audio_type TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(child, day)
);
CREATE INDEX IF NOT EXISTS glitter_by_year ON glitter_diary(year, day);
