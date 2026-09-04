-- Historique global (total des dons + spectateurs cumulés)
CREATE TABLE IF NOT EXISTS global_history (
  time INTEGER PRIMARY KEY,
  total REAL NOT NULL,
  viewers INTEGER NOT NULL
);

-- Historique par streamer (montant de dons + spectateurs à chaque relevé)
CREATE TABLE IF NOT EXISTS streamer_history (
  time INTEGER NOT NULL,
  twitch_id TEXT NOT NULL,
  display TEXT NOT NULL,
  amount REAL NOT NULL,
  viewers INTEGER NOT NULL,
  PRIMARY KEY (time, twitch_id)
);

CREATE INDEX IF NOT EXISTS idx_streamer_history_twitch_id_time
  ON streamer_history (twitch_id, time);
