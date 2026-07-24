# STATE.md — Project Memory

> Last updated: 2026-07-24

## Current Position
- **Phase**: 7
- **Task**: Planning complete
- **Status**: Ready for execution

## Last Session Summary
Phase 6 (SDK, Payments & Cross-Cutting Features) execution was successfully verified. Phase 7 plans (1 to 4) have been created to handle the Visual Parity Audit & Acceptance process.

## Next Steps
1. Review and approve the Phase 7 implementation plan.
2. Run /execute 7 to begin Phase 7 execution.
- Simulator-first architecture: simulators ARE the canonical UX spec
- All live behavior injected via Vite adapter scripts into simulator HTML
- 200-feature register is the acceptance gate

## Session Notes
- Project uses pnpm 11.9.0 workspace monorepo
- Deployed to Sepolia testnet only (no mainnet path active)
- Docker Compose orchestrates production (postgres → redis → migrate → api → indexer → frontends)
