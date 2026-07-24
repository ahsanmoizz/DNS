---
phase: 5
plan: 4
wave: 4
---

# Plan 5.4: Gateway & System Monitoring

## Objective
Implement ERC-3668 gateway configurations, operational system monitoring, event searching, and privacy-safe CSV exports.

## Context
- .gsd/SPEC.md
- d:\Daily_DNS\apps\admin-web\src\live-adapter.ts

## Tasks

<task type="auto">
  <name>Implement ERC-3668 Gateway Settings</name>
  <files>d:\Daily_DNS\apps\admin-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveSaveGateway` for the gateway signer address.
    - Implement `dailyLiveAddGatewayUrl` and `dailyLiveRemoveGatewayUrl`.
  </action>
  <verify>pnpm build</verify>
  <done>Gateway resolution URLs and signatures are managed effectively on-chain.</done>
</task>

<task type="auto">
  <name>Implement System Monitoring & Health</name>
  <files>d:\Daily_DNS\apps\admin-web\src\live-adapter.ts</files>
  <action>
    - Hook into `/v1/admin/monitoring` to fetch indexer checkpoint status, RPC latency, mail relay status, and storage health.
    - Connect `dailyLiveSearchEvents` to query `/v1/admin/events`.
  </action>
  <verify>pnpm build</verify>
  <done>System metrics, blockchain indexer status, and logs are visually represented on the admin monitoring pane.</done>
</task>

<task type="auto">
  <name>Implement Operational CSV Export</name>
  <files>d:\Daily_DNS\apps\admin-web\src\live-adapter.ts</files>
  <action>
    - Implement `dailyLiveDownloadOperationalCsv` to fetch `/v1/admin/reports/operational.csv` and trigger a blob download.
  </action>
  <verify>pnpm build</verify>
  <done>Privacy-safe operational reporting downloads successfully.</done>
</task>

## Success Criteria
- [ ] CCIP-Read components are fully manageable from the UI.
- [ ] Comprehensive monitoring provides instant feedback to admins.
- [ ] Reports export safely.
