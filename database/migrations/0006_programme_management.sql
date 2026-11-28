BEGIN;
ALTER TABLE gracehill.programmes ADD COLUMN revision integer NOT NULL DEFAULT 1 CHECK (revision>0);
GRANT SELECT, INSERT ON gracehill.programmes TO gracehill_runtime;
GRANT UPDATE (title,description,starts_at,ends_at,status,updated_at,revision) ON gracehill.programmes TO gracehill_runtime;
COMMIT;
