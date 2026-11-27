# Repository layout
Target approved by owner: apps/{website,administration,api}, packages/{ui,shared,configuration}, assets/{branding,photography,design}, database/{migrations,seeds}, docs/{requirements,architecture,design-system,security,operations,decisions}, tests/{unit,integration,e2e}, scripts, archive, .github; root README, CONTRIBUTING, SECURITY, CHANGELOG, ROADMAP, .env.example and .gitignore.

## Migration sequence
1. Inventory active and historical assets, including binary files and case-sensitive paths. Preserve original history.
2. Repair active HTML and CSS, then establish baseline browser screenshots and checks.
3. Move public pages into apps/website and admin into apps/administration in a dedicated migration PR. Rewrite references, update check scripts, validate every link and asset, and retain a local preview entrypoint.
4. Move shared code into packages and assets into their approved categories; distinguish design originals from public assets. Exclude archive and admin prototype from public deployment.
5. Introduce API, database and testing directories with actual implementations or explicit README scope, not fictional services. Do not store secrets or real personal records.
6. Review CI, local preview, browser checks and rollback before merging.

Canonical apps, packages, assets and archive are established. Source and browser baseline checks passed before legacy cleanup; the cleanup PR must pass CI again before merge.
