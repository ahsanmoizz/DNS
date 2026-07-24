---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Core Governance & TLD Controls

## Objective
Implement role-based access management, registry administrative transfers, and top-level domain global constraints.

## Context
- .gsd/SPEC.md
- d:\Daily_DNS\apps\admin-web\src\live-adapter.ts

## Tasks

<task type="auto">
  <name>Implement Limited Role Management</name>
  <files>d:\Daily_DNS\apps\admin-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveGrantRegistrarRole` and `dailyLiveRevokeRegistrarRole`.
    - Support mapped roles: `PRICING_MANAGER_ROLE`, `CATALOG_MANAGER_ROLE`, `QUOTE_MANAGER_ROLE`.
  </action>
  <verify>pnpm build</verify>
  <done>Admins can grant and revoke limited roles via on-chain calls.</done>
</task>

<task type="auto">
  <name>Implement Two-Step Admin Transfer</name>
  <files>d:\Daily_DNS\apps\admin-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveBeginAdminTransfer`, `dailyLiveAcceptAdminTransfer`, and `dailyLiveCancelAdminTransfer`.
  </action>
  <verify>pnpm build</verify>
  <done>Registry default admin transfer securely processes through the delayed two-step system.</done>
</task>

<task type="auto">
  <name>Implement TLD Configuration Controls</name>
  <files>d:\Daily_DNS\apps\admin-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveSaveRegistrarControls` for updating registrationsEnabled, bundleDiscountBps, gracePeriod, commitmentAges, and treasury.
  </action>
  <verify>pnpm build</verify>
  <done>Protocol variables are successfully written to the TLD registrars.</done>
</task>

## Success Criteria
- [ ] Core governance controls manage access and config natively on-chain.
