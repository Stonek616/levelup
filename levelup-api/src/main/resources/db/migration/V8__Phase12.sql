CREATE TABLE game_profiles (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform   VARCHAR(20)  NOT NULL,
    handle     VARCHAR(100) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT now(),
    UNIQUE (user_id, platform)
);

CREATE INDEX idx_game_profiles_user ON game_profiles (user_id);
