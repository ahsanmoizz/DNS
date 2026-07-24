import assert from "node:assert/strict";
import test from "node:test";
import { createMarketingAlias, parseGeographyCsv, quoteAudience, stableMarketingAlias, type CampaignDraft, type CampaignPolicy, type MarketingConsent } from "../src/campaign-domain.js";

const policy: CampaignPolicy = { platformFeeBps: 1000, acknowledgementBps: 4000, clickBps: 2500, replyBps: 3500, refundDays: 7, maxCampaignsPerDay: 3 };
const draft: CampaignDraft = { title: "Wallet beta", text: "Try our wallet", clickableUrl: "https://example.com", categories: ["wallet"], locations: [{ country: "Pakistan", region: "Punjab", city: "Lahore" }], recipientCount: 1 };
const consents: MarketingConsent[] = [{ address: "0x1111111111111111111111111111111111111111", country: "Pakistan", region: "Punjab", city: "Lahore", categories: ["wallet"] }, { address: "0x1111111111111111111111111111111111111111", country: "Pakistan", region: "Punjab", city: "Lahore", categories: ["wallet"] }, { address: "0x2222222222222222222222222222222222222222", country: "Pakistan", region: "Punjab", city: "Lahore", categories: ["wallet"], optedOut: true }];

test("creates fixed-format opaque marketing aliases", () => { assert.equal(createMarketingAlias("a1b2c3d4e5f6a7b8c9d0e1f2"), "a1b2c3d4e5f6a7b8c9d0e1f2.marketing.daily"); assert.match(stableMarketingAlias("0x1111111111111111111111111111111111111111"), /^[a-z0-9]{24}\.marketing\.daily$/); });
test("deduplicates consented audience and keeps fee separate", () => { const rates = parseGeographyCsv("country,region,city,price_per_recipient_wei\nPakistan,Punjab,Lahore,100"); const quote = quoteAudience(draft, consents, rates, policy); assert.deepEqual(quote.eligibleAddresses, ["0x1111111111111111111111111111111111111111"]); assert.equal(quote.rewardBudgetWei, 100n); assert.equal(quote.platformFeeWei, 10n); assert.equal(quote.totalDepositWei, 110n); });
test("rejects postcode targeting by restricting the CSV schema", () => { assert.throws(() => parseGeographyCsv("country,region,city,postcode,price_per_recipient_wei\nPakistan,Punjab,Lahore,54000,100")); });
