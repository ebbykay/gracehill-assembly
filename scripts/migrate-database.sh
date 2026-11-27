#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DATABASE_URL:?Set DATABASE_URL to an isolated development database}"
if [[ "${GRACEHILL_MIGRATION_TARGET:-}" != "development" ]]; then
  echo "Refusing migration without explicit development target" >&2
  exit 1
fi
# Use one psql session and a session advisory lock for all migrations.
# Migration files own their transactions. Record each checksum in the same transaction.
{
cat <<'SQL'
SELECT pg_advisory_lock(721349102);
CREATE SCHEMA IF NOT EXISTS gracehill_migrations;
REVOKE ALL ON SCHEMA gracehill_migrations FROM PUBLIC;
CREATE TABLE IF NOT EXISTS gracehill_migrations.applied (
  version text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL
for file in database/migrations/[0-9]*.sql; do
  version="$(basename "$file")"
  [[ "$version" =~ ^[0-9]{4}_[a-z0-9_]+\.sql$ ]] || { echo "Invalid migration name" >&2; exit 1; }
  checksum="$(sha256sum "$file" | cut -d' ' -f1)"
  printf "SELECT EXISTS(SELECT 1 FROM gracehill_migrations.applied WHERE version='%s') AS already_applied, EXISTS(SELECT 1 FROM gracehill_migrations.applied WHERE version='%s' AND checksum<>'%s') AS checksum_changed \\gset\n" "$version" "$version" "$checksum"
  printf '%s\n' '\if :checksum_changed' "DO \$\$ BEGIN RAISE EXCEPTION 'Applied migration checksum mismatch'; END \$\$;" '\endif' '\if :already_applied' '\else'
  # Enforce the migration convention: exact BEGIN/COMMIT lines enclosing SQL.
  [[ "$(head -n1 "$file")" == "BEGIN;" && "$(tail -n1 "$file")" == "COMMIT;" ]] || { echo "Missing transaction boundaries" >&2; exit 1; }
  printf 'BEGIN;\n'
  sed '1d;$d' "$file"
  printf "\nINSERT INTO gracehill_migrations.applied(version,checksum) VALUES ('%s','%s');\nCOMMIT;\n" "$version" "$checksum"
  printf '%s\n' '\endif'
done
printf 'SELECT pg_advisory_unlock(721349102);\n'
} | psql "$DATABASE_URL" -X --set=ON_ERROR_STOP=1
