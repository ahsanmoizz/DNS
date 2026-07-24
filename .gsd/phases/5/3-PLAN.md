---
phase: 5
plan: 3
wave: 3
---

# Plan 5.3: Economy, Moderation & Mail Controls

## Objective
Implement campaign policy economics, geography catalogue imports, campaign moderation workflows, and encrypted mail relay controls.

## Context
- .gsd/SPEC.md
- d:\Daily_DNS\apps\admin-web\src\live-adapter.ts

## Tasks

<task type="auto">
  <name>Implement Campaign Policy & Geography Rates</name>
  <files>d:\Daily_DNS\apps\admin-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveSaveCampaignPolicy` mapping to `setPolicy` on the campaign escrow contract and backend sync.
    - Implement `dailyLiveImportGeography` mapping to `/v1/admin/marketing/geography/csv`.
  </action>
  <verify>pnpm build</verify>
  <done>Admins can configure aggregate campaign economy logic natively.</done>
</task>

<task type="auto">
  <name>Implement Moderation (Campaigns & Country Changes)</name>
  <files>d:\Daily_DNS\apps\admin-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveReviewCampaign` (approve/reject).
    - Implement `dailyLiveDeliverCampaign` (trigger matched delivery).
    - Implement `dailyLiveBlockCampaign` (trigger on-chain and off-chain blocking).
    - Implement `dailyLiveDecideCountryChange` to manage marketer country-lock resets.
  </action>
  <verify>pnpm build</verify>
  <done>All campaign and country change requests are accurately handled by admins.</done>
</task>

<task type="auto">
  <name>Implement Mail Relay Pause & Audit Log</name>
  <files>d:\Daily_DNS\apps\admin-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveSaveMailControls` to pause/resume the encrypted mail relay via `/v1/admin/mail/controls`.
    - Implement `dailyLiveOpenAuditLog` to view recent protected actions.
  </action>
  <verify>pnpm build</verify>
  <done>Mail envelope flow can be paused and all actions are auditable.</done>
</task>

## Success Criteria
- [ ] Campaign pricing policies update successfully.
- [ ] Campaigns can be blocked or approved dynamically.
- [ ] Spam flows and relay operations are accurately managed.
