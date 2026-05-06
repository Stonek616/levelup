CREATE TABLE genres (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE themes (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE keywords (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255)  NOT NULL,
    slug VARCHAR(255)  NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE games (
    id UUID PRIMARY KEY,
    igdb_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    cover_image_id VARCHAR(50),
    first_release_date DATE,
    release_year INTEGER,
    summary TEXT,
    storyline TEXT,
    platforms TEXT[],
    player_perspectives TEXT[],
    game_modes TEXT[],
    developers TEXT[],
    franchises TEXT[],
    similar_game_ids INTEGER[],
    cached_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE game_genres (
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id),
    PRIMARY KEY (game_id, genre_id)
);

CREATE TABLE game_themes (
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    theme_id INTEGER NOT NULL REFERENCES themes(id),
    PRIMARY KEY(game_id, theme_id)
);

CREATE TABLE game_keywords (
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    keyword_id INTEGER NOT NULL REFERENCES keywords(id),
    PRIMARY KEY (game_id, keyword_id)
);

CREATE INDEX idx_game_genres_genre ON game_genres(genre_id);
CREATE INDEX idx_game_themes_theme ON game_themes(theme_id);
CREATE INDEX idx_game_keywords_kw ON game_keywords(keyword_id);

CREATE INDEX idx_games_platforms ON games USING GIN (platforms);
CREATE INDEX idx_games_game_modes ON games USING GIN (game_modes);