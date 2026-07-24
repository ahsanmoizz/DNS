Locked Register + Simulator Gap Audit

Date: 2026-07-24  
Mode: read-only source audit. No feature implementation, browser run, visual comparison, or tests were performed in this audit.

## Exact evidence counts

| Measure | Count | Meaning |
|---|---:|---|
| Locked feature rows | 200 | DLY-001 through DLY-118 and UX-119 through UX-200 in the PDF register. |
| Canonical acceptance rows checked | 0 | No feature has the required runtime, visual, and test evidence. |
| Canonical acceptance rows unchecked | 200 | Every locked feature remains unaccepted. |
| User simulator inline `onclick` placements | 269 | Controls/placements in `Daily_User_Marketer_Simulator_V3_6.html` requiring one-to-one live behavior. |
| Admin simulator inline `onclick` placements | 121 | Controls/placements in `Daily_Admin_Simulator_V3_6.html` requiring one-to-one live behavior. |
| Total simulator inline control placements | 390 | Raw controls, including repeated placements of the same handler. |
| User adapter `dailyLive*` identifiers | 87 | Current live action and field-hook identifiers; this is not one-to-one proof for 269 simulator placements. |
| Admin adapter `dailyLive*` identifiers | 62 | Current live action and field-hook identifiers; this is not one-to-one proof for 121 simulator placements. |

## Current conclusion

**0/200 features can honestly be called fully real, identical, and working yet.**

The previous source-implementation statement means code paths exist. It does **not** prove the HTML simulator flows, button placements, fields, state transitions, responsive layouts, and real data behavior are identical in a browser.

The minimum confirmed UI/flow blocking count is **12**:

- **2 generic simulator-action blockers**: one in each live adapter intercepts simulator controls that are not explicitly allow-listed and reports that the action is not live.
- **2 explicit user placeholders**: Paid Attention and Marketer Studio show unavailable/no-live-data states until their live views replace them.
- **8 explicit admin placeholders at initialization**: Overview, Name Catalog, Resolver Gateway, Mail Controls, Campaign Monitoring, Campaign Economics, Admin Transfer, and Monitoring are initially replaced with unavailable/no-live-data panels. Some have later live renderers, but this has not been proven to preserve the simulator state/flow.

## Confirmed source-level UI/flow gaps to implement or prove

These are the locked UX items where the current source lacks the specified simulator-equivalent surface, or contains a weaker/generalized surface. They are implementation gaps until a browser-state comparison proves otherwise.

| Locked IDs | Gap |
|---|---|
| UX-126 | Transfer manager has a recipient field but no explicit selected-domain risk checkbox flow. |
| UX-127 | The live name manager has generic text records; it does not present the simulator’s optional avatar, website, and bio treatment. |
| UX-128, UX-167 | Contenthash is a raw-bytes input; no guided website/dApp/manifest/documentation pointer forms exist for names or subnames. |
| UX-130, UX-131, UX-159, UX-160 | Live mail activation is single-name/local-state based; the simulator’s multi-domain selection, persistent mailbox manager, and identity-tab behavior are not mapped one-to-one. |
| UX-133 | No source-level recent/oldest sort control for single-line mailbox rows. |
| UX-135, UX-138, UX-139 | The live Paid Attention reader records engagement, but does not render the simulator’s immediate earned amount, no-link redistribution state, or pending-claim countdown. |
| UX-140 | The current campaign code accepts a deadline; the simulator’s exact approved 1/3/7/14/30-day selection flow is not proven. |
| UX-147, UX-151 | Exact All Categories selection and per-location dynamic cost-breakdown behavior are not mapped one-to-one. |
| UX-156, UX-177 | The simulator’s aggregate reporting format, including all location breakdown fields, is not present as an equivalent user/admin report view. |
| UX-161, UX-162, UX-163, UX-164, UX-165 | Select-all/clear-all marketing categories and the bulk-renewal flow (expiring-first, independent terms, locked total) remain simulator-owned. |
| UX-169 | No local encrypted-vault backup-password change flow is exposed. |
| UX-170, UX-171, UX-172 | Country/brand evidence upload is blocked in the user adapter, and matching protected review plus Daily Mail decision-notice flow is not mapped end-to-end. |
| UX-173, UX-174 | SDK payment-URI functions exist, but the simulator-equivalent name-to-name native transfer, masked-resolution review, fee display, and admin monitoring surfaces are absent. |
| UX-175, UX-176 | Restart and edit-and-restart campaign flows remain simulator-owned. |
| UX-178, UX-179, UX-180 | Annual revenue dashboard, category breakdown, and escrow-liability separation are not equivalent live admin views. |
| UX-181, UX-182 | The source has per-registrar catalogue controls, not the simulator’s one global catalogue and exact short-label estimate/payment-lock experience. |
| UX-183, UX-184, UX-185 | Reported-campaign evidence view, release action, and complete blocked-campaign settlement UX are not equivalent live admin flows. |
| UX-186, UX-187 | Brand evidence upload/review path is incomplete in the user/admin screens. |
| UX-188, UX-190 | Expanded taxonomy and the full geography management view need simulator-state parity confirmation; only partial controls are currently exposed. |
| UX-191, UX-192 | Authenticated preview and maintenance-window UI/operations are not implemented as simulator-equivalent views. |
| UX-194 | Moderation enforcement across verified linked identities is not surfaced as a complete admin/user flow. |
| UX-198, UX-199 | Payment URI helper exists in the SDK only; QR request UI and masked recipient-resolution/explicit full-address review are absent. |

## Items requiring direct browser-state comparison, not a source-only decision

The following have source paths but need simulator-by-simulator visual and interaction evidence before they can leave the gap list: registration wizard, premium request/quote screens, all My Names tabs/modals, mailbox reader/compose states, country-change queue, campaign creator, campaign economics, resolver gateway, mail moderation, geography CSV handling, and all mobile/tablet layouts.

## Required next audit method

For each of the 390 simulator control placements, capture the matching state in the built user/admin app at desktop, tablet, and mobile widths. Record: simulator control, real control, live API/contract action, resulting state, and screenshot reference. Only then can the implementation gap count be reduced from the current evidence-based position.
