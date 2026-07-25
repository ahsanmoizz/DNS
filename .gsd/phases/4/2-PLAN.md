---
phase: 4
plan: 2
wave: 2
---

# Plan 4.2: Marketer Studio & Campaign Escrow

## Objective
Implement campaign creation, dynamic audience quoting, and ETH escrow funding on the User Side.

## Context
- .gsd/SPEC.md
- d:\Daily_DNS\apps\user-web\src\live-adapter.ts

## Tasks

<task type="auto">
  <name>Implement Dynamic Audience Quoting</name>
  <files>d:\Daily_DNS\apps\user-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveQuoteCampaign` to query `GET /v1/marketing/audience/quote` with the selected categories and locations.
    - Render the returned budget, platform fee, and eligible recipient counts dynamically in the budget step.
  </action>
  <verify>pnpm build</verify>
  <done>Campaign wizard displays real pricing data from the API based on audience selection.</done>
</task>

<task type="auto">
  <name>Implement Campaign Escrow & Registration</name>
  <files>d:\Daily_DNS\apps\user-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveFundCampaign` to deposit the quoted total amount using `fundCampaign` on `DailyContracts`.
    - Wait for the transaction receipt and then submit the campaign draft and receipt hash to `POST /v1/marketing/campaigns`.
    - Handle policy errors and update the UI.
  </action>
  <verify>pnpm build</verify>
  <done>Marketer can successfully deposit ETH and register a campaign.</done>
</task>

## Success Criteria
- [ ] Dynamic pricing is retrieved from the API based on audience size.
- [ ] Campaign escrow is deposited securely on-chain.
- [ ] Campaigns are successfully registered with the backend.
