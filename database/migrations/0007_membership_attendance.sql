BEGIN;
CREATE TABLE gracehill.households (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 label text NOT NULL CHECK(length(btrim(label)) BETWEEN 1 AND 120),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE gracehill.members (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 display_name text NOT NULL CHECK(length(btrim(display_name)) BETWEEN 1 AND 160),
 household_id uuid REFERENCES gracehill.households(id) ON DELETE RESTRICT,
 status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','active','inactive')),
 joined_on date NOT NULL,
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX members_household_idx ON gracehill.members(household_id);
CREATE TABLE gracehill.attendance_services (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL CHECK(length(btrim(title)) BETWEEN 1 AND 200),
 service_date date NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE gracehill.attendance_entries (
 service_id uuid NOT NULL REFERENCES gracehill.attendance_services(id) ON DELETE RESTRICT,
 member_id uuid NOT NULL REFERENCES gracehill.members(id) ON DELETE RESTRICT,
 present boolean NOT NULL,
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(service_id,member_id)
);
ALTER TABLE gracehill.audit_events DROP CONSTRAINT audit_events_action_check;
ALTER TABLE gracehill.audit_events ADD CHECK(action IN ('programme:publish','programme:draft','media:publish','media:draft','identity:manage','membership:write','attendance:write'));
REVOKE ALL ON gracehill.households,gracehill.members,gracehill.attendance_services,gracehill.attendance_entries FROM PUBLIC;
GRANT SELECT,INSERT ON gracehill.households,gracehill.members,gracehill.attendance_services,gracehill.attendance_entries TO gracehill_runtime;
GRANT UPDATE(display_name,household_id,status,joined_on,revision,updated_at) ON gracehill.members TO gracehill_runtime;
GRANT UPDATE(present,revision,updated_at) ON gracehill.attendance_entries TO gracehill_runtime;
COMMIT;
