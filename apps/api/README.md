# Gracehill API

Local foundation only. Node.js 24; no external dependencies. Run `node apps/api/src/server.mjs` from the repository root and test with `node --test tests/integration/api.test.mjs`. GET /health/live reports process liveness; GET /health/ready returns 503 until operational dependencies are configured. No data endpoints, authentication or public deployment. Loopback binding only.
