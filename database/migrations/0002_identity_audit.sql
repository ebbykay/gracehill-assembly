BEGIN;
CREATE TABLE gracehill.identities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 issuer text NOT NULL CHECK (length(issuer) BETWEEN 1 AND 2048),
 subject text NOT NULL CHECK (length(subject) BETWEEN 1 AND 255),
 enabled boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (issuer,subject)
);
CREATE TABLE gracehill.identity_roles (
 identity_id uuid NOT NULL REFERENCES gracehill.identities(id) ON DELETE RESTRICT,
 role text NOT NULL CHECK (role IN ('editor','publisher','membership','finance','pastoral','auditor','administrator')),
 assigned_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (identity_id,role)
);
CREATE TABLE gracehill.audit_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 actor_id uuid REFERENCES gracehill.identities(id) ON DELETE RESTRICT,
 request_id uuid NOT NULL,
 action text NOT NULL CHECK (action IN ('programme:publish','programme:draft','media:publish','media:draft','identity:manage')),
 outcome text NOT NULL CHECK (outcome IN ('allowed','denied','failed')),
 occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_time_idx ON gracehill.audit_events(occurred_at);
REVOKE ALL ON ALL TABLES IN SCHEMA gracehill FROM PUBLIC;
COMMIT;
