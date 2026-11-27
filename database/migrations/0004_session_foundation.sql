BEGIN;
CREATE TABLE gracehill.admin_sessions (
 token_hash text PRIMARY KEY CHECK (token_hash ~ '^[0-9a-f]{64}$'),
 identity_id uuid NOT NULL REFERENCES gracehill.identities(id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL CHECK (expires_at > created_at AND expires_at <= created_at + interval '15 minutes'),
 revoked_at timestamptz
);
CREATE INDEX admin_sessions_identity_idx ON gracehill.admin_sessions(identity_id);
REVOKE ALL ON gracehill.admin_sessions FROM PUBLIC;
GRANT SELECT, INSERT ON gracehill.admin_sessions TO gracehill_runtime;
GRANT UPDATE (revoked_at) ON gracehill.admin_sessions TO gracehill_runtime;
COMMIT;
