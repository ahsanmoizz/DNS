# Daily Identity V3.6 implementation state

This companion ledger deliberately separates implementation from acceptance. The canonical 200-row acceptance record remains [implementation-checklist.md](implementation-checklist.md); **no acceptance checkbox is checked by this file**.

| Scope | Implementation state | Acceptance state | Current source of truth |
|---|---|---|---|
| DLY-001–038 Naming and resolver | In progress | Unverified | Registry, registrar, resolver, reverse resolver, bundle coordinator, SDK, user adapter |
| DLY-039–062 Encrypted Daily Mail | In progress | Unverified | Client cryptography, API relay, mailbox API, Drive ciphertext connector |
| DLY-063–089 Protocol administration | In progress | Unverified | Admin adapter, role-gated API, registry/registrar contracts |
| DLY-090–100 Paid Attention | In progress | Unverified | Consent API, campaign escrow, review/delivery workflow, user/admin adapters |
| DLY-101–118 Settlement and operations | In progress | Unverified | Campaign escrow, indexer, API operations paths |
| UX-119–200 Simulator parity | In progress | Unverified | User/admin simulator adapters and control inventory |

## Implementation evidence added during the active sweep

- ERC-3668 response signing, gateway storage, and browser-side signature verification.
- Runtime Sepolia manifest configuration for SDK, API, browser typed-data domains, and receipt validation.
- Google Drive ciphertext-only archive upload and authenticated download.
- Atomic on-chain subname revocation plus resolver TTL control.
- Campaign review approval/rejection gate before aggregate delivery.

## Rule

An item becomes `acceptance-verified` only when its exact simulator control/route, live dependency, automated test, and recorded visual/runtime evidence are all present. Until then, the canonical checklist remains unchecked.
