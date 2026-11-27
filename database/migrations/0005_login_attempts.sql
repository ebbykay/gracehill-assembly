BEGIN;
CREATE TABLE gracehill.login_attempts (
 state_hash text PRIMARY KEY CHECK (state_hash ~ '^[0-9a-f]{64}$'),
 browser_hash text NOT NULL CHECK (browser_hash ~ '^[0-9a-f]{64}$'),
 nonce text NOT NULL CHECK (nonce ~ '^[A-Za-z0-9_-]{43}$'),
 verifier text NOT NULL CHECK (verifier ~ '^[A-Za-z0-9_-]{43}$'),
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL CHECK (expires_at > created_at AND expires_at <= created_at + interval '5 minutes')
);
CREATE INDEX login_attempts_expiry_idx ON gracehill.login_attempts(expires_at);
REVOKE ALL ON gracehill.login_attempts FROM PUBLIC;
GRANT SELECT, INSERT, DELETE ON gracehill.login_attempts TO gracehill_runtime;
COMMIT;
