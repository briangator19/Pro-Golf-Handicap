CREATE TABLE IF NOT EXISTS players (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tour TEXT,
  nationality TEXT,
  dob DATE,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  venue TEXT,
  course_rating NUMERIC(5,2) NOT NULL DEFAULT 72.00,
  slope_rating INTEGER NOT NULL DEFAULT 113,
  tees JSONB DEFAULT '{}'::jsonb,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tournaments (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tour TEXT,
  start_date DATE,
  end_date DATE,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scores (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  tournament_id BIGINT REFERENCES tournaments(id) ON DELETE SET NULL,
  course_id BIGINT REFERENCES courses(id) ON DELETE SET NULL,
  date_played DATE NOT NULL,
  round_number INTEGER,
  gross_score INTEGER NOT NULL,
  adjusted_gross INTEGER NOT NULL,
  par INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scores_player_date ON scores(player_id, date_played DESC);

CREATE TABLE IF NOT EXISTS handicap_history (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  handicap_index NUMERIC(5,2) NOT NULL,
  source TEXT,
  details JSONB
);
