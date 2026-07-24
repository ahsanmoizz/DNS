---
phase: 4
plan: 4
wave: 4
---

# Plan 4.4: Admin Campaign Review & Approvals

## Objective
Implement campaign review, delivery, blocking, and country-change approval flows on the Admin Side. Implement marketer refund flow on User Side.

## Context
- .gsd/SPEC.md
- d:\Daily_DNS\apps\admin-web\src\live-adapter.ts
- d:\Daily_DNS\apps\user-web\src\live-adapter.ts

## Tasks

<task type="auto">
  <name>Implement Admin Campaign Review</name>
  <files>d:\Daily_DNS\apps\admin-web\src\live-adapter.ts</files>
  <action>
    - Hook into the admin panel for reviewing campaigns.
    - Implement fetching of pending campaigns.
    - Implement actions to pause, release, and block campaigns via backend endpoints.
    - View campaign evidence logic.
  </action>
  <verify>pnpm build</verify>
  <done>Admins can review, release, and block campaigns.</done>
</task>

<task type="auto">
  <name>Implement Country-Change Approval Queue</name>
  <files>d:\Daily_DNS\apps\admin-web\src\live-adapter.ts</files>
  <action>
    - Implement the admin flow for reviewing user country change requests.
    - Hook approval/rejection endpoints to the admin UI.
  </action>
  <verify>pnpm build</verify>
  <done>Admins can approve or reject country change requests.</done>
</task>

<task type="auto">
  <name>Implement Marketer Refunds</name>
  <files>d:\Daily_DNS\apps\user-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveOpenCampaignSettlement` to view campaign settlement status.
    - Implement `dailyLiveRefundCampaign` to call `refundCampaign` on `DailyContracts` for a given campaign ID and inform the backend via `POST /v1/marketing/campaigns/:id/refund`.
  </action>
  <verify>pnpm build</verify>
  <done>Marketers can claim refunds for unused escrow after campaign deadlines.</done>
</task>

## Success Criteria
- [ ] Admin can properly manage the campaign and country queues.
- [ ] Marketers can claim their eligible refunds seamlessly.
