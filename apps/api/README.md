# Gracehill API

Local foundation only. Node.js 24; no external dependencies. Run `node apps/api/src/server.mjs` from the repository root and test with `node --test tests/integration/api.test.mjs`. GET /health/live reports process liveness; GET /health/ready returns 503 until operational dependencies are configured. No data endpoints, authentication or public deployment. Loopback binding only.

## Database runtime
Install dependencies with `npm install --prefix apps/api`. Optional DATABASE_URL enables a loopback-only PostgreSQL pool. Use a separately provisioned login granted gracehill_runtime, never the migration owner. Readiness stays 503 until trusted identity integration and operational services are configured. External identity mapping adapter exists but no real verifier is wired. Audit hook records verified access decisions when configured. Dependency lockfile and production TLS/credentials provisioning remain outstanding.
