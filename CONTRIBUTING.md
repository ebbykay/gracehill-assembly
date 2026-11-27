# Development process

1. Record the problem, scope and acceptance criteria in an issue.
2. Create a short-lived branch: feature/<topic>, fix/<topic> or docs/<topic>.
3. Make focused changes to the active source; preserve historical alternatives until an explicit archival change.
4. Run `node scripts/check.mjs`. Add behavioural tests when implementing behaviour; never claim mocked features are working services.
5. Inspect all affected pages on desktop and mobile, keyboard navigation, both themes, empty/error states, and console/network failures.
6. Open a pull request explaining the problem, changes, validation and remaining risks. Obtain review before merging. Use a squash merge with a descriptive message.
7. Release only after content approval, accessibility checks, security review and a rollback plan. Record a version tag and release notes.

Do not commit secrets, personal church records or generated dependencies. Keep architecture decisions and setup instructions current. Do not force-push shared branches. Branch protection should require PR review and the source-check job; this policy is documented but not yet enforced in GitHub settings.
