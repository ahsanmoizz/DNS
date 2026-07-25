---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: Domain Operations & Transfer

## Objective
Implement domain-to-domain native DLY transfers with masked resolution, transaction history logic, and gas fee estimation capabilities.

## Context
- .gsd/SPEC.md
- ROADMAP.md (Phase 6)

## Tasks

<task type="auto">
  <name>Implement Transaction Fee Estimation</name>
  <files>
    - packages/sdk/src/contracts.ts
    - apps/user-web/src/live-adapter.ts
  </files>
  <action>
    - Verify `estimateCommitFee` and `estimateRegistrationFee` functionality.
    - Wire frontend hooks to display estimated network fees prior to signature.
  </action>
  <verify>pnpm build</verify>
  <done>Users see accurate gas estimates before confirming transactions.</done>
</task>

<task type="auto">
  <name>Implement Domain-to-Domain Transfers</name>
  <files>apps/user-web/src/live-adapter.ts</files>
  <action>
    - Wire `dailyLiveTransferName` to handle native ERC-721 token transfer logic.
    - Resolve recipient `.dly` names locally to obtain their wallet address.
  </action>
  <verify>pnpm build</verify>
  <done>Native DLY transfers between domains execute properly on-chain.</done>
</task>

<task type="auto">
  <name>Implement Activity Ledger</name>
  <files>apps/user-web/src/live-adapter.ts</files>
  <action>
    - Implement transaction history ledger by querying indexing endpoints for user actions.
  </action>
  <verify>pnpm build</verify>
  <done>Users can view their historical transactions and transfers.</done>
</task>

## Success Criteria
- [ ] Network fee estimation works correctly.
- [ ] Wallet domains resolve to transfer targets natively.
- [ ] Activity Ledger correctly tracks transaction history.
