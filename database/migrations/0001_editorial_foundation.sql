BEGIN;
CREATE SCHEMA IF NOT EXISTS gracehill;
CREATE TABLE gracehill.programmes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
 description text NOT NULL,
 starts_at timestamptz NOT NULL,
 ends_at timestamptz NOT NULL CHECK (ends_at >= starts_at),
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE gracehill.media_resources (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
 description text NOT NULL,
 format text NOT NULL CHECK (format IN ('video','audio','photo','podcast')),
 resource_url text NOT NULL CHECK (resource_url LIKE 'https://%'),
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX programmes_status_start_idx ON gracehill.programmes(status,starts_at);
CREATE INDEX media_status_idx ON gracehill.media_resources(status);
REVOKE ALL ON SCHEMA gracehill FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA gracehill FROM PUBLIC;
COMMIT;
