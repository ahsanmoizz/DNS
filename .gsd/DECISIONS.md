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

---

## Phase 1 Decisions

**Date:** 2026-07-24
**Discussed in:** `/discuss-phase 1`

### ADR-004: Offset Port Strategy
**Status:** Accepted
**Context:** Ubuntu server has PostgreSQL and Redis already installed globally (default ports 5432/6379) serving other applications.
**Decision:** Daily Identity uses offset ports — PostgreSQL on **5480**, Redis on **6380**. A dedicated PostgreSQL database `daily_identity` is created on the existing server PostgreSQL instance using the offset port. Redis uses a separate instance or a dedicated database index.
**Consequence:** `.env` DATABASE_URL and REDIS_URL must use offset ports. `setup.sh` creates the database/user on the existing PostgreSQL cluster but bound to port 5480, or connects to the existing cluster and creates a dedicated database.

### ADR-005: PM2 Process Manager
**Status:** Accepted
**Context:** PM2 is already installed globally on the server and manages other applications.
**Decision:** Use PM2 with an `ecosystem.config.cjs` file to manage all Daily Identity processes (API, indexer, user-web static serve, admin-web static serve).
**Consequence:** `setup.sh` runs `pm2 start ecosystem.config.cjs` and `pm2 save`. No systemd units needed. PM2 already has startup hooks configured on the server.

### ADR-006: Persistent Cloudflare Tunnels
**Status:** Accepted
**Context:** Cloudflare Tunnels are already running as a persistent service on the server, pointing to the ports defined in `.env` (3100 for user-web, 3101 for admin-web, 4100 for API, 3102 for preview).
**Decision:** No tunnel setup in `setup.sh`. Tunnels are pre-configured and will route traffic to the correct local ports automatically.
**Consequence:** The deployment only needs to ensure services bind to the correct ports in `.env`. No Cloudflare configuration changes needed.

### ADR-007: Slim Transfer Deployment
**Status:** Accepted
**Context:** Server is Ubuntu with Node.js and PM2. Building on server would require full dev toolchain and risk OOM on limited VPS resources (known from past deployments).
**Decision:** Build everything locally with `pnpm build`, then `scp` only the slim artifacts:
- `apps/user-web/dist/` — Vite-built static files
- `apps/admin-web/dist/` — Vite-built static files
- `services/api/` — Source + node_modules (tsx runtime)
- `services/indexer/` — Source + node_modules
- `services/mail-relay/` — Source + node_modules
- `packages/sdk/` — Source (workspace dependency)
- `packages/contracts/build/` — Compiled ABI artifacts
- `services/api/sql/` — Migration files
- `.env` — Server configuration
- `ecosystem.config.cjs` — PM2 process definitions
- `scripts/setup.sh` — Server-side setup script

No build tools (vite, tsc, truffle) needed on the server. API runs via `tsx` at runtime.
**Consequence:** `node_modules` must be Linux-compatible. If native modules differ (e.g. `keccak`, `secp256k1`), `setup.sh` runs a targeted `pnpm install --frozen-lockfile` on the server for those packages only.

### ADR-008: Server Environment
**Status:** Accepted
**Context:** Server is Ubuntu with Nginx, PM2, PostgreSQL, Redis, and multiple other applications already running.
**Decision:** 
- **OS:** Ubuntu (existing)
- **PostgreSQL:** Already installed globally — create a dedicated `daily_identity` database on offset port
- **Redis:** Already installed globally — use a dedicated database index or offset-port instance
- **Nginx:** Already installed — add a new site config for Daily Identity static file serving
- **PM2:** Already installed globally — add Daily Identity processes
- **Cloudflare Tunnels:** Already running as persistent service
**Consequence:** `setup.sh` is purely additive — creates database, copies Nginx configs, starts PM2 processes. Does not install any system packages.
