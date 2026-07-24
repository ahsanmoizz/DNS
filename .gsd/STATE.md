# STATE.md — Project Memory

> Last updated: 2026-07-24

## Current Position
- **Phase**: 1 (completed)
- **Task**: All tasks complete
- **Status**: Verified

## Last Session Summary
Phase 1 executed successfully. 2 plans, 4 tasks completed to establish the deployment pipeline and infrastructure scripts.

## Next Steps
1. Proceed to Phase 2
2. /discuss-phase 2
3. /plan 2
- Simulator-first architecture: simulators ARE the canonical UX spec
- All live behavior injected via Vite adapter scripts into simulator HTML
- 200-feature register is the acceptance gate

## Session Notes
- Project uses pnpm 11.9.0 workspace monorepo
- Deployed to Sepolia testnet only (no mainnet path active)
- Docker Compose orchestrates production (postgres → redis → migrate → api → indexer → frontends)
