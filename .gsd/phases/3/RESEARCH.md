# Phase 3 Research: Encrypted Mail System

## 1. SDK Crypto Capabilities
The `@daily/sdk` exposes `generateMailboxKeyPair`, `encryptForRecipient`, `decryptForRecipient`, `encryptVault`, `decryptVault` in `mail-crypto.ts`. These leverage AES-256-GCM and ECDH P-256 (JWK).

## 2. API Routes
`services/api/src/server.ts` exposes the following:
- `POST /v1/mailboxes` - Register mailbox public key.
- `GET /v1/mailboxes/:namehash` - Resolve public key.
- `POST /v1/mail/envelopes` - Send mail (requires sender EIP-712 signature on envelope).
- `GET /v1/mail/:namehash` - Fetch inbox/archived.
- `GET /v1/mail/sent/:address` - Fetch sent mail.
- `POST /v1/mail/:id/:action` - Update mail state (read, archive, delete, block, report, acknowledge).
- Google Drive endpoints: `/v1/storage/google-drive/connect`, `/callback`, `/ciphertext`.

## 3. UI Simulator Targets
The mail interface is in `Daily_User_Marketer_Simulator_V3_6.html` inside `#mail`. The `live-adapter.ts` exports methods on `SimulatorWindow` to bind logic:
- `dailyLiveGenerateMailKey`
- `dailyLiveUnlockMailKey`
- `dailyLiveExportMailRecovery`
- `dailyLiveSendMail`
- `dailyLiveReadMail`
- `dailyLiveMailAction`
- `dailyLiveAnchorMail`
- `dailyLiveReplyMail`

## Plan
1. **Wave 1 (Keys & Activation):** Implement key generation, recovery export, vault encryption, and mailbox registration.
2. **Wave 2 (Reading & Sending):** Implement inbox fetching, decryption, recipient key lookup, encryption, and EIP-712 signed dispatch.
3. **Wave 3 (Actions & Storage):** Implement mail management actions (read, archive, acknowledge, spam/block) and wire up the Google Drive storage status flow.
