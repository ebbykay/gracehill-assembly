BEGIN;
CREATE TABLE gracehill.ministries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK(length(btrim(name)) BETWEEN 1 AND 120),
 active boolean NOT NULL DEFAULT true,
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
 UNIQUE(name)
);
CREATE TABLE gracehill.ministry_assignments (
 ministry_id uuid NOT NULL REFERENCES gracehill.ministries(id) ON DELETE RESTRICT,
 member_id uuid NOT NULL REFERENCES gracehill.members(id) ON DELETE RESTRICT,
 responsibility text NOT NULL CHECK(length(btrim(responsibility)) BETWEEN 1 AND 120),
 PRIMARY KEY(ministry_id,member_id)
);
CREATE TABLE gracehill.finance_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 label text NOT NULL CHECK(length(btrim(label)) BETWEEN 1 AND 200),
 direction text NOT NULL CHECK(direction IN ('income','expense')),
 amount_minor bigint NOT NULL CHECK(amount_minor BETWEEN 1 AND 100000000000),
 entry_date date NOT NULL,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','approved','rejected')),
 created_by uuid NOT NULL REFERENCES gracehill.identities(id),
 reviewed_by uuid REFERENCES gracehill.identities(id),
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
 CHECK(reviewed_by IS NULL OR reviewed_by<>created_by),
 CHECK((status IN ('approved','rejected'))=(reviewed_by IS NOT NULL))
);
CREATE INDEX finance_date_idx ON gracehill.finance_entries(entry_date,status);
CREATE TABLE gracehill.finance_budgets (
 month date PRIMARY KEY CHECK(EXTRACT(DAY FROM month)=1),
 ceiling_minor bigint NOT NULL CHECK(ceiling_minor BETWEEN 0 AND 100000000000),
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0)
);
ALTER TABLE gracehill.media_resources ADD COLUMN revision integer NOT NULL DEFAULT 1 CHECK(revision>0);
CREATE TABLE gracehill.care_followups (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 case_ref text NOT NULL CHECK(length(btrim(case_ref)) BETWEEN 1 AND 100),
 due_date date NOT NULL,
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','scheduled','closed')),
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
 UNIQUE(case_ref)
);
CREATE TABLE gracehill.announcements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL CHECK(length(btrim(title)) BETWEEN 1 AND 200),
 body text NOT NULL CHECK(length(btrim(body)) BETWEEN 1 AND 4000),
 audience text NOT NULL CHECK(audience IN ('all','members','volunteers')),
 scheduled_at timestamptz,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','approved','archived')),
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0)
);
ALTER TABLE gracehill.identity_roles DROP CONSTRAINT identity_roles_role_check;
ALTER TABLE gracehill.identity_roles ADD CHECK(role IN ('editor','publisher','membership','finance','finance_approver','ministry','pastoral','auditor','administrator','communications','communications_approver'));
ALTER TABLE gracehill.audit_events DROP CONSTRAINT audit_events_action_check;
ALTER TABLE gracehill.audit_events ADD CHECK(action IN ('programme:publish','programme:draft','media:publish','media:draft','identity:manage','membership:write','attendance:write','ministry:write','finance:write','finance:approve','pastoral:write','communications:write','communications:approve'));
REVOKE ALL ON gracehill.ministries,gracehill.ministry_assignments,gracehill.finance_entries,gracehill.finance_budgets,gracehill.care_followups,gracehill.announcements FROM PUBLIC;
GRANT SELECT,INSERT ON gracehill.ministries,gracehill.ministry_assignments,gracehill.finance_entries,gracehill.finance_budgets,gracehill.care_followups,gracehill.announcements,gracehill.media_resources TO gracehill_runtime;
GRANT UPDATE(status,reviewed_by,revision) ON gracehill.finance_entries TO gracehill_runtime;
GRANT UPDATE(ceiling_minor,revision) ON gracehill.finance_budgets TO gracehill_runtime;
GRANT UPDATE(status,revision,updated_at) ON gracehill.media_resources TO gracehill_runtime;
GRANT UPDATE(status,revision) ON gracehill.care_followups,gracehill.announcements TO gracehill_runtime;
COMMIT;
