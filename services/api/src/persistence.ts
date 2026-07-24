import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import pg from "pg";
import type { CampaignDraft, CampaignPolicy, GeographyRate, MarketingConsent } from "./campaign-domain.js";
import type { RewardDistribution } from "./campaign-rewards.js";

export type SubmittedEnvelope = { from: string; recipientNamehash: string; ciphertext: string; signature: string; nonce: string; deadline: number };
export type PersistedMail = { id: string; recipientNamehash: string; senderAddress: string; nonce: string; deadline: number; ciphertextHash: string; ciphertext: string; signature: string; state: string; readAt?: string; createdAt: string };

export class DailyPersistence {
  readonly pool: pg.Pool;
  readonly driveKey: Buffer;
  constructor(connectionString: string, secret = "") { this.pool = new pg.Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000 }); this.driveKey = createHash("sha256").update(`daily-google-drive-v1:${secret}`).digest(); }
  async healthcheck() { await this.pool.query("SELECT 1"); }
  async close() { await this.pool.end(); }
  async issueNonce(address: string, message: string, expiresAt: Date) {
    const normalized = address.toLowerCase();
    await this.pool.query("INSERT INTO wallet_accounts(address) VALUES($1) ON CONFLICT DO NOTHING", [normalized]);
    await this.pool.query("INSERT INTO auth_nonces(address,message,expires_at) VALUES($1,$2,$3) ON CONFLICT(address) DO UPDATE SET message=EXCLUDED.message, expires_at=EXCLUDED.expires_at", [normalized, message, expiresAt]);
  }
  async consumeNonce(address: string) {
    const result = await this.pool.query<{ message: string }>("DELETE FROM auth_nonces WHERE address=$1 AND expires_at > now() RETURNING message", [address.toLowerCase()]);
    return result.rows[0]?.message;
  }
  async registerMailbox(namehash: string, owner: string, keyHash: string, keyVersion: number, publicKey: Record<string, unknown>) {
    const normalizedOwner = owner.toLowerCase();
    await this.pool.query("INSERT INTO wallet_accounts(address) VALUES($1) ON CONFLICT DO NOTHING", [normalizedOwner]);
    await this.pool.query("INSERT INTO mailboxes(namehash,owner_address,public_key_hash,public_key,key_version) VALUES($1,$2,$3,$4,$5) ON CONFLICT(namehash) DO UPDATE SET owner_address=EXCLUDED.owner_address, public_key_hash=EXCLUDED.public_key_hash, public_key=EXCLUDED.public_key, key_version=EXCLUDED.key_version", [namehash.toLowerCase(), normalizedOwner, keyHash, publicKey, keyVersion]);
  }
  async mailboxPublicKey(namehash: string) {
    const result = await this.pool.query<{ namehash: string; public_key_hash: string; public_key: Record<string, unknown>; key_version: number }>("SELECT namehash,public_key_hash,public_key,key_version FROM mailboxes WHERE namehash=$1", [namehash.toLowerCase()]);
    return result.rows[0];
  }
  async submitMail(envelope: SubmittedEnvelope, recipient: { owner: string; keyHash: string; keyVersion: number }) {
    const sender = envelope.from.toLowerCase(); const owner = recipient.owner.toLowerCase(); const id = randomUUID();
    const ciphertextHash = `0x${createHash("sha256").update(envelope.ciphertext).digest("hex")}`;
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("INSERT INTO wallet_accounts(address) VALUES($1),($2) ON CONFLICT DO NOTHING", [sender, owner]);
      await client.query("INSERT INTO mailboxes(namehash,owner_address,public_key_hash,key_version) VALUES($1,$2,$3,$4) ON CONFLICT(namehash) DO UPDATE SET owner_address=EXCLUDED.owner_address, public_key_hash=EXCLUDED.public_key_hash, key_version=EXCLUDED.key_version", [envelope.recipientNamehash.toLowerCase(), owner, recipient.keyHash, recipient.keyVersion]);
      const blocked = await client.query("SELECT 1 FROM mail_sender_blocks WHERE recipient_namehash=$1 AND sender_address=$2", [envelope.recipientNamehash.toLowerCase(), sender]);
      if (blocked.rowCount) throw new Error("Recipient has blocked this sender.");
      const inserted = await client.query("INSERT INTO mail_messages(id,recipient_namehash,sender_address,nonce,deadline,ciphertext_hash,ciphertext_reference,envelope_signature,delivery_state) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'delivered') ON CONFLICT(sender_address,nonce) DO NOTHING RETURNING id,recipient_namehash,sender_address,nonce,deadline,ciphertext_hash,ciphertext_reference,envelope_signature,delivery_state,read_at,created_at", [id, envelope.recipientNamehash.toLowerCase(), sender, envelope.nonce, envelope.deadline, ciphertextHash, envelope.ciphertext, envelope.signature]);
      if (!inserted.rowCount) throw new Error("Replay-protected mail nonce already exists.");
      await client.query("COMMIT");
      return this.mailRow(inserted.rows[0]);
    } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  }
  async listMail(recipientNamehash: string, folder: "inbox" | "archived" = "inbox") {
    const result = await this.pool.query("SELECT m.id,m.recipient_namehash,m.sender_address,m.nonce,m.deadline,m.ciphertext_hash,m.ciphertext_reference,m.envelope_signature,COALESCE(s.state,m.delivery_state) AS delivery_state,COALESCE(s.read_at,m.read_at) AS read_at,m.created_at FROM mail_messages m LEFT JOIN mailbox_message_state s ON s.message_id=m.id AND s.recipient_namehash=m.recipient_namehash WHERE m.recipient_namehash=$1 AND (CASE WHEN $2='archived' THEN COALESCE(s.state,m.delivery_state)='archived' ELSE COALESCE(s.state,m.delivery_state) NOT IN ('archived','deleted') END) ORDER BY m.created_at DESC", [recipientNamehash.toLowerCase(), folder]);
    return result.rows.map(row => this.mailRow(row));
  }
  async listSentMail(sender: string) {
    const result = await this.pool.query("SELECT id,recipient_namehash,sender_address,nonce,deadline,ciphertext_hash,ciphertext_reference,envelope_signature,delivery_state,read_at,created_at FROM mail_messages WHERE sender_address=$1 AND delivery_state <> 'deleted' ORDER BY created_at DESC", [sender.toLowerCase()]);
    return result.rows.map(row => this.mailRow(row));
  }
  async mailboxOwnerForMessage(id: string) {
    const result = await this.pool.query<{ recipient_namehash: string }>("SELECT recipient_namehash FROM mail_messages WHERE id=$1", [id]);
    return result.rows[0]?.recipient_namehash;
  }
  async messageSender(id: string) {
    const result = await this.pool.query<{ recipient_namehash: string; sender_address: string }>("SELECT recipient_namehash,sender_address FROM mail_messages WHERE id=$1", [id]);
    return result.rows[0];
  }
  async blockSender(recipientNamehash: string, sender: string) {
    await this.pool.query("INSERT INTO mail_sender_blocks(recipient_namehash,sender_address) VALUES($1,$2) ON CONFLICT DO NOTHING", [recipientNamehash.toLowerCase(), sender.toLowerCase()]);
  }
  async reportSpam(messageId: string, reporter: string, reason?: string) {
    await this.pool.query("INSERT INTO wallet_accounts(address) VALUES($1) ON CONFLICT DO NOTHING", [reporter.toLowerCase()]);
    await this.pool.query("INSERT INTO mail_spam_reports(id,message_id,reporter_address,reason) VALUES($1,$2,$3,$4) ON CONFLICT(message_id,reporter_address) DO NOTHING", [randomUUID(), messageId, reporter.toLowerCase(), reason ?? null]);
  }
  async spamReports(limit = 200) { const result = await this.pool.query("SELECT r.id,r.message_id,r.reporter_address,r.reason,r.created_at,m.sender_address,m.recipient_namehash,m.ciphertext_hash FROM mail_spam_reports r JOIN mail_messages m ON m.id=r.message_id ORDER BY r.created_at DESC LIMIT $1", [limit]); return result.rows; }
  async senderBlocks(limit = 200) { const result = await this.pool.query("SELECT recipient_namehash,sender_address,created_at FROM mail_sender_blocks ORDER BY created_at DESC LIMIT $1", [limit]); return result.rows; }
  async registeredNames() {
    const result = await this.pool.query<{ payload: { name?: string; expiry?: string } }>("SELECT payload FROM indexed_events WHERE event_name LIKE 'registrar.%NameRegistered' ORDER BY block_number DESC, log_index DESC LIMIT 5000");
    const names = new Map<string, { name: string; expiry?: string }>();
    for (const row of result.rows) if (row.payload.name) names.set(row.payload.name.toLowerCase(), { name: row.payload.name, expiry: row.payload.expiry });
    return [...names.values()];
  }
  async activityForWallet(address: string) { const result = await this.pool.query("SELECT event_name,block_number,transaction_hash,payload,created_at FROM indexed_events WHERE payload::text ILIKE $1 ORDER BY block_number DESC,log_index DESC LIMIT 200", [`%${address.toLowerCase()}%`]); return result.rows; }
  async upsertCcipRecord(input: { requestHash: string; node: string; owner: string; extraData: string; result: string }) {
    await this.pool.query("INSERT INTO wallet_accounts(address) VALUES($1) ON CONFLICT DO NOTHING", [input.owner.toLowerCase()]);
    await this.pool.query("INSERT INTO ccip_records(request_hash,node,owner_address,extra_data,result) VALUES($1,$2,$3,$4,$5) ON CONFLICT(request_hash) DO UPDATE SET node=EXCLUDED.node,owner_address=EXCLUDED.owner_address,extra_data=EXCLUDED.extra_data,result=EXCLUDED.result,updated_at=now()", [input.requestHash.toLowerCase(), input.node.toLowerCase(), input.owner.toLowerCase(), input.extraData, input.result]);
  }
  async ccipRecord(requestHash: string) { const result = await this.pool.query<{ request_hash: string; node: string; owner_address: string; extra_data: string; result: string }>("SELECT request_hash,node,owner_address,extra_data,result FROM ccip_records WHERE request_hash=$1", [requestHash.toLowerCase()]); return result.rows[0]; }
  async upsertMarketingConsent(consent: MarketingConsent, signature: string) {
    const address = consent.address.toLowerCase(); await this.pool.query("INSERT INTO wallet_accounts(address) VALUES($1) ON CONFLICT DO NOTHING", [address]);
    const existing = await this.consentFor(address);
    if (existing && (existing.country !== consent.country || existing.region !== (consent.region ?? null) || existing.city !== (consent.city ?? null))) throw new Error("Marketing location is locked. Submit a protected country-change request instead.");
    await this.pool.query("INSERT INTO marketing_consents(address,country,region,city,categories,consent_signature,opted_out_at,country_locked_at) VALUES($1,$2,$3,$4,$5,$6,NULL,now()) ON CONFLICT(address) DO UPDATE SET categories=EXCLUDED.categories, consent_signature=EXCLUDED.consent_signature, opted_out_at=NULL", [address, consent.country, consent.region ?? null, consent.city ?? null, consent.categories, signature]);
  }
  async consentFor(address: string) {
    const result = await this.pool.query<{ address: string; country: string; region: string | null; city: string | null; categories: string[]; enrolled_at: Date; country_locked_at: Date; opted_out_at: Date | null }>("SELECT address,country,region,city,categories,enrolled_at,country_locked_at,opted_out_at FROM marketing_consents WHERE address=$1", [address.toLowerCase()]);
    return result.rows[0];
  }
  async activeConsents(): Promise<MarketingConsent[]> {
    const result = await this.pool.query<{ address: string; country: string; region: string | null; city: string | null; categories: string[] }>("SELECT address,country,region,city,categories FROM marketing_consents WHERE opted_out_at IS NULL");
    return result.rows.map(row => ({ address: row.address, country: row.country, ...(row.region ? { region: row.region } : {}), ...(row.city ? { city: row.city } : {}), categories: row.categories }));
  }
  async geographyRates(): Promise<GeographyRate[]> {
    const result = await this.pool.query<{ country: string; region: string | null; city: string | null; price_per_user_wei: string; active: boolean }>("SELECT country,region,city,price_per_user_wei,active FROM geography_catalog");
    return result.rows.map(row => ({ country: row.country, ...(row.region ? { region: row.region } : {}), ...(row.city ? { city: row.city } : {}), pricePerRecipientWei: BigInt(row.price_per_user_wei), active: row.active }));
  }
  async campaignPolicy(): Promise<CampaignPolicy> {
    const result = await this.pool.query<{ platform_fee_bps: number; acknowledgement_bps: number; click_bps: number; reply_bps: number; refund_days: number; max_campaigns_per_day: number }>("SELECT platform_fee_bps,acknowledgement_bps,click_bps,reply_bps,refund_days,max_campaigns_per_day FROM marketing_policy WHERE singleton=true");
    const row = result.rows[0]; if (!row) throw new Error("Marketing policy is not configured.");
    return { platformFeeBps: row.platform_fee_bps, acknowledgementBps: row.acknowledgement_bps, clickBps: row.click_bps, replyBps: row.reply_bps, refundDays: row.refund_days, maxCampaignsPerDay: row.max_campaigns_per_day };
  }
  async setCampaignPolicy(policy: CampaignPolicy) {
    await this.pool.query("UPDATE marketing_policy SET platform_fee_bps=$1,acknowledgement_bps=$2,click_bps=$3,reply_bps=$4,refund_days=$5,max_campaigns_per_day=$6,updated_at=now() WHERE singleton=true", [policy.platformFeeBps, policy.acknowledgementBps, policy.clickBps, policy.replyBps, policy.refundDays, policy.maxCampaignsPerDay]);
  }
  async upsertGeographyRates(rates: readonly GeographyRate[]) {
    const client = await this.pool.connect();
    try { await client.query("BEGIN"); for (const rate of rates) await client.query("INSERT INTO geography_catalog(id,country,region,city,opted_in_users,price_per_user_wei,active) VALUES($1,$2,$3,$4,NULL,$5,$6) ON CONFLICT(country,region,city) DO UPDATE SET price_per_user_wei=EXCLUDED.price_per_user_wei,active=EXCLUDED.active", [randomUUID(), rate.country, rate.region ?? null, rate.city ?? null, rate.pricePerRecipientWei.toString(), rate.active]); await client.query("COMMIT"); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  }
  async pendingCountryChanges() {
    const result = await this.pool.query("SELECT id,address,current_country,requested_country,reason,evidence_reference,status,created_at FROM country_change_requests WHERE status='pending' ORDER BY created_at ASC"); return result.rows;
  }
  async decideCountryChange(id: string, approved: boolean, actor: string, reason: string) {
    const client = await this.pool.connect();
    try { await client.query("BEGIN"); const request = await client.query<{ address: string; requested_country: string }>("SELECT address,requested_country FROM country_change_requests WHERE id=$1 AND status='pending' FOR UPDATE", [id]); if (!request.rowCount) throw new Error("Country-change request was not found or already decided."); await client.query("UPDATE country_change_requests SET status=$2,decision_reason=$3,decided_by=$4,decided_at=now() WHERE id=$1", [id, approved ? "approved" : "rejected", reason, actor.toLowerCase()]); if (approved) await client.query("UPDATE marketing_consents SET country=$2,region=NULL,city=NULL,country_locked_at=now() WHERE address=$1", [request.rows[0].address, request.rows[0].requested_country]); await client.query("COMMIT"); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  }
  async requestCountryChange(address: string, currentCountry: string, requestedCountry: string, reason: string, evidenceReference?: string) {
    await this.pool.query("INSERT INTO country_change_requests(id,address,current_country,requested_country,reason,evidence_reference,status) VALUES($1,$2,$3,$4,$5,$6,'pending')", [randomUUID(), address.toLowerCase(), currentCountry, requestedCountry, reason, evidenceReference ?? null]);
  }
  async createFundedCampaign(input: { chainCampaignId: string; marketer: string; alias: string; draft: CampaignDraft; rewardBudgetWei: bigint; platformFeeWei: bigint; deadline: number; transactionHash: string }) {
    const id = randomUUID(); await this.pool.query("INSERT INTO wallet_accounts(address) VALUES($1) ON CONFLICT DO NOTHING", [input.marketer.toLowerCase()]);
    await this.pool.query("INSERT INTO campaigns(id,chain_campaign_id,marketer_address,alias,title,creative,categories,locations,recipient_count,reward_budget_wei,platform_fee_wei,deadline,escrow_transaction_hash,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,to_timestamp($12),$13,'review')", [id, input.chainCampaignId.toLowerCase(), input.marketer.toLowerCase(), input.alias, input.draft.title, { text: input.draft.text, imageUrl: input.draft.imageUrl, clickableUrl: input.draft.clickableUrl }, input.draft.categories, input.draft.locations, input.draft.recipientCount, input.rewardBudgetWei.toString(), input.platformFeeWei.toString(), input.deadline, input.transactionHash.toLowerCase()]);
    return { id, chainCampaignId: input.chainCampaignId, status: "review" };
  }
  async campaignsForAdmin() {
    const result = await this.pool.query("SELECT c.id,c.chain_campaign_id,c.marketer_address,c.alias,c.title,c.categories,c.locations,c.recipient_count,c.reward_budget_wei,c.platform_fee_wei,c.deadline,c.escrow_transaction_hash,c.status,c.created_at,COALESCE(receipts.acknowledgements,0)::int AS acknowledgements,COALESCE(receipts.clicks,0)::int AS clicks,COALESCE(receipts.replies,0)::int AS replies FROM campaigns c LEFT JOIN (SELECT campaign_id,count(*) FILTER (WHERE action='acknowledge') AS acknowledgements,count(*) FILTER (WHERE action='click') AS clicks,count(*) FILTER (WHERE action='reply') AS replies FROM campaign_engagement_receipts GROUP BY campaign_id) receipts ON receipts.campaign_id=c.id ORDER BY c.created_at DESC"); return result.rows;
  }
  async campaignsForMarketer(address: string) { const result = await this.pool.query("SELECT id,chain_campaign_id,title,reward_budget_wei,platform_fee_wei,deadline,status,created_at FROM campaigns WHERE marketer_address=$1 ORDER BY created_at DESC", [address.toLowerCase()]); return result.rows; }
  async markCampaignRefunded(chainCampaignId: string, marketer: string) { const result = await this.pool.query("UPDATE campaigns SET status='settled' WHERE chain_campaign_id=$1 AND marketer_address=$2 AND status IN ('review','approved','delivered','blocked') RETURNING id,status", [chainCampaignId.toLowerCase(), marketer.toLowerCase()]); if (!result.rowCount) throw new Error("Campaign is not eligible for marketer settlement."); return result.rows[0]; }
  async deliverCampaign(id: string, recipients: readonly string[]) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN"); const campaign = await client.query<{ creative: Record<string, unknown> }>("SELECT creative FROM campaigns WHERE id=$1 AND status='approved' FOR UPDATE", [id]); if (!campaign.rowCount) throw new Error("Campaign is unavailable for delivery.");
      for (const recipient of recipients) { const address = recipient.toLowerCase(); await client.query("INSERT INTO wallet_accounts(address) VALUES($1) ON CONFLICT DO NOTHING", [address]); await client.query("INSERT INTO paid_attention_messages(id,campaign_id,recipient_address,creative) VALUES($1,$2,$3,$4) ON CONFLICT(campaign_id,recipient_address) DO NOTHING", [randomUUID(), id, address, campaign.rows[0].creative]); }
      await client.query("UPDATE campaigns SET status='delivered' WHERE id=$1", [id]); await client.query("COMMIT"); return { delivered: recipients.length };
    } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  }
  async paidAttentionInbox(address: string) { const result = await this.pool.query("SELECT id,campaign_id,creative,status,delivered_at,read_at FROM paid_attention_messages WHERE recipient_address=$1 AND status <> 'dismissed' ORDER BY delivered_at DESC", [address.toLowerCase()]); return result.rows; }
  async updatePaidAttentionMessage(id: string, address: string, action: "read" | "dismiss") { const statement = action === "read" ? "UPDATE paid_attention_messages SET status='read',read_at=COALESCE(read_at,now()) WHERE id=$1 AND recipient_address=$2 RETURNING id,status" : "UPDATE paid_attention_messages SET status='dismissed' WHERE id=$1 AND recipient_address=$2 RETURNING id,status"; const result = await this.pool.query(statement, [id, address.toLowerCase()]); if (!result.rowCount) throw new Error("Paid Attention message was not found."); return result.rows[0]; }
  async recordCampaignEngagement(input: { messageId: string; recipient: string; action: "acknowledge" | "click" | "reply"; signature: string; deadline: number }) {
    const message = await this.pool.query<{ campaign_id: string }>("SELECT campaign_id FROM paid_attention_messages WHERE id=$1 AND recipient_address=$2 AND status <> 'dismissed'", [input.messageId, input.recipient.toLowerCase()]);
    if (!message.rowCount) throw new Error("Paid Attention message was not found or is no longer active.");
    await this.pool.query("INSERT INTO campaign_engagement_receipts(id,message_id,campaign_id,recipient_address,action,signature,deadline) VALUES($1,$2,$3,$4,$5,$6,to_timestamp($7)) ON CONFLICT(message_id,recipient_address,action) DO NOTHING", [randomUUID(), input.messageId, message.rows[0].campaign_id, input.recipient.toLowerCase(), input.action, input.signature, input.deadline]);
    return { messageId: input.messageId, action: input.action, recorded: true };
  }
  async storeCampaignRewardDistribution(campaignId: string, actor: string, distribution: RewardDistribution) { const client = await this.pool.connect(); try { await client.query("BEGIN"); const campaign = await client.query<{ reward_budget_wei: string }>("SELECT reward_budget_wei FROM campaigns WHERE id=$1 AND status='delivered' FOR UPDATE", [campaignId]); if (!campaign.rowCount) throw new Error("Only delivered campaigns can receive a reward distribution."); const total = distribution.allocations.reduce((sum, item) => sum + BigInt(item.amountWei), 0n); if (total > BigInt(campaign.rows[0].reward_budget_wei)) throw new Error("Reward distribution exceeds campaign escrow."); await client.query("INSERT INTO wallet_accounts(address) VALUES($1) ON CONFLICT DO NOTHING", [actor.toLowerCase()]); await client.query("INSERT INTO campaign_reward_distributions(campaign_id,merkle_root,total_amount_wei,created_by) VALUES($1,$2,$3,$4) ON CONFLICT(campaign_id) DO UPDATE SET merkle_root=EXCLUDED.merkle_root,total_amount_wei=EXCLUDED.total_amount_wei,created_by=EXCLUDED.created_by,created_at=now()", [campaignId, distribution.root, total.toString(), actor.toLowerCase()]); await client.query("DELETE FROM campaign_reward_allocations WHERE campaign_id=$1", [campaignId]); for (const item of distribution.allocations) { await client.query("INSERT INTO wallet_accounts(address) VALUES($1) ON CONFLICT DO NOTHING", [item.recipient.toLowerCase()]); await client.query("INSERT INTO campaign_reward_allocations(campaign_id,leaf_index,recipient_address,amount_wei,merkle_proof) VALUES($1,$2,$3,$4,$5)", [campaignId, item.index, item.recipient.toLowerCase(), item.amountWei, item.proof]); } await client.query("COMMIT"); return { root: distribution.root, totalAmountWei: total.toString(), recipients: distribution.allocations.length }; } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } }
  async rewardProof(campaignId: string, recipient: string) { const result = await this.pool.query<{ chain_campaign_id: string; merkle_root: string; leaf_index: string; amount_wei: string; merkle_proof: string[] }>("SELECT c.chain_campaign_id,d.merkle_root,a.leaf_index,a.amount_wei,a.merkle_proof FROM campaign_reward_allocations a JOIN campaign_reward_distributions d ON d.campaign_id=a.campaign_id JOIN campaigns c ON c.id=a.campaign_id WHERE a.campaign_id=$1 AND a.recipient_address=$2", [campaignId, recipient.toLowerCase()]); return result.rows[0]; }
  async rewardProofForMessage(messageId: string, recipient: string) { const result = await this.pool.query<{ chain_campaign_id: string; merkle_root: string; leaf_index: string; amount_wei: string; merkle_proof: string[] }>("SELECT c.chain_campaign_id,d.merkle_root,a.leaf_index,a.amount_wei,a.merkle_proof FROM paid_attention_messages m JOIN campaign_reward_allocations a ON a.campaign_id=m.campaign_id AND a.recipient_address=m.recipient_address JOIN campaign_reward_distributions d ON d.campaign_id=m.campaign_id JOIN campaigns c ON c.id=m.campaign_id WHERE m.id=$1 AND m.recipient_address=$2", [messageId, recipient.toLowerCase()]); return result.rows[0]; }
  async linkIdentity(primary: string, linked: string, signature: string, deadline: number) { const owner = primary.toLowerCase(); const target = linked.toLowerCase(); await this.pool.query("INSERT INTO wallet_accounts(address) VALUES($1),($2) ON CONFLICT DO NOTHING", [owner, target]); await this.pool.query("INSERT INTO signed_identity_links(primary_address,linked_address,signature,deadline,revoked_at) VALUES($1,$2,$3,to_timestamp($4),NULL) ON CONFLICT(primary_address,linked_address) DO UPDATE SET signature=EXCLUDED.signature,deadline=EXCLUDED.deadline,revoked_at=NULL,created_at=now()", [owner, target, signature, deadline]); return { primaryAddress: owner, linkedAddress: target, status: "linked" }; }
  async identityLinks(address: string) { const result = await this.pool.query<{ linked_address: string; created_at: Date; deadline: Date }>("SELECT linked_address,created_at,deadline FROM signed_identity_links WHERE primary_address=$1 AND revoked_at IS NULL ORDER BY created_at DESC", [address.toLowerCase()]); return result.rows; }
  async revokeIdentityLink(primary: string, linked: string) { const result = await this.pool.query("UPDATE signed_identity_links SET revoked_at=now() WHERE primary_address=$1 AND linked_address=$2 AND revoked_at IS NULL RETURNING linked_address", [primary.toLowerCase(), linked.toLowerCase()]); if (!result.rowCount) throw new Error("Signed identity link was not found."); return { linkedAddress: linked.toLowerCase(), status: "revoked" }; }
  async decideCampaignReview(id: string, approved: boolean) { const result = await this.pool.query("UPDATE campaigns SET status=$2 WHERE id=$1 AND status='review' RETURNING id,chain_campaign_id,status", [id, approved ? "approved" : "rejected"]); if (!result.rowCount) throw new Error("Campaign was not found or is no longer awaiting review."); return result.rows[0]; }
  async monitoringSnapshot() {
    const [checkpoint, events, campaigns, mail] = await Promise.all([this.pool.query("SELECT chain_id,block_number,updated_at FROM indexer_checkpoints ORDER BY updated_at DESC LIMIT 1"), this.pool.query("SELECT count(*)::int AS count FROM indexed_events"), this.pool.query("SELECT count(*)::int AS count FROM campaigns"), this.pool.query("SELECT count(*)::int AS count FROM mail_messages WHERE delivery_state <> 'deleted'")]);
    return { checkpoint: checkpoint.rows[0] ?? null, indexedEvents: events.rows[0]?.count ?? 0, campaigns: campaigns.rows[0]?.count ?? 0, activeMailMessages: mail.rows[0]?.count ?? 0 };
  }
  async operationalCsv() {
    const [events, campaigns, mail] = await Promise.all([
      this.pool.query<{ event_name: string; block_number: string; transaction_hash: string; created_at: Date }>("SELECT event_name,block_number,transaction_hash,created_at FROM indexed_events ORDER BY block_number DESC,log_index DESC LIMIT 10000"),
      this.pool.query<{ chain_campaign_id: string; status: string; recipient_count: number; reward_budget_wei: string; platform_fee_wei: string; created_at: Date }>("SELECT chain_campaign_id,status,recipient_count,reward_budget_wei,platform_fee_wei,created_at FROM campaigns ORDER BY created_at DESC LIMIT 10000"),
      this.pool.query<{ delivery_state: string; count: string }>("SELECT delivery_state,count(*)::text AS count FROM mail_messages GROUP BY delivery_state")
    ]);
    const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = ["section,event_or_campaign,status_or_block,transaction_or_recipients,amount_or_count,recorded_at"];
    events.rows.forEach(row => lines.push(["event", row.event_name, row.block_number, row.transaction_hash, "", row.created_at.toISOString()].map(escape).join(",")));
    campaigns.rows.forEach(row => lines.push(["campaign", row.chain_campaign_id, row.status, row.recipient_count, `${row.reward_budget_wei}:${row.platform_fee_wei}`, row.created_at.toISOString()].map(escape).join(",")));
    mail.rows.forEach(row => lines.push(["mail", "aggregate", row.delivery_state, "", row.count, ""].map(escape).join(",")));
    return lines.join("\n");
  }
  async protocolEvents(query: string, limit = 100) { const value = `%${query.trim()}%`; const result = await this.pool.query("SELECT event_name,block_number,transaction_hash,payload,created_at FROM indexed_events WHERE event_name ILIKE $1 OR transaction_hash ILIKE $1 ORDER BY block_number DESC,log_index DESC LIMIT $2", [value, limit]); return result.rows; }
  async audit(actor: string, action: string, subjectType: string, subjectId: string, metadata: Record<string, unknown> = {}) { await this.pool.query("INSERT INTO audit_log(id,actor_address,action,subject_type,subject_id,metadata) VALUES($1,$2,$3,$4,$5,$6)", [randomUUID(), actor.toLowerCase(), action, subjectType, subjectId, metadata]); }
  async auditEntries(limit = 100) { const result = await this.pool.query("SELECT actor_address,action,subject_type,subject_id,metadata,created_at FROM audit_log ORDER BY created_at DESC LIMIT $1", [limit]); return result.rows; }
  async createPremiumRequest(input: { name: string; applicant: string; durationYears: number; reason: string; note: string; evidenceReference?: string }) {
    const id = randomUUID(); const applicant = input.applicant.toLowerCase(); await this.pool.query("INSERT INTO wallet_accounts(address) VALUES($1) ON CONFLICT DO NOTHING", [applicant]);
    await this.pool.query("INSERT INTO premium_requests(id,name,applicant_address,duration_years,reason,note,evidence_reference,status) VALUES($1,$2,$3,$4,$5,$6,$7,'submitted')", [id, input.name, applicant, input.durationYears, input.reason, input.note, input.evidenceReference ?? null]); return { id, status: "submitted" };
  }
  async premiumRequests(applicant?: string) {
    const result = await this.pool.query(applicant ? "SELECT id,name,applicant_address,duration_years,reason,note,evidence_reference,status,quoted_registration_wei,quoted_renewal_wei,quote_expires_at,created_at FROM premium_requests WHERE applicant_address=$1 ORDER BY created_at DESC" : "SELECT id,name,applicant_address,duration_years,reason,note,evidence_reference,status,quoted_registration_wei,quoted_renewal_wei,quote_expires_at,created_at FROM premium_requests ORDER BY created_at DESC", applicant ? [applicant.toLowerCase()] : []); return result.rows;
  }
  async decidePremiumRequest(id: string, decision: { approved: boolean; registrationWei?: string; renewalWei?: string; expiresAt?: Date }) {
    const result = await this.pool.query("UPDATE premium_requests SET status=$2,quoted_registration_wei=$3,quoted_renewal_wei=$4,quote_expires_at=$5 WHERE id=$1 AND status='submitted' RETURNING id,status", [id, decision.approved ? "quoted" : "rejected", decision.registrationWei ?? null, decision.renewalWei ?? null, decision.expiresAt ?? null]); if (!result.rowCount) throw new Error("Premium request was not found or has already been decided."); return result.rows[0];
  }
  async markCampaignBlocked(id: string) {
    const result = await this.pool.query("UPDATE campaigns SET status='blocked' WHERE id=$1 AND status IN ('review','approved') RETURNING id,chain_campaign_id,status", [id]); if (!result.rowCount) throw new Error("Campaign was not found or is no longer fundable."); return result.rows[0];
  }
  async storeEncryptedEvidence(input: { owner: string; purpose: "premium" | "country-change" | "brand"; filename: string; contentType: "application/pdf" | "image/png" | "image/jpeg"; byteSize: number; ciphertext: string }) {
    const id = randomUUID(); const owner = input.owner.toLowerCase(); const hash = `0x${createHash("sha256").update(input.ciphertext).digest("hex")}`; await this.pool.query("INSERT INTO wallet_accounts(address) VALUES($1) ON CONFLICT DO NOTHING", [owner]);
    await this.pool.query("INSERT INTO encrypted_evidence(id,owner_address,purpose,filename,content_type,byte_size,ciphertext_hash,ciphertext) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [id, owner, input.purpose, input.filename, input.contentType, input.byteSize, hash, input.ciphertext]);
    return { id, ciphertextHash: hash, status: "submitted" };
  }
  async evidenceForOwner(id: string, owner: string) {
    const result = await this.pool.query("SELECT id,purpose,filename,content_type,byte_size,ciphertext_hash,status,created_at FROM encrypted_evidence WHERE id=$1 AND owner_address=$2 AND deleted_at IS NULL", [id, owner.toLowerCase()]); return result.rows[0];
  }
  async evidenceForAdmin(limit = 100) { const result = await this.pool.query("SELECT id,owner_address,purpose,filename,content_type,byte_size,ciphertext_hash,status,created_at FROM encrypted_evidence WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1", [limit]); return result.rows; }
  async purgeExpiredEvidence(retentionDays: number) {
    const result = await this.pool.query("UPDATE encrypted_evidence SET ciphertext='', deleted_at=now(), status='deleted' WHERE deleted_at IS NULL AND created_at < now() - ($1::text || ' days')::interval", [retentionDays]); return result.rowCount ?? 0;
  }
  async mailRelayPaused() { const result = await this.pool.query<{ mail_relay_paused: boolean }>("SELECT mail_relay_paused FROM protocol_controls WHERE singleton=true"); return result.rows[0]?.mail_relay_paused ?? false; }
  async setMailRelayPaused(paused: boolean, actor: string) { await this.pool.query("UPDATE protocol_controls SET mail_relay_paused=$1,updated_by=$2,updated_at=now() WHERE singleton=true", [paused, actor.toLowerCase()]); return { paused }; }
  async updateMail(id: string, recipientNamehash: string, action: "read" | "acknowledge" | "archive" | "delete", acknowledgementSignature?: string) {
    const state = action === "read" ? "read" : action === "acknowledge" ? "acknowledged" : action === "archive" ? "archived" : "deleted";
    const result = await this.pool.query("INSERT INTO mailbox_message_state(message_id,recipient_namehash,state,acknowledgement_signature,read_at,updated_at) VALUES($1,$2,$3,$4,CASE WHEN $3 IN ('read','acknowledged') THEN now() ELSE NULL END,now()) ON CONFLICT(message_id,recipient_namehash) DO UPDATE SET state=EXCLUDED.state,acknowledgement_signature=COALESCE(EXCLUDED.acknowledgement_signature,mailbox_message_state.acknowledgement_signature),read_at=CASE WHEN EXCLUDED.state IN ('read','acknowledged') THEN COALESCE(mailbox_message_state.read_at,now()) ELSE mailbox_message_state.read_at END,updated_at=now() RETURNING message_id AS id,recipient_namehash,NULL::text AS sender_address,''::text AS nonce,0::bigint AS deadline,''::text AS ciphertext_hash,''::text AS ciphertext_reference,''::text AS envelope_signature,state AS delivery_state,read_at,updated_at AS created_at", [id, recipientNamehash.toLowerCase(), state, acknowledgementSignature ?? null]);
    if (!result.rowCount) throw new Error("Encrypted-mail metadata was not found.");
    return { id: String(result.rows[0].id), recipientNamehash, state: String(result.rows[0].delivery_state), readAt: result.rows[0].read_at ? new Date(String(result.rows[0].read_at)).toISOString() : undefined };
  }
  private mailRow(row: Record<string, unknown>): PersistedMail {
    return { id: String(row.id), recipientNamehash: String(row.recipient_namehash), senderAddress: String(row.sender_address), nonce: String(row.nonce), deadline: Number(row.deadline), ciphertextHash: String(row.ciphertext_hash), ciphertext: String(row.ciphertext_reference), signature: String(row.envelope_signature), state: String(row.delivery_state), readAt: row.read_at ? new Date(String(row.read_at)).toISOString() : undefined, createdAt: new Date(String(row.created_at)).toISOString() };
  }
  encryptDriveToken(token: string) { const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", this.driveKey, iv); const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]); return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${ciphertext.toString("base64url")}`; }
  decryptDriveToken(value: string) { const [ivValue, tagValue, ciphertextValue] = value.split("."); if (!ivValue || !tagValue || !ciphertextValue) throw new Error("Stored Google Drive token is malformed."); const decipher = createDecipheriv("aes-256-gcm", this.driveKey, Buffer.from(ivValue, "base64url")); decipher.setAuthTag(Buffer.from(tagValue, "base64url")); return Buffer.concat([decipher.update(Buffer.from(ciphertextValue, "base64url")), decipher.final()]).toString("utf8"); }
  async saveGoogleDriveConnection(address: string, refreshToken: string, scope?: string, email?: string) {
    const owner = address.toLowerCase(); await this.pool.query("INSERT INTO wallet_accounts(address) VALUES($1) ON CONFLICT DO NOTHING", [owner]);
    await this.pool.query("INSERT INTO google_drive_connections(address,encrypted_refresh_token,scope,email,connected_at,revoked_at) VALUES($1,$2,$3,$4,now(),NULL) ON CONFLICT(address) DO UPDATE SET encrypted_refresh_token=EXCLUDED.encrypted_refresh_token,scope=EXCLUDED.scope,email=EXCLUDED.email,connected_at=now(),revoked_at=NULL", [owner, this.encryptDriveToken(refreshToken), scope ?? null, email ?? null]);
  }
  async googleDriveConnection(address: string) { const result = await this.pool.query<{ email: string | null; scope: string | null; connected_at: string; revoked_at: string | null }>("SELECT email,scope,connected_at,revoked_at FROM google_drive_connections WHERE address=$1", [address.toLowerCase()]); return result.rows[0]; }
  async googleDriveRefreshToken(address: string) { const result = await this.pool.query<{ encrypted_refresh_token: string; revoked_at: string | null }>("SELECT encrypted_refresh_token,revoked_at FROM google_drive_connections WHERE address=$1", [address.toLowerCase()]); const row = result.rows[0]; return row && !row.revoked_at ? this.decryptDriveToken(row.encrypted_refresh_token) : undefined; }
  async revokeGoogleDriveConnection(address: string) { await this.pool.query("UPDATE google_drive_connections SET revoked_at=now() WHERE address=$1", [address.toLowerCase()]); }
}
