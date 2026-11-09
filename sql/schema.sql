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
