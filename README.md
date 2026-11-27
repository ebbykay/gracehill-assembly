# Gracehill Assembly

Public source repository for the church website and administration demonstration.

## Staged application structure
- apps/website: six public pages
- apps/administration: demonstration only, no credentials or real records
- packages/ui/css and packages/shared/js: shared frontend code
- apps/api and database: future scope, not implemented
- scripts/build-pages.mjs: assemble public-only dist artifact

Run Node.js 24: `node scripts/check.mjs` and `node scripts/build-pages.mjs`. Serve dist with a local static server. See docs/operations/PAGES.md to switch GitHub Pages to Actions.

Legacy gracehillassembly and root index remain during cutover; source duplication is temporary. Original design assets and archives have not yet been moved. Do not commit sensitive church information: this repository is public. Content, missing photography, browser tests and secure backend remain outstanding.
