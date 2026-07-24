# STATE.md — Project Memory

> Last updated: 2026-07-24

## Current Position
- **Phase**: 2
- **Task**: Planning complete
- **Status**: Ready for execution

## Last Session Summary
Phase 2 plans created (2.1 to 2.4). The objective is to replace generic modals in live-adapter.ts with exact simulator HTML UI states for wallet auth, search, checkout, and name management.

## Next Steps
1. /execute 2
- Simulator-first architecture: simulators ARE the canonical UX spec
- All live behavior injected via Vite adapter scripts into simulator HTML
- 200-feature register is the acceptance gate

## Session Notes
- Project uses pnpm 11.9.0 workspace monorepo
- Deployed to Sepolia testnet only (no mainnet path active)
- Docker Compose orchestrates production (postgres → redis → migrate → api → indexer → frontends)
