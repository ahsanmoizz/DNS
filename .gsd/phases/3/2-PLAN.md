---
phase: 3
plan: 2
wave: 2
---

# Plan 3.2: Mailbox Reading & Dispatch

## Objective
Implement fetching inbox/sent items, decrypting them, and composing/sending new encrypted mail via EIP-712 envelopes.

## Context
- .gsd/SPEC.md
- d:\Daily_DNS\apps\user-web\src\live-adapter.ts
- d:\Daily_DNS\Daily_User_Marketer_Simulator_V3_6.html

## Tasks

<task type="auto">
  <name>Implement Mail Reading & Decryption</name>
  <files>d:\Daily_DNS\apps\user-web\src\live-adapter.ts</files>
  <action>
    - Fetch `/v1/mail/:namehash` and `/v1/mail/sent/:address` for inbox/sent folders.
    - Decrypt ciphertexts using `decryptForRecipient` from SDK.
    - Render the decrypted messages dynamically replacing the dummy inbox rows in `mailInboxRows`.
    - Implement `dailyLiveReadMail(index)` to open the reading pane and decrypt content.
  </action>
  <verify>pnpm build</verify>
  <done>Inbox and Sent tabs fetch real messages and decrypt them to display in the UI.</done>
</task>

<task type="auto">
  <name>Implement Mail Dispatch</name>
  <files>d:\Daily_DNS\apps\user-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveSendMail()` reading from `composeTo`, `composeSubject`, `composeBody`.
    - Resolve recipient public key via `/v1/mailboxes/:namehash`.
    - Encrypt mail using `encryptForRecipient` from SDK.
    - Sign the envelope using EIP-712 `MAIL_ENVELOPE_TYPES`.
    - Post the envelope to `/v1/mail/envelopes`.
    - Implement `dailyLiveReplyMail(index, forward)` to populate compose fields from an existing message.
  </action>
  <verify>pnpm build</verify>
  <done>Users can compose and send encrypted emails directly from the UI.</done>
</task>

## Success Criteria
- [ ] Inbox fetches from the backend and decrypts locally.
- [ ] Users can send emails to other Daily Network users with full EIP-712 envelope signing.
