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
DO $identity_test$
DECLARE ident uuid;
BEGIN
 INSERT INTO gracehill.identities(issuer,subject) VALUES ('https://issuer.example','synthetic-subject') RETURNING id INTO ident;
 IF (SELECT enabled FROM gracehill.identities WHERE id=ident) THEN RAISE EXCEPTION 'Identity enabled by default'; END IF;
 INSERT INTO gracehill.identity_roles(identity_id,role) VALUES (ident,'editor');
 BEGIN
 INSERT INTO gracehill.identity_roles(identity_id,role) VALUES (ident,'editor');
 RAISE EXCEPTION 'Duplicate role accepted';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 BEGIN
 INSERT INTO gracehill.identity_roles(identity_id,role) VALUES (ident,'superuser');
 RAISE EXCEPTION 'Unknown role accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
 INSERT INTO gracehill.identities(issuer,subject) VALUES ('https://issuer.example','synthetic-subject');
 RAISE EXCEPTION 'Duplicate identity accepted';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 INSERT INTO gracehill.audit_events(actor_id,request_id,action,outcome) VALUES (ident,gen_random_uuid(),'programme:publish','denied');
 BEGIN
 DELETE FROM gracehill.identities WHERE id=ident;
 RAISE EXCEPTION 'Referenced identity deleted';
 EXCEPTION WHEN foreign_key_violation THEN NULL; END;
END $identity_test$;
CREATE ROLE gracehill_ci_unprivileged NOLOGIN;
SET LOCAL ROLE gracehill_ci_unprivileged;
DO $$ BEGIN
 IF has_schema_privilege(current_user,'gracehill','USAGE') THEN RAISE EXCEPTION 'Unexpected schema access'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
