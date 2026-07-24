# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0 — Production Testnet Launch

## Must-Haves (from SPEC)

- [ ] 200/200 features implemented with evidence
- [ ] 390/390 simulator controls have live behavior
- [ ] Pixel-perfect UI parity at desktop/tablet/mobile
- [ ] Zero-Docker local build → scp → setup.sh deployment
- [ ] Server PostgreSQL on isolated non-conflicting port
- [ ] All ports/tunnels in .env only

## Phases

### Phase 1: Deployment Pipeline & Server Infrastructure
**Status**: ✅ Complete
**Objective**: Establish the zero-Docker build-to-server deployment pipeline so every subsequent phase can be verified on a real server.

**Deliverables:**
- `.env.example` with all port/tunnel/database configuration variables
- `scripts/build.sh` — local build script (`pnpm build` for all packages)
- `scripts/deploy.sh` — local script that `scp`s artifacts to server
- `scripts/setup.sh` — server-side script that:
  - Installs/configures PostgreSQL on a dedicated non-conflicting port
  - Installs/configures Redis on a dedicated port
  - Runs database migrations
  - Configures Nginx reverse proxy for user-web and admin-web
  - Starts API, indexer and frontends via PM2 or systemd
  - Reads all configuration exclusively from `.env`
- Remove Docker dependency from the workflow (keep docker-compose files as reference only)
- Verify: fresh server deploy from scratch using only `scp` + `setup.sh`

**Features:** Infrastructure foundation for all 200 features
**Requirements:** Deployment constraints from SPEC

---

### Phase 2: Core Identity & Name Registration (DLY-001 → DLY-034)
**Status**: ⬜ Not Started
**Objective**: Complete the foundational name registration, management and resolution features with full simulator visual parity.

**Deliverables:**
- Wallet connection flow (DLY-001, DLY-002)
- Search across all TLDs with availability/reserved/premium status (DLY-004→DLY-008, UX-119)
- Full registration checkout: commit-reveal, payment, duration, bundles (DLY-009→DLY-018, UX-120→UX-122)
- Renewal flows including multi-domain (DLY-019→DLY-020, UX-125, UX-162→UX-165)
- Name transfer with risk checkbox (DLY-021, UX-126)
- Domain dashboard with all tabs (DLY-023, UX-123, UX-157)
- Record editors: address, multichain, text, contenthash, mail-key (DLY-025→DLY-030, UX-127→UX-128)
- Subname creation, transfer, revoke, resolver selection (DLY-031→DLY-033, UX-124, UX-166→UX-167)
- Primary reverse name (DLY-022)
- Profile and portfolio (DLY-003, DLY-024, DLY-034)
- All user-web live-adapter handlers for registration/management controls
- Visual parity: every heading, field, button, card must match simulator exactly

**Features:** DLY-001→DLY-034, UX-119→UX-128, UX-157, UX-162→UX-167
**Requirements:** 48 features

---

### Phase 3: Encrypted Mail System (DLY-039 → DLY-062)
**Status**: ⬜ Not Started
**Objective**: Implement the complete Daily Mail encrypted messaging system with full simulator flow parity.

**Deliverables:**
- Mailbox activation: single and multi-domain (DLY-039, UX-130→UX-131, UX-159→UX-160)
- Key generation, vault, recovery, rotation (DLY-040→DLY-043, UX-169)
- Message composition: recipient resolution, key verification, encryption (DLY-044→DLY-051)
- Mail relay and delivery (DLY-052, DLY-060)
- Inbox/sent folders with identity tabs (DLY-053, UX-131)
- Single-line mailbox rows with sorting (UX-133)
- Read/unread, reply, forward, archive, delete (DLY-054→DLY-057)
- Block sender, spam report (DLY-058→DLY-059)
- Signed acknowledgement and optional on-chain anchoring (DLY-061→DLY-062, DLY-112)
- External encrypted storage: Google Drive connector (UX-200, DLY-109→DLY-111)
- Wallet-gated message access (UX-129)
- All live-adapter handlers for mail controls
- Visual parity: mailbox reader, compose, activation must match simulator exactly

**Features:** DLY-039→DLY-062, DLY-109→DLY-112, UX-129→UX-131, UX-133, UX-159→UX-160, UX-169, UX-200
**Requirements:** 34 features

---

### Phase 4: Marketing & Paid Attention System (DLY-090 → DLY-108)
**Status**: ⬜ Not Started
**Objective**: Implement the complete Paid Attention marketing, campaign, reward and escrow system.

**Deliverables:**
- Marketing opt-in with location capture and category selection (DLY-090→DLY-092, UX-141→UX-143, UX-147, UX-161)
- Country lock and country-change request flow (UX-143→UX-145, UX-170→UX-172)
- Marketer Studio: campaign creation with audience/creative/timing (DLY-093→DLY-096, UX-148→UX-153)
- Dynamic location cost breakdown (UX-151)
- Campaign escrow funding on-chain (DLY-095, DLY-101)
- Admin campaign review, deliver, block (DLY-097, UX-155, UX-183→UX-185)
- Paid Attention inbox: read/click/reply rewards (UX-134→UX-140)
- EIP-712 engagement receipts (DLY-106)
- Merkle reward distribution and claims (DLY-107)
- Refund after deadline (DLY-108)
- Campaign restart and edit-restart (UX-175→UX-176)
- Aggregate campaign reports (UX-156, UX-177)
- System marketing alias (UX-132)
- Blocked marketer restriction (UX-154)
- Rate limits (DLY-099→DLY-100)
- Platform fee configuration (DLY-102→DLY-105)
- All live-adapter handlers for marketing/campaign controls
- Visual parity: every Marketer Studio and Paid Attention screen must match simulator exactly

**Features:** DLY-090→DLY-108, UX-132, UX-134→UX-156, UX-161, UX-170→UX-177, UX-183→UX-185, UX-189
**Requirements:** 56 features

---

### Phase 5: Admin Panel & Protocol Governance (DLY-063 → DLY-089)
**Status**: ⬜ Not Started
**Objective**: Complete the admin panel with all governance, monitoring and operational features matching the admin simulator exactly.

**Deliverables:**
- Role-based access: admin, pricing, catalogue, gateway, treasury roles (DLY-063→DLY-070)
- Two-step admin transfer (DLY-064)
- Registration pause and mail relay pause (DLY-065→DLY-066)
- TLD enable/disable controls (DLY-071)
- Pricing matrix and premium quote management (DLY-072→DLY-073, UX-181→UX-182)
- Bundle discount, grace period, commitment timing configuration (DLY-074→DLY-076)
- Reserved keyword management: exact/prefix/suffix/contains (DLY-077→DLY-079)
- Official name assignment (DLY-079)
- Treasury configuration (DLY-080→DLY-081)
- Contract address registry (DLY-082)
- ERC-3668 gateway URL and signer management (DLY-083→DLY-084)
- Admin geography catalogue and CSV import (UX-190, UX-195→UX-197)
- Expanded category taxonomy (UX-188)
- Monitoring: indexer, RPC, relay, storage health (DLY-085→DLY-087)
- Searchable protocol event logs (DLY-088)
- CSV report export (DLY-089)
- Revenue dashboard: annual, categories, escrow separation (UX-178→UX-180)
- Campaign moderation: evidence viewer, pause/release/block (UX-183→UX-185)
- Country-change approval queue (UX-145)
- Brand evidence review (UX-186→UX-187)
- Mail moderation (DLY-058→DLY-059 admin side)
- Audit log (DLY-088)
- Admin transfer monitoring (UX-174)
- Maintenance window and notices (UX-192)
- Authenticated preview environment (UX-191)
- Identity-link moderation (UX-193→UX-194)
- All admin live-adapter handlers
- Visual parity: every admin panel, sidebar, card, table, modal must match admin simulator exactly

**Features:** DLY-063→DLY-089, UX-145, UX-174, UX-178→UX-182, UX-186→UX-198
**Requirements:** 55 features

---

### Phase 6: SDK, Payments & Cross-Cutting Features (DLY-035 → DLY-038, DLY-113 → DLY-118)
**Status**: ⬜ Not Started
**Objective**: Complete remaining SDK features, payment flows, wallet settings, and optional/future-ready capabilities.

**Deliverables:**
- Transaction fee estimation (DLY-035)
- Transaction history / unified activity ledger (DLY-036, UX-168)
- Resolver interface detection ERC-165 (DLY-037)
- Public TypeScript SDK finalization (DLY-038)
- Domain-to-domain native DLY transfer with masked resolution (UX-173→UX-174, UX-199)
- Payment request with QR (UX-198)
- Wallet-gated settings (UX-158)
- Identity linking with EIP-712 signatures (UX-193)
- Moderation enforcement across linked identities (UX-194)
- Multisig governance integration readiness (DLY-113)
- Timelock for high-risk configuration (DLY-114)
- Additional language SDK readiness (DLY-115, Python SDK stub)
- Contract upgrade migration tooling (DLY-116)
- Multiple gateway redundancy (DLY-117)
- Mainnet redeployment scripts (DLY-118)

**Features:** DLY-035→DLY-038, DLY-113→DLY-118, UX-158, UX-168, UX-173→UX-174, UX-193→UX-194, UX-198→UX-199
**Requirements:** 17 features

---

### Phase 7: Visual Parity Audit & Acceptance
**Status**: ⬜ Not Started
**Objective**: Systematically verify every simulator control placement against the live application and produce canonical acceptance evidence.

**Deliverables:**
- For each of 390 simulator control placements: capture matching state at desktop (1920px), tablet (768px), and mobile (375px)
- Record: simulator control → real control → live API/contract action → resulting state → screenshot reference
- Update `current-audit.md` with evidence counts
- Generate acceptance ledger from `scripts/build-acceptance-ledger.mjs`
- Fix any remaining visual discrepancies (0% tolerance)
- Final 200/200 feature acceptance sign-off
- Final deployment verification on server

**Features:** All 200 — acceptance gate
**Requirements:** Audit evidence standard from SPEC
