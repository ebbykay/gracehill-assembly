# ADR 0002 — Local backend foundation
Status: provisional, pending architecture and hosting approval.
Use Node.js 24 native HTTP and node:test for the first small backend increment to avoid introducing unreviewed dependencies. Use PostgreSQL migration SQL for editorial content only; no database connection or sensitive records yet. Keep loopback-only binding and readiness unavailable until dependencies are configured. Future TypeScript/framework, identity provider, deployment, migration runner and role enforcement require separate decisions. Public Pages remains static.
