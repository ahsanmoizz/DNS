# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision

Turn the Daily Identity V3.6 interactive dummy simulators (User/Marketer 304KB + Admin 117KB) into a production-grade decentralized identity application where every flow, heading, field, button, card, grid layout and pixel matches the simulator HTML exactly. The 200-feature Grand Sealed Feature Register is the single source of truth — zero deviations permitted. The finished product runs on DLY Testnet (Sepolia) with a direct-to-server deployment model and no local Docker dependency.

## Goals

1. **Pixel-perfect simulator-to-production conversion** — Replace every dummy-data `onclick` handler across 390 simulator control placements with real blockchain + API actions while preserving the simulator's exact visual structure, CSS, headings, fields, button placements and responsive layouts (0% visual deviation tolerance).
2. **200-feature acceptance** — Implement and verify all 200 locked features (DLY-001→DLY-118 core, UX-119→UX-200 amendments) from the Grand Sealed Feature Register with runtime evidence, visual proof and test coverage for each.
3. **Zero-Docker local development** — No Docker, no local PostgreSQL installation. Build locally with `pnpm`, deploy via `scp`, run a single server-side setup script.
4. **Production-safe server deployment** — PostgreSQL installed directly on the server using a dedicated non-conflicting port. All ports, tunnels and mappings configured exclusively through `.env`. The application must not affect anything else on the server.

## Non-Goals (Out of Scope)

- **Mainnet deployment** — Testnet and authenticated preview only (per register section 7).
- **Independent security audit** — Required before mainnet, separately funded (per register section 7).
- **Exact postcode/local-area targeting** — Excluded from privacy boundary (per register section 5).
- **Public Gmail/Outlook use of Daily aliases** — Requires separately funded SMTP gateway.
- **Simultaneous production OneDrive + Google Drive** — One connector in testnet scope; second requires separate approval.
- **Local Docker or PostgreSQL installation** — Prohibited by project constraints.
- **Any UI/UX deviation from simulators** — Not even 0.0001% difference is acceptable.

## Users

### End Users (Wallet Holders)
- Connect MetaMask, register `.dly`/`.day`/`.daily` names, manage DNS-like records, send encrypted mail, opt into marketing rewards, create payment requests, manage identity links.

### Marketers (Wallet Holders)
- Create targeted campaigns, fund escrow, track engagement receipts, claim refunds, restart/edit campaigns.

### Protocol Administrators (On-chain Role Holders)
- Manage pricing, catalogue, gateway, mail relay, campaign moderation, country-change approvals, premium quotes, geography rates, operational reporting, audit logs, revenue dashboards.

## Constraints

### Simulator Fidelity (NON-NEGOTIABLE)
- `Daily_User_Marketer_Simulator_V3_6.html` (304KB, 269 inline onclick placements) is the **exact** model for the user/marketer frontend.
- `Daily_Admin_Simulator_V3_6.html` (117KB, 121 inline onclick placements) is the **exact** model for the admin frontend.
- Every heading, field label, button text, card component, grid layout, sidebar navigation, responsive breakpoint, color, font, spacing and interaction flow must be preserved identically.
- The live-adapter pattern (Vite injects TypeScript into simulator HTML) is the approved architecture.

### Feature Register (NON-NEGOTIABLE)
- `Daily_Identity_Grand_Sealed_Feature_Register_V3_6_200_Features.pdf` contains the 200 locked features.
- Features DLY-001 through DLY-118: V3.0 locked contractual baseline (118 features).
- Features UX-119 through UX-200: Accepted V3.2/V3.3/V3.4/V3.6 amendments (82 features).
- All 200 features have status "Included" or "Accepted" — every one must be implemented.

### Technology Stack (LOCKED)
- Per register section 2: ERC-137/ENS, ENSIP-15, ENSIP-9+SLIP-0044, ERC-165, ERC-721, ERC-3668/CCIP-Read, EIP-712, ERC-1271, OpenZeppelin, AES-256-GCM, Native DLY payments.
- pnpm 11.9.0 monorepo, TypeScript, Vite, React 19, Fastify 5, ethers v6, PostgreSQL 16, Redis 7, Truffle, Solidity ^0.8.24.

### Deployment (NON-NEGOTIABLE)
- **No local Docker** — Zero Docker usage on the development machine.
- **No local PostgreSQL** — Database exists only on the server.
- **Build flow:** `pnpm build` locally → `scp` artifacts to server → run single `setup.sh` script on server.
- **Server PostgreSQL:** Installed/created directly on the server with a dedicated port that does not conflict with existing services.
- **Port isolation:** All ports, tunnels, and reverse-proxy mappings are defined exclusively in `.env`. The application must be fully isolated from other server processes.
- **No state leakage:** The app cannot write to, read from, or affect any directories, ports, databases or processes outside its own scope.

### Audit Evidence Standard
- Per `current-audit.md`: Each of the 390 simulator control placements must have a matching live control, API/contract action, resulting state change, and screenshot reference at desktop/tablet/mobile widths.
- Acceptance criteria: runtime evidence + visual match + test proof for every feature.

## Success Criteria

- [ ] 200/200 features have runtime evidence proving implementation matches register specification
- [ ] 390/390 simulator control placements have matching live behavior with API/contract backing
- [ ] User simulator visual parity confirmed at desktop (1920px), tablet (768px), and mobile (375px) widths
- [ ] Admin simulator visual parity confirmed at desktop (1920px), tablet (768px), and mobile (375px) widths
- [ ] Zero Docker dependencies in local development workflow
- [ ] Single `setup.sh` script successfully deploys fresh server from `scp`-delivered build artifacts
- [ ] PostgreSQL on server uses a dedicated non-conflicting port defined in `.env`
- [ ] All 87 user-adapter `dailyLive*` identifiers produce real blockchain/API responses
- [ ] All 62 admin-adapter `dailyLive*` identifiers produce real blockchain/API responses
- [ ] Remaining 241 simulator placements (390 - 149 current identifiers) have new live-adapter coverage
- [ ] `pnpm build` completes without errors for all workspace packages
- [ ] `pnpm test` passes for all workspace packages
- [ ] Audit log captures every admin action with actor, timestamp and metadata
