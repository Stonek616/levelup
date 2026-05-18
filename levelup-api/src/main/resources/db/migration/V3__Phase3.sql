CREATE TABLE feed_events (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(20) NOT NULL,
    game_id UUID REFERENCES games(id),
    metadata JSONB,
    created_at TIMESTAMP
);

CREATE TABLE library_entries (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    is_owned BOOLEAN DEFAULT false,
    platforms TEXT[],
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uq_user_game UNIQUE (user_id, game_id)
);