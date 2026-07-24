# STATE.md — Project Memory

> Last updated: 2026-07-24

## Current Position
- **Phase**: 1
- **Task**: Planning complete
- **Status**: Ready for execution

## Next Steps
1. /execute 1

## Key Decisions
- Simulator-first architecture: simulators ARE the canonical UX spec
- All live behavior injected via Vite adapter scripts into simulator HTML
- 200-feature register is the acceptance gate

## Session Notes
- Project uses pnpm 11.9.0 workspace monorepo
- Deployed to Sepolia testnet only (no mainnet path active)
- Docker Compose orchestrates production (postgres → redis → migrate → api → indexer → frontends)
