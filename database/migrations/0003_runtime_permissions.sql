BEGIN;
CREATE ROLE gracehill_runtime NOLOGIN;
GRANT USAGE ON SCHEMA gracehill TO gracehill_runtime;
GRANT SELECT ON gracehill.identities,gracehill.identity_roles TO gracehill_runtime;
GRANT INSERT ON gracehill.audit_events TO gracehill_runtime;
COMMIT;
