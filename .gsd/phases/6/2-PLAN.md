---
phase: 6
plan: 2
wave: 2
---

# Plan 6.2: Identity & Security

## Objective
Finalize wallet-gated settings, identity-link EIP-712 proofs, and moderation enforcement across linked wallets.

## Context
- .gsd/SPEC.md
- ROADMAP.md (Phase 6)

## Tasks

<task type="auto">
  <name>Implement Identity Linking</name>
  <files>apps/user-web/src/live-adapter.ts</files>
  <action>
    - Verify `linkWalletV35` effectively utilizes the `/v1/identity-links/challenge` endpoint.
    - Store the multi-wallet linked identity context natively.
  </action>
  <verify>pnpm build</verify>
  <done>Users can cryptographically prove ownership of multiple addresses.</done>
</task>

<task type="auto">
  <name>Cross-Linked Moderation Enforcement</name>
  <files>services/api/src/server.ts</files>
  <action>
    - Verify backend handlers properly evaluate block states across all linked identities, ensuring bans propagate across a user's multi-wallet tree.
  </action>
  <verify>pnpm build</verify>
  <done>A block on one address disables access for all verified linked addresses.</done>
</task>

<task type="auto">
  <name>Wallet-Gated Settings</name>
  <files>apps/user-web/src/live-adapter.ts</files>
  <action>
    - Connect secure user profile actions requiring wallet authentication loops.
  </action>
  <verify>pnpm build</verify>
  <done>Sensitive profile settings prompt wallet signatures.</done>
</task>

## Success Criteria
- [ ] Linked identities sync seamlessly and share moderation status.
- [ ] EIP-712 proofs are correctly structured for linkage.
- [ ] Cross-Linked Moderation Enforcement works across all connected addresses.
- [ ] Wallet-Gated Settings enforce strict re-authentication loops.
