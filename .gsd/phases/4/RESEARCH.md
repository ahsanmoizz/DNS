# Phase 4 Research: Marketing & Paid Attention System

## 1. API Endpoints Available
Based on `services/api/src/server.ts` and `campaign-domain.ts`, the backend likely supports:
- `POST /v1/marketing/consent` - Submit EIP-712 signed opt-in consent with location and categories.
- `GET /v1/marketing/audience/quote` - Fetch dynamic pricing and eligible recipient counts by location/category.
- `POST /v1/marketing/campaigns` - Register a campaign after escrow funding.
- `GET /v1/marketing/campaigns` - Fetch campaigns for settlement.
- `POST /v1/marketing/campaigns/:id/refund` - Process refund after deadline.
- `POST /v1/marketing/engagement` - Submit EIP-712 engagement receipt (read, click, reply).
- `GET /v1/marketing/rewards` - Fetch Merkle proofs for earned rewards.

## 2. Smart Contracts (`DailyContracts`)
- `fundCampaign(campaignId, rewardBudget, deadline, account)` - Deposits ETH into the Escrow contract.
- `refundCampaign(campaignId, account)` - Recovers unused escrow after the deadline.
- (Merkle claims for rewards would be in the Escrow contract).

## 3. Simulator UI Hooks (`apps/user-web/src/live-adapter.ts`)
The `SimulatorWindow` interface defines:
- `dailyLiveDetectLocation`
- `dailyLiveSaveConsent`
- `dailyLiveRequestCountryChange`
- `dailyLiveSubmitCountryChange`
- `dailyLiveOpenPaidInbox`
- `dailyLivePaidInboxAction`
- `dailyLivePaidEngagement`
- `dailyLiveClaimPaidReward`
- `dailyLiveQuoteCampaign`
- `dailyLiveFundCampaign`
- `dailyLiveOpenCampaignSettlement`
- `dailyLiveRefundCampaign`

Many of these hooks appear to be wired up or partially stubbed. We will need to map them perfectly in Phase 4 execution.

## 4. Admin UI Hooks (`apps/admin-web/src/live-adapter.ts`)
The admin simulator will need hooks to review campaigns and approve country changes.

## Plan Structure (Waves)
1. **Wave 1 (Opt-In & Country Change):** Implement location detection, consent EIP-712 signing, and country change requests.
2. **Wave 2 (Marketer Studio & Escrow):** Implement dynamic audience quoting, ETH escrow funding via `DailyContracts`, and campaign registration.
3. **Wave 3 (Paid Inbox & Engagement):** Implement fetching marketing messages, EIP-712 engagement receipts (read/click/reply), and Merkle reward claiming.
4. **Wave 4 (Admin Approvals & Refunds):** Implement marketer refund flow, admin campaign review/block, and admin country-change approval queue.
