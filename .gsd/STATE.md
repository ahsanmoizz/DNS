# STATE.md — Project Memory

> Last updated: 2026-07-24

## Last Session Summary
Codebase mapping complete.
- 8 components identified (2 frontends, 3 services, 3 packages)
- 9 smart contracts analyzed
- 18 database tables documented
- 10 technical debt items catalogued
- 0/200 features have acceptance evidence

## Active Blockers
- None (mapping phase only)

## Key Decisions
- Simulator-first architecture: simulators ARE the canonical UX spec
- All live behavior injected via Vite adapter scripts into simulator HTML
- 200-feature register is the acceptance gate

## Session Notes
- Project uses pnpm 11.9.0 workspace monorepo
- Deployed to Sepolia testnet only (no mainnet path active)
- Docker Compose orchestrates production (postgres → redis → migrate → api → indexer → frontends)
