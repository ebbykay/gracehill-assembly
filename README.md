# Gracehill Assembly

Private development repository for the church website and administration prototype.

## Current state
The active website is in `gracehillassembly/`: seven HTML pages, shared CSS and JavaScript. Open `gracehillassembly/index.html` for a basic local preview. External fonts and libraries require internet access. There is no build step or backend.

Run checks with Node.js 24: `node scripts/check.mjs`.

## Source layout
- `gracehillassembly/*.html`, `css/`, `js/`: active source.
- `gracehillassembly/gha/`, `later use/`, `ga/gha.zip`: preserved historical alternatives, not deployment sources.
- PNG and PSD files: original branding and design assets.
- `docs/DEVELOPMENT.md`: workflow, architecture, acceptance criteria and known gaps.

## Release status
Not production ready. Admin authentication is simulated; forms do not deliver messages; some images and destinations are missing; event and church content needs verification. Do not store real credentials, member records, prayer requests or finances in this prototype. Browser visual verification is outstanding. Passing CI is not approval to deploy.

No public deployment or open-source licence has been enabled. See CONTRIBUTING.md and SECURITY.md.
