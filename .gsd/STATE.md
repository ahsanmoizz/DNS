# STATE.md — Project Memory

> Last updated: 2026-07-24

## Current Position
- **Phase**: 6
- **Task**: Planning complete
- **Status**: Ready for execution

## Last Session Summary
Phase 5 (Admin Panel & Protocol Governance) execution was successfully verified. Phase 6 plans (1 to 4) have been created to cover API Security, SDK Finalization, and Infrastructure readiness (DLY-121 to DLY-200, DLY-035 to DLY-038).

## Next Steps
1. Review and approve the Phase 6 implementation plan.
2. Run /execute 6 to begin Phase 6 execution.
- Simulator-first architecture: simulators ARE the canonical UX spec
- All live behavior injected via Vite adapter scripts into simulator HTML
- 200-feature register is the acceptance gate

## Session Notes
- Project uses pnpm 11.9.0 workspace monorepo
- Deployed to Sepolia testnet only (no mainnet path active)
- Docker Compose orchestrates production (postgres → redis → migrate → api → indexer → frontends)
