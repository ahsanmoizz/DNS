---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Marketing Opt-in & Country Management

## Objective
Implement the user opt-in flow for Paid Attention, including location detection, category selection, and EIP-712 consent signing. Implement the country-change request flow.

## Context
- .gsd/SPEC.md
- d:\Daily_DNS\apps\user-web\src\live-adapter.ts

## Tasks

<task type="auto">
  <name>Implement Marketing Opt-in Flow</name>
  <files>d:\Daily_DNS\apps\user-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveDetectLocation` using the browser Geolocation API.
    - Implement `dailyLiveSaveConsent` to sign `MARKETING_CONSENT_TYPES` EIP-712 data.
    - Submit the signed consent to `POST /v1/marketing/consent`.
    - Update the UI to show active opt-in status.
  </action>
  <verify>pnpm build</verify>
  <done>User can successfully opt-in with location and category preferences signed via EIP-712.</done>
</task>

<task type="auto">
  <name>Implement Country Change Request</name>
  <files>d:\Daily_DNS\apps\user-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveRequestCountryChange` to show the modal for requesting a country change.
    - Implement `dailyLiveSubmitCountryChange` to submit the request to the API with a reason.
  </action>
  <verify>pnpm build</verify>
  <done>User can submit a country change request.</done>
</task>

## Success Criteria
- [ ] Users can opt-in to marketing campaigns using real EIP-712 signatures.
- [ ] Country change requests can be successfully submitted to the API.
