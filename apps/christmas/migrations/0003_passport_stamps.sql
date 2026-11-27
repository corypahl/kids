-- Collectible, idempotent seasonal achievement stamps for each child.
CREATE TABLE IF NOT EXISTS christmas_passport_stamps (
  child TEXT NOT NULL CHECK (child IN ('emma', 'sophie', 'adam')),
  year INTEGER NOT NULL CHECK (year BETWEEN 2026 AND 2100),
  stamp TEXT NOT NULL CHECK (stamp IN (
    'present-bounce','delivery-run','elf-coding','snow-globe',
    'around-the-world','cursive','advent','kindness'
  )),
  earned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (child,year,stamp)
);
