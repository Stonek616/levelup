CREATE TABLE daily_challenges (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_date DATE        NOT NULL UNIQUE,
    challenge_type VARCHAR(50) NOT NULL DEFAULT 'ODD_ONE_OUT',
    rounds         JSONB       NOT NULL,
    created_at     TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_challenges_date ON daily_challenges (challenge_date);

CREATE TABLE daily_challenge_results (
    id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID      NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
    score        INT       NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (user_id, challenge_id)
);

CREATE INDEX idx_dcr_user      ON daily_challenge_results (user_id);
CREATE INDEX idx_dcr_challenge ON daily_challenge_results (challenge_id);
