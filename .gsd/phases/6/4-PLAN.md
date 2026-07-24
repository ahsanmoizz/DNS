---
phase: 6
plan: 4
wave: 4
---

# Plan 6.4: SDK Finalization & Operations

## Objective
Finalize the TypeScript SDK, create the Python SDK stub, and write migration and deployment documentation.

## Context
- .gsd/SPEC.md
- ROADMAP.md (Phase 6)

## Tasks

<task type="auto">
  <name>TypeScript SDK Finalization</name>
  <files>
    - packages/sdk/src/index.ts
    - packages/sdk/src/contracts.ts
  </files>
  <action>
    - Export remaining `@daily/sdk` primitives properly to ensure they are accessible.
    - Check Rollup configuration and module resolution.
  </action>
  <verify>pnpm build</verify>
  <done>SDK accurately bundles in ESM/CJS formats and passes all type checks.</done>
</task>

<task type="auto">
  <name>Python SDK Stub & Migration Tooling</name>
  <files>
    - python-sdk/stub.py
    - scripts/migrate.ts
  </files>
  <action>
    - Create a placeholder stub for a future Python SDK equivalent (DLY-115).
    - Create documentation for smart contract upgrades and migration paths (DLY-116).
  </action>
  <verify>Manual inspection</verify>
  <done>Future readiness goals are met.</done>
</task>

<task type="auto">
  <name>Mainnet Redeployment Scripts</name>
  <files>
    - scripts/mainnet-deploy.sh
  </files>
  <action>
    - Create scaffolding deployment scripts for transitioning from Sepolia testnet to Ethereum Mainnet (DLY-118).
  </action>
  <verify>Manual check</verify>
  <done>Redeployment processes are documented.</done>
</task>

## Success Criteria
- [ ] TypeScript SDK is final and complete.
- [ ] Operational scripts and stubs for expansion exist.
