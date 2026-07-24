---
phase: 3
plan: 3
wave: 3
---

# Plan 3.3: Mail Actions & External Storage

## Objective
Implement mail management actions (read, archive, block, report) and connect Google Drive storage UI.

## Context
- .gsd/SPEC.md
- d:\Daily_DNS\apps\user-web\src\live-adapter.ts

## Tasks

<task type="auto">
  <name>Implement Mail Actions</name>
  <files>d:\Daily_DNS\apps\user-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveMailAction(id, action)` to map to `/v1/mail/:id/:action`.
    - For `acknowledge`, prompt for EIP-712 signature over `MAIL_ACKNOWLEDGEMENT_TYPES`.
    - Implement `dailyLiveAnchorMail(index)` using `anchorMailHash` from `contracts.ts` to log receipt on-chain.
  </action>
  <verify>pnpm build</verify>
  <done>Users can archive, delete, report spam, and acknowledge mail on-chain.</done>
</task>

<task type="auto">
  <name>Implement Storage UI Connections</name>
  <files>d:\Daily_DNS\apps\user-web\src\live-adapter.ts</files>
  <action>
    - Ensure Google Drive storage status (connected/disconnected) is rendered correctly in the UI.
    - Attach the correct OAuth redirect URLs to the Google Drive connect button.
  </action>
  <verify>pnpm build</verify>
  <done>Storage options UI reflects API connection status.</done>
</task>

## Success Criteria
- [ ] Archive, delete, block, and report buttons update the API state and refresh the view.
- [ ] Signed acknowledgements successfully transmit the EIP-712 receipt to the backend.
- [ ] Google drive connection button flows properly.
