# STATE.md — Project Memory

> Last updated: 2026-07-24

## Current Position
- **Phase**: 5
- **Task**: Planning complete
- **Status**: Ready for execution

## Last Session Summary
Phase 4 (Marketing & Paid Attention System) execution was completely verified. Phase 5 plans (1 to 4) have been created to cover Admin Panel & Protocol Governance (DLY-109 to DLY-120).

## Next Steps
1. Review and approve the Phase 5 implementation plan.
2. Run /execute 5 to begin Admin Panel & Protocol Governance execution.
- Simulator-first architecture: simulators ARE the canonical UX spec
- All live behavior injected via Vite adapter scripts into simulator HTML
- 200-feature register is the acceptance gate

## Session Notes
- Project uses pnpm 11.9.0 workspace monorepo
- Deployed to Sepolia testnet only (no mainnet path active)
- Docker Compose orchestrates production (postgres → redis → migrate → api → indexer → frontends)
