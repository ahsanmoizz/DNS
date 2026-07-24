---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Mailbox Activation & Keys

## Objective
Implement mailbox activation, key generation, and key vault storage using the SDK crypto primitives.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- d:\Daily_DNS\packages\sdk\src\mail-crypto.ts
- d:\Daily_DNS\apps\user-web\src\live-adapter.ts

## Tasks

<task type="auto">
  <name>Implement Mailbox Activation Logic</name>
  <files>d:\Daily_DNS\apps\user-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveGenerateMailKey` using `generateMailboxKeyPair` and `encryptVault` from SDK.
    - Save encrypted vault to local storage.
    - Submit the generated public key to `/v1/mailboxes`.
    - Implement `dailyLiveUnlockMailKey` to decrypt vault using `decryptVault`.
    - Update the DOM elements in `#mail` section to show active state based on simulator IDs (e.g. `mailSetup`, `mailActive`).
    - Implement `dailyLiveExportMailRecovery` to export plaintext key.
  </action>
  <verify>pnpm build</verify>
  <done>Mailbox can be activated, keys generated, stored, and exported matching simulator flows.</done>
</task>

## Success Criteria
- [ ] User can click 'Generate Keys' and see the mailbox activated.
- [ ] The mailbox public key is submitted to the API successfully.
- [ ] The generated keys are stored encrypted locally.
