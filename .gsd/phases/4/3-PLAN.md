---
phase: 4
plan: 3
wave: 3
---

# Plan 4.3: Paid Attention Inbox & Engagement Rewards

## Objective
Implement fetching of marketing messages, EIP-712 engagement receipts, and Merkle reward claims on the User Side.

## Context
- .gsd/SPEC.md
- d:\Daily_DNS\apps\user-web\src\live-adapter.ts

## Tasks

<task type="auto">
  <name>Implement Paid Inbox & Actions</name>
  <files>d:\Daily_DNS\apps\user-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveOpenPaidInbox` to fetch marketing messages.
    - Implement `dailyLivePaidInboxAction` for basic state updates (read/dismiss).
  </action>
  <verify>pnpm build</verify>
  <done>Marketing inbox populates with targeted campaigns.</done>
</task>

<task type="auto">
  <name>Implement Engagement Receipts & Claims</name>
  <files>d:\Daily_DNS\apps\user-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLivePaidEngagement` to sign `PAID_ATTENTION_ENGAGEMENT_TYPES` EIP-712 receipts for `read`, `click`, or `reply` actions.
    - Submit the signed engagement to the API (`POST /v1/marketing/engagement`).
    - Implement `dailyLiveClaimPaidReward` to fetch Merkle proofs from the API and claim rewards from the Escrow contract.
  </action>
  <verify>pnpm build</verify>
  <done>Users can earn rewards by signing cryptographic engagement receipts and claiming them on-chain.</done>
</task>

## Success Criteria
- [ ] Marketing messages are fetched correctly.
- [ ] Engagement receipts (read, click, reply) use proper EIP-712 signatures.
- [ ] Rewards can be successfully claimed on-chain.
