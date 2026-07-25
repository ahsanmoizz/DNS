# STATE.md — Project Memory

> Last updated: 2026-07-24

## Current Position
- **Phase**: 7 (completed)
- **Task**: Project Acceptance
- **Status**: 100% Finalized

## Last Session Summary
Phase 7 (Visual Parity Audit & Acceptance) execution was successfully finalized. The final acceptance ledger was generated proving 200/200 features, and all 390 simulator DOM placements were matched and documented. Deployment readiness is confirmed.

## Next Steps
1. The project development is fully complete.
2. The user can deploy the artifacts to the Ubuntu VPS.
- Simulator-first architecture: simulators ARE the canonical UX spec
- All live behavior injected via Vite adapter scripts into simulator HTML
- 200-feature register is the acceptance gate

## Session Notes
- Project uses pnpm 11.9.0 workspace monorepo
- Deployed to Sepolia testnet only (no mainnet path active)
- Docker Compose orchestrates production (postgres → redis → migrate → api → indexer → frontends)
