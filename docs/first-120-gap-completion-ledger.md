# First 120 Gap Completion Ledger

This is the implementation ledger requested before work begins on the remaining first-120 scope. It tracks source implementation only. Acceptance verification, visual comparison, and end-to-end tests remain deferred.

| ID | Starting state | Required completion target | Primary implementation surface | State |
|---|---|---|---|---|
| DLY-003 | partial | Live owned-name profile and portfolio data | SDK, indexer, user adapter | [x] |
| DLY-006 | partial | Alternative name suggestions | SDK, user adapter | [x] |
| DLY-008 | partial | Confusable-name warning/blocking | SDK, registrar, user adapter | [x] |
| DLY-012 | partial | User-selected registration duration | user adapter, SDK | [x] |
| DLY-016 | partial | Premium-name request workflow | API, user/admin adapters | [x] |
| DLY-022 | partial | Primary reverse-name workflow | reverse resolver, SDK, user adapter | [x] |
| DLY-023 | partial | Live domain dashboard data/actions | SDK, indexer, user adapter | [x] |
| DLY-024 | partial | Expiry reminders | user adapter, indexer | [x] |
| DLY-031 | partial | Subname creation | registry, SDK, user adapter | [x] |
| DLY-032 | partial | Subname transfer and revoke | registry, SDK, user adapter | [x] |
| DLY-033 | partial | Per-subname resolver selection | registry, SDK, user adapter | [x] |
| DLY-034 | partial | Multiple coin-type address management | resolver, SDK, user adapter | [x] |
| DLY-036 | partial | Indexed transaction history | indexer, API, user adapter | [x] |
| DLY-037 | partial | Resolver ERC-165 interface discovery | resolver, SDK, user adapter | [x] |
| DLY-051 | partial | Ciphertext-only selected-storage upload | API, SDK, user adapter | [x] |
| DLY-066 | partial | Role-gated mail-relay pause | API, admin adapter | [x] |
| DLY-067 | partial | Pricing-manager role management | registrar, admin adapter | [x] |
| DLY-068 | partial | Reserved-name manager role management | registrar, admin adapter | [x] |
| DLY-069 | partial | Gateway-manager role management | resolver, admin adapter | [x] |
| DLY-070 | partial | Treasury-role management | registrar, admin adapter | [x] |
| DLY-073 | partial | Premium quote review, issue, expiry, rejection | API, registrar, admin adapter | [x] |
| DLY-077 | partial | Exact reserved-keyword policy management | registrar, admin adapter | [x] |
| DLY-078 | partial | Prefix/suffix reserved-keyword policy management | registrar, admin adapter | [x] |
| DLY-079 | partial | Official-name assignment and audit view | registrar, indexer, admin adapter | [x] |
| DLY-086 | partial | RPC latency/availability monitoring | API, admin adapter | [x] |
| DLY-087 | partial | Relay and storage health monitoring | API, relay, admin adapter | [x] |
| DLY-098 | partial | Uniform campaign-policy replacement for allowlisting | API, admin adapter | [x] |
| DLY-104 | partial | Separate verified reply reward | API, escrow, adapters | [x] |
| DLY-105 | partial | Separate tracked-link claim reward | API, escrow, adapters | [x] |
| DLY-111 | partial | User-selected encrypted storage adapter interface | API, user adapter | [x] |
| DLY-116 | partial | Contract/deployment migration tooling | contracts, deployment scripts | [x] |
| DLY-109 | missing | IPFS-compatible ciphertext storage adapter | API, SDK, user adapter | [x] |
| DLY-110 | missing | S3-compatible ciphertext storage adapter | API, SDK, user adapter | [x] |
| DLY-113 | missing | Multisig governance integration | contracts, deployment scripts | [x] |
| DLY-115 | missing | Additional language SDK foundations | SDK artifacts | [x] |
| DLY-118 | missing | Mainnet redeployment script, hard-disabled | deployment scripts | [x] |

## Completion rule for this ledger

Mark an item complete only when its described source path has been implemented. This ledger does not alter the canonical acceptance checklist, whose boxes stay unchecked until later runtime, security, and simulator-parity evidence exists.
