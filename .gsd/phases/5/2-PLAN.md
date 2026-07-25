---
phase: 5
plan: 2
wave: 2
---

# Plan 5.2: Pricing, Catalog & Premium Quotes

## Objective
Implement native ETH pricing updates, catalogue rule management, and the premium request approval flow.

## Context
- .gsd/SPEC.md
- apps/admin-web/src/live-adapter.ts

## Tasks

<task type="auto">
  <name>Implement Pricing Matrix Updates</name>
  <files>apps/admin-web/src/live-adapter.ts</files>
  <action>
    - Hook the "Save pricing" action to call `setAnnualPrice` on the respective registrars.
  </action>
  <verify>Ensure pricing updates integrate accurately with registrars</verify>
  <done>Admins can update annual pricing matrix on-chain.</done>
</task>

<task type="auto">
  <name>Implement Catalog Rule Management</name>
  <files>apps/admin-web/src/live-adapter.ts</files>
  <action>
    - Implement `dailyLiveSaveCatalogRule` (keyword, prefix, suffix, exact).
    - Implement `dailyLiveSaveCatalog` (exact categorization) and `dailyLiveImportCatalog` (CSV batch loading).
  </action>
  <verify>Ensure catalog rules function accurately across imports and saves</verify>
  <done>Reserved, official, standard and premium catalogs can be updated.</done>
</task>

<task type="auto">
  <name>Implement Premium Quote Approvals</name>
  <files>apps/admin-web/src/live-adapter.ts</files>
  <action>
    - Hook into `POST /v1/admin/premium-requests/:id/decision`.
    - If approved, trigger `setPremiumQuote` on the relevant registrar natively.
  </action>
  <verify>Ensure premium quote approvals successfully set quotes on-chain</verify>
  <done>Premium requests are properly validated and securely quoted on-chain.</done>
</task>

## Success Criteria
- [ ] Prices update securely.
- [ ] Catalog rule engines function accurately.
- [ ] Premium quotes integrate perfectly with the smart contracts.
