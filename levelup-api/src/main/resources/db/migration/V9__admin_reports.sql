ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';

CREATE TABLE reports (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL,
    target_id   UUID        NOT NULL,
    reason      VARCHAR(30) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes       TEXT,
    created_at  TIMESTAMP   NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP,
    UNIQUE (reporter_id, target_type, target_id)
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
