# Engineering baseline

## Architecture decision
Keep the existing buildless HTML/CSS/JavaScript site during remediation. Avoid a framework migration until requirements justify it. The root of gracehillassembly is authoritative; gha, later use and the ZIP are historical snapshots. Preserve every original file in the initial import.

## Prioritised backlog
- P0: Replace simulated admin access before handling any real data.
- P0: Remove misleading submission success messages or implement tested delivery with error states.
- P1: Supply approved hero/gallery assets, repair paths, replace placeholder destinations.
- P1: Verify service times, contact details, history, leadership, member counts and event dates with church leadership.
- P1: Verify all seven pages at phone, tablet and desktop widths, both themes and keyboard-only navigation.
- P2: Consolidate inline styles and scripts, add semantic landmarks and accessible tab/FAQ behaviour.
- P2: Choose hosting and backend from documented requirements; establish backups and release/rollback procedures.

## Definition of done
Acceptance criteria met; meaningful automated checks pass; affected flows tested; documentation updated; no secrets or real personal records; reviewer approval; no unexplained console errors; accessibility and responsive checks complete. Any exception must be recorded explicitly.

## Validation limits
CI checks JavaScript syntax (including inline scripts), expected pages and shared stylesheet references. It does not certify HTML validity, accessibility, asset availability, real delivery, authentication or visual quality. Existing missing assets are tracked above, not hidden by a passing check.

## Repository controls
Use PRs for future changes. Require source-check and review on main when GitHub plan/settings allow. No branch protection, public hosting or release is assumed to be enabled merely because these files exist.
