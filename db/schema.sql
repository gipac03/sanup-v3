-- Schema della banca domande SanUp (SQLite / libSQL).
--
-- Compatibile con SQLite locale (file:), Turso e Cloudflare D1: passare online
-- non richiede modifiche allo schema, solo un cambio di URL di connessione.
--
-- I campi strutturati (options, explanationDetails) sono salvati come JSON in
-- colonne TEXT: mantengono la forma dell'oggetto Question senza tabelle extra,
-- restando comunque interrogabili se in futuro servira'.

CREATE TABLE IF NOT EXISTS questions (
  id                    TEXT PRIMARY KEY,
  subject               TEXT NOT NULL,
  chapter               TEXT NOT NULL,
  topic                 TEXT NOT NULL,
  difficulty            TEXT NOT NULL,
  question              TEXT NOT NULL,
  options               TEXT NOT NULL,  -- JSON: { "A": "...", ..., "E": "..." }
  correct_option        TEXT NOT NULL,
  explanation           TEXT NOT NULL,
  explanation_details   TEXT NOT NULL,  -- JSON: ExplanationDetails
  source_type           TEXT NOT NULL,
  originality_status    TEXT NOT NULL,
  protected_source_risk INTEGER NOT NULL, -- 0/1
  production_eligible   INTEGER NOT NULL  -- 0/1
);

CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_subject_chapter ON questions(subject, chapter);
