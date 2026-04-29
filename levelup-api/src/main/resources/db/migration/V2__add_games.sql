CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    igdb_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    cover_url VARCHAR(500),
    release_year INTEGER,
    description TEXT,
    genres TEXT[],
    platforms TEXT[],
    tags TEXT[],
    game_modes TEXT[],
    cached_at TIMESTAMP NOT NULL DEFAULT now()
);