CREATE TABLE IF NOT EXISTS character_creations (
  id TEXT PRIMARY KEY,
  child TEXT NOT NULL CHECK (child IN ('emma', 'sophie', 'adam')),
  kind TEXT NOT NULL CHECK (kind IN ('elf', 'snowman')),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 24),
  look_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS character_creations_by_child_kind
  ON character_creations(child, kind, updated_at DESC);
