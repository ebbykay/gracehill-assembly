# Naming conventions

Use lowercase kebab-case for application, component and asset paths; retain established root documentation names and tool-required configuration names. Avoid spaces, unexplained abbreviations and case-only duplicates. Preserve archived file contents and Git history.

Public pages retain stable URLs. Build-time header and footer templates live under packages/ui/components; edit them once rather than duplicating markup. Run node scripts/build-pages.mjs before previewing dist. The public build excludes admin and archives. Branding files use gracehill-logo.png and ram-logo.png.
