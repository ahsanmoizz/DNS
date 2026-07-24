# DECISIONS.md — Architecture Decision Records

> Last updated: 2026-07-24

## ADR-001: Simulator-First Architecture Preserved
**Date:** 2026-07-24
**Status:** Accepted
**Context:** The existing codebase uses a simulator-first pattern where Vite injects live-adapter TypeScript into the simulator HTML files at build time.
**Decision:** Preserve this architecture. The simulator HTML IS the production frontend. Live-adapters replace dummy `onclick` handlers with real API/blockchain calls.
**Consequence:** All UI work happens in the live-adapter TypeScript files, not by modifying the simulator HTML structure or CSS.

## ADR-002: Zero-Docker Deployment
**Date:** 2026-07-24
**Status:** Accepted
**Context:** User explicitly prohibits Docker on the development machine and requires direct server installation.
**Decision:** Build locally with pnpm, deploy via scp, run a single setup.sh script on the server that installs PostgreSQL, Redis, runs migrations, and starts services.
**Consequence:** Docker Compose files are retained as reference only. PM2 or systemd manages processes on the server.

## ADR-003: Server Port Isolation
**Date:** 2026-07-24
**Status:** Accepted
**Context:** The server runs other services. The application must not interfere.
**Decision:** All ports (PostgreSQL, Redis, API, frontends, Nginx) are configured exclusively through .env. PostgreSQL runs on a non-default, non-conflicting port.
**Consequence:** Every service binding reads its port from environment variables. No hardcoded ports in any source file.
