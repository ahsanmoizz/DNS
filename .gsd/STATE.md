# STATE.md — Project Memory

> Last updated: 2026-07-24

## Current Position
- **Phase**: 4 (completed)
- **Task**: All tasks complete
- **Status**: Verified

## Last Session Summary
Phase 4 (Marketing & Paid Attention System) execution was completely verified. Opt-in flows, marketer escrow workflows, campaign rewards claiming, and admin reviews have been tested successfully via `live-adapter.ts`.

## Next Steps
1. Proceed to Phase 5 (Admin Panel & Protocol Governance)
2. Run /plan 5 to begin planning the admin governance features.
- Simulator-first architecture: simulators ARE the canonical UX spec
- All live behavior injected via Vite adapter scripts into simulator HTML
- 200-feature register is the acceptance gate

## Session Notes
- Project uses pnpm 11.9.0 workspace monorepo
- Deployed to Sepolia testnet only (no mainnet path active)
- Docker Compose orchestrates production (postgres → redis → migrate → api → indexer → frontends)
