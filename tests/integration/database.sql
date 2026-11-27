\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE programme_id uuid;
BEGIN
 INSERT INTO gracehill.programmes(title,description,starts_at,ends_at)
 VALUES ('Synthetic test programme','CI fixture', '2099-01-01 09:00+00','2099-01-01 10:00+00') RETURNING id INTO programme_id;
 IF (SELECT status FROM gracehill.programmes WHERE id=programme_id) <> 'draft' THEN RAISE EXCEPTION 'Draft default failed'; END IF;
 BEGIN
 INSERT INTO gracehill.programmes(title,description,starts_at,ends_at) VALUES ('Invalid dates','Fixture','2099-01-02','2099-01-01');
 RAISE EXCEPTION 'Invalid dates accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
 UPDATE gracehill.programmes SET status='invalid' WHERE id=programme_id;
 RAISE EXCEPTION 'Invalid status accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 INSERT INTO gracehill.media_resources(title,description,format,resource_url) VALUES ('Synthetic media','Fixture','audio','https://example.com/test');
 BEGIN
 INSERT INTO gracehill.media_resources(title,description,format,resource_url) VALUES ('Unsafe media','Fixture','audio','javascript:alert(1)');
 RAISE EXCEPTION 'Unsafe URL accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
 INSERT INTO gracehill.media_resources(title,description,format,resource_url) VALUES ('Invalid format','Fixture','invalid','https://example.com/test');
 RAISE EXCEPTION 'Invalid format accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
CREATE ROLE gracehill_ci_unprivileged NOLOGIN;
SET LOCAL ROLE gracehill_ci_unprivileged;
DO $$ BEGIN
 IF has_schema_privilege(current_user,'gracehill','USAGE') THEN RAISE EXCEPTION 'Unexpected schema access'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
