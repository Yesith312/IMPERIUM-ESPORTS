CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Anuncios oficiales',
  tags TEXT,
  image TEXT,
  author TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  nick TEXT NOT NULL,
  public_name TEXT,
  country TEXT,
  flag TEXT,
  game_id TEXT,
  role TEXT,
  category TEXT NOT NULL DEFAULT 'Jugadores titulares',
  bio TEXT,
  photo TEXT,
  instagram TEXT,
  tiktok TEXT,
  joined TEXT,
  stats TEXT,
  history TEXT,
  active BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  position TEXT NOT NULL,
  name TEXT,
  bio TEXT,
  photo TEXT,
  social TEXT,
  vacant BOOLEAN NOT NULL DEFAULT false,
  sort INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT,
  format TEXT,
  starts_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Próximamente',
  description TEXT,
  result TEXT,
  confirmed BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  tournament TEXT NOT NULL,
  season TEXT,
  position INT,
  points INT,
  booyahs INT,
  kills INT,
  matches INT
);
CREATE TABLE IF NOT EXISTS sponsors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'Patrocinador oficial',
  description TEXT,
  website TEXT,
  social TEXT,
  logo TEXT
);
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS tryouts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  roles TEXT,
  requirements TEXT,
  open BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  player_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Recibida',
  notes TEXT,
  evaluation JSONB,
  guardian_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  reason TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_email TEXT,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  region TEXT,
  game TEXT,
  manager TEXT,
  coach TEXT,
  status TEXT NOT NULL DEFAULT 'En formación',
  history TEXT,
  active BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS player_stats (
  id SERIAL PRIMARY KEY,
  player TEXT NOT NULL,
  tournament TEXT,
  season TEXT,
  kills INT,
  booyahs INT,
  matches INT,
  points INT
);
CREATE TABLE IF NOT EXISTS portal_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT 'todos',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS trainings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  details TEXT,
  audience TEXT NOT NULL DEFAULT 'todos'
);
CREATE TABLE IF NOT EXISTS internal_docs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'todos'
);
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  label TEXT,
  mime TEXT NOT NULL,
  data BYTEA NOT NULL,
  press BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS tryout_registrations (
  id SERIAL PRIMARY KEY,
  tryout_id INT NOT NULL REFERENCES tryouts(id) ON DELETE CASCADE,
  application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  attendance TEXT NOT NULL DEFAULT 'Invitado',
  UNIQUE (tryout_id, application_id)
);
CREATE TABLE IF NOT EXISTS data_requests (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Recibida',
  answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
